/**
 * Lembretes no WhatsApp — CRMTHIAGO
 * ==================================
 *
 * ATENÇÃO: este arquivo é DOCUMENTAÇÃO. Este repositório não é deployado.
 * Para funcionar, precisa ser colado no `worker.js` publicado (painel Cloudflare
 * > Workers > crm-thiago-leads-worker), junto dos passos do fim do arquivo.
 *
 * Escrito em cima do que o worker publicado JÁ tem — não substitui nada:
 *   - `enviarWhatsapp(env, telefone, mensagem)`  → Green API, já existe
 *   - `lerIntegracao(env, chave)`                → credenciais na tabela `integracoes`
 *   - `getAuth(request, env)`                    → JWT, e aceita X-Automation-Key do n8n
 *   - `scheduled()`                              → cron já roda, só ganha mais uma tarefa
 *   - tabelas `agenda` e `tarefas`               → onde o compromisso já mora
 *
 * O aviso de LEAD NOVO já existe em produção (`enviarAlertaLead`, chamado por
 * `registrarLeadEntrante`) e cobre todas as entradas de lead. Nada a fazer lá.
 *
 * Fuso: `lembrar_em` e `alertado_em` ficam em horário de Brasília, igual a
 * `agenda.data`, `agenda.hora_inicio` e `tarefas.vencimento`. O Worker roda em
 * UTC, então toda leitura de "agora" passa por `agoraBrasilia()` — nunca use
 * `datetime('now')` para comparar com essas colunas.
 */

const FUSO_BRASIL_HORAS = -3;   // Brasília, sem horário de verão desde 2019
const ANTECEDENCIA_AGENDA_MIN = 60;   // aviso padrão de compromisso: 1h antes

// ---------------------------------------------------------------------------
// 1. Datas em horário de Brasília
// ---------------------------------------------------------------------------

const dois = (n) => String(n).padStart(2, '0');

/** Date -> 'YYYY-MM-DD HH:MM' em horário de Brasília. */
function formatarBrasilia(instante) {
  const d = new Date(instante.getTime() + FUSO_BRASIL_HORAS * 3600000);
  return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())} ` +
         `${dois(d.getUTCHours())}:${dois(d.getUTCMinutes())}`;
}

/** 'Agora' já em Brasília, no formato das colunas. */
function agoraBrasilia(agora = new Date()) {
  return formatarBrasilia(agora);
}

/** Componentes de data/hora de Brasília -> 'YYYY-MM-DD HH:MM'. */
function montarBrasilia(ano, mes, dia, hora, minuto) {
  const d = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
  return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())} ` +
         `${dois(d.getUTCHours())}:${dois(d.getUTCMinutes())}`;
}

/** 'YYYY-MM-DD HH:MM' (Brasília) menos N minutos, ainda em Brasília. */
function menosMinutos(textoLocal, minutos) {
  const [data, hora] = String(textoLocal).split(' ');
  const [a, m, d] = data.split('-').map(Number);
  const [h, min] = (hora || '00:00').split(':').map(Number);
  const base = new Date(Date.UTC(a, m - 1, d, h, min) - minutos * 60000);
  return `${base.getUTCFullYear()}-${dois(base.getUTCMonth() + 1)}-${dois(base.getUTCDate())} ` +
         `${dois(base.getUTCHours())}:${dois(base.getUTCMinutes())}`;
}

/** 'YYYY-MM-DD HH:MM' -> 'dd/mm às HH:MM', para confirmar ao usuário. */
function porExtenso(textoLocal) {
  const [data, hora] = String(textoLocal).split(' ');
  const [, m, d] = data.split('-');
  return `${d}/${m} às ${hora || '00:00'}`;
}

// ---------------------------------------------------------------------------
// 2. Interpretador de lembrete em português
// ---------------------------------------------------------------------------

const DIAS_SEMANA = {
  domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6,
};

const ACENTOS = {
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a', 'é': 'e', 'ê': 'e', 'è': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ò': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ç': 'c', 'ñ': 'n',
};

