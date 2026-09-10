/**
 * Ana Paula interna — a assistente que conversa com o Thiago dentro do CRM
 * =======================================================================
 *
 * ATENÇÃO: documentação. Precisa ser colado no `worker.js` publicado.
 *
 * Não confundir com a Ana Paula que atende LEAD no WhatsApp: aquela qualifica
 * quem chega, esta cobra o Thiago. Prompt diferente, histórico diferente
 * (`assistente_conversa`), interlocutor diferente.
 *
 * Reaproveita o que o worker já tem:
 *   `chamarOpenAI(env, historico, sistemaPrompt)`  — gpt-4o-mini, chave em `integracoes`
 *   `getAuth()`, `json()`, `criarLembrete()`, `interpretarLembrete()`
 *
 * Duas decisões que valem explicação:
 *
 * 1. O RESUMO NÃO PASSA PELA IA. Quem lista lead parado, follow-up vencido e
 *    compromisso é SQL, em `montarPanorama()`. É de graça, é instantâneo e não
 *    inventa nome de cliente. A IA entra só quando o Thiago escreve.
 *
 * 2. "Me lembra amanhã 9h de X" é resolvido ANTES da IA, pelo interpretador que
 *    já existe. Comando não precisa de modelo de linguagem, e assim o lembrete
 *    é criado mesmo se a OpenAI estiver fora do ar.
 */

const ASSIST_MAX_HISTORICO = 20;      // trocas guardadas (o resto é cortado)
const ASSIST_PARADO_DIAS = 7;         // a partir de quantos dias um lead "esfria"
const ASSIST_TOPO = 5;                // quantos leads parados mostrar por vez

// ---------------------------------------------------------------------------
// 1. Panorama — o que está pegando hoje, direto do banco
// ---------------------------------------------------------------------------

const PESO_ESTAGIO = { 'Proposta Enviada': 4, 'Qualificado': 3, 'Contato Feito': 2, 'Novo': 1 };
const PESO_TEMPERATURA = { 'Quente': 3, 'Morno': 2, 'Frio': 1 };
const ESTAGIOS_FINAIS = ['Fechado', 'Perdido'];

/**
 * Lead parado não é tudo igual: proposta enviada esfriando vale mais do que
 * lead novo frio de dois meses. O score ordena por onde há dinheiro mais perto
 * de fechar, não por quem está parado há mais tempo.
 */
function pontuarLead(lead) {
  const estagio = PESO_ESTAGIO[lead.estagio] || 1;
  const temperatura = PESO_TEMPERATURA[lead.temperatura] || 2;
  const dias = Math.min(Number(lead.dias_parado) || 0, 30);
  return estagio * 10 + temperatura * 5 + dias / 3;
}

async function montarPanorama(env, agora = new Date()) {
  const hoje = diaBrasilia(agora);

  const [parados, followUps, compromissos, tarefas] = await Promise.all([
    env.DB.prepare(`
      SELECT id, nome, telefone, estagio, temperatura, origem, interesse,
             CAST(julianday('now') - julianday(atualizado_em) AS INTEGER) AS dias_parado
        FROM leads
       WHERE estagio NOT IN (${ESTAGIOS_FINAIS.map(() => '?').join(',')})
         AND julianday('now') - julianday(atualizado_em) >= ?
       ORDER BY atualizado_em
       LIMIT 60
    `).bind(...ESTAGIOS_FINAIS, ASSIST_PARADO_DIAS).all(),

    env.DB.prepare(`
      SELECT f.id, f.proximo_contato, f.tentativas, f.observacoes,
             l.id AS lead_id, l.nome, l.telefone, l.estagio
        FROM follow_ups f
        LEFT JOIN leads l ON l.id = f.lead_id
       WHERE f.status = 'Ativo' AND f.proximo_contato IS NOT NULL
         AND date(f.proximo_contato) <= date(?)
       ORDER BY f.proximo_contato
       LIMIT 20
    `).bind(hoje).all(),

    env.DB.prepare(`
      SELECT id, titulo, tipo, data, hora_inicio, local
        FROM agenda
       WHERE status = 'Agendado' AND date(data) BETWEEN date(?) AND date(?, '+1 day')
       ORDER BY data, hora_inicio
       LIMIT 20
    `).bind(hoje, hoje).all(),

    env.DB.prepare(`
      SELECT id, titulo, vencimento
        FROM tarefas
       WHERE status = 'Pendente' AND vencimento IS NOT NULL AND date(vencimento) <= date(?)
       ORDER BY vencimento
       LIMIT 20
    `).bind(hoje).all(),
  ]);

  const listaParados = (parados.results || [])
    .map((l) => ({ ...l, score: pontuarLead(l) }))
    .sort((a, b) => b.score - a.score);

  return {
    hoje,
    parados: listaParados.slice(0, ASSIST_TOPO),
    paradosTotal: listaParados.length,
    followUps: followUps.results || [],
    compromissos: compromissos.results || [],
    tarefas: tarefas.results || [],
  };
}

