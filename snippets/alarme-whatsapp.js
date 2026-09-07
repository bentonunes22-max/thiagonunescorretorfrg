/**
 * Canal de alarme/lembrete no WhatsApp — CRMTHIAGO
 * =================================================
 *
 * ATENÇÃO: este arquivo é DOCUMENTAÇÃO. Este repositório não é deployado.
 * Para o alarme funcionar, este código precisa ser colado dentro do `worker.js`
 * publicado (painel Cloudflare > Workers > crm-thiago-leads-worker > Editar código),
 * junto com os três passos de instalação descritos no final do arquivo.
 *
 * O que ele faz:
 *   1. Envia mensagem no seu WhatsApp pela Evolution API (a mesma instância da "Fernanda").
 *   2. Avisa na hora que um lead novo cai pelo webhook `POST /lead`.
 *   3. Guarda lembretes avulsos na tabela `alarmes` (D1) e dispara no horário,
 *      via Cron Trigger do Worker.
 *
 * Fuso: o Worker roda em UTC. Tudo é gravado em UTC no D1 e convertido para
 * horário de Brasília (UTC-3, fixo — o Brasil não tem mais horário de verão)
 * só na entrada e na exibição.
 */

// ---------------------------------------------------------------------------
// Configuração (variáveis e secrets do Worker — nada de chave no código)
// ---------------------------------------------------------------------------
// Painel Cloudflare > Workers > crm-thiago-leads-worker > Settings > Variables:
//
//   EVOLUTION_URL        (texto)   ex.: https://evolution.seudominio.com.br
//   EVOLUTION_INSTANCIA  (texto)   nome da instância que roda a Fernanda
//   EVOLUTION_APIKEY     (SECRET)  a apikey da Evolution — marque como "Encrypt"
//   ALARME_DESTINO       (texto)   seu número com DDI: 5541998921475
//
// `DB` é o binding do D1 `crm-thiago-leads` que o worker já usa. Se no seu
// worker.js ele tiver outro nome, troque `env.DB` abaixo pelo nome certo.

const FUSO_BRASIL_HORAS = -3;

/** 0 = payload da Evolution v2, 1 = v1. Descoberto no primeiro envio bem-sucedido. */
let formatoEvolution = null;

// ---------------------------------------------------------------------------
// 1. Envio pela Evolution API
// ---------------------------------------------------------------------------

/** Deixa o número no formato que a Evolution espera: só dígitos, com DDI 55. */
function normalizarNumero(numero) {
  let n = String(numero || '').replace(/\D/g, '');
  if (n.length <= 11) n = '55' + n;          // veio sem DDI
  return n;
}

/** Esconde o miolo do telefone antes de qualquer log (LGPD). */
function mascararNumero(numero) {
  const n = String(numero || '');
  return n.length < 8 ? '***' : n.slice(0, 4) + '****' + n.slice(-4);
}

/**
 * Envia uma mensagem de texto pela Evolution API.
 * Tenta o formato da v2 e, se a instância for v1, refaz no formato antigo.
 * Retorna { ok: boolean, erro?: string }.
 */
async function enviarWhatsApp(env, numero, texto) {
  const base = String(env.EVOLUTION_URL || '').replace(/\/+$/, '');
  if (!base || !env.EVOLUTION_INSTANCIA || !env.EVOLUTION_APIKEY) {
    return { ok: false, erro: 'Evolution API não configurada no Worker' };
  }

  const url = `${base}/message/sendText/${env.EVOLUTION_INSTANCIA}`;
  const destino = normalizarNumero(numero);
  const cabecalho = { 'Content-Type': 'application/json', apikey: env.EVOLUTION_APIKEY };

  const formatos = [
    { number: destino, text: texto },                      // Evolution v2
    { number: destino, textMessage: { text: texto } },      // Evolution v1
  ];
  // Depois do primeiro acerto, o Worker lembra qual formato a instância aceita
  // enquanto estiver quente, e para de gastar uma requisição à toa.
  if (formatoEvolution === 1) formatos.reverse();

  let ultimoErro = '';
  for (const [indice, corpo] of formatos.entries()) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: cabecalho,
        body: JSON.stringify(corpo),
      });
      if (r.ok) {
        formatoEvolution = formatoEvolution === 1 ? (indice === 0 ? 1 : 0) : indice;
        return { ok: true };
      }
      ultimoErro = `HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`;
      if (r.status !== 400) break;   // 400 = payload no formato errado, vale tentar o outro
    } catch (e) {
      ultimoErro = String(e && e.message ? e.message : e);
      break;                          // rede fora: tentar de novo não ajuda
    }
  }

  console.log('alarme: falha ao enviar para', mascararNumero(destino), '—', ultimoErro);
  return { ok: false, erro: ultimoErro };
}