/**
 * Minúsculas e sem acento, trocando caractere por caractere para o texto
 * continuar com o MESMO comprimento do original — assim os índices dos matches
 * valem também no texto bruto, e o título sai limpo com o acento preservado.
 */
function semAcento(texto) {
  return String(texto).toLowerCase().replace(/[áàãâäéêèíìîóôõòúùûüçñ]/g, (c) => ACENTOS[c]);
}

/**
 * Lê uma frase solta e devolve { lembrarEm, titulo } em horário de Brasília,
 * ou null se não achar tempo nenhum. Entende, por exemplo:
 *   "me lembra amanhã 9h de ligar pro proprietário do Green Field"
 *   "lembrete 12/09 14:30 visita Eucaliptos"
 *   "em 40 minutos confirmar a vistoria"
 *   "sexta 8h assinatura do contrato"
 * Sem hora explícita, assume 09:00. Sem data explícita, assume hoje — e, se o
 * horário já passou, joga para amanhã.
 */
function interpretarLembrete(frase, agora = new Date()) {
  const bruto = String(frase || '');
  const t = semAcento(bruto);

  const local = new Date(agora.getTime() + FUSO_BRASIL_HORAS * 3600000);
  let ano = local.getUTCFullYear(), mes = local.getUTCMonth() + 1, dia = local.getUTCDate();
  let hora = null, minuto = 0;
  let achouData = false;
  const cortes = [];   // [inicio, fim] dos pedaços de tempo, a tirar do título

  const marcar = (m) => cortes.push([m.index, m.index + m[0].length]);

  // "em 40 minutos" / "em 2 horas" / "em 3 dias"
  const rel = t.match(/\bem\s+(\d{1,3})\s*(min|mins|minuto|minutos|h|hora|horas|dia|dias)\b/);
  if (rel) {
    const n = parseInt(rel[1], 10);
    const ms = /^min/.test(rel[2]) ? n * 60000 : /^(h|hora)/.test(rel[2]) ? n * 3600000 : n * 86400000;
    marcar(rel);
    return {
      lembrarEm: formatarBrasilia(new Date(agora.getTime() + ms)),
      titulo: limparTitulo(bruto, cortes),
    };
  }

  // "12/09" ou "12/09/2026"
  const dataExplicita = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (dataExplicita) {
    dia = parseInt(dataExplicita[1], 10);
    mes = parseInt(dataExplicita[2], 10);
    if (dataExplicita[3]) {
      ano = parseInt(dataExplicita[3], 10);
      if (ano < 100) ano += 2000;
    }
    achouData = true;
    marcar(dataExplicita);
  }

  // "hoje" / "amanha" / "depois de amanha"
  if (!achouData) {
    const m = t.match(/\bdepois de amanha\b|\bamanha\b|\bhoje\b/);
    if (m) {
      const somar = m[0] === 'hoje' ? 0 : m[0] === 'amanha' ? 1 : 2;
      const d = new Date(Date.UTC(ano, mes - 1, dia + somar));
      ano = d.getUTCFullYear(); mes = d.getUTCMonth() + 1; dia = d.getUTCDate();
      achouData = true;
      marcar(m);
    }
  }

  // "segunda", "sexta"... — sempre a próxima ocorrência
  if (!achouData) {
    for (const [nome, alvo] of Object.entries(DIAS_SEMANA)) {
      const m = t.match(new RegExp(`\\b${nome}(?:-feira)?\\b`));
      if (!m) continue;
      const diff = ((alvo - local.getUTCDay()) + 7) % 7 || 7;
      const d = new Date(Date.UTC(ano, mes - 1, dia + diff));
      ano = d.getUTCFullYear(); mes = d.getUTCMonth() + 1; dia = d.getUTCDate();
      achouData = true;
      marcar(m);
      break;
    }
  }

  // "14:30", "9h", "9h30", "as 8", "19 horas" — procurado fora do trecho de data,
  // senão o "09" de "12/09" seria lido como horário.
  const tHora = dataExplicita
    ? t.slice(0, dataExplicita.index) + ' '.repeat(dataExplicita[0].length) +
      t.slice(dataExplicita.index + dataExplicita[0].length)
    : t;
  const padroesHora = [
    /\b(\d{1,2}):(\d{2})\b/,           // 14:30
    /\b(\d{1,2})h(\d{2})\b/,           // 9h30
    /\b(\d{1,2})\s*h(?:s|oras?)?\b/,   // 9h, 19 horas
    /\bas\s+(\d{1,2})\b/,              // às 8
  ];
  for (const padrao of padroesHora) {
    const m = tHora.match(padrao);
    if (!m) continue;
    const h = parseInt(m[1], 10);
    if (h > 23) continue;
    hora = h;
    minuto = m[2] ? parseInt(m[2], 10) : 0;
    marcar(m);
    break;
  }

  if (!achouData && hora === null) return null;   // não há tempo nenhum na frase
  if (hora === null) { hora = 9; minuto = 0; }

  let lembrarEm = montarBrasilia(ano, mes, dia, hora, minuto);
  if (!achouData && lembrarEm <= agoraBrasilia(agora)) {
    const d = new Date(Date.UTC(ano, mes - 1, dia + 1, hora, minuto));
    lembrarEm = montarBrasilia(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hora, minuto);
  }

  return { lembrarEm, titulo: limparTitulo(bruto, cortes) };
}