/** Data de hoje em Brasília ('YYYY-MM-DD'), já que o Worker roda em UTC. */
function diaBrasilia(agora = new Date()) {
  return new Date(agora.getTime() - 3 * 3600000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// 2. O resumo em texto — montado em código, sem IA
// ---------------------------------------------------------------------------

function textoResumo(p) {
  const partes = [];

  if (p.compromissos.length) {
    const hoje = p.compromissos.filter((c) => c.data === p.hoje);
    const amanha = p.compromissos.filter((c) => c.data !== p.hoje);
    if (hoje.length) {
      partes.push('Hoje na agenda:\n' + hoje.map(
        (c) => `• ${c.hora_inicio || '--:--'} ${c.titulo}${c.local ? ' — ' + c.local : ''}`
      ).join('\n'));
    }
    if (amanha.length) {
      partes.push(`Amanhã: ${amanha.map((c) => `${c.hora_inicio || ''} ${c.titulo}`.trim()).join('; ')}`);
    }
  }

  if (p.followUps.length) {
    partes.push('Follow-up vencido:\n' + p.followUps.map(
      (f) => `• ${f.nome || 'lead sem nome'}${f.estagio ? ` (${f.estagio})` : ''} — era pra retornar em ${formatarDia(f.proximo_contato)}`
    ).join('\n'));
  }

  if (p.tarefas.length) {
    partes.push('Tarefa vencida:\n' + p.tarefas.map((t) => `• ${t.titulo}`).join('\n'));
  }

  if (p.parados.length) {
    const cabecalho = p.paradosTotal > p.parados.length
      ? `${p.paradosTotal} leads parados há mais de ${ASSIST_PARADO_DIAS} dias. Os ${p.parados.length} que eu pegaria primeiro:`
      : 'Leads parados:';
    partes.push(cabecalho + '\n' + p.parados.map(
      (l) => `• ${l.nome} — ${l.estagio}, ${l.temperatura.toLowerCase()}, ${l.dias_parado} dias sem mexer`
    ).join('\n'));
  }

  if (!partes.length) return 'Nada atrasado por aqui. Agenda limpa e nenhum lead esfriando.';
  return partes.join('\n\n');
}

function formatarDia(texto) {
  const d = String(texto || '').slice(0, 10).split('-');
  return d.length === 3 ? `${d[2]}/${d[1]}` : String(texto || '');
}

// ---------------------------------------------------------------------------
// 3. Prompt — quem ela é quando fala com o Thiago
// ---------------------------------------------------------------------------

function sistemaAssistente(panorama) {
  return `Você é a Ana Paula, assistente do Thiago Nunes, corretor de imóveis autônomo (CRECI-PR 50.265) em Fazenda Rio Grande, PR.

Aqui você NÃO está atendendo cliente: você está falando com o Thiago, dentro do CRM dele. Sua função é não deixar negócio esfriar — cobrar retorno de lead parado, lembrar de compromisso e de follow-up, e responder o que ele perguntar sobre a carteira.

Como falar:
- Português do Brasil, direta, como colega de trabalho que conhece a rotina dele.
- Frases curtas. Sem introdução do tipo "claro!", "com certeza!", sem se oferecer para ajudar no fim de cada resposta.
- No máximo um emoji, e só quando couber. Nada de lista com marcador para tudo.
- Se ele perguntar algo que os dados abaixo não respondem, diga que não tem esse dado no CRM. Nunca invente nome, telefone, valor ou data.
- Quando fizer sentido, termine com uma pergunta objetiva que mova alguma coisa ("quer que eu marque o retorno pra amanhã 9h?").

Situação da carteira agora (${panorama.hoje}), dado real do banco:
${textoResumo(panorama)}

Total de leads parados há mais de ${ASSIST_PARADO_DIAS} dias: ${panorama.paradosTotal}.

Se ele pedir para marcar lembrete, avise que basta escrever "me lembra amanhã 9h de ..." que você agenda — o próprio sistema entende essa frase.`;
}

// ---------------------------------------------------------------------------
// 4. Histórico
// ---------------------------------------------------------------------------

async function lerConversa(env, usuarioId) {
  const linha = await env.DB.prepare(
    `SELECT id, historico, resumo_em FROM assistente_conversa WHERE usuario_id = ?`
  ).bind(usuarioId).first();

  if (linha) {
    let historico = [];
    try { historico = JSON.parse(linha.historico) || []; } catch (e) { historico = []; }
    return { id: linha.id, historico, resumoEm: linha.resumo_em };
  }

  const nova = await env.DB.prepare(
    `INSERT INTO assistente_conversa (usuario_id, historico) VALUES (?, '[]')`
  ).bind(usuarioId).run();
  return { id: nova.meta.last_row_id, historico: [], resumoEm: null };
}

async function gravarConversa(env, usuarioId, historico, resumoEm) {
  const cortado = historico.slice(-ASSIST_MAX_HISTORICO * 2);
  await env.DB.prepare(`
    UPDATE assistente_conversa
       SET historico = ?, resumo_em = COALESCE(?, resumo_em), atualizado_em = datetime('now')
     WHERE usuario_id = ?
  `).bind(JSON.stringify(cortado), resumoEm || null, usuarioId).run();
}

// ---------------------------------------------------------------------------
// 5. Rotas
// ---------------------------------------------------------------------------

/**
 *   GET  /api/assistente            → histórico + resumo do dia (sem IA)
 *   POST /api/assistente/mensagem   → { texto } e ela responde
 *   POST /api/assistente/limpar     → esquece a conversa
 */
async function rotasAssistente(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/assistente')) return null;

  const usuario = await getAuth(request, env);
  if (!usuario) return json({ sucesso: false, erro: 'não autorizado' }, 401);
  const usuarioId = Number(usuario.sub) || 0;

  // --- abertura ---
  if (request.method === 'GET' && url.pathname === '/api/assistente') {
    const [conversa, panorama] = await Promise.all([
      lerConversa(env, usuarioId),
      montarPanorama(env),
    ]);

    const hoje = panorama.hoje;
    const mensagens = conversa.historico.slice();
    let resumoNovo = null;

    // Um resumo por dia: reabrir o CRM cinco vezes não repete a mesma cobrança.
    if (conversa.resumoEm !== hoje) {
      const texto = 'Bom dia! ' + textoResumo(panorama);
      mensagens.push({ papel: 'assistente', texto, em: new Date().toISOString() });
      await gravarConversa(env, usuarioId, mensagens, hoje);
      resumoNovo = texto;
    }

    return json({
      sucesso: true,
      mensagens: mensagens.slice(-ASSIST_MAX_HISTORICO),
      resumoNovo,
      panorama: {
        parados_total: panorama.paradosTotal,
        follow_ups: panorama.followUps.length,
        compromissos: panorama.compromissos.length,
        tarefas: panorama.tarefas.length,
      },
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/assistente/limpar') {
    await gravarConversa(env, usuarioId, [], null);
    return json({ sucesso: true });
  }

  if (request.method === 'POST' && url.pathname === '/api/assistente/mensagem') {
    const corpo = await request.json().catch(() => ({}));
    const texto = String(corpo.texto || '').trim();
    if (!texto) return json({ sucesso: false, erro: 'mensagem vazia' }, 400);
    if (texto.length > 1000) return json({ sucesso: false, erro: 'mensagem muito longa' }, 400);

    const conversa = await lerConversa(env, usuarioId);
    const historico = conversa.historico.concat({
      papel: 'thiago', texto, em: new Date().toISOString(),
    });

    // (a) Comando de lembrete: resolvido sem IA.
    const resposta = await tentarComandoLembrete(env, texto) || await responderComIA(env, historico);

    historico.push({ papel: 'assistente', texto: resposta, em: new Date().toISOString() });
    await gravarConversa(env, usuarioId, historico, null);

    return json({ sucesso: true, resposta });
  }

  return json({ sucesso: false, erro: 'rota não encontrada' }, 404);
}

/** "me lembra amanhã 9h de ligar pro João" vira tarefa aqui mesmo. */
async function tentarComandoLembrete(env, texto) {
  if (!/\b(lembra|lembrar|lembrete|me avisa|alarme)\b/i.test(texto)) return null;

  const lido = interpretarLembrete(texto);
  if (!lido) return 'Entendi que é lembrete, mas não peguei o horário. Tenta assim: "me lembra amanhã 9h de ligar pro proprietário".';

  await criarLembrete(env, { titulo: lido.titulo, lembrarEm: lido.lembrarEm });
  const [data, hora] = lido.lembrarEm.split(' ');
  const [a, m, d] = data.split('-');
  return `Marquei: ${lido.titulo} — ${d}/${m} às ${hora}. Te aviso aqui e no WhatsApp.`;
}

/** Conversa de verdade, com o panorama do dia no prompt de sistema. */
async function responderComIA(env, historico) {
  const panorama = await montarPanorama(env);
  const paraOpenAI = historico.slice(-ASSIST_MAX_HISTORICO).map((m) => ({
    role: m.papel === 'thiago' ? 'user' : 'assistant',
    content: m.texto,
  }));

  try {
    const resposta = await chamarOpenAI(env, paraOpenAI, sistemaAssistente(panorama));
    return resposta.trim() || 'Não consegui formular resposta agora. Tenta de novo?';
  } catch (erro) {
    console.error('assistente: falha na OpenAI —', erro.message);
    // Sem IA, ela ainda serve para o principal: dizer o que está atrasado.
    return 'Não consegui pensar agora (a OpenAI não respondeu). Mas o que está pegando é isto:\n\n' + textoResumo(panorama);
  }
}

// ---------------------------------------------------------------------------
// INSTALAÇÃO
// ---------------------------------------------------------------------------
//
// PASSO 1 — rodar `sql/2026-09-assistente.sql` no D1.
//
// PASSO 2 — colar este arquivo no worker.js, DEPOIS de `snippets/lembrete-whatsapp.js`
//   (usa `criarLembrete` e `interpretarLembrete` de lá).
//
// PASSO 3 — em `tratarRequisicao`:
//
//     const assistente = await rotasAssistente(request, env);
//     if (assistente) return assistente;
//
// Custo: só a rota /api/assistente/mensagem chama a OpenAI. Abrir o CRM e ler o
// resumo do dia não gasta nada.
