/**
 * Painel de avisos do CRM — lado do Worker
 * ========================================
 *
 * ATENÇÃO: documentação. Precisa ser colado no `worker.js` publicado.
 *
 * Serve a janela de avisos que fica aberta dentro do CRM
 * (ver `snippets/painel-avisos-crm.html`). Não cria tabela nem grava nada:
 * só lê o que já aconteceu em `leads`, `tarefas` e `agenda`.
 *
 * Reaproveita o que o worker já tem: `getAuth()` e `json()`.
 *
 * FUSO — o ponto delicado deste arquivo:
 *   `leads.criado_em`                     está em UTC (vem de datetime('now'))
 *   `tarefas.alertado_em` / `agenda.*`    estão em horário de Brasília
 * Para não misturar, tudo sai daqui em UTC no formato ISO ('...Z') e quem
 * formata para o Thiago é o navegador, que já está no fuso certo.
 */

const AVISOS_JANELA_PADRAO_H = 24;    // sem `desde`, olha as últimas 24h
const AVISOS_LIMITE = 40;

/**
 * GET /api/avisos?desde=2026-09-10T12:00:00Z
 *
 * Devolve { sucesso, agora, avisos: [...] }, do mais recente para o mais antigo.
 * Cada aviso: { id, tipo, titulo, detalhe, quando, link }
 *   - `id` é estável ("lead-12"), para o painel não repetir o mesmo aviso
 *   - `quando` é sempre UTC ISO
 *   - `link` é o wa.me do lead, quando dá para montar
 */
async function rotasAvisos(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/avisos') return null;

  const usuario = await getAuth(request, env);
  if (!usuario) return json({ sucesso: false, erro: 'não autorizado' }, 401);

  const desde = normalizarDesde(url.searchParams.get('desde'));
  const avisos = [];

  // --- Leads novos (criado_em já está em UTC) ---
  const { results: leads } = await env.DB.prepare(`
    SELECT id, nome, telefone, origem, interesse, criado_em
      FROM leads
     WHERE criado_em > ?
     ORDER BY criado_em DESC
     LIMIT ?
  `).bind(desde, AVISOS_LIMITE).all();

  for (const l of leads || []) {
    avisos.push({
      id: `lead-${l.id}`,
      tipo: 'lead',
      titulo: `Lead novo: ${l.nome || 'sem nome'}`,
      detalhe: [l.origem ? `Origem: ${l.origem}` : null, l.interesse].filter(Boolean).join(' · '),
      quando: paraISO(l.criado_em),
      link: l.telefone ? `https://wa.me/${comDDI(l.telefone)}` : null,
    });
  }

  // --- Lembretes que dispararam (alertado_em está em Brasília: +3h vira UTC) ---
  const { results: tarefas } = await env.DB.prepare(`
    SELECT id, titulo, descricao, datetime(alertado_em, '+3 hours') AS quando_utc
      FROM tarefas
     WHERE alertado_em IS NOT NULL
       AND datetime(alertado_em, '+3 hours') > ?
     ORDER BY alertado_em DESC
     LIMIT ?
  `).bind(desde, AVISOS_LIMITE).all();

  for (const t of tarefas || []) {
    avisos.push({
      id: `tarefa-${t.id}`,
      tipo: 'lembrete',
      titulo: t.titulo,
      detalhe: t.descricao || '',
      quando: paraISO(t.quando_utc),
      link: null,
    });
  }

  // --- Compromissos avisados ---
  const { results: compromissos } = await env.DB.prepare(`
    SELECT id, titulo, tipo, data, hora_inicio, local,
           datetime(alertado_em, '+3 hours') AS quando_utc
      FROM agenda
     WHERE alertado_em IS NOT NULL
       AND datetime(alertado_em, '+3 hours') > ?
     ORDER BY alertado_em DESC
     LIMIT ?
  `).bind(desde, AVISOS_LIMITE).all();

  for (const c of compromissos || []) {
    avisos.push({
      id: `agenda-${c.id}`,
      tipo: 'agenda',
      titulo: prefixarTipo(c.tipo, c.titulo),
      detalhe: [
        c.hora_inicio ? `Hoje ${c.hora_inicio}` : null,
        c.local ? `em ${c.local}` : null,
      ].filter(Boolean).join(' · '),
      quando: paraISO(c.quando_utc),
      link: null,
    });
  }

  avisos.sort((a, b) => (a.quando < b.quando ? 1 : a.quando > b.quando ? -1 : 0));

  return json({
    sucesso: true,
    agora: new Date().toISOString(),
    avisos: avisos.slice(0, AVISOS_LIMITE),
  });
}

/** "Visita" + "Visita Green Field" viraria repetição — só prefixa quando ajuda. */
function prefixarTipo(tipo, titulo) {
  const t = String(tipo || 'Compromisso');
  const alvo = String(titulo || '');
  return alvo.toLowerCase().startsWith(t.toLowerCase()) ? alvo : `${t}: ${alvo}`;
}

/** Aceita ISO do painel ou nada; devolve 'YYYY-MM-DD HH:MM:SS' em UTC. */
function normalizarDesde(valor) {
  const d = valor ? new Date(valor) : null;
  const base = d && !isNaN(d) ? d : new Date(Date.now() - AVISOS_JANELA_PADRAO_H * 3600000);
  return base.toISOString().slice(0, 19).replace('T', ' ');
}

/** 'YYYY-MM-DD HH:MM:SS' (UTC, como o D1 devolve) -> ISO com Z. */
function paraISO(textoUTC) {
  return String(textoUTC || '').replace(' ', 'T').slice(0, 19) + 'Z';
}

/** Telefone com DDI, para montar o link do WhatsApp. */
function comDDI(telefone) {
  const d = String(telefone || '').replace(/\D/g, '');
  return d.length <= 11 ? `55${d}` : d;
}

// ---------------------------------------------------------------------------
// INSTALAÇÃO
// ---------------------------------------------------------------------------
//
// Em `tratarRequisicao`, junto das outras rotas:
//
//     const avisos = await rotasAvisos(request, env);
//     if (avisos) return avisos;
//
// O CORS já está habilitado globalmente por `aplicarCors()`, então o painel
// consegue chamar essa rota mesmo com o CRM aberto de outro endereço.