const COMANDOS = /^\s*(me\s+)?(lembra|lembrar|lembre|lembrete|alarme|alerta|avisa|avisar)\b\s*/i;
const LIGACOES = /^\s*(de|do|da|que|pra|para|dia|as|às|no|na|o|a)\b\s*/i;

/** Tira do texto os pedaços de tempo e as palavras de comando; sobra o assunto. */
function limparTitulo(bruto, cortes) {
  let titulo = '';
  let pos = 0;
  let cortouNoComeco = false;

  for (const [ini, fim] of [...cortes].sort((a, b) => a[0] - b[0])) {
    if (ini < pos) continue;                       // trechos sobrepostos
    if (pos === 0 && bruto.slice(0, ini).trim() === '') cortouNoComeco = true;
    titulo += bruto.slice(pos, ini) + ' ';
    pos = fim;
  }
  titulo += bruto.slice(pos);
  titulo = titulo.replace(/\s{2,}/g, ' ').trim();

  const semComando = titulo.replace(COMANDOS, '');
  const tinhaComando = semComando !== titulo;
  titulo = semComando;

  // "de", "dia", "as" só saem quando sobraram órfãos de um corte — senão um
  // lembrete que comece com "as chaves..." perderia a primeira palavra.
  if (tinhaComando || cortouNoComeco) {
    let anterior;
    do { anterior = titulo; titulo = titulo.replace(LIGACOES, ''); } while (titulo !== anterior);
  }

  titulo = titulo.replace(/\s*\b(as|às|dia|de|do|da)\b\s*$/i, '').trim();
  return titulo || 'Lembrete';
}

// ---------------------------------------------------------------------------
// 3. Criar lembrete
// ---------------------------------------------------------------------------

/**
 * Grava o lembrete em `tarefas` — assim ele aparece na aba de Tarefas do CRM,
 * em vez de ficar numa fila invisível. Compromisso com local e horário continua
 * indo para `agenda` pelo CRUD que já existe; o aviso dele é automático.
 */
async function criarLembrete(env, dados) {
  const r = await env.DB.prepare(`
    INSERT INTO tarefas (titulo, descricao, tipo, relacionado_tipo, relacionado_id, vencimento, lembrar_em, status)
    VALUES (?, ?, 'Lembrete', ?, ?, ?, ?, 'Pendente')
  `).bind(
    dados.titulo,
    dados.descricao || null,
    dados.relacionadoTipo || null,
    dados.relacionadoId || null,
    dados.lembrarEm.slice(0, 10),   // vencimento continua sendo só a data
    dados.lembrarEm
  ).run();
  return r.meta.last_row_id;
}