// ---------------------------------------------------------------------------
// 2. Datas — conversão Brasília <-> UTC
// ---------------------------------------------------------------------------

/** Date -> 'YYYY-MM-DD HH:MM:SS' em UTC, o formato usado na coluna disparar_em. */
function paraUTC(data) {
  return data.toISOString().slice(0, 19).replace('T', ' ');
}

/** 'YYYY-MM-DD HH:MM:SS' (UTC) -> 'dd/mm às HH:MM' no horário de Brasília. */
function paraBrasilia(textoUTC) {
  const d = new Date(String(textoUTC).replace(' ', 'T') + 'Z');
  const local = new Date(d.getTime() + FUSO_BRASIL_HORAS * 3600000);
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(local.getUTCDate())}/${dois(local.getUTCMonth() + 1)} às ` +
         `${dois(local.getUTCHours())}:${dois(local.getUTCMinutes())}`;
}

/** Monta um instante a partir de componentes em horário de Brasília. */
function deBrasilia(ano, mes, dia, hora, minuto) {
  return new Date(Date.UTC(ano, mes - 1, dia, hora - FUSO_BRASIL_HORAS, minuto, 0));
}

// ---------------------------------------------------------------------------
// 3. Interpretador de lembrete em português
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
 * Lê uma frase solta e devolve { dispararEm, titulo } ou null se não achar
 * horário nenhum. Entende, por exemplo:
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

  const marcar = (m, deslocamento = 0) => cortes.push([m.index + deslocamento, m.index + deslocamento + m[0].length]);

  // "em 40 minutos" / "em 2 horas" / "em 3 dias"
  const rel = t.match(/\bem\s+(\d{1,3})\s*(min|mins|minuto|minutos|h|hora|horas|dia|dias)\b/);
  if (rel) {
    const n = parseInt(rel[1], 10);
    const ms = /^min/.test(rel[2]) ? n * 60000 : /^(h|hora)/.test(rel[2]) ? n * 3600000 : n * 86400000;
    marcar(rel);
    return {
      dispararEm: paraUTC(new Date(agora.getTime() + ms)),
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
  const inicioData = dataExplicita ? dataExplicita.index : -1;
  const tHora = dataExplicita
    ? t.slice(0, inicioData) + ' '.repeat(dataExplicita[0].length) + t.slice(inicioData + dataExplicita[0].length)
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

  let quando = deBrasilia(ano, mes, dia, hora, minuto);
  if (!achouData && quando <= agora) quando = new Date(quando.getTime() + 86400000);

  return { dispararEm: paraUTC(quando), titulo: limparTitulo(bruto, cortes) };
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

  // "de", "dia", "as" só são removidos quando sobraram órfãos de um corte —
  // senão um lembrete que comece com "as chaves..." perderia a primeira palavra.
  if (tinhaComando || cortouNoComeco) {
    let anterior;
    do { anterior = titulo; titulo = titulo.replace(LIGACOES, ''); } while (titulo !== anterior);
  }

  titulo = titulo.replace(/\s*\b(as|às|dia|de|do|da)\b\s*$/i, '').trim();
  return titulo || 'Lembrete';
}

// ---------------------------------------------------------------------------
// 4. Fila de alarmes no D1
// ---------------------------------------------------------------------------

async function criarAlarme(env, dados) {
  const r = await env.DB.prepare(
    `INSERT INTO alarmes (titulo, mensagem, disparar_em, destino, origem, lead_id, imovel_id, repetir)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    dados.titulo,
    dados.mensagem || null,
    dados.dispararEm,
    dados.destino || null,
    dados.origem || 'manual',
    dados.leadId || null,
    dados.imovelId || null,
    dados.repetir || null
  ).run();
  return r.meta.last_row_id;
}

/** Calcula o próximo disparo de um alarme repetido. */
function proximoDisparo(dispararEmUTC, repetir) {
  const d = new Date(String(dispararEmUTC).replace(' ', 'T') + 'Z');
  if (repetir === 'diario')  d.setUTCDate(d.getUTCDate() + 1);
  else if (repetir === 'semanal') d.setUTCDate(d.getUTCDate() + 7);
  else if (repetir === 'mensal')  d.setUTCMonth(d.getUTCMonth() + 1);
  else return null;
  return paraUTC(d);
}