// ---------------------------------------------------------------------------
// 4. Despacho (roda no cron que já existe)
// ---------------------------------------------------------------------------

/** Telefone de destino: a mesma chave que o alerta de lead já usa. */
async function telefoneAlerta(env) {
  return await lerIntegracao(env, 'alerta_whatsapp_telefone');
}

/**
 * Envia os lembretes vencidos de `tarefas` e os compromissos de `agenda` que
 * estão chegando. Marca `alertado_em` no mesmo instante, então cada um sai uma
 * vez só, mesmo se o cron rodar de novo antes do envio anterior terminar.
 */
async function despacharLembretes(env, agora = new Date()) {
  const telefone = await telefoneAlerta(env);
  if (!telefone) {
    console.log('lembretes: `alerta_whatsapp_telefone` não cadastrado em integracoes');
    return { enviados: 0 };
  }

  const agoraLocal = agoraBrasilia(agora);
  let enviados = 0;

  // --- Tarefas com lembrete marcado ---
  const { results: tarefas } = await env.DB.prepare(`
    SELECT id, titulo, descricao, lembrar_em
      FROM tarefas
     WHERE alertado_em IS NULL AND status = 'Pendente'
       AND lembrar_em IS NOT NULL AND lembrar_em <= ?
     ORDER BY lembrar_em LIMIT 20
  `).bind(agoraLocal).all();

  for (const t of tarefas || []) {
    const texto = montarTexto(['⏰ Lembrete', '', t.titulo, t.descricao]);
    if (await entregar(env, telefone, texto, 'tarefas', t.id, agora)) enviados++;
  }

  // --- Compromissos da agenda chegando ---
  // `lembrar_em` manda; se estiver vazio, avisa ANTECEDENCIA_AGENDA_MIN antes.
  const { results: compromissos } = await env.DB.prepare(`
    SELECT id, titulo, tipo, data, hora_inicio, local, lembrar_em
      FROM agenda
     WHERE alertado_em IS NULL AND status = 'Agendado'
       AND data >= date(?, '-1 day')
     ORDER BY data, hora_inicio LIMIT 50
  `).bind(agoraLocal.slice(0, 10)).all();

  for (const c of compromissos || []) {
    const inicio = `${c.data} ${c.hora_inicio || '09:00'}`;
    const avisarEm = c.lembrar_em || menosMinutos(inicio, ANTECEDENCIA_AGENDA_MIN);
    if (avisarEm > agoraLocal) continue;

    const texto = montarTexto([
      `📅 ${c.tipo || 'Compromisso'}`,
      '',
      c.titulo,
      `Quando: ${porExtenso(inicio)}`,
      c.local ? `Onde: ${c.local}` : null,
    ]);

    if (await entregar(env, telefone, texto, 'agenda', c.id, agora)) enviados++;
  }

  return { enviados };
}

/** Junta as linhas da mensagem preservando a linha em branco do cabeçalho. */
function montarTexto(linhas) {
  return linhas.filter((l) => l !== null && l !== undefined && l !== false).join('\n');
}

/** Marca antes de enviar; se o envio falhar, devolve a linha para a fila. */
async function entregar(env, telefone, texto, tabela, id, agora = new Date()) {
  const marcado = await env.DB.prepare(
    `UPDATE ${tabela} SET alertado_em = ? WHERE id = ? AND alertado_em IS NULL`
  ).bind(agoraBrasilia(agora), id).run();

  if (!marcado.meta.changes) return false;   // outro ciclo do cron já pegou

  try {
    await enviarWhatsapp(env, telefone, texto);
    return true;
  } catch (erro) {
    await env.DB.prepare(`UPDATE ${tabela} SET alertado_em = NULL WHERE id = ?`).bind(id).run();
    console.error(`lembretes: falha ao enviar ${tabela}#${id} —`, erro.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// 5. Rota HTTP — POST /api/lembretes
// ---------------------------------------------------------------------------

/**
 * Cria lembrete a partir de data pronta ou de frase solta. Devolve `null` se a
 * URL não for dele, para o roteamento existente seguir.
 *
 *   POST /api/lembretes  { "frase": "me lembra amanhã 9h de ligar pro proprietário" }
 *   POST /api/lembretes  { "titulo": "Visita Eucaliptos", "quando": "2026-09-12 14:30" }
 *   POST /api/lembretes/teste   → manda uma mensagem de teste agora
 */
async function rotasLembrete(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/lembretes')) return null;

  const usuario = await getAuth(request, env);   // JWT ou X-Automation-Key (n8n)
  if (!usuario) return json({ sucesso: false, erro: 'não autorizado' }, 401);

  if (request.method !== 'POST') return json({ sucesso: false, erro: 'método não suportado' }, 405);

  if (url.pathname === '/api/lembretes/teste') {
    const telefone = await telefoneAlerta(env);
    if (!telefone) return json({ sucesso: false, erro: '`alerta_whatsapp_telefone` não cadastrado' }, 400);
    await enviarWhatsapp(env, telefone, '✅ Canal de lembretes do CRM funcionando.');
    return json({ sucesso: true });
  }

  const corpo = await request.json().catch(() => ({}));
  let lembrarEm = corpo.quando ? String(corpo.quando).replace('T', ' ').slice(0, 16) : null;
  let titulo = corpo.titulo;

  if (!lembrarEm && corpo.frase) {
    const lido = interpretarLembrete(corpo.frase);
    if (!lido) return json({ sucesso: false, erro: 'não entendi a data/hora do lembrete' }, 400);
    lembrarEm = lido.lembrarEm;
    titulo = titulo || lido.titulo;
  }

  if (!lembrarEm) return json({ sucesso: false, erro: 'informe `quando` ou `frase`' }, 400);
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(lembrarEm)) {
    return json({ sucesso: false, erro: 'data inválida — use "YYYY-MM-DD HH:MM"' }, 400);
  }
  if (!titulo) return json({ sucesso: false, erro: 'informe `titulo`' }, 400);

  const id = await criarLembrete(env, {
    titulo,
    descricao: corpo.descricao,
    lembrarEm,
    relacionadoTipo: corpo.relacionadoTipo,
    relacionadoId: corpo.relacionadoId,
  });

  return json({
    sucesso: true,
    id,
    titulo,
    lembrar_em: lembrarEm,
    confirmacao: `Lembrete marcado para ${porExtenso(lembrarEm)}.`,
  }, 201);
}

// ---------------------------------------------------------------------------
// INSTALAÇÃO — no worker.js publicado
// ---------------------------------------------------------------------------
//
// PASSO 1 — rodar `sql/2026-09-lembretes.sql` no D1 `crm-thiago-leads`.
//
// PASSO 2 — colar as funções acima (tirando `json`, `enviarWhatsapp`,
//   `lerIntegracao` e `getAuth`, que já existem no worker).
//
// PASSO 3 — em `tratarRequisicao`, antes do roteamento CRUD genérico:
//
//     const lembrete = await rotasLembrete(request, env);
//     if (lembrete) return lembrete;
//
// PASSO 4 — no `scheduled()` que já existe, somar mais uma tarefa às três atuais:
//
//     ctx.waitUntil(despacharLembretes(env));
//
//   Conferir em Settings > Triggers com que frequência o cron roda: a precisão
//   do lembrete é a do cron. De 5 em 5 minutos ("*/5 * * * *") é o razoável aqui.
//
// OPCIONAL — criar lembrete falando no WhatsApp: no fluxo da Ana Paula
//   (/webhook/green-api), quando a mensagem vier do próprio número do Thiago e
//   começar com "lembra"/"lembrete", chamar POST /api/lembretes com
//   { "frase": "<texto da mensagem>" } em vez de mandar para o atendimento.