/**
 * Varre a fila e envia o que já venceu. Chamado pelo Cron Trigger.
 * Desiste depois de 3 tentativas para não ficar reenviando eternamente.
 */
async function despacharAlarmes(env, limite = 20) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM alarmes
      WHERE status = 'pendente' AND disparar_em <= datetime('now') AND tentativas < 3
      ORDER BY disparar_em
      LIMIT ?`
  ).bind(limite).all();

  let enviados = 0;
  for (const a of results || []) {
    const texto = a.mensagem ? `⏰ *${a.titulo}*\n\n${a.mensagem}` : `⏰ *${a.titulo}*`;
    const r = await enviarWhatsApp(env, a.destino || env.ALARME_DESTINO, texto);

    if (r.ok) {
      await env.DB.prepare(
        `UPDATE alarmes SET status='enviado', enviado_em=datetime('now'), erro=NULL WHERE id=?`
      ).bind(a.id).run();
      enviados++;

      const proximo = proximoDisparo(a.disparar_em, a.repetir);
      if (proximo) {
        await criarAlarme(env, {
          titulo: a.titulo, mensagem: a.mensagem, dispararEm: proximo,
          destino: a.destino, origem: a.origem, leadId: null,
          imovelId: a.imovel_id, repetir: a.repetir,
        });
      }
    } else {
      const tentativas = a.tentativas + 1;
      await env.DB.prepare(
        `UPDATE alarmes SET tentativas=?, erro=?, status=CASE WHEN ?>=3 THEN 'erro' ELSE 'pendente' END
          WHERE id=?`
      ).bind(tentativas, r.erro.slice(0, 300), tentativas, a.id).run();
    }
  }
  return { verificados: (results || []).length, enviados };
}

// ---------------------------------------------------------------------------
// 5. Aviso de lead novo
// ---------------------------------------------------------------------------

/**
 * Chamar dentro do handler do `POST /lead`, depois de gravar o lead.
 * Registra o alarme na fila (o cron cobre se o envio imediato falhar) e tenta
 * mandar na hora, sem segurar a resposta do webhook.
 */
async function avisarLeadNovo(env, ctx, lead) {
  const nome = lead.nome || lead.name || 'sem nome';
  const fone = lead.telefone || lead.phone || '';
  const origem = lead.origem || lead.source || 'não informada';
  const interesse = lead.interesse || lead.mensagem || lead.message || '';

  const linhas = [
    '🔔 *Lead novo no CRM*',
    '',
    `*Nome:* ${nome}`,
    fone ? `*WhatsApp:* ${fone}` : null,
    `*Origem:* ${origem}`,
    interesse ? `*Interesse:* ${String(interesse).slice(0, 300)}` : null,
    fone ? `\nAbrir conversa: https://wa.me/${normalizarNumero(fone)}` : null,
  ].filter(Boolean);

  const texto = linhas.join('\n');

  // Grava na fila (idempotente por lead — o índice único barra duplicata do webhook).
  if (lead.id) {
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO alarmes (titulo, mensagem, disparar_em, origem, lead_id)
         VALUES (?, ?, datetime('now'), 'lead_novo', ?)`
      ).bind(`Lead novo: ${nome}`, texto, lead.id).run();
    } catch (e) {
      console.log('alarme: não consegui enfileirar o lead novo —', e.message);
    }
  }

  // Tenta entregar na hora, em paralelo à resposta do webhook.
  ctx.waitUntil(
    enviarWhatsApp(env, env.ALARME_DESTINO, texto).then(async (r) => {
      if (r.ok && lead.id) {
        await env.DB.prepare(
          `UPDATE alarmes SET status='enviado', enviado_em=datetime('now')
            WHERE origem='lead_novo' AND lead_id=? AND status='pendente'`
        ).bind(lead.id).run();
      }
    })
  );
}

// ---------------------------------------------------------------------------
// 6. Rotas HTTP — /api/alarmes
// ---------------------------------------------------------------------------

const json = (dados, status = 200) => new Response(JSON.stringify(dados), {
  status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

/**
 * Roteador do canal de alarme. Devolve `null` quando a URL não é dele, para o
 * worker.js seguir com as rotas que já existem.
 *
 *   POST   /api/alarmes            { titulo, mensagem?, quando|frase, repetir? }
 *   GET    /api/alarmes            lista os pendentes (?status=enviado para os já enviados)
 *   DELETE /api/alarmes/:id        cancela
 *   POST   /api/alarmes/teste      manda uma mensagem de teste agora
 */
async function rotasAlarme(request, env, ctx) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/alarmes')) return null;

  // >>> TROQUE por sua função de autenticação JWT já existente no worker.js.
  // >>> Sem isso, qualquer um dispara mensagem no seu WhatsApp.
  const usuario = await verificarToken(request, env);
  if (!usuario) return json({ erro: 'não autorizado' }, 401);

  // POST /api/alarmes/teste
  if (request.method === 'POST' && url.pathname === '/api/alarmes/teste') {
    const r = await enviarWhatsApp(env, env.ALARME_DESTINO, '✅ Canal de alarme do CRM funcionando.');
    return json(r, r.ok ? 200 : 502);
  }

  // POST /api/alarmes
  if (request.method === 'POST' && url.pathname === '/api/alarmes') {
    const corpo = await request.json().catch(() => ({}));
    let dispararEm = null;
    let titulo = corpo.titulo;

    if (corpo.quando) {
      // ISO vindo do CRM: "2026-09-12T14:30" (horário de Brasília) ou com offset.
      const d = /[zZ]|[+-]\d{2}:\d{2}$/.test(corpo.quando)
        ? new Date(corpo.quando)
        : new Date(corpo.quando + '-03:00');
      if (isNaN(d)) return json({ erro: 'data inválida' }, 400);
      dispararEm = paraUTC(d);
    } else if (corpo.frase) {
      const lido = interpretarLembrete(corpo.frase);
      if (!lido) return json({ erro: 'não entendi a data/hora do lembrete' }, 400);
      dispararEm = lido.dispararEm;
      titulo = titulo || lido.titulo;
    } else {
      return json({ erro: 'informe `quando` ou `frase`' }, 400);
    }

    if (!titulo) return json({ erro: 'informe `titulo`' }, 400);

    const id = await criarAlarme(env, {
      titulo,
      mensagem: corpo.mensagem,
      dispararEm,
      destino: corpo.destino,
      origem: 'manual',
      leadId: corpo.leadId,
      imovelId: corpo.imovelId,
      repetir: corpo.repetir,
    });

    return json({ id, titulo, dispararEm, confirmacao: `Alarme marcado para ${paraBrasilia(dispararEm)}.` }, 201);
  }

  // GET /api/alarmes
  if (request.method === 'GET' && url.pathname === '/api/alarmes') {
    const status = url.searchParams.get('status') || 'pendente';
    const { results } = await env.DB.prepare(
      `SELECT id, titulo, mensagem, disparar_em, origem, repetir, status, lead_id, imovel_id
         FROM alarmes WHERE status = ? ORDER BY disparar_em LIMIT 100`
    ).bind(status).all();
    return json((results || []).map((a) => ({ ...a, quando: paraBrasilia(a.disparar_em) })));
  }

  // DELETE /api/alarmes/:id
  const del = url.pathname.match(/^\/api\/alarmes\/(\d+)$/);
  if (request.method === 'DELETE' && del) {
    await env.DB.prepare(`UPDATE alarmes SET status='cancelado' WHERE id=?`).bind(del[1]).run();
    return json({ ok: true });
  }

  return json({ erro: 'rota não encontrada' }, 404);
}

// ---------------------------------------------------------------------------
// INSTALAÇÃO — três passos no worker.js publicado
// ---------------------------------------------------------------------------
//
// PASSO 1 — rodar `sql/2026-09-alarmes.sql` no D1 `crm-thiago-leads`.
//
// PASSO 2 — no `export default` do worker.js:
//
//   export default {
//     async fetch(request, env, ctx) {
//       const alarme = await rotasAlarme(request, env, ctx);
//       if (alarme) return alarme;
//       ... o roteamento que já existe ...
//     },
//
//     // Cron Trigger: Settings > Triggers > Cron Triggers > Add > "*/5 * * * *"
//     async scheduled(event, env, ctx) {
//       ctx.waitUntil(despacharAlarmes(env));
//     },
//   };
//
// PASSO 3 — dentro do handler do `POST /lead`, logo depois de gravar o lead:
//
//   await avisarLeadNovo(env, ctx, { id: idGravado, ...dadosDoLead });
//
// Opcional — criar lembrete falando com a Fernanda no WhatsApp: no n8n, quando a
// mensagem recebida for do seu próprio número e começar com "lembra"/"lembrete",
// chame `POST /api/alarmes` com `{ "frase": "<texto da mensagem>" }` em vez de
// mandar para o fluxo de atendimento.
