var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __defProp22 = Object.defineProperty;
var __name22 = /* @__PURE__ */ __name2((target, value) => __defProp22(target, "name", { value, configurable: true }), "__name");
var __defProp222 = Object.defineProperty;
var __name222 = /* @__PURE__ */ __name22((target, value) => __defProp222(target, "name", { value, configurable: true }), "__name");
var __defProp2222 = Object.defineProperty;
var __name2222 = /* @__PURE__ */ __name222((target, value) => __defProp2222(target, "name", { value, configurable: true }), "__name");
var __defProp22222 = Object.defineProperty;
var __name22222 = /* @__PURE__ */ __name2222((target, value) => __defProp22222(target, "name", { value, configurable: true }), "__name");
var PBKDF2_ITER = 1e5;
var SESSAO_DURACAO_SEGUNDOS = 60 * 60 * 24 * 14;
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
var ORIGENS_PERMITIDAS = ["https://crmthiago.vercel.app", "http://localhost:5173", "http://localhost:3000"];
function origemPermitida(request) {
  const origem = request.headers.get("Origin");
  if (!origem)
    return null;
  if (ORIGENS_PERMITIDAS.includes(origem))
    return origem;
  if (/^https:\/\/crmthiago-[a-z0-9-]+\.vercel\.app$/.test(origem))
    return origem;
  return null;
}
__name(origemPermitida, "origemPermitida");
__name2(origemPermitida, "origemPermitida");
function aplicarCors(resp, request) {
  const origem = origemPermitida(request);
  const headers = new Headers(resp.headers);
  if (origem) {
    headers.set("Access-Control-Allow-Origin", origem);
  } else {
    headers.delete("Access-Control-Allow-Origin");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Vary", "Origin");
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}
__name(aplicarCors, "aplicarCors");
__name2(aplicarCors, "aplicarCors");
__name22(corsHeaders, "corsHeaders");
__name222(corsHeaders, "corsHeaders");
__name2222(corsHeaders, "corsHeaders");
__name22222(corsHeaders, "corsHeaders");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}
__name(json, "json");
__name2(json, "json");
__name22(json, "json");
__name222(json, "json");
__name2222(json, "json");
__name22222(json, "json");
function buf2hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(buf2hex, "buf2hex");
__name2(buf2hex, "buf2hex");
__name22(buf2hex, "buf2hex");
__name222(buf2hex, "buf2hex");
__name2222(buf2hex, "buf2hex");
__name22222(buf2hex, "buf2hex");
function hex2buf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  return bytes.buffer;
}
__name(hex2buf, "hex2buf");
__name2(hex2buf, "hex2buf");
__name22(hex2buf, "hex2buf");
__name222(hex2buf, "hex2buf");
__name2222(hex2buf, "hex2buf");
__name22222(hex2buf, "hex2buf");
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64url, "b64url");
__name2(b64url, "b64url");
__name22(b64url, "b64url");
__name222(b64url, "b64url");
__name2222(b64url, "b64url");
__name22222(b64url, "b64url");
function b64urlDecodeToBuf(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4)
    str += "=";
  const bin = atob(str);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++)
    buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
__name(b64urlDecodeToBuf, "b64urlDecodeToBuf");
__name2(b64urlDecodeToBuf, "b64urlDecodeToBuf");
__name22(b64urlDecodeToBuf, "b64urlDecodeToBuf");
__name222(b64urlDecodeToBuf, "b64urlDecodeToBuf");
__name2222(b64urlDecodeToBuf, "b64urlDecodeToBuf");
__name22222(b64urlDecodeToBuf, "b64urlDecodeToBuf");
async function obterChaveIntegracoes(env) {
  if (!env.INTEGRACOES_KEY)
    return null;
  const bruta = new Uint8Array(b64urlDecodeToBuf(env.INTEGRACOES_KEY));
  return crypto.subtle.importKey("raw", bruta, "AES-GCM", false, ["encrypt", "decrypt"]);
}
__name(obterChaveIntegracoes, "obterChaveIntegracoes");
__name2(obterChaveIntegracoes, "obterChaveIntegracoes");
async function criptografarValor(env, texto) {
  const chave = await obterChaveIntegracoes(env);
  if (!chave)
    return texto;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cifrado = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, chave, new TextEncoder().encode(String(texto)));
  return `enc:v1:${b64url(iv.buffer)}:${b64url(cifrado)}`;
}
__name(criptografarValor, "criptografarValor");
__name2(criptografarValor, "criptografarValor");
async function descriptografarValor(env, valor) {
  if (!valor || !String(valor).startsWith("enc:v1:"))
    return valor;
  const chave = await obterChaveIntegracoes(env);
  if (!chave)
    throw new Error("INTEGRACOES_KEY n\xE3o configurada \u2014 n\xE3o \xE9 poss\xEDvel ler valores j\xE1 criptografados");
  const [, , ivB64, dadosB64] = String(valor).split(":");
  const iv = new Uint8Array(b64urlDecodeToBuf(ivB64));
  const decriptado = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, chave, b64urlDecodeToBuf(dadosB64));
  return new TextDecoder().decode(decriptado);
}
__name(descriptografarValor, "descriptografarValor");
__name2(descriptografarValor, "descriptografarValor");
async function hashSenha(senha, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16)).buffer;
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITER, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return { hash: buf2hex(bits), salt: buf2hex(salt) };
}
__name(hashSenha, "hashSenha");
__name2(hashSenha, "hashSenha");
__name22(hashSenha, "hashSenha");
__name222(hashSenha, "hashSenha");
__name2222(hashSenha, "hashSenha");
__name22222(hashSenha, "hashSenha");
async function signJWT(payload, secret) {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = b64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${b64url(sig)}`;
}
__name(signJWT, "signJWT");
__name2(signJWT, "signJWT");
__name22(signJWT, "signJWT");
__name222(signJWT, "signJWT");
__name2222(signJWT, "signJWT");
__name22222(signJWT, "signJWT");
async function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3)
    return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("HMAC", key, b64urlDecodeToBuf(sigB64), enc.encode(`${headerB64}.${payloadB64}`));
  if (!valid)
    return null;
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
  if (payload.exp && Date.now() / 1e3 > payload.exp)
    return null;
  return payload;
}
__name(verifyJWT, "verifyJWT");
__name2(verifyJWT, "verifyJWT");
__name22(verifyJWT, "verifyJWT");
__name222(verifyJWT, "verifyJWT");
__name2222(verifyJWT, "verifyJWT");
__name22222(verifyJWT, "verifyJWT");
async function getAuth(request, env) {
  const automationKey = request.headers.get("X-Automation-Key");
  if (automationKey && env.AUTOMATION_KEY && automationKey === env.AUTOMATION_KEY) {
    return { sub: "automation", nome: "Automa\xE7\xE3o (n8n)", email: null, papel: "automation" };
  }
  const auth = request.headers.get("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token)
    return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload)
    return null;
  if (payload.sub && payload.sub !== "automation") {
    const linhaUsuario = await env.DB.prepare(`SELECT token_version FROM users WHERE id = ?`).bind(payload.sub).first();
    if (!linhaUsuario || (payload.tv || 1) !== linhaUsuario.token_version) {
      return null;
    }
  }
  return payload;
}
__name(getAuth, "getAuth");
__name2(getAuth, "getAuth");
__name22(getAuth, "getAuth");
__name222(getAuth, "getAuth");
__name2222(getAuth, "getAuth");
__name22222(getAuth, "getAuth");
async function enviarAlertaLead(env, lead) {
  try {
    const [idInstance, apiTokenInstance, telefoneRaw] = await Promise.all([
      lerIntegracao(env, "green_api_id_instance"),
      lerIntegracao(env, "green_api_token_instance"),
      lerIntegracao(env, "alerta_whatsapp_telefone")
    ]);
    if (!idInstance || !apiTokenInstance || !telefoneRaw)
      return;
    const telefone = String(telefoneRaw).replace(/\D/g, "");
    const linhas = [
      "\u{1F514} Novo lead no site!",
      "",
      `Nome: ${lead.nome || "-"}`,
      `Telefone: ${lead.telefone || "-"}`,
      lead.email ? `E-mail: ${lead.email}` : null,
      `Interesse: ${lead.interesse || lead.mensagem || "-"}`,
      `Origem: ${lead.origem || "site"}`
    ].filter(Boolean);
    await fetch(`https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: `${telefone}@c.us`, message: linhas.join("\n") })
    });
  } catch (erro) {
    console.error("Falha ao enviar alerta de lead no WhatsApp:", erro);
  }
}
__name(enviarAlertaLead, "enviarAlertaLead");
__name2(enviarAlertaLead, "enviarAlertaLead");
__name22(enviarAlertaLead, "enviarAlertaLead");
__name222(enviarAlertaLead, "enviarAlertaLead");
__name2222(enviarAlertaLead, "enviarAlertaLead");
__name22222(enviarAlertaLead, "enviarAlertaLead");
var ORIGENS_CANONICAS = {
  "instagram": "Instagram",
  "chaves na m\xE3o": "Chaves na M\xE3o",
  "chaves na mao": "Chaves na M\xE3o",
  "zap im\xF3veis": "ZAP Im\xF3veis",
  "zap imoveis": "ZAP Im\xF3veis",
  "balc\xE3o": "Balc\xE3o",
  "balcao": "Balc\xE3o",
  "indica\xE7\xE3o": "Indica\xE7\xE3o",
  "indicacao": "Indica\xE7\xE3o",
  "prospec\xE7\xE3o": "Prospec\xE7\xE3o",
  "prospeccao": "Prospec\xE7\xE3o",
  "prospec\xE7ao": "Prospec\xE7\xE3o",
  "parceria imobili\xE1ria": "Parceria imobili\xE1ria",
  "parceria imobiliaria": "Parceria imobili\xE1ria",
  "n\xE3o informado": "N\xE3o informado",
  "nao informado": "N\xE3o informado"
};
function normalizarOrigem(valor) {
  const t = String(valor || "").trim();
  if (!t)
    return t;
  return ORIGENS_CANONICAS[t.toLowerCase()] || t;
}
__name(normalizarOrigem, "normalizarOrigem");
__name2(normalizarOrigem, "normalizarOrigem");
async function criarFollowUpAutomatico(env, leadId, dias = 2) {
  if (!leadId)
    return;
  const jaTemAtivo = await env.DB.prepare(
    `SELECT id FROM follow_ups WHERE lead_id = ? AND status = 'Ativo' LIMIT 1`
  ).bind(leadId).first();
  if (jaTemAtivo)
    return;
  const proximo = new Date(Date.now() + dias * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  await env.DB.prepare(
    `INSERT INTO follow_ups (lead_id, proximo_contato, canal, status, observacoes)
     VALUES (?, ?, 'WhatsApp', 'Ativo', 'Follow-up autom\xE1tico \u2014 lead entrou no funil')`
  ).bind(leadId, proximo).run();
}
__name(criarFollowUpAutomatico, "criarFollowUpAutomatico");
__name2(criarFollowUpAutomatico, "criarFollowUpAutomatico");
async function registrarLeadEntrante(env, lead, ctx) {
  const origemId = lead.origem_id || null;
  if (origemId) {
    const jaExiste = await env.DB.prepare(`SELECT id FROM leads_capture WHERE origem_id = ?`).bind(origemId).first();
    if (jaExiste)
      return { novo: false, capturaId: jaExiste.id };
  }
  const captura = await env.DB.prepare(`
    INSERT INTO leads_capture (nome, telefone, email, origem, interesse, mensagem, zona_interesse, origem_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    lead.nome || null,
    lead.telefone || null,
    lead.email || null,
    lead.origem || null,
    lead.interesse || null,
    lead.mensagem || null,
    lead.zona_interesse || null,
    origemId
  ).run();
  const nomeFunil = lead.nome || lead.telefone || lead.email || "Contato sem nome";
  const insercaoLead = await env.DB.prepare(`
    INSERT INTO leads (nome, telefone, email, interesse, estagio, origem, origem_id, nota_inicial, stage_changed_at, origem_automatica)
    VALUES (?, ?, ?, ?, 'Novo', ?, ?, ?, datetime('now'), 1)
  `).bind(
    nomeFunil,
    lead.telefone || null,
    lead.email || null,
    lead.interesse || null,
    lead.origem || null,
    origemId,
    lead.mensagem || null
  ).run();
  const leadId = insercaoLead.meta.last_row_id;
  if (ctx)
    ctx.waitUntil(criarFollowUpAutomatico(env, leadId).catch((e) => console.error("Falha ao criar follow-up automatico:", e)));
  else
    await criarFollowUpAutomatico(env, leadId).catch((e) => console.error("Falha ao criar follow-up automatico:", e));
  if (ctx)
    ctx.waitUntil(enviarAlertaLead(env, lead));
  else
    await enviarAlertaLead(env, lead);
  if (lead.telefone) {
    if (ctx)
      ctx.waitUntil(ativarAnaPaula(env, leadId).catch((e) => console.error("Falha ao ativar Ana Paula automaticamente:", e)));
    else
      await ativarAnaPaula(env, leadId).catch((e) => console.error("Falha ao ativar Ana Paula automaticamente:", e));
  }
  return { novo: true, capturaId: captura.meta.last_row_id, leadId };
}
__name(registrarLeadEntrante, "registrarLeadEntrante");
__name2(registrarLeadEntrante, "registrarLeadEntrante");
__name22(registrarLeadEntrante, "registrarLeadEntrante");
__name222(registrarLeadEntrante, "registrarLeadEntrante");
__name2222(registrarLeadEntrante, "registrarLeadEntrante");
__name22222(registrarLeadEntrante, "registrarLeadEntrante");
function extrairCampoLead(fieldData, nomes) {
  for (const campo of fieldData || []) {
    const chave = String(campo.name || "").toLowerCase();
    if (nomes.includes(chave)) {
      return campo.values && campo.values[0] || null;
    }
  }
  return null;
}
__name(extrairCampoLead, "extrairCampoLead");
__name2(extrairCampoLead, "extrairCampoLead");
__name22(extrairCampoLead, "extrairCampoLead");
__name222(extrairCampoLead, "extrairCampoLead");
__name2222(extrairCampoLead, "extrairCampoLead");
__name22222(extrairCampoLead, "extrairCampoLead");
async function marcarLeadsPerdidosAutomaticamente(env) {
  const controle = await env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = 'ultima_varredura_perdidos_em'`).first();
  if (controle?.valor) {
    const horasDesde = (Date.now() - new Date(controle.valor).getTime()) / 36e5;
    if (horasDesde < 20)
      return;
  }
  try {
    const { results: candidatos } = await env.DB.prepare(`
      SELECT l.id, l.nome, l.telefone
      FROM leads l
      WHERE l.estagio NOT IN ('Fechado', 'Perdido')
        AND julianday('now') - julianday(l.stage_changed_at) > 30
        AND (
          EXISTS (
            SELECT 1 FROM follow_ups f WHERE f.lead_id = l.id
            AND f.status IN ('Ativo', 'Aguardando Thiago')
            AND julianday('now') - julianday(f.proximo_contato) > 15
          )
          OR (
            NOT EXISTS (SELECT 1 FROM follow_ups f WHERE f.lead_id = l.id)
            AND julianday('now') - julianday(l.stage_changed_at) > 45
          )
        )
    `).all();
    if (!candidatos || candidatos.length === 0)
      return;
    for (const lead of candidatos) {
      await env.DB.prepare(
        `UPDATE leads SET estagio = 'Perdido', stage_changed_at = datetime('now') WHERE id = ?`
      ).bind(lead.id).run();
      await env.DB.prepare(
        `UPDATE follow_ups SET status = 'Conclu\xEDdo', atualizado_em = datetime('now') WHERE lead_id = ? AND status IN ('Ativo', 'Aguardando Thiago')`
      ).bind(lead.id).run();
    }
    await env.DB.prepare(`
      INSERT INTO integracoes (chave, valor, atualizado_em) VALUES ('ultima_varredura_perdidos_em', ?, datetime('now'))
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now')
    `).bind((/* @__PURE__ */ new Date()).toISOString()).run();
    const telefoneAlerta = await lerIntegracao(env, "alerta_whatsapp_telefone");
    if (telefoneAlerta) {
      const listaNomes = candidatos.map((l) => `- ${l.nome || "sem nome"} (${l.telefone || "sem telefone"})`).join("\n");
      await enviarWhatsapp(
        env,
        telefoneAlerta,
        `\u{1F9F9} Marquei ${candidatos.length} lead(s) como Perdido automaticamente \u2014 mais de 30 dias parados no funil e follow-up vencido h\xE1 15+ dias:

${listaNomes}

Se algum ainda estiver quente, \xE9 s\xF3 reabrir o est\xE1gio dele no CRM.`
      ).catch(() => {
      });
    }
  } catch (erroPerdidos) {
    console.error("Falha na varredura automatica de leads perdidos:", erroPerdidos);
  }
}
__name(marcarLeadsPerdidosAutomaticamente, "marcarLeadsPerdidosAutomaticamente");
__name2(marcarLeadsPerdidosAutomaticamente, "marcarLeadsPerdidosAutomaticamente");
async function executarBackupAutomatico(env) {
  const TABELAS_BACKUP = ["leads", "clientes", "imoveis", "users", "integracoes", "follow_ups", "agenda", "tarefas", "ana_paula_conversas", "instagram_conversas"];
  const controle = await env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = 'ultimo_backup_em'`).first();
  if (controle?.valor) {
    const diasDesde = (Date.now() - new Date(controle.valor).getTime()) / 864e5;
    if (diasDesde < 6)
      return;
  }
  const dataStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
  try {
    for (const tabela of TABELAS_BACKUP) {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS _bkp_${dataStr}_${tabela} AS SELECT * FROM ${tabela}`).run().catch((e) => {
        console.error(`Falha ao copiar backup de ${tabela}:`, e);
      });
    }
    const tabelasAntigas = await env.DB.prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE '_bkp_%'`
    ).all();
    const limiteAntigo = Date.now() - 28 * 864e5;
    for (const t of tabelasAntigas.results || []) {
      const m = t.name.match(/^_bkp_(\d{4})(\d{2})(\d{2})_/);
      if (!m)
        continue;
      const dataTabela = (/* @__PURE__ */ new Date(`${m[1]}-${m[2]}-${m[3]}`)).getTime();
      if (dataTabela < limiteAntigo) {
        await env.DB.prepare(`DROP TABLE IF EXISTS "${t.name}"`).run().catch(() => {
        });
      }
    }
    await env.DB.prepare(`
      INSERT INTO integracoes (chave, valor, atualizado_em) VALUES ('ultimo_backup_em', ?, datetime('now'))
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now')
    `).bind((/* @__PURE__ */ new Date()).toISOString()).run();
  } catch (erroBackup) {
    console.error("Falha no backup autom\xE1tico semanal:", erroBackup);
  }
}
__name(executarBackupAutomatico, "executarBackupAutomatico");
__name2(executarBackupAutomatico, "executarBackupAutomatico");
async function registrarMetaSyncLog(env, { sucesso, novos = 0, http_status = null, erro = null }) {
  try {
    await env.DB.prepare(
      `INSERT INTO meta_sync_log (sucesso, novos, http_status, erro) VALUES (?, ?, ?, ?)`
    ).bind(sucesso ? 1 : 0, novos, http_status, erro).run();
  } catch (e) {
    console.error("Falha ao gravar meta_sync_log:", e);
  }
}
__name(registrarMetaSyncLog, "registrarMetaSyncLog");
__name2(registrarMetaSyncLog, "registrarMetaSyncLog");
async function sincronizarLeadsMeta(env) {
  const resultado = { novos: 0, erro: null };
  try {
    const [pageToken, formId] = await Promise.all([
      lerIntegracao(env, "meta_page_access_token"),
      lerIntegracao(env, "meta_leadgen_form_id")
    ]);
    if (!pageToken || !formId) {
      resultado.erro = "Integra\xE7\xE3o do Meta (Instagram/Facebook Lead Ads) n\xE3o configurada.";
      await registrarMetaSyncLog(env, { sucesso: false, erro: resultado.erro });
      return resultado;
    }
    const resp = await fetch(
      `https://graph.facebook.com/v20.0/${formId}/leads?fields=id,created_time,field_data&limit=100&access_token=${pageToken}`
    );
    const dados = await resp.json();
    if (dados.error) {
      resultado.erro = dados.error.message || "Erro ao consultar leads do Meta";
      await registrarMetaSyncLog(env, { sucesso: false, http_status: resp.status, erro: resultado.erro });
      return resultado;
    }
    for (const lead of dados.data || []) {
      const origemId = `meta_lead_${lead.id}`;
      const nome = extrairCampoLead(lead.field_data, ["full_name", "nome", "name"]) || "Lead do Instagram/Facebook";
      const telefone = extrairCampoLead(lead.field_data, ["phone_number", "telefone", "phone"]);
      const email = extrairCampoLead(lead.field_data, ["email"]);
      const outrasRespostas = (lead.field_data || []).filter((c) => {
        const chave = String(c.name || "").toLowerCase();
        return !["full_name", "nome", "name", "phone_number", "telefone", "phone", "email"].includes(chave);
      }).map((c) => `${c.name}: ${c.values && c.values[0] || "-"}`).join("\n");
      const registro = await registrarLeadEntrante(env, {
        nome,
        telefone,
        email,
        origem: "Instagram/Facebook \u2014 An\xFAncio de leads",
        interesse: null,
        mensagem: outrasRespostas || "Lead recebido via an\xFAncio de capta\xE7\xE3o (Meta).",
        origem_id: origemId
      });
      if (registro.novo)
        resultado.novos++;
    }
    await registrarMetaSyncLog(env, { sucesso: true, novos: resultado.novos, http_status: resp.status });
  } catch (erro) {
    resultado.erro = String(erro?.message || erro);
    console.error("Falha ao sincronizar leads do Meta:", erro);
    await registrarMetaSyncLog(env, { sucesso: false, erro: resultado.erro });
  }
  return resultado;
}
__name(sincronizarLeadsMeta, "sincronizarLeadsMeta");
__name2(sincronizarLeadsMeta, "sincronizarLeadsMeta");
__name22(sincronizarLeadsMeta, "sincronizarLeadsMeta");
__name222(sincronizarLeadsMeta, "sincronizarLeadsMeta");
__name2222(sincronizarLeadsMeta, "sincronizarLeadsMeta");
__name22222(sincronizarLeadsMeta, "sincronizarLeadsMeta");
function ehTokenLoginInstagram(token) {
  return typeof token === "string" && token.startsWith("IGAA");
}
__name(ehTokenLoginInstagram, "ehTokenLoginInstagram");
__name2(ehTokenLoginInstagram, "ehTokenLoginInstagram");
__name22(ehTokenLoginInstagram, "ehTokenLoginInstagram");
__name222(ehTokenLoginInstagram, "ehTokenLoginInstagram");
__name2222(ehTokenLoginInstagram, "ehTokenLoginInstagram");
__name22222(ehTokenLoginInstagram, "ehTokenLoginInstagram");
async function diagnosticoMeta(env) {
  const resultado = { sucesso: false, erro: null };
  try {
    const pageToken = await lerIntegracao(env, "meta_page_access_token");
    if (!pageToken) {
      resultado.erro = "Token de p\xE1gina do Meta n\xE3o configurado (meta_page_access_token).";
      return resultado;
    }
    if (ehTokenLoginInstagram(pageToken)) {
      const qs = new URLSearchParams({ access_token: pageToken, fields: "user_id,username,name" });
      const r = await fetch(`https://graph.instagram.com/v21.0/me?${qs}`);
      const meResp = await r.json();
      if (meResp?.error) {
        resultado.erro = meResp.error.message || "Token do Instagram recusado pelo Meta.";
        return resultado;
      }
      resultado.sucesso = true;
      resultado.tipo_token = "instagram_login";
      resultado.token_valido = true;
      resultado.token_expira_em = null;
      resultado.instagram_username = meResp?.username || null;
      resultado.instagram_conectado = !!meResp?.username;
      resultado.instagram_erro = null;
      resultado.pagina_nome = null;
      resultado.pagina_ligada_instagram = null;
      resultado.pagina_erro = null;
      resultado.permissoes = null;
      resultado.tem_instagram_manage_messages = true;
      resultado.tem_pages_messaging = null;
      return resultado;
    }
    const igBusinessId = await lerIntegracao(env, "meta_instagram_business_id");
    const pageId = await lerIntegracao(env, "meta_page_id");
    const g = /* @__PURE__ */ __name22222(async (caminho, params = {}) => {
      const qs = new URLSearchParams({ access_token: pageToken, ...params });
      const r = await fetch(`https://graph.facebook.com/v20.0/${caminho}?${qs}`);
      return r.json();
    }, "g");
    const [debugResp, paginaResp, igResp] = await Promise.all([
      g("debug_token", { input_token: pageToken }),
      pageId ? g(pageId, { fields: "name,instagram_business_account" }) : Promise.resolve(null),
      igBusinessId ? g(igBusinessId, { fields: "username,name,ig_id" }) : Promise.resolve(null)
    ]);
    if (debugResp?.error) {
      resultado.erro = debugResp.error.message;
      return resultado;
    }
    const permissoesConcedidas = debugResp?.data?.scopes || [];
    resultado.sucesso = true;
    resultado.tipo_token = "pagina_facebook";
    resultado.token_valido = debugResp?.data?.is_valid ?? null;
    resultado.token_expira_em = debugResp?.data?.expires_at ?? null;
    resultado.permissoes = permissoesConcedidas;
    resultado.tem_instagram_manage_messages = permissoesConcedidas.includes("instagram_manage_messages");
    resultado.tem_pages_messaging = permissoesConcedidas.includes("pages_messaging");
    resultado.pagina_nome = paginaResp?.name || null;
    resultado.pagina_ligada_instagram = !!paginaResp?.instagram_business_account;
    resultado.pagina_erro = paginaResp?.error?.message || null;
    resultado.instagram_username = igResp?.username || null;
    resultado.instagram_conectado = !igResp?.error && !!igResp?.username;
    resultado.instagram_erro = igResp?.error?.message || null;
  } catch (erro) {
    resultado.erro = String(erro?.message || erro);
    console.error("Falha ao rodar diagn\xF3stico do Meta:", erro);
  }
  return resultado;
}
__name(diagnosticoMeta, "diagnosticoMeta");
__name2(diagnosticoMeta, "diagnosticoMeta");
__name22(diagnosticoMeta, "diagnosticoMeta");
__name222(diagnosticoMeta, "diagnosticoMeta");
__name2222(diagnosticoMeta, "diagnosticoMeta");
__name22222(diagnosticoMeta, "diagnosticoMeta");
var TIPO_IMOVEL_LABEL = {
  casa: "Casa",
  sobrado: "Sobrado",
  apartamento: "Apartamento",
  terreno: "Terreno",
  chacara: "Ch\xE1cara",
  comercial: "Im\xF3vel comercial",
  industrial: "Im\xF3vel industrial"
};
function formatarPrecoBRL(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
__name(formatarPrecoBRL, "formatarPrecoBRL");
__name2(formatarPrecoBRL, "formatarPrecoBRL");
__name22(formatarPrecoBRL, "formatarPrecoBRL");
function legendaPadraoInstagram(imovel) {
  const tipo = TIPO_IMOVEL_LABEL[imovel.tipo] || "Im\xF3vel";
  const linhas = [
    `${tipo} \xE0 venda em ${imovel.bairro || "Fazenda Rio Grande"}`,
    "",
    formatarPrecoBRL(imovel.valor),
    "",
    (imovel.descricao || "").slice(0, 300),
    "",
    "\u{1F4CD} Fazenda Rio Grande e regi\xE3o",
    "\u{1F4F2} Fale com o Thiago Nunes: (41) 99892-1475",
    "CRECI 50.265",
    "",
    "#im\xF3veis #fazendariogrande #corretordeim\xF3veis #imobili\xE1ria #casaavenda #apartamentoavenda"
  ].filter((l) => l !== null && l !== void 0);
  return linhas.join("\n").trim();
}
__name(legendaPadraoInstagram, "legendaPadraoInstagram");
__name2(legendaPadraoInstagram, "legendaPadraoInstagram");
__name22(legendaPadraoInstagram, "legendaPadraoInstagram");
async function gerarLegendaInstagram(env, imovel) {
  const apiKey = await lerIntegracao(env, "openai_api_key");
  if (!apiKey)
    return legendaPadraoInstagram(imovel);
  try {
    const modelo = await lerIntegracao(env, "openai_model") || "gpt-4o-mini";
    const tipo = TIPO_IMOVEL_LABEL[imovel.tipo] || "im\xF3vel";
    const prompt = `Escreva uma legenda de post do Instagram para divulgar este im\xF3vel de um corretor imobili\xE1rio.
Dados reais do im\xF3vel (n\xE3o invente nenhum dado que n\xE3o esteja aqui):
- Tipo: ${tipo}
- Bairro: ${imovel.bairro || "n\xE3o informado"}
- Valor: ${formatarPrecoBRL(imovel.valor)}
- Descri\xE7\xE3o: ${imovel.descricao || "sem descri\xE7\xE3o adicional"}

Regras:
- Portugu\xEAs do Brasil, tom profissional e acolhedor, pode usar at\xE9 4 emojis.
- N\xE3o invente caracter\xEDsticas (quartos, vagas, etc.) que n\xE3o foram informadas acima.
- Termine com uma chamada para a\xE7\xE3o pedindo para chamar no WhatsApp (41) 99892-1475.
- Inclua a linha "CRECI 50.265".
- Termine com 5 a 8 hashtags relevantes sobre im\xF3veis em Fazenda Rio Grande.
- Responda s\xF3 com o texto da legenda, sem explica\xE7\xF5es.`;
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });
    const dados = await resp.json();
    const texto = dados.choices?.[0]?.message?.content?.trim();
    return texto || legendaPadraoInstagram(imovel);
  } catch (erro) {
    console.error("Falha ao gerar legenda com IA, usando padr\xE3o:", erro);
    return legendaPadraoInstagram(imovel);
  }
}
__name(gerarLegendaInstagram, "gerarLegendaInstagram");
__name2(gerarLegendaInstagram, "gerarLegendaInstagram");
__name22(gerarLegendaInstagram, "gerarLegendaInstagram");
async function publicarNoInstagram(env, fotoUrlPublica, legenda) {
  const pageToken = await lerIntegracao(env, "meta_page_access_token");
  if (!pageToken) {
    throw new Error("Token do Instagram n\xE3o configurado (meta_page_access_token).");
  }
  let base, igUserId;
  if (ehTokenLoginInstagram(pageToken)) {
    base = "https://graph.instagram.com/v21.0";
    igUserId = "me";
  } else {
    base = "https://graph.facebook.com/v20.0";
    igUserId = await lerIntegracao(env, "meta_instagram_business_id");
    if (!igUserId) {
      throw new Error("ID da conta comercial do Instagram n\xE3o configurado (meta_instagram_business_id).");
    }
  }
  const criarResp = await fetch(`${base}/${igUserId}/media?access_token=${pageToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: fotoUrlPublica, caption: legenda })
  });
  const criarDados = await criarResp.json();
  if (criarDados.error) {
    throw new Error(criarDados.error.message || "Falha ao criar o post no Instagram.");
  }
  const creationId = criarDados.id;
  const publicarResp = await fetch(`${base}/${igUserId}/media_publish?access_token=${pageToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId })
  });
  const publicarDados = await publicarResp.json();
  if (publicarDados.error) {
    throw new Error(publicarDados.error.message || "Falha ao publicar o post no Instagram.");
  }
  return publicarDados.id;
}
__name(publicarNoInstagram, "publicarNoInstagram");
__name2(publicarNoInstagram, "publicarNoInstagram");
__name22(publicarNoInstagram, "publicarNoInstagram");
function removerAcentosLocacao(txt) {
  return String(txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
__name(removerAcentosLocacao, "removerAcentosLocacao");
__name2(removerAcentosLocacao, "removerAcentosLocacao");
__name22(removerAcentosLocacao, "removerAcentosLocacao");
function pixCampo(id, valor) {
  const tamanho = String(valor).length.toString().padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}
__name(pixCampo, "pixCampo");
__name2(pixCampo, "pixCampo");
__name22(pixCampo, "pixCampo");
function crc16Pix(payload) {
  let crc = 65535;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 32768) !== 0 ? crc << 1 ^ 4129 : crc << 1;
      crc &= 65535;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
__name(crc16Pix, "crc16Pix");
__name2(crc16Pix, "crc16Pix");
__name22(crc16Pix, "crc16Pix");
function gerarPixPayload({ chave, valor, nomeRecebedor, cidadeRecebedor, txid }) {
  if (!chave) {
    throw new Error("Chave Pix do recebedor n\xE3o configurada.");
  }
  const nome = removerAcentosLocacao(nomeRecebedor).slice(0, 25).toUpperCase() || "THIAGO NUNES";
  const cidade = removerAcentosLocacao(cidadeRecebedor).slice(0, 15).toUpperCase() || "FAZENDA RIO GRANDE";
  const txidLimpo = String(txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const valorFormatado = Number(valor).toFixed(2);
  const merchantAccountInfo = pixCampo("00", "BR.GOV.BCB.PIX") + pixCampo("01", chave);
  const additionalData = pixCampo("05", txidLimpo);
  const payloadSemChecksum = pixCampo("00", "01") + pixCampo("26", merchantAccountInfo) + pixCampo("52", "0000") + pixCampo("53", "986") + pixCampo("54", valorFormatado) + pixCampo("58", "BR") + pixCampo("59", nome) + pixCampo("60", cidade) + pixCampo("62", additionalData) + "6304";
  return payloadSemChecksum + crc16Pix(payloadSemChecksum);
}
__name(gerarPixPayload, "gerarPixPayload");
__name2(gerarPixPayload, "gerarPixPayload");
__name22(gerarPixPayload, "gerarPixPayload");
function somarUmAno(dataIso) {
  const d = dataIso ? /* @__PURE__ */ new Date(`${dataIso}T00:00:00Z`) : /* @__PURE__ */ new Date();
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
__name(somarUmAno, "somarUmAno");
__name2(somarUmAno, "somarUmAno");
__name22(somarUmAno, "somarUmAno");
var APIFY_ATORES = [
  { chave: "vivareal", nome: "VivaReal", varAmbiente: "ACTOR_VIVAREAL" },
  { chave: "zap", nome: "ZAP Im\xF3veis", varAmbiente: "ACTOR_IMOBILIARIA" },
  { chave: "olx", nome: "OLX / outros portais", varAmbiente: "ACTOR_OLX" }
];
function montarInputApify(chave) {
  if (chave === "vivareal" || chave === "zap") {
    return { location: "Fazenda Rio Grande, PR", deal_type: "sale", limit: 40 };
  }
  if (chave === "olx") {
    return { state: "pr", city: "fazenda-rio-grande", maxListings: 40, sources: "all", includeDescription: false };
  }
  return {};
}
__name(montarInputApify, "montarInputApify");
__name2(montarInputApify, "montarInputApify");
__name22(montarInputApify, "montarInputApify");
__name222(montarInputApify, "montarInputApify");
__name2222(montarInputApify, "montarInputApify");
__name22222(montarInputApify, "montarInputApify");
function normalizarEnderecoApify(loc) {
  if (!loc)
    return null;
  const partes = [loc.street, loc.street_number].filter(Boolean);
  return partes.length ? partes.join(", ") : null;
}
__name(normalizarEnderecoApify, "normalizarEnderecoApify");
__name2(normalizarEnderecoApify, "normalizarEnderecoApify");
__name22(normalizarEnderecoApify, "normalizarEnderecoApify");
__name222(normalizarEnderecoApify, "normalizarEnderecoApify");
__name2222(normalizarEnderecoApify, "normalizarEnderecoApify");
__name22222(normalizarEnderecoApify, "normalizarEnderecoApify");
function normalizarItemVivaRealZap(item, portalNome) {
  const loc = item.location || {};
  const link = item.source_context?.url || item.url || null;
  if (!link)
    return null;
  return {
    portal: portalNome,
    type: item.attributes?.property_type || null,
    zone: loc.neighborhood || null,
    location: loc.city || null,
    area: item.attributes?.usable_area || item.attributes?.area?.usable_area || null,
    price: item.pricing?.amount || null,
    link,
    endereco: normalizarEnderecoApify(loc),
    anunciante_nome: item.entities?.seller?.name || null,
    anunciante_telefone: item.contact?.phones && item.contact.phones[0] || null,
    anunciante_whatsapp: item.contact?.whatsapp ? 1 : 0,
    titulo: item.content?.title || null,
    descricao: item.content?.description || null,
    cidade: loc.city || null
  };
}
__name(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
__name2(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
__name22(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
__name222(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
__name2222(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
__name22222(normalizarItemVivaRealZap, "normalizarItemVivaRealZap");
function normalizarItemOlx(item) {
  const link = item.url || null;
  if (!link)
    return null;
  return {
    portal: item.source || "OLX/outros",
    type: item.propertyType || null,
    zone: item.neighborhood || null,
    location: item.city || null,
    area: item.area || null,
    price: item.price || null,
    link,
    endereco: null,
    anunciante_nome: null,
    anunciante_telefone: null,
    anunciante_whatsapp: 0,
    titulo: item.title || null,
    descricao: null,
    cidade: item.city || null
  };
}
__name(normalizarItemOlx, "normalizarItemOlx");
__name2(normalizarItemOlx, "normalizarItemOlx");
__name22(normalizarItemOlx, "normalizarItemOlx");
__name222(normalizarItemOlx, "normalizarItemOlx");
__name2222(normalizarItemOlx, "normalizarItemOlx");
__name22222(normalizarItemOlx, "normalizarItemOlx");
var TERMOS_IMOBILIARIA = ["imobiliaria", "imoveis", "realty", "corretora", "corretor de imoveis", "empreendimentos", "construtora", "incorporadora"];
function normalizarTexto(txt) {
  return String(txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
__name(normalizarTexto, "normalizarTexto");
__name2(normalizarTexto, "normalizarTexto");
__name22(normalizarTexto, "normalizarTexto");
__name222(normalizarTexto, "normalizarTexto");
__name2222(normalizarTexto, "normalizarTexto");
__name22222(normalizarTexto, "normalizarTexto");
function pareceImobiliaria(nome, licenca) {
  if (licenca)
    return true;
  if (!nome)
    return false;
  const nomeNormalizado = normalizarTexto(nome);
  return TERMOS_IMOBILIARIA.some((termo) => nomeNormalizado.includes(termo));
}
__name(pareceImobiliaria, "pareceImobiliaria");
__name2(pareceImobiliaria, "pareceImobiliaria");
__name22(pareceImobiliaria, "pareceImobiliaria");
__name222(pareceImobiliaria, "pareceImobiliaria");
__name2222(pareceImobiliaria, "pareceImobiliaria");
__name22222(pareceImobiliaria, "pareceImobiliaria");
async function iniciarSincronizacaoApify(env) {
  const token = env.APIFY_TOKEN;
  if (!token) {
    return { sucesso: false, erro: "APIFY_TOKEN n\xE3o configurado no Worker (wrangler secret)." };
  }
  const runs = {};
  const erros = [];
  for (const ator of APIFY_ATORES) {
    const actorId = env[ator.varAmbiente];
    if (!actorId) {
      erros.push(`${ator.nome}: ator n\xE3o configurado (${ator.varAmbiente})`);
      continue;
    }
    try {
      const resp = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarInputApify(ator.chave))
      });
      const dados = await resp.json();
      if (!resp.ok || dados.error) {
        erros.push(`${ator.nome}: ${dados.error?.message || `erro ${resp.status}`}`);
        continue;
      }
      runs[ator.chave] = dados.data.id;
    } catch (e) {
      erros.push(`${ator.nome}: ${e.message}`);
    }
  }
  if (Object.keys(runs).length === 0) {
    return { sucesso: false, erro: erros.join("; ") || "Nenhuma busca p\xF4de ser iniciada." };
  }
  const resultado = await env.DB.prepare(`
INSERT INTO apify_sync_log (started_at, status, runs_json, errors_json, total_inserted, total_skipped) VALUES (datetime('now'), 'em_andamento', ?, ?, 0, 0)
`).bind(JSON.stringify(runs), JSON.stringify(erros)).run();
  return { sucesso: true, sync_id: resultado.meta.last_row_id, iniciadas: Object.keys(runs).map((c) => APIFY_ATORES.find((a) => a.chave === c)?.nome || c), erros };
}
__name(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
__name2(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
__name22(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
__name222(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
__name2222(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
__name22222(iniciarSincronizacaoApify, "iniciarSincronizacaoApify");
async function coletarResultadoApify(runId, token) {
  const runResp = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
  const runDados = await runResp.json();
  const status = runDados.data?.status;
  if (status !== "SUCCEEDED")
    return { status, itens: null };
  const datasetId = runDados.data.defaultDatasetId;
  const itemsResp = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&clean=true`);
  const itens = await itemsResp.json();
  return { status, itens };
}
__name(coletarResultadoApify, "coletarResultadoApify");
__name2(coletarResultadoApify, "coletarResultadoApify");
__name22(coletarResultadoApify, "coletarResultadoApify");
__name222(coletarResultadoApify, "coletarResultadoApify");
__name2222(coletarResultadoApify, "coletarResultadoApify");
__name22222(coletarResultadoApify, "coletarResultadoApify");
async function processarSincronizacaoApify(env, syncId) {
  const token = env.APIFY_TOKEN;
  const registro = await env.DB.prepare(`SELECT * FROM apify_sync_log WHERE id = ?`).bind(syncId).first();
  if (!registro)
    return { sucesso: false, erro: "Sincroniza\xE7\xE3o n\xE3o encontrada" };
  if (registro.status === "concluido") {
    return { sucesso: true, status: "concluido", novos: registro.total_inserted, ignorados: registro.total_skipped };
  }
  if (!token)
    return { sucesso: false, erro: "APIFY_TOKEN n\xE3o configurado no Worker." };
  let runs = {};
  try {
    runs = JSON.parse(registro.runs_json) || {};
  } catch {
    runs = {};
  }
  let errosAtuais = [];
  try {
    errosAtuais = JSON.parse(registro.errors_json) || [];
  } catch {
    errosAtuais = [];
  }
  let totalInserido = 0;
  let totalIgnorado = 0;
  for (const [chave, runId] of Object.entries(runs)) {
    try {
      const { status, itens } = await coletarResultadoApify(runId, token);
      if (status === "RUNNING" || status === "READY") {
        continue;
      }
      if (status === "SUCCEEDED") {
        const nomePortal = APIFY_ATORES.find((a) => a.chave === chave)?.nome || chave;
        for (const itemBruto of itens || []) {
          const normalizado = chave === "olx" ? normalizarItemOlx(itemBruto) : normalizarItemVivaRealZap(itemBruto, nomePortal);
          if (!normalizado || !normalizado.link)
            continue;
          if (chave !== "olx" && pareceImobiliaria(normalizado.anunciante_nome, itemBruto.entities?.seller?.license_number)) {
            totalIgnorado++;
            continue;
          }
          const observacaoNota = chave === "olx" ? "Portal sem dado de anunciante \u2014 confira pelo link se \xE9 imobili\xE1ria antes de contatar." : null;
          const resultadoInsert = await env.DB.prepare(`
INSERT OR IGNORE INTO apify_leads (portal, type, zone, location, area, price, link, endereco, captured_at, source, raw_json, anunciante_nome, anunciante_telefone, anunciante_whatsapp, titulo, descricao, cidade, observacoes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).bind(
            normalizado.portal,
            normalizado.type,
            normalizado.zone,
            normalizado.location,
            normalizado.area,
            normalizado.price,
            normalizado.link,
            normalizado.endereco,
            chave,
            JSON.stringify(itemBruto).slice(0, 4e3),
            normalizado.anunciante_nome,
            normalizado.anunciante_telefone,
            normalizado.anunciante_whatsapp,
            normalizado.titulo,
            normalizado.descricao,
            normalizado.cidade,
            observacaoNota
          ).run();
          if (resultadoInsert.meta.changes > 0)
            totalInserido++;
          else
            totalIgnorado++;
        }
      } else {
        errosAtuais.push(`${chave}: run terminou com status ${status}`);
      }
      delete runs[chave];
    } catch (e) {
      errosAtuais.push(`${chave}: ${e.message}`);
      delete runs[chave];
    }
  }
  const restantes = Object.keys(runs).length;
  const novoStatus = restantes > 0 ? "em_andamento" : "concluido";
  const totalInseridoAcumulado = (registro.total_inserted || 0) + totalInserido;
  const totalIgnoradoAcumulado = (registro.total_skipped || 0) + totalIgnorado;
  await env.DB.prepare(`
UPDATE apify_sync_log
SET status = ?, runs_json = ?, errors_json = ?, total_inserted = ?, total_skipped = ?, finished_at = CASE WHEN ? = 'concluido' THEN datetime('now') ELSE finished_at END
WHERE id = ?
`).bind(novoStatus, JSON.stringify(runs), JSON.stringify(errosAtuais), totalInseridoAcumulado, totalIgnoradoAcumulado, novoStatus, syncId).run();
  return { sucesso: true, status: novoStatus, novos: totalInseridoAcumulado, ignorados: totalIgnoradoAcumulado, erros: errosAtuais };
}
__name(processarSincronizacaoApify, "processarSincronizacaoApify");
__name2(processarSincronizacaoApify, "processarSincronizacaoApify");
__name22(processarSincronizacaoApify, "processarSincronizacaoApify");
__name222(processarSincronizacaoApify, "processarSincronizacaoApify");
__name2222(processarSincronizacaoApify, "processarSincronizacaoApify");
__name22222(processarSincronizacaoApify, "processarSincronizacaoApify");
var LIMITE_MENSAGENS_CONVERSA = 20;
var ANA_PAULA_SISTEMA = `Voc\xEA \xE9 Ana Paula, assistente virtual de uma imobili\xE1ria em Fazenda Rio Grande, PR, atendendo pelo WhatsApp em nome do corretor Thiago Nunes.

QUEM VOC\xCA \xC9: voc\xEA \xE9 assistente do Thiago, N\xC3O \xE9 corretora. Nunca fale como se voc\xEA fosse fechar o neg\xF3cio, mostrar o im\xF3vel ou decidir algo sozinha. A palavra final, os detalhes espec\xEDficos de cada im\xF3vel (pre\xE7o exato, disponibilidade, condi\xE7\xF5es) e o fechamento s\xE3o sempre com o Thiago.

SEU TOM: acolhedor, caloroso, humano \u2014 como uma assistente atenciosa de verdade, nunca rob\xF3tica ou fria. Use t\xE9cnicas de rapport: chame a pessoa pelo nome quando souber, demonstre interesse genu\xEDno no que ela conta, espelhe o que ela disse antes de perguntar mais ("entendi, ent\xE3o voc\xEA busca algo mais tranquilo pra fam\xEDlia, certo?"), valide os sentimentos dela ("faz todo sentido querer isso"). Seja persuasiva de forma honesta e direta \u2014 destaque benef\xEDcios reais do que ela busca, crie senso de oportunidade quando fizer sentido genuinamente (ex: "im\xF3veis assim costumam ter bastante procura na regi\xE3o"), mas NUNCA seja evasiva: se n\xE3o souber responder algo, diga na hora que vai confirmar com o Thiago, nunca enrole ou fique em cima do muro.

Seu objetivo \xE9 qualificar o lead de forma natural e simp\xE1tica, descobrindo:
1. O que a pessoa procura (comprar, alugar, vender, investir)
2. Tipo de im\xF3vel de interesse (casa, apartamento, terreno, etc.)
3. Regi\xE3o/bairro de interesse
4. Faixa de valor / capacidade de investimento
5. Urg\xEAncia (quando pretende fechar neg\xF3cio)

Regras importantes:
- Seja breve, cordial e direta \u2014 mensagens curtas, como conversa de WhatsApp real, nunca par\xE1grafos longos.
- Fa\xE7a UMA pergunta por vez.
- Nunca invente informa\xE7\xF5es sobre im\xF3veis espec\xEDficos, pre\xE7os, disponibilidade ou prazos \u2014 isso \xE9 sempre com o Thiago. Se perguntarem algo assim, diga algo como "deixa eu confirmar isso certinho com o Thiago e j\xE1 te retorno" (nunca invente um n\xFAmero ou responda "sim" por chutar).
- Sempre que perceber que o lead est\xE1 QUENTE \u2014 quer decidir r\xE1pido, j\xE1 tem or\xE7amento definido/aprovado, pede pra visitar, menciona prazo curto, demonstra inten\xE7\xE3o clara de fechar \u2014 inclua na sua mensagem, em uma linha pr\xF3pria, o marcador exato [QUENTE] seguido de um resumo curto (ex: "[QUENTE] Quer visitar essa semana, j\xE1 tem or\xE7amento aprovado"). Isso avisa o Thiago na hora. Depois disso continue a conversa normalmente.
- Quando tiver informa\xE7\xF5es suficientes (pelo menos o que procura, regi\xE3o e faixa de valor), finalize a conversa agradecendo e avisando que o Thiago vai dar continuidade, e inclua no final da sua mensagem, em uma linha pr\xF3pria, o marcador exato: [QUALIFICADO] seguido de um resumo curto em uma linha (ex: "[QUALIFICADO] Busca apto 2 quartos no Eucaliptos, at\xE9 R$300mil, urg\xEAncia alta").
- Se a pessoa claramente n\xE3o tiver interesse ou pedir para n\xE3o ser mais contatada, encerre educadamente e tamb\xE9m use [QUALIFICADO] com o resumo "Sem interesse".
- Nunca mencione que voc\xEA \xE9 uma IA a menos que perguntem diretamente; se perguntarem, seja honesta.`;
var ANA_PAULA_FOLLOWUP_SISTEMA = `Voc\xEA \xE9 Ana Paula, assistente virtual de uma imobili\xE1ria em Fazenda Rio Grande, PR, retomando contato pelo WhatsApp em nome do corretor Thiago Nunes com um lead que j\xE1 demonstrou interesse antes, mas ficou um tempo sem responder ou sem avan\xE7ar.

QUEM VOC\xCA \xC9: voc\xEA \xE9 assistente do Thiago, N\xC3O \xE9 corretora. Nunca fale como se fosse fechar o neg\xF3cio ou decidir algo sozinha \u2014 detalhes espec\xEDficos de im\xF3veis e a palavra final s\xE3o sempre com o Thiago.

SEU TOM: acolhedor, caloroso, tom leve de "oi, tudo bem? s\xF3 passando pra saber se ainda tem interesse" \u2014 use rapport (retome algo que a pessoa j\xE1 contou antes, mostre que voc\xEA lembra dela), nunca insistente ou repetitiva. Seja persuasiva sem ser evasiva: se ela perguntar algo espec\xEDfico que voc\xEA n\xE3o sabe, diga na hora que vai confirmar com o Thiago, nunca enrole.

Regras importantes:
- Use o contexto do lead informado (interesse, est\xE1gio, tentativas anteriores) pra variar a abordagem \u2014 n\xE3o mande sempre a mesma mensagem gen\xE9rica.
- N\xE3o repita perguntas de qualifica\xE7\xE3o j\xE1 respondidas antes.
- Nunca invente informa\xE7\xF5es sobre im\xF3veis espec\xEDficos, pre\xE7os ou disponibilidade \u2014 isso \xE9 sempre com o Thiago.
- Sempre que perceber que o lead est\xE1 QUENTE (quer decidir r\xE1pido, tem or\xE7amento pronto, pede visita, menciona prazo curto), inclua em linha pr\xF3pria o marcador exato [QUENTE] seguido de um resumo curto, e continue a conversa normalmente depois.
- Se a pessoa responder com interesse, retome a qualifica\xE7\xE3o normalmente (o que procura, regi\xE3o, faixa de valor, urg\xEAncia) e finalize com o marcador [QUALIFICADO] igual no atendimento inicial.
- Se a pessoa disser que n\xE3o tem mais interesse ou pedir pra n\xE3o ser mais contatada, agrade\xE7a e finalize com [QUALIFICADO] resumo "Sem interesse \u2014 follow-up".
- Nunca mencione que voc\xEA \xE9 uma IA a menos que perguntem diretamente; se perguntarem, seja honesta.`;
var LIMITE_FOLLOWUPS_AUTOMATICOS = 4;
async function enviarFollowUpAutomatico(env, followUpId, lead, tentativaAtual) {
  const primeiraMensagem = await chamarOpenAI(env, [
    {
      role: "user",
      content: `Retomando contato com o lead ${lead.nome || "cliente"}. Interesse registrado: ${lead.interesse || lead.nota_inicial || "n\xE3o informado"}. Est\xE1gio atual no funil: ${lead.estagio}. Esta \xE9 a tentativa n\xFAmero ${tentativaAtual} de follow-up autom\xE1tico. Envie uma mensagem curta e cordial retomando o contato.`
    }
  ], ANA_PAULA_FOLLOWUP_SISTEMA);
  await enviarWhatsapp(env, lead.telefone, primeiraMensagem);
  await env.DB.prepare(`
INSERT INTO ana_paula_conversas (lead_id, telefone, historico, status, modo, criado_em, atualizado_em)
VALUES (?, ?, ?, 'ativa', 'follow_up', datetime('now'), datetime('now'))
`).bind(
    lead.id,
    lead.telefone,
    JSON.stringify([
      { role: "user", content: "[FOLLOW-UP AUTOM\xC1TICO]" },
      { role: "assistant", content: primeiraMensagem }
    ])
  ).run();
  const proximo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  await env.DB.prepare(`
UPDATE follow_ups SET ultimo_contato = date('now'), tentativas = ?, proximo_contato = ?,
  observacoes = ?, canal = 'WhatsApp (Ana Paula)', atualizado_em = datetime('now') WHERE id = ?
`).bind(tentativaAtual, proximo, `Ana Paula (autom\xE1tico): "${primeiraMensagem.slice(0, 200)}"`, followUpId).run();
}
__name(enviarFollowUpAutomatico, "enviarFollowUpAutomatico");
__name2(enviarFollowUpAutomatico, "enviarFollowUpAutomatico");
async function processarFollowUpsAutomaticos(env) {
  const { results } = await env.DB.prepare(`
    SELECT f.id as follow_up_id, f.tentativas as follow_up_tentativas, l.*
    FROM follow_ups f
    JOIN leads l ON l.id = f.lead_id
    WHERE f.status = 'Ativo' AND f.proximo_contato IS NOT NULL AND date(f.proximo_contato) <= date('now')
      AND l.estagio NOT IN ('Fechado', 'Perdido') AND l.telefone IS NOT NULL AND l.telefone != ''
      AND l.origem_automatica = 1
  `).all();
  for (const lead of results || []) {
    try {
      const conversaAtiva = await env.DB.prepare(
        `SELECT id FROM ana_paula_conversas WHERE lead_id = ? AND status = 'ativa'`
      ).bind(lead.id).first();
      if (conversaAtiva)
        continue;
      const tentativasAtuais = lead.follow_up_tentativas || 0;
      if (tentativasAtuais >= LIMITE_FOLLOWUPS_AUTOMATICOS) {
        await env.DB.prepare(
          `UPDATE follow_ups SET status = 'Aguardando Thiago', atualizado_em = datetime('now') WHERE id = ?`
        ).bind(lead.follow_up_id).run();
        await env.DB.prepare(`
INSERT INTO tarefas (titulo, descricao, tipo, relacionado_tipo, relacionado_id, responsavel, prioridade, vencimento, status)
VALUES (?, ?, 'Contato', 'lead', ?, 'Thiago', 'Alta', datetime('now'), 'Pendente')
`).bind(
          `Ligar para ${lead.nome || "lead"} \u2014 follow-up autom\xE1tico esgotado`,
          `A Ana Paula tentou contato autom\xE1tico ${tentativasAtuais} vezes sem resposta do lead. Hora de ligar pessoalmente.`,
          lead.id
        ).run();
        continue;
      }
      await enviarFollowUpAutomatico(env, lead.follow_up_id, lead, tentativasAtuais + 1);
    } catch (e) {
      console.error("Falha no follow-up autom\xE1tico do lead", lead.id, e);
    }
  }
}
__name(processarFollowUpsAutomaticos, "processarFollowUpsAutomaticos");
__name2(processarFollowUpsAutomaticos, "processarFollowUpsAutomaticos");
async function renovarTokenMetaAutomatico(env) {
  const [tokenAtual, appId, appSecret, pageId] = await Promise.all([
    lerIntegracao(env, "meta_access_token"),
    lerIntegracao(env, "meta_app_id"),
    lerIntegracao(env, "meta_app_secret"),
    lerIntegracao(env, "meta_page_id")
  ]);
  if (!tokenAtual || !appId || !appSecret)
    return;
  const ultimaRenovacao = await env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = 'meta_token_renovado_em'`).first();
  if (ultimaRenovacao?.valor) {
    const horasDesde = (Date.now() - new Date(ultimaRenovacao.valor).getTime()) / 36e5;
    if (horasDesde < 20)
      return;
  }
  try {
    const urlTroca = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(tokenAtual)}`;
    const respTroca = await fetch(urlTroca);
    const dadosTroca = await respTroca.json();
    if (!respTroca.ok || !dadosTroca.access_token) {
      throw new Error(dadosTroca?.error?.message || "Falha ao trocar o token de usu\xE1rio");
    }
    const novoTokenUsuario = dadosTroca.access_token;
    await env.DB.prepare(`UPDATE integracoes SET valor = ?, atualizado_em = datetime('now') WHERE chave = 'meta_access_token'`).bind(await criptografarValor(env, novoTokenUsuario)).run();
    if (pageId) {
      const respPaginas = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=name,access_token&access_token=${encodeURIComponent(novoTokenUsuario)}`);
      const dadosPaginas = await respPaginas.json();
      const pagina = (dadosPaginas?.data || []).find((p) => String(p.id) === String(pageId));
      if (pagina?.access_token) {
        await env.DB.prepare(`UPDATE integracoes SET valor = ?, atualizado_em = datetime('now') WHERE chave = 'meta_page_access_token'`).bind(await criptografarValor(env, pagina.access_token)).run();
      }
    }
    await env.DB.prepare(`
      INSERT INTO integracoes (chave, valor, atualizado_em) VALUES ('meta_token_renovado_em', ?, datetime('now'))
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = datetime('now')
    `).bind((/* @__PURE__ */ new Date()).toISOString()).run();
  } catch (erroRenovacao) {
    console.error("Falha na renova\xE7\xE3o autom\xE1tica do token Meta:", erroRenovacao);
    const telefoneAlerta = await lerIntegracao(env, "alerta_whatsapp_telefone");
    if (telefoneAlerta) {
      await enviarWhatsapp(env, telefoneAlerta, `\u26A0\uFE0F N\xE3o consegui renovar o token do Meta/Instagram sozinho: ${erroRenovacao.message}. Provavelmente precisa gerar um token novo manualmente em Configura\xE7\xF5es.`).catch(() => {
      });
    }
  }
}
__name(renovarTokenMetaAutomatico, "renovarTokenMetaAutomatico");
__name2(renovarTokenMetaAutomatico, "renovarTokenMetaAutomatico");
async function lerIntegracao(env, chave) {
  const row = await env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = ?`).bind(chave).first();
  return row ? await descriptografarValor(env, row.valor) : null;
}
__name(lerIntegracao, "lerIntegracao");
__name2(lerIntegracao, "lerIntegracao");
async function limitarTaxa(env, identificador, limite, janelaSegundos) {
  try {
    const agora = Math.floor(Date.now() / 1e3);
    const desde = agora - janelaSegundos;
    await env.DB.prepare(`DELETE FROM rate_limit_log WHERE criado_em < ?`).bind(desde).run();
    const linha = await env.DB.prepare(`SELECT COUNT(*) as n FROM rate_limit_log WHERE identificador = ? AND criado_em >= ?`).bind(identificador, desde).first();
    if ((linha?.n || 0) >= limite)
      return false;
    await env.DB.prepare(`INSERT INTO rate_limit_log (identificador, criado_em) VALUES (?, ?)`).bind(identificador, agora).run();
    return true;
  } catch (erro) {
    console.error("Falha no controle de taxa, liberando por seguran\xE7a operacional:", erro);
    return true;
  }
}
__name(limitarTaxa, "limitarTaxa");
__name2(limitarTaxa, "limitarTaxa");
async function validarAssinaturaMeta(corpoTexto, assinaturaHeader, appSecret) {
  if (!assinaturaHeader.startsWith("sha256="))
    return false;
  const esperado = assinaturaHeader.slice(7);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinado = await crypto.subtle.sign("HMAC", key, enc.encode(corpoTexto));
  const calculado = buf2hex(assinado);
  if (calculado.length !== esperado.length)
    return false;
  let diff = 0;
  for (let i = 0; i < calculado.length; i++)
    diff |= calculado.charCodeAt(i) ^ esperado.charCodeAt(i);
  return diff === 0;
}
__name(validarAssinaturaMeta, "validarAssinaturaMeta");
__name2(validarAssinaturaMeta, "validarAssinaturaMeta");
__name22(lerIntegracao, "lerIntegracao");
__name222(lerIntegracao, "lerIntegracao");
__name2222(lerIntegracao, "lerIntegracao");
__name22222(lerIntegracao, "lerIntegracao");
async function enviarWhatsapp(env, telefone, mensagem) {
  const idInstance = await lerIntegracao(env, "green_api_id_instance");
  const apiTokenInstance = await lerIntegracao(env, "green_api_token_instance");
  if (!idInstance || !apiTokenInstance) {
    throw new Error("Green API n\xE3o configurada (green_api_id_instance / green_api_token_instance)");
  }
  const digitos = String(telefone || "").replace(/\D/g, "");
  const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos;
  const resp = await fetch(`https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: `${comDDI}@c.us`, message: mensagem })
  });
  if (!resp.ok) {
    const texto = await resp.text().catch(() => "");
    throw new Error(`Falha ao enviar WhatsApp (Green API): ${resp.status} ${texto}`);
  }
  return resp.json();
}
__name(enviarWhatsapp, "enviarWhatsapp");
__name2(enviarWhatsapp, "enviarWhatsapp");
__name22(enviarWhatsapp, "enviarWhatsapp");
__name222(enviarWhatsapp, "enviarWhatsapp");
__name2222(enviarWhatsapp, "enviarWhatsapp");
__name22222(enviarWhatsapp, "enviarWhatsapp");
async function enviarWhatsappComMidia(env, telefone, mensagem, midiaUrl, midiaNome) {
  const idInstance = await lerIntegracao(env, "green_api_id_instance");
  const apiTokenInstance = await lerIntegracao(env, "green_api_token_instance");
  if (!idInstance || !apiTokenInstance) {
    throw new Error("Green API n\xE3o configurada (green_api_id_instance / green_api_token_instance)");
  }
  const digitos = String(telefone || "").replace(/\D/g, "");
  const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos;
  const resp = await fetch(`https://api.green-api.com/waInstance${idInstance}/sendFileByUrl/${apiTokenInstance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId: `${comDDI}@c.us`,
      urlFile: midiaUrl,
      fileName: midiaNome || "arquivo",
      caption: mensagem
    })
  });
  if (!resp.ok) {
    const texto = await resp.text().catch(() => "");
    throw new Error(`Falha ao enviar WhatsApp com arquivo (Green API): ${resp.status} ${texto}`);
  }
  return resp.json();
}
__name(enviarWhatsappComMidia, "enviarWhatsappComMidia");
__name2(enviarWhatsappComMidia, "enviarWhatsappComMidia");
__name22(enviarWhatsappComMidia, "enviarWhatsappComMidia");
__name222(enviarWhatsappComMidia, "enviarWhatsappComMidia");
__name2222(enviarWhatsappComMidia, "enviarWhatsappComMidia");
__name22222(enviarWhatsappComMidia, "enviarWhatsappComMidia");
function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name(aguardar, "aguardar");
__name2(aguardar, "aguardar");
__name22(aguardar, "aguardar");
__name222(aguardar, "aguardar");
__name2222(aguardar, "aguardar");
__name22222(aguardar, "aguardar");
var ATRASO_MIN_MS = 2e4;
var ATRASO_MAX_MS = 45e3;
var LIMITE_DESTINATARIOS_POR_EXECUCAO = 30;
var LIMITE_DIARIO_DISPARO_MASSA = 100;
var MAX_FALHAS_CONSECUTIVAS = 3;
var HORARIO_INICIO_ENVIO = 8;
var HORARIO_FIM_ENVIO = 20;
function atrasoAleatorio() {
  return ATRASO_MIN_MS + Math.random() * (ATRASO_MAX_MS - ATRASO_MIN_MS);
}
__name(atrasoAleatorio, "atrasoAleatorio");
__name2(atrasoAleatorio, "atrasoAleatorio");
__name22(atrasoAleatorio, "atrasoAleatorio");
__name222(atrasoAleatorio, "atrasoAleatorio");
__name2222(atrasoAleatorio, "atrasoAleatorio");
__name22222(atrasoAleatorio, "atrasoAleatorio");
function dentroDoHorarioComercial() {
  const agora = /* @__PURE__ */ new Date();
  const horaBrasilia = (agora.getUTCHours() - 3 + 24) % 24;
  return horaBrasilia >= HORARIO_INICIO_ENVIO && horaBrasilia < HORARIO_FIM_ENVIO;
}
__name(dentroDoHorarioComercial, "dentroDoHorarioComercial");
__name2(dentroDoHorarioComercial, "dentroDoHorarioComercial");
__name22(dentroDoHorarioComercial, "dentroDoHorarioComercial");
__name222(dentroDoHorarioComercial, "dentroDoHorarioComercial");
__name2222(dentroDoHorarioComercial, "dentroDoHorarioComercial");
__name22222(dentroDoHorarioComercial, "dentroDoHorarioComercial");
function variarMensagem(mensagem) {
  const zwsp = "\u200B";
  const qtd = Math.floor(Math.random() * 3);
  return mensagem + zwsp.repeat(qtd);
}
__name(variarMensagem, "variarMensagem");
__name2(variarMensagem, "variarMensagem");
__name22(variarMensagem, "variarMensagem");
__name222(variarMensagem, "variarMensagem");
__name2222(variarMensagem, "variarMensagem");
__name22222(variarMensagem, "variarMensagem");
async function processarDisparo(env, disparoId) {
  const disparo = await env.DB.prepare(`SELECT * FROM disparos WHERE id = ?`).bind(disparoId).first();
  if (!disparo || disparo.status === "Cancelado" || disparo.status === "Concluido")
    return;
  if (!dentroDoHorarioComercial()) {
    return;
  }
  const enviadosUltimas24h = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM disparos_destinatarios WHERE status = 'Enviado' AND enviado_em >= datetime('now', '-1 day')`
  ).first();
  const restanteHoje = LIMITE_DIARIO_DISPARO_MASSA - (enviadosUltimas24h?.total || 0);
  if (restanteHoje <= 0) {
    return;
  }
  const { results: pendentes } = await env.DB.prepare(
    `SELECT * FROM disparos_destinatarios WHERE disparo_id = ? AND status = 'Pendente' ORDER BY id LIMIT ?`
  ).bind(disparoId, Math.max(0, Math.min(LIMITE_DESTINATARIOS_POR_EXECUCAO, restanteHoje))).all();
  let falhasConsecutivas = 0;
  let idsFalhouNestaLeva = [];
  for (const destinatario of pendentes || []) {
    const atual = await env.DB.prepare(`SELECT status FROM disparos WHERE id = ?`).bind(disparoId).first();
    if (!atual || atual.status === "Cancelado")
      break;
    if (!dentroDoHorarioComercial())
      break;
    try {
      if (disparo.midia_url) {
        await enviarWhatsappComMidia(env, destinatario.telefone, variarMensagem(destinatario.mensagem_final), disparo.midia_url, disparo.midia_nome);
      } else {
        await enviarWhatsapp(env, destinatario.telefone, variarMensagem(destinatario.mensagem_final));
      }
      await env.DB.prepare(
        `UPDATE disparos_destinatarios SET status = 'Enviado', erro = NULL, enviado_em = datetime('now') WHERE id = ?`
      ).bind(destinatario.id).run();
      falhasConsecutivas = 0;
      idsFalhouNestaLeva = [];
    } catch (e) {
      await env.DB.prepare(
        `UPDATE disparos_destinatarios SET status = 'Falhou', erro = ? WHERE id = ?`
      ).bind(String(e?.message || e).slice(0, 500), destinatario.id).run();
      falhasConsecutivas++;
      idsFalhouNestaLeva.push(destinatario.id);
      if (falhasConsecutivas >= MAX_FALHAS_CONSECUTIVAS) {
        for (const idFalho of idsFalhouNestaLeva) {
          await env.DB.prepare(
            `UPDATE disparos_destinatarios SET status = 'Pendente', erro = NULL WHERE id = ?`
          ).bind(idFalho).run();
        }
        break;
      }
    }
    await aguardar(atrasoAleatorio());
  }
  const contagem = await env.DB.prepare(
    `SELECT
       SUM(CASE WHEN status = 'Enviado' THEN 1 ELSE 0 END) AS enviados,
       SUM(CASE WHEN status = 'Falhou' THEN 1 ELSE 0 END) AS falhas,
       SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) AS pendentes
     FROM disparos_destinatarios WHERE disparo_id = ?`
  ).bind(disparoId).first();
  const aindaTemPendente = (contagem?.pendentes || 0) > 0;
  const disparoAtual = await env.DB.prepare(`SELECT status FROM disparos WHERE id = ?`).bind(disparoId).first();
  const statusFinal = disparoAtual?.status === "Cancelado" ? "Cancelado" : aindaTemPendente ? "Enviando" : "Concluido";
  await env.DB.prepare(
    `UPDATE disparos SET total_enviados = ?, total_falhas = ?, status = ? WHERE id = ?`
  ).bind(contagem?.enviados || 0, contagem?.falhas || 0, statusFinal, disparoId).run();
}
__name(processarDisparo, "processarDisparo");
__name2(processarDisparo, "processarDisparo");
__name22(processarDisparo, "processarDisparo");
__name222(processarDisparo, "processarDisparo");
__name2222(processarDisparo, "processarDisparo");
__name22222(processarDisparo, "processarDisparo");
var URL_WEBHOOK_WHATSAPP = "https://crm-thiago-leads-worker.bento-nunes22.workers.dev/webhook/green-api";
async function configurarWebhookWhatsapp(env) {
  const idInstance = await lerIntegracao(env, "green_api_id_instance");
  const apiTokenInstance = await lerIntegracao(env, "green_api_token_instance");
  if (!idInstance || !apiTokenInstance) {
    return { sucesso: false, erro: "Green API n\xE3o configurada (green_api_id_instance / green_api_token_instance)." };
  }
  const urlWebhook = env.GREEN_API_WEBHOOK_SECRET ? `${URL_WEBHOOK_WHATSAPP}?secreto=${encodeURIComponent(env.GREEN_API_WEBHOOK_SECRET)}` : URL_WEBHOOK_WHATSAPP;
  try {
    const resp = await fetch(`https://api.green-api.com/waInstance${idInstance}/setSettings/${apiTokenInstance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: urlWebhook, incomingWebhook: "yes" })
    });
    const dados = await resp.json().catch(() => ({}));
    if (!resp.ok || dados.saveSettings === false) {
      return { sucesso: false, erro: dados?.description || `Green API recusou a configura\xE7\xE3o (erro ${resp.status}).` };
    }
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}
__name(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
__name2(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
__name22(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
__name222(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
__name2222(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
__name22222(configurarWebhookWhatsapp, "configurarWebhookWhatsapp");
async function chamarOpenAI(env, historicoOpenAI, sistemaPrompt) {
  const apiKey = await lerIntegracao(env, "openai_api_key");
  if (!apiKey) {
    throw new Error("Chave da OpenAI n\xE3o configurada (openai_api_key)");
  }
  const modelo = await lerIntegracao(env, "openai_model") || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelo,
      messages: [{ role: "system", content: sistemaPrompt || ANA_PAULA_SISTEMA }, ...historicoOpenAI],
      temperature: 0.6
    })
  });
  const dados = await resp.json();
  if (dados.error) {
    throw new Error(dados.error.message || "Erro ao chamar a OpenAI");
  }
  return dados.choices?.[0]?.message?.content || "";
}
__name(chamarOpenAI, "chamarOpenAI");
__name2(chamarOpenAI, "chamarOpenAI");
__name22(chamarOpenAI, "chamarOpenAI");
__name222(chamarOpenAI, "chamarOpenAI");
__name2222(chamarOpenAI, "chamarOpenAI");
__name22222(chamarOpenAI, "chamarOpenAI");
async function ativarAnaPaula(env, leadId, opcoes = {}) {
  const lead = await env.DB.prepare(`SELECT * FROM leads WHERE id = ?`).bind(leadId).first();
  if (!lead)
    return { sucesso: false, erro: "Lead n\xE3o encontrado" };
  if (!lead.telefone)
    return { sucesso: false, erro: "Lead sem telefone cadastrado" };
  if (!lead.origem_automatica)
    return { sucesso: false, erro: "Este lead \xE9 da base manual do CRM \u2014 a Ana Paula s\xF3 atende leads vindos automaticamente do site, portais ou Instagram." };
  if (!opcoes.forcar) {
    const existente = await env.DB.prepare(
      `SELECT * FROM ana_paula_conversas WHERE lead_id = ? AND status = 'ativa'`
    ).bind(leadId).first();
    if (existente)
      return { sucesso: false, erro: "J\xE1 existe uma conversa ativa da Ana Paula com este lead" };
    const jaAtendido = await env.DB.prepare(
      `SELECT ac.*, l.nome as lead_nome FROM ana_paula_conversas ac LEFT JOIN leads l ON l.id = ac.lead_id WHERE ac.telefone = ? ORDER BY ac.id DESC LIMIT 1`
    ).bind(lead.telefone).first();
    if (jaAtendido) {
      return {
        sucesso: false,
        erro: `Este contato j\xE1 foi atendido pela Ana Paula antes (lead "${jaAtendido.lead_nome || jaAtendido.lead_id}", status: ${jaAtendido.status}). Use forcar=true para reabrir mesmo assim.`,
        ja_atendido: true,
        conversa_anterior_id: jaAtendido.id
      };
    }
  }
  const primeiraMensagem = await chamarOpenAI(env, [
    {
      role: "user",
      content: `Novo lead chamado ${lead.nome || "cliente"}. Interesse inicial informado: ${lead.interesse || lead.mensagem || "n\xE3o informado"}. Origem: ${lead.origem || "n\xE3o informada"}. Inicie a conversa se apresentando como Ana Paula, da equipe do corretor Thiago Nunes, e comece a qualifica\xE7\xE3o.`
    }
  ]);
  const historico = [
    { role: "user", content: "[IN\xCDCIO DA CONVERSA]" },
    { role: "assistant", content: primeiraMensagem }
  ];
  await env.DB.prepare(`
INSERT INTO ana_paula_conversas (lead_id, telefone, historico, status, criado_em, atualizado_em)
VALUES (?, ?, ?, 'ativa', datetime('now'), datetime('now'))
`).bind(leadId, lead.telefone, JSON.stringify(historico)).run();
  await enviarWhatsapp(env, lead.telefone, primeiraMensagem);
  return { sucesso: true };
}
__name(ativarAnaPaula, "ativarAnaPaula");
__name2(ativarAnaPaula, "ativarAnaPaula");
__name22(ativarAnaPaula, "ativarAnaPaula");
__name222(ativarAnaPaula, "ativarAnaPaula");
__name2222(ativarAnaPaula, "ativarAnaPaula");
__name22222(ativarAnaPaula, "ativarAnaPaula");
var TENANT_MANUTENCAO_PALAVRAS = ["manutencao", "problema", "vazamento", "quebrado", "quebrou", "conserto", "reparo", "defeito", "encanamento", "eletrica", "infiltra", "goteira", "entupi"];
var TENANT_PAGAMENTO_PALAVRAS = ["pix", "boleto", "pagar", "pagamento", "aluguel", "vencimento", "venc"];
var ANA_PAULA_INQUILINO_SISTEMA = `Voc\xEA \xE9 Ana Paula, assistente virtual da imobili\xE1ria do corretor Thiago Nunes em Fazenda Rio Grande, PR, respondendo pelo WhatsApp a um INQUILINO que j\xE1 tem contrato de loca\xE7\xE3o ativo (n\xE3o \xE9 um lead novo).

Regras importantes:
- Seja breve, cordial e direta \u2014 mensagens curtas, como conversa de WhatsApp real.
- Use apenas os dados do contrato informados abaixo. Nunca invente valores, datas ou informa\xE7\xF5es sobre o im\xF3vel.
- Para pedidos de Pix/boleto ou chamados de manuten\xE7\xE3o, informe que \xE9 s\xF3 pedir diretamente (ex: "me manda o pix" ou "quero abrir uma manuten\xE7\xE3o") que voc\xEA resolve na hora.
- Para qualquer coisa que dependa de decis\xE3o do Thiago (negocia\xE7\xE3o, renova\xE7\xE3o de contrato, desconto, rescis\xE3o), diga que vai repassar para o Thiago e n\xE3o prometa nada em nome dele.
- Nunca mencione que voc\xEA \xE9 uma IA a menos que perguntem diretamente; se perguntarem, seja honesta.`;
async function buscarOuGerarCobrancaAtual(env, contrato) {
  const hoje = /* @__PURE__ */ new Date();
  const competencia = `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, "0")}`;
  const existente = await env.DB.prepare(
    `SELECT * FROM cobrancas_locacao WHERE contrato_id = ? AND competencia = ? ORDER BY id DESC LIMIT 1`
  ).bind(contrato.id, competencia).first();
  if (existente)
    return existente;
  const valor = Number(contrato.valor_aluguel);
  const dia = String(contrato.dia_vencimento || 5).padStart(2, "0");
  const dataVencimento = `${competencia}-${dia}`;
  const chave = contrato.chave_pix_recebedor || await lerIntegracao(env, "pix_chave_padrao");
  const nomeRecebedor = await lerIntegracao(env, "pix_recebedor_nome") || "Thiago Nunes";
  const cidadeRecebedor = await lerIntegracao(env, "pix_recebedor_cidade") || "Fazenda Rio Grande";
  const pixPayload = gerarPixPayload({
    chave,
    valor,
    nomeRecebedor,
    cidadeRecebedor,
    txid: `LOC${contrato.id}${competencia.replace("-", "")}`
  });
  const result = await env.DB.prepare(`
INSERT INTO cobrancas_locacao (contrato_id, competencia, valor, data_vencimento, status, pix_payload) VALUES (?, ?, ?, ?, 'pendente', ?)
`).bind(contrato.id, competencia, valor, dataVencimento, pixPayload).run();
  return { id: result.meta.last_row_id, contrato_id: contrato.id, competencia, valor, data_vencimento: dataVencimento, status: "pendente", pix_payload: pixPayload };
}
__name(buscarOuGerarCobrancaAtual, "buscarOuGerarCobrancaAtual");
__name2(buscarOuGerarCobrancaAtual, "buscarOuGerarCobrancaAtual");
__name22(buscarOuGerarCobrancaAtual, "buscarOuGerarCobrancaAtual");
async function responderInquilinoComIA(env, contrato, texto) {
  try {
    const sistemaInquilino = `${ANA_PAULA_INQUILINO_SISTEMA}

Dados do contrato deste inquilino:
- Nome: ${contrato.inquilino_nome}
- Valor do aluguel: ${formatarPrecoBRL(contrato.valor_aluguel)}
- Dia de vencimento: todo dia ${contrato.dia_vencimento || "n\xE3o informado"}
- \xCDndice de reajuste: ${contrato.indice_reajuste || "n\xE3o informado"}
- Status do contrato: ${contrato.status || "n\xE3o informado"}`;
    return await chamarOpenAI(env, [{ role: "user", content: texto }], sistemaInquilino);
  } catch (erro) {
    console.error("Falha ao responder inquilino com IA:", erro);
    return "Recebi sua mensagem! Vou repassar para o Thiago e ele te retorna em breve.";
  }
}
__name(responderInquilinoComIA, "responderInquilinoComIA");
__name2(responderInquilinoComIA, "responderInquilinoComIA");
__name22(responderInquilinoComIA, "responderInquilinoComIA");
async function processarMensagemInquilino(env, contrato, texto) {
  const normalizado = normalizarTexto(texto);
  if (TENANT_MANUTENCAO_PALAVRAS.some((p) => normalizado.includes(p))) {
    await env.DB.prepare(`
INSERT INTO chamados_manutencao (contrato_id, imovel_id, descricao, prioridade, status, aberto_por) VALUES (?, ?, ?, 'media', 'aberto', 'Inquilino via WhatsApp')
`).bind(contrato.id, contrato.imovel_id, texto).run();
    await enviarWhatsapp(env, contrato.inquilino_telefone, "Recebi sua solicita\xE7\xE3o e j\xE1 abri um chamado de manuten\xE7\xE3o para o Thiago. Ele vai entrar em contato para combinar os detalhes. Obrigada! \u{1F64F}");
    try {
      const telefoneAlerta = await lerIntegracao(env, "alerta_whatsapp_telefone");
      if (telefoneAlerta) {
        await enviarWhatsapp(
          env,
          telefoneAlerta,
          `\u{1F527} Novo chamado de manuten\xE7\xE3o!

Inquilino: ${contrato.inquilino_nome}
Contrato #${contrato.id}
Mensagem: ${texto}`
        );
      }
    } catch (erroAlerta) {
      console.error("Falha ao avisar Thiago sobre chamado de manuten\xE7\xE3o:", erroAlerta);
    }
    return;
  }
  if (TENANT_PAGAMENTO_PALAVRAS.some((p) => normalizado.includes(p))) {
    try {
      const cobranca = await buscarOuGerarCobrancaAtual(env, contrato);
      const mensagem = [
        `Ol\xE1 ${contrato.inquilino_nome}! Segue os dados do seu aluguel de ${cobranca.competencia}:`,
        `Valor: ${formatarPrecoBRL(cobranca.valor)}`,
        `Vencimento: ${cobranca.data_vencimento}`,
        "",
        "Pix Copia e Cola:",
        cobranca.pix_payload
      ].join("\n");
      await enviarWhatsapp(env, contrato.inquilino_telefone, mensagem);
    } catch (erroPix) {
      await enviarWhatsapp(env, contrato.inquilino_telefone, "N\xE3o consegui gerar seu Pix agora. J\xE1 avisei o Thiago para te enviar manualmente.");
      console.error("Falha ao gerar Pix para inquilino via WhatsApp:", erroPix);
    }
    return;
  }
  const resposta = await responderInquilinoComIA(env, contrato, texto);
  await enviarWhatsapp(env, contrato.inquilino_telefone, resposta);
}
__name(processarMensagemInquilino, "processarMensagemInquilino");
__name2(processarMensagemInquilino, "processarMensagemInquilino");
__name22(processarMensagemInquilino, "processarMensagemInquilino");
async function receberMensagemWhatsapp(env, body) {
  try {
    const idInstanceEsperado = await lerIntegracao(env, "green_api_id_instance");
    if (idInstanceEsperado && body?.instanceData?.idInstance && String(body.instanceData.idInstance) !== String(idInstanceEsperado)) {
      return;
    }
    if (body?.typeWebhook !== "incomingMessageReceived")
      return;
    const msgData = body.messageData;
    const texto = msgData?.textMessageData?.textMessage || msgData?.extendedTextMessageData?.text || null;
    if (!texto)
      return;
    const chatId = body?.senderData?.chatId || "";
    const telefoneDigitos = chatId.replace(/\D/g, "");
    if (!telefoneDigitos)
      return;
    const sufixo = telefoneDigitos.slice(-10);
    const contratoInquilino = await env.DB.prepare(
      `SELECT * FROM contratos_locacao WHERE (status IS NULL OR status NOT IN ('encerrado', 'inativo', 'cancelado')) AND inquilino_telefone LIKE ?`
    ).bind(`%${sufixo}`).first();
    if (contratoInquilino) {
      await processarMensagemInquilino(env, contratoInquilino, texto);
      return;
    }
    const conversa = await env.DB.prepare(
      `SELECT * FROM ana_paula_conversas WHERE status = 'ativa' AND telefone LIKE ?`
    ).bind(`%${sufixo}`).first();
    if (!conversa)
      return;
    let historico = [];
    try {
      historico = JSON.parse(conversa.historico) || [];
    } catch {
      historico = [];
    }
    historico.push({ role: "user", content: texto });
    if (historico.filter((m) => m.role === "user").length > LIMITE_MENSAGENS_CONVERSA) {
      await env.DB.prepare(
        `UPDATE ana_paula_conversas SET status = 'limite_atingido', historico = ?, atualizado_em = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(historico), conversa.id).run();
      await enviarWhatsapp(env, conversa.telefone, "Vou repassar nossa conversa para o Thiago dar continuidade por aqui mesmo, tudo bem? Ele j\xE1 te chama! \u{1F60A}");
      return;
    }
    const historicoOpenAI = historico.map((m) => ({ role: m.role, content: m.content }));
    const sistemaEscolhido = conversa.modo === "follow_up" ? ANA_PAULA_FOLLOWUP_SISTEMA : ANA_PAULA_SISTEMA;
    const resposta = await chamarOpenAI(env, historicoOpenAI, sistemaEscolhido);
    const qualificado = resposta.includes("[QUALIFICADO]");
    const quente = resposta.includes("[QUENTE]");
    const respostaParaEnviar = resposta.replace(/\[QUALIFICADO\][^\n]*/, "").replace(/\[QUENTE\][^\n]*/, "").trim();
    historico.push({ role: "assistant", content: resposta });
    if (respostaParaEnviar) {
      await enviarWhatsapp(env, conversa.telefone, respostaParaEnviar);
    }
    if (quente) {
      try {
        const leadQuente = await env.DB.prepare(`SELECT * FROM leads WHERE id = ?`).bind(conversa.lead_id).first();
        if (leadQuente && leadQuente.temperatura !== "Quente") {
          const linhaQuente = resposta.split("\n").find((l) => l.includes("[QUENTE]")) || "";
          const resumoQuente = linhaQuente.replace("[QUENTE]", "").trim();
          await env.DB.prepare(`UPDATE leads SET temperatura = 'Quente' WHERE id = ?`).bind(conversa.lead_id).run();
          const telefoneAlertaQuente = await lerIntegracao(env, "alerta_whatsapp_telefone");
          if (telefoneAlertaQuente) {
            await enviarWhatsapp(
              env,
              telefoneAlertaQuente,
              `\u{1F525} Lead esquentando AGORA (Ana Paula)!

Nome: ${leadQuente.nome || "-"}
Telefone: ${leadQuente.telefone || "-"}
Sinal: ${resumoQuente || "demonstrou inten\xE7\xE3o forte de fechar"}

A conversa ainda est\xE1 rolando \u2014 essa \xE9 sua chance de entrar em contato voc\xEA mesmo enquanto est\xE1 quente.`
            );
          }
        }
      } catch (erroQuente) {
        console.error("Falha ao processar alerta de lead quente:", erroQuente);
      }
    }
    if (qualificado) {
      const linhaResumo = resposta.split("\n").find((l) => l.includes("[QUALIFICADO]")) || "";
      const resumo = linhaResumo.replace("[QUALIFICADO]", "").trim();
      await env.DB.prepare(
        `UPDATE ana_paula_conversas SET status = 'concluida', historico = ?, atualizado_em = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(historico), conversa.id).run();
      const lead = await env.DB.prepare(`SELECT * FROM leads WHERE id = ?`).bind(conversa.lead_id).first();
      if (lead) {
        const notaAtual = lead.nota_inicial || "";
        const novaNota = `${notaAtual}${notaAtual ? "\n\n" : ""}\u{1F916} Ana Paula (qualifica\xE7\xE3o autom\xE1tica): ${resumo || "conversa conclu\xEDda"}`;
        await env.DB.prepare(
          `UPDATE leads SET estagio = 'Qualificado', nota_inicial = ?, stage_changed_at = datetime('now') WHERE id = ?`
        ).bind(novaNota, conversa.lead_id).run();
        try {
          await env.DB.prepare(`
INSERT INTO tarefas (titulo, descricao, tipo, relacionado_tipo, relacionado_id, responsavel, prioridade, vencimento, status)
VALUES (?, ?, 'Contato', 'lead', ?, 'Thiago', 'Alta', datetime('now', '+2 hours'), 'Pendente')
`).bind(`Ligar para ${lead.nome || "lead qualificado"} (Ana Paula)`, resumo || "Ana Paula qualificou este lead pelo WhatsApp.", conversa.lead_id).run();
        } catch (erroTarefa) {
          console.error("Falha ao criar tarefa de follow-up para lead qualificado:", erroTarefa);
        }
        try {
          const telefoneAlerta = await lerIntegracao(env, "alerta_whatsapp_telefone");
          if (telefoneAlerta) {
            await enviarWhatsapp(
              env,
              telefoneAlerta,
              `\u2705 Ana Paula qualificou um lead!

Nome: ${lead.nome || "-"}
Telefone: ${lead.telefone || "-"}
Resumo: ${resumo || "conversa conclu\xEDda"}

Est\xE1gio atualizado pra "Qualificado" no CRM.`
            );
          }
        } catch (erroAlerta) {
          console.error("Falha ao avisar Thiago sobre lead qualificado:", erroAlerta);
        }
      }
    } else {
      await env.DB.prepare(
        `UPDATE ana_paula_conversas SET historico = ?, atualizado_em = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(historico), conversa.id).run();
    }
  } catch (erro) {
    console.error("Falha ao processar mensagem recebida da Ana Paula:", erro);
  }
}
__name(receberMensagemWhatsapp, "receberMensagemWhatsapp");
__name2(receberMensagemWhatsapp, "receberMensagemWhatsapp");
__name22(receberMensagemWhatsapp, "receberMensagemWhatsapp");
__name222(receberMensagemWhatsapp, "receberMensagemWhatsapp");
__name2222(receberMensagemWhatsapp, "receberMensagemWhatsapp");
__name22222(receberMensagemWhatsapp, "receberMensagemWhatsapp");
// Valor movido para secret do Worker (INSTAGRAM_WEBHOOK_VERIFY_TOKEN) ao versionar
// o codigo: este repositorio e publico. Sem o secret, a verificacao abaixo recusa
// qualquer chamada - falha fechada, de proposito.
var INSTAGRAM_WEBHOOK_VERIFY_TOKEN = null;
async function buscarNomeInstagram(env, senderId) {
  try {
    const token = await lerIntegracao(env, "meta_page_access_token");
    if (!token)
      return null;
    const base = ehTokenLoginInstagram(token) ? `https://graph.instagram.com/v21.0/${senderId}?fields=name,username` : `https://graph.facebook.com/v20.0/${senderId}?fields=name,username`;
    const resp = await fetch(`${base}&access_token=${token}`);
    const dados = await resp.json();
    if (dados.error)
      return null;
    return dados.name || dados.username || null;
  } catch {
    return null;
  }
}
__name(buscarNomeInstagram, "buscarNomeInstagram");
__name2(buscarNomeInstagram, "buscarNomeInstagram");
__name22(buscarNomeInstagram, "buscarNomeInstagram");
__name222(buscarNomeInstagram, "buscarNomeInstagram");
__name2222(buscarNomeInstagram, "buscarNomeInstagram");
__name22222(buscarNomeInstagram, "buscarNomeInstagram");
async function enviarMensagemInstagram(env, destinatarioId, texto) {
  const token = await lerIntegracao(env, "meta_page_access_token");
  if (!token)
    throw new Error("Token de p\xE1gina do Meta n\xE3o configurado (meta_page_access_token).");
  const urlEnvio = ehTokenLoginInstagram(token) ? `https://graph.instagram.com/v21.0/me/messages?access_token=${token}` : `https://graph.facebook.com/v20.0/me/messages?access_token=${token}`;
  const resp = await fetch(urlEnvio, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: destinatarioId },
      message: { text: texto },
      messaging_type: "RESPONSE"
    })
  });
  const dados = await resp.json();
  if (dados.error)
    throw new Error(dados.error.message || "Erro ao enviar mensagem pelo Instagram");
  return dados;
}
__name(enviarMensagemInstagram, "enviarMensagemInstagram");
__name2(enviarMensagemInstagram, "enviarMensagemInstagram");
__name22(enviarMensagemInstagram, "enviarMensagemInstagram");
__name222(enviarMensagemInstagram, "enviarMensagemInstagram");
__name2222(enviarMensagemInstagram, "enviarMensagemInstagram");
__name22222(enviarMensagemInstagram, "enviarMensagemInstagram");
async function receberMensagemInstagram(env, body) {
  try {
    if (body?.object !== "instagram" && body?.object !== "user")
      return;
    for (const entry of body.entry || []) {
      for (const evento of entry.messaging || []) {
        const senderId = evento?.sender?.id;
        const texto = evento?.message?.text;
        if (!senderId || !texto || evento.message?.is_echo)
          continue;
        const conversa = await env.DB.prepare(
          `SELECT * FROM instagram_conversas WHERE sender_id = ?`
        ).bind(senderId).first();
        let historico = [];
        if (conversa) {
          try {
            historico = JSON.parse(conversa.historico) || [];
          } catch {
            historico = [];
          }
        }
        historico.push({ direction: "in", texto, em: (/* @__PURE__ */ new Date()).toISOString() });
        if (!conversa) {
          const nomeContato = await buscarNomeInstagram(env, senderId);
          const insertConversa = await env.DB.prepare(`
INSERT INTO instagram_conversas (sender_id, nome, historico, status, criado_em, atualizado_em)
VALUES (?, ?, ?, 'aberta', datetime('now'), datetime('now'))
`).bind(senderId, nomeContato, JSON.stringify(historico)).run();
          const conversaId = insertConversa.meta.last_row_id;
          const origemId = `instagram_dm_${senderId}`;
          const registro = await registrarLeadEntrante(env, {
            nome: nomeContato || "Contato do Instagram",
            telefone: null,
            email: null,
            origem: "Instagram \u2014 Mensagem direta",
            interesse: null,
            mensagem: texto,
            origem_id: origemId
          });
          if (registro.capturaId) {
            await env.DB.prepare(`UPDATE instagram_conversas SET lead_capture_id = ? WHERE id = ?`).bind(registro.capturaId, conversaId).run();
          }
        } else {
          await env.DB.prepare(
            `UPDATE instagram_conversas SET historico = ?, status = 'aberta', atualizado_em = datetime('now') WHERE id = ?`
          ).bind(JSON.stringify(historico), conversa.id).run();
        }
      }
    }
  } catch (erro) {
    console.error("Falha ao processar mensagem recebida do Instagram:", erro);
  }
}
__name(receberMensagemInstagram, "receberMensagemInstagram");
__name2(receberMensagemInstagram, "receberMensagemInstagram");
__name22(receberMensagemInstagram, "receberMensagemInstagram");
__name222(receberMensagemInstagram, "receberMensagemInstagram");
__name2222(receberMensagemInstagram, "receberMensagemInstagram");
__name22222(receberMensagemInstagram, "receberMensagemInstagram");
var TABLES = {
  leads: {
    campos: ["nome", "telefone", "email", "interesse", "tipo_negocio", "estagio", "temperatura", "valor_potencial", "origem", "origem_id", "nota_inicial", "stage_changed_at", "fechado_em", "motivo_perda"],
    obrigatorio: "nome"
  },
  clientes: {
    campos: ["nome", "telefone", "email", "papel", "origem", "observacoes", "tipo_contato", "capacidade_investimento", "interesse"],
    obrigatorio: "nome"
  },
  imoveis: {
    campos: ["endereco", "bairro", "tipo", "valor", "area", "matricula", "cliente_id", "video_url", "descricao", "status", "entrada", "vencimento", "dias_vencimento", "data_venda", "modo", "gmb_postado_em"],
    obrigatorio: "endereco"
  },
  tarefas: {
    campos: ["titulo", "descricao", "tipo", "relacionado_tipo", "relacionado_id", "responsavel", "prioridade", "vencimento", "status", "concluido_em"],
    obrigatorio: "titulo"
  },
  metas: {
    campos: ["titulo", "tipo", "valor_meta", "periodo_inicio", "periodo_fim"],
    obrigatorio: "titulo"
  },
  propostas: {
    campos: ["imovel_id", "cliente_id", "valor_proposta", "forma_pagamento", "status", "validade", "observacoes"],
    obrigatorio: "imovel_id"
  },
  campanhas: {
    campos: ["nome", "canal", "investimento", "periodo_inicio", "periodo_fim", "observacoes"],
    obrigatorio: "nome"
  },
  avaliacoes: {
    campos: ["nome_solicitante", "telefone", "email", "cliente_id", "endereco", "bairro", "tipo_imovel", "area", "valor_estimado", "status", "data_visita", "observacoes"],
    obrigatorio: "nome_solicitante"
  },
  disparos: {
    campos: ["titulo", "mensagem", "publico", "status", "total_destinatarios", "total_enviados", "total_falhas", "midia_url", "midia_nome"],
    obrigatorio: "titulo"
  },
  disparos_destinatarios: {
    campos: ["disparo_id", "nome", "telefone", "mensagem_final", "status", "erro", "enviado_em"],
    obrigatorio: "telefone"
  },
  pos_vendas: {
    campos: ["imovel_id", "cliente_id", "data_fechamento", "documentacao_entregue", "chaves_entregues", "pesquisa_enviada", "nota_satisfacao", "indicacao_solicitada", "status", "observacoes"],
    obrigatorio: "imovel_id"
  },
  follow_ups: {
    campos: ["lead_id", "ultimo_contato", "proximo_contato", "tentativas", "canal", "status", "observacoes"],
    obrigatorio: "lead_id"
  },
  agenda: {
    campos: ["titulo", "tipo", "data", "hora_inicio", "hora_fim", "local", "relacionado_tipo", "relacionado_id", "status", "observacoes"],
    obrigatorio: "titulo"
  },
  apify_leads: {
    campos: ["portal", "type", "zone", "location", "area", "price", "link", "endereco", "captured_at", "source", "raw_json", "status", "observacoes", "anunciante_nome", "anunciante_telefone", "anunciante_whatsapp", "titulo", "descricao", "cidade"],
    obrigatorio: "link"
  },
  simulacoes: {
    campos: ["lead_id", "cliente_id", "imovel_id", "nome_cliente", "telefone", "valor_imovel", "entrada", "valor_financiado", "renda_familiar", "prazo_meses", "modalidade", "sistema", "juros_aa", "primeira_parcela", "ultima_parcela", "comprometimento", "subsidio", "custos_aquisicao", "versao_params", "payload"],
    obrigatorio: "valor_imovel"
  },
  lancamentos: {
    campos: ["tipo", "data", "categoria", "descricao", "valor", "vgv"],
    obrigatorio: "tipo"
  },
  contratos_locacao: {
    campos: ["imovel_id", "proprietario_cliente_id", "inquilino_nome", "inquilino_telefone", "inquilino_email", "inquilino_cpf", "valor_aluguel", "dia_vencimento", "taxa_administracao", "indice_reajuste", "data_inicio", "data_fim", "data_ultimo_reajuste", "data_proximo_reajuste", "chave_pix_recebedor", "status", "observacoes"],
    obrigatorio: "inquilino_nome"
  },
  cobrancas_locacao: {
    campos: ["contrato_id", "competencia", "valor", "data_vencimento", "status", "data_pagamento", "forma_pagamento", "pix_payload", "lembrete_enviado_em", "observacoes"],
    obrigatorio: "contrato_id"
  },
  chamados_manutencao: {
    campos: ["contrato_id", "imovel_id", "descricao", "prioridade", "status", "aberto_por", "data_agendada", "data_conclusao", "custo", "responsavel_pelo_custo", "observacoes"],
    obrigatorio: "descricao"
  },
  implantacoes: {
    campos: ["cliente_nome", "endereco", "tipo_estudo", "zona", "area_terreno", "testada", "n_unidades", "vgv", "custo_total", "margem", "roi_anualizado", "veredito", "imovel_id", "cliente_id", "dados_json", "pendencias_json"],
    obrigatorio: "endereco"
  }
};
var DEPENDENCIAS_PARA_CASCADE = {
  leads: [
    { tabela: "follow_ups", coluna: "lead_id" },
    { tabela: "ana_paula_conversas", coluna: "lead_id" }
  ]
};
async function handleCrud(request, env, ctx, tabela, id) {
  const config = TABLES[tabela];
  const db = env.DB;
  if (request.method === "GET" && !id) {
    const { results } = await db.prepare(`SELECT * FROM ${tabela} ORDER BY id DESC`).all();
    return json({ sucesso: true, dados: results });
  }
  if (request.method === "GET" && id) {
    const row = await db.prepare(`SELECT * FROM ${tabela} WHERE id = ?`).bind(id).first();
    if (!row)
      return json({ sucesso: false, erro: "N\xE3o encontrado" }, 404);
    return json({ sucesso: true, dados: row });
  }
  if (request.method === "POST") {
    const body = await request.json();
    if (!body[config.obrigatorio])
      return json({ sucesso: false, erro: `Campo obrigat\xF3rio: ${config.obrigatorio}` }, 400);
    const campos = config.campos.filter((c) => body[c] !== void 0);
    const placeholders = campos.map(() => "?").join(", ");
    const sql = `INSERT INTO ${tabela} (${campos.join(", ")}) VALUES (${placeholders})`;
    const valoresCampos = campos.map((c) => tabela === "leads" && c === "origem" ? normalizarOrigem(body[c]) : body[c]);
    const result = await db.prepare(sql).bind(...valoresCampos).run();
    if (tabela === "leads") {
      await criarFollowUpAutomatico(env, result.meta.last_row_id).catch((e) => console.error("Falha ao criar follow-up automatico (CRUD):", e));
    }
    return json({ sucesso: true, id: result.meta.last_row_id });
  }
  if (request.method === "PUT" && id) {
    const body = await request.json();
    const campos = config.campos.filter((c) => body[c] !== void 0);
    if (campos.length === 0)
      return json({ sucesso: false, erro: "Nada para atualizar" }, 400);
    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const sql = `UPDATE ${tabela} SET ${sets}, atualizado_em = datetime('now') WHERE id = ?`;
    const valoresCampos = campos.map((c) => tabela === "leads" && c === "origem" ? normalizarOrigem(body[c]) : body[c]);
    await db.prepare(sql).bind(...valoresCampos, id).run();
    if (tabela === "leads" && (body.estagio === "Fechado" || body.estagio === "Perdido")) {
      await db.prepare(
        `UPDATE follow_ups SET status = 'Conclu\xEDdo', atualizado_em = datetime('now') WHERE lead_id = ? AND status = 'Ativo'`
      ).bind(id).run().catch((e) => console.error("Falha ao encerrar follow-ups do lead fechado:", e));
    }
    return json({ sucesso: true });
  }
  if (request.method === "DELETE" && id) {
    try {
      const dependencias = DEPENDENCIAS_PARA_CASCADE[tabela] || [];
      for (const dep of dependencias) {
        await db.prepare(`DELETE FROM ${dep.tabela} WHERE ${dep.coluna} = ?`).bind(id).run();
      }
      await db.prepare(`DELETE FROM ${tabela} WHERE id = ?`).bind(id).run();
      return json({ sucesso: true });
    } catch (erroDelete) {
      const msg = String(erroDelete?.message || erroDelete);
      if (msg.includes("FOREIGN KEY") || msg.includes("SQLITE_CONSTRAINT")) {
        return json({
          sucesso: false,
          erro: "N\xE3o foi poss\xEDvel excluir: existem registros vinculados a este item em outra tabela (chave estrangeira). Avise o Thiago pra checar o v\xEDnculo."
        }, 409);
      }
      return json({ sucesso: false, erro: msg }, 500);
    }
  }
  return json({ sucesso: false, erro: "M\xE9todo n\xE3o suportado" }, 405);
}
__name(handleCrud, "handleCrud");
__name2(handleCrud, "handleCrud");
__name22(handleCrud, "handleCrud");
__name222(handleCrud, "handleCrud");
__name2222(handleCrud, "handleCrud");
__name22222(handleCrud, "handleCrud");
async function tratarRequisicao(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }
  try {
    if (path === "/" && request.method === "GET") {
      return json({ status: "CRM Thiago Nunes - Worker ativo" });
    }
    const CAMPOS_PUBLICOS = "id, endereco, bairro, tipo, valor, area, descricao, video_url, status, criado_em";
    const FILTRO_PUBLICO = "(status IS NULL OR status NOT IN ('vendido', 'inativo', 'indisponivel'))";
    const comFotosDoImovel = /* @__PURE__ */ __name2222(async (imovel) => {
      const listed = await env.fotos_balde.list({ prefix: `imoveis/${imovel.id}/` });
      return { ...imovel, fotos: listed.objects.map((o) => `/fotos/${o.key}`) };
    }, "comFotosDoImovel");
    if (path === "/publico/imoveis" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT ${CAMPOS_PUBLICOS} FROM imoveis WHERE ${FILTRO_PUBLICO} ORDER BY id DESC`
      ).all();
      return json({ sucesso: true, dados: await Promise.all(results.map(comFotosDoImovel)) });
    }
    const publicoDetalheMatch = path.match(/^\/publico\/imoveis\/(\d+)$/);
    if (publicoDetalheMatch && request.method === "GET") {
      const row = await env.DB.prepare(
        `SELECT ${CAMPOS_PUBLICOS} FROM imoveis WHERE id = ? AND ${FILTRO_PUBLICO}`
      ).bind(publicoDetalheMatch[1]).first();
      if (!row)
        return json({ sucesso: false, erro: "Im\xF3vel n\xE3o dispon\xEDvel" }, 404);
      return json({ sucesso: true, dados: await comFotosDoImovel(row) });
    }
    if (path === "/lead" && request.method === "POST") {
      const ipLead = request.headers.get("CF-Connecting-IP") || "desconhecido";
      if (!await limitarTaxa(env, `lead:${ipLead}`, 10, 60)) {
        return json({ sucesso: false, erro: "Muitas tentativas. Aguarde um minuto." }, 429);
      }
      const body = await request.json().catch(() => null);
      if (!body)
        return json({ sucesso: false, erro: "Corpo inv\xE1lido" }, 400);
      if (!body.nome && !body.telefone && !body.email) {
        return json({ sucesso: false, erro: "Informe ao menos nome, telefone ou e-mail" }, 400);
      }
      await registrarLeadEntrante(env, {
        nome: body.nome,
        telefone: body.telefone,
        email: body.email,
        origem: normalizarOrigem(body.origem) || "Site \u2014 contato",
        interesse: body.interesse,
        mensagem: body.mensagem,
        zona_interesse: body.zona_interesse
      }, ctx);
      return json({ sucesso: true, mensagem: "Lead salvo com sucesso!" });
    }
    if (path === "/api/auth/login" && request.method === "POST") {
      const ipLogin = request.headers.get("CF-Connecting-IP") || "desconhecido";
      if (!await limitarTaxa(env, `login:${ipLogin}`, 8, 60)) {
        return json({ sucesso: false, erro: "Muitas tentativas de login. Aguarde um minuto." }, 429);
      }
      const { email, senha } = await request.json();
      const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first();
      if (!user)
        return json({ sucesso: false, erro: "Credenciais inv\xE1lidas" }, 401);
      const { hash } = await hashSenha(senha, user.senha_salt);
      if (hash !== user.senha_hash)
        return json({ sucesso: false, erro: "Credenciais inv\xE1lidas" }, 401);
      const token = await signJWT({ sub: user.id, email: user.email, nome: user.nome, papel: user.papel, tv: user.token_version, exp: Math.floor(Date.now() / 1e3) + SESSAO_DURACAO_SEGUNDOS }, env.JWT_SECRET);
      return json({ sucesso: true, token, usuario: { id: user.id, nome: user.nome, email: user.email, papel: user.papel } });
    }
    const isApi = path.startsWith("/api/");
    let auth = null;
    if (isApi && path !== "/api/auth/login") {
      auth = await getAuth(request, env);
      if (!auth)
        return json({ sucesso: false, erro: "N\xE3o autorizado" }, 401);
    }
    if (path === "/api/auth/me" && request.method === "GET") {
      return json({ sucesso: true, usuario: { id: auth.sub, nome: auth.nome, email: auth.email, papel: auth.papel } });
    }
    if (path === "/api/auth/revogar-sessoes" && request.method === "POST") {
      await env.DB.prepare(`UPDATE users SET token_version = token_version + 1 WHERE id = ?`).bind(auth.sub).run();
      return json({ sucesso: true, mensagem: "Todas as sess\xF5es foram encerradas. Fa\xE7a login novamente em todos os dispositivos." });
    }
    if (path === "/api/saude-automacao" && request.method === "GET") {
      const [ultimoSyncMeta, ultimoBackup, ultimaRenovacaoToken, conversasAnaPaula, conversasInstagram, ultimoApify, ultimoLead] = await Promise.all([
        env.DB.prepare(`SELECT executado_em, sucesso, novos, http_status, erro FROM meta_sync_log ORDER BY id DESC LIMIT 1`).first(),
        env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = 'ultimo_backup_em'`).first(),
        env.DB.prepare(`SELECT valor FROM integracoes WHERE chave = 'meta_token_renovado_em'`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM ana_paula_conversas`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM instagram_conversas`).first(),
        env.DB.prepare(`SELECT MAX(started_at) as ultimo FROM apify_sync_log`).first(),
        env.DB.prepare(`SELECT MAX(criado_em) as ultimo FROM leads`).first()
      ]);
      return json({
        sucesso: true,
        dados: {
          cron: { ativo: !!ultimoSyncMeta, ultima_execucao: ultimoSyncMeta?.executado_em || null },
          sincronizacao_meta: ultimoSyncMeta ? {
            sucesso: !!ultimoSyncMeta.sucesso,
            novos: ultimoSyncMeta.novos,
            http_status: ultimoSyncMeta.http_status,
            erro: ultimoSyncMeta.erro
          } : { erro: "Nunca rodou" },
          ultimo_backup_em: ultimoBackup?.valor || null,
          ultima_renovacao_token_meta: ultimaRenovacaoToken?.valor || null,
          ana_paula_total_conversas: conversasAnaPaula?.n || 0,
          instagram_total_conversas: conversasInstagram?.n || 0,
          apify_ultima_execucao: ultimoApify?.ultimo || null,
          ultimo_lead_recebido_em: ultimoLead?.ultimo || null
        }
      });
    }
    if (path === "/api/dashboard-resumo" && request.method === "GET") {
      const [leadsAbertos, leadsHoje, followUpsVencidos, imoveisAtivos, imoveisVendidos, propostasAbertas, tarefasPendentes, anaPaulaAtivas] = await Promise.all([
        env.DB.prepare(`SELECT COUNT(*) as n FROM leads WHERE estagio NOT IN ('Fechado', 'Perdido')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM leads WHERE date(criado_em) = date('now')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM follow_ups WHERE status = 'Ativo' AND proximo_contato IS NOT NULL AND date(proximo_contato) <= date('now')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM imoveis WHERE status NOT IN ('vendido', 'inativo')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM imoveis WHERE status = 'vendido'`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM propostas WHERE status NOT IN ('Aceita', 'Recusada', 'Cancelada')`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM tarefas WHERE status = 'Pendente'`).first(),
        env.DB.prepare(`SELECT COUNT(*) as n FROM ana_paula_conversas WHERE status = 'ativa'`).first()
      ]);
      return json({
        sucesso: true,
        dados: {
          leads_abertos: leadsAbertos?.n || 0,
          leads_hoje: leadsHoje?.n || 0,
          follow_ups_vencidos: followUpsVencidos?.n || 0,
          imoveis_ativos: imoveisAtivos?.n || 0,
          imoveis_vendidos: imoveisVendidos?.n || 0,
          propostas_abertas: propostasAbertas?.n || 0,
          tarefas_pendentes: tarefasPendentes?.n || 0,
          ana_paula_ativas: anaPaulaAtivas?.n || 0
        }
      });
    }
    if (path === "/api/chat-crm" && request.method === "POST") {
      const bodyChat = await request.json().catch(() => null);
      const mensagemChat = bodyChat?.mensagem?.trim();
      if (!mensagemChat) {
        return json({ sucesso: false, erro: "Mensagem vazia" }, 400);
      }
      if (!await limitarTaxa(env, `chat-crm:${auth.sub}`, 20, 60)) {
        return json({ sucesso: false, erro: "Muitas mensagens. Aguarde um minuto." }, 429);
      }
      await env.DB.prepare(
        `INSERT INTO chat_assistente_mensagens (remetente, mensagem) VALUES ('user', ?)`
      ).bind(mensagemChat).run();
      const hojeChat = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const [agendaHoje, followUpsVencidos, leadsQuentesParados, resumoFunil, tarefasVencidas, historicoChat] = await Promise.all([
        env.DB.prepare(
          `SELECT titulo, tipo, hora_inicio, local, status FROM agenda WHERE data = ? AND status != 'Cancelado' ORDER BY hora_inicio`
        ).bind(hojeChat).all(),
        env.DB.prepare(
          `SELECT f.id, l.nome, l.telefone, f.proximo_contato, f.tentativas, f.canal FROM follow_ups f JOIN leads l ON l.id = f.lead_id WHERE f.status = 'Ativo' AND f.proximo_contato <= ? ORDER BY f.proximo_contato LIMIT 20`
        ).bind(hojeChat).all(),
        env.DB.prepare(
          `SELECT nome, telefone, estagio, valor_potencial, atualizado_em FROM leads WHERE temperatura = 'Quente' AND estagio NOT IN ('Fechado','Perdido') AND julianday('now') - julianday(atualizado_em) > 3 ORDER BY atualizado_em LIMIT 15`
        ).all(),
        env.DB.prepare(
          `SELECT estagio, COUNT(*) as total FROM leads WHERE estagio NOT IN ('Fechado','Perdido') GROUP BY estagio`
        ).all(),
        env.DB.prepare(
          `SELECT titulo, vencimento, prioridade FROM tarefas WHERE status = 'Pendente' AND vencimento <= ? ORDER BY vencimento LIMIT 20`
        ).bind(hojeChat).all(),
        env.DB.prepare(
          `SELECT remetente, mensagem FROM chat_assistente_mensagens ORDER BY id DESC LIMIT 12`
        ).all()
      ]);
      const linhasAgenda = agendaHoje.results.length ? agendaHoje.results.map((a) => `- ${a.hora_inicio || "(sem hora)"} ${a.titulo} (${a.tipo}) em ${a.local || "\u2014"}`).join("\n") : "- Nada agendado hoje.";
      const linhasFollowUps = followUpsVencidos.results.length ? followUpsVencidos.results.map((f) => `- ${f.nome} (${f.telefone || "sem telefone"}) \u2014 pr\xF3ximo contato: ${f.proximo_contato}, ${f.tentativas} tentativas, canal ${f.canal}`).join("\n") : "- Nenhum follow-up vencido.";
      const linhasLeadsQuentes = leadsQuentesParados.results.length ? leadsQuentesParados.results.map((l) => `- ${l.nome} (${l.telefone || "sem telefone"}) \u2014 est\xE1gio ${l.estagio}, potencial R$ ${l.valor_potencial}`).join("\n") : "- Nenhum lead quente parado.";
      const linhasTarefas = tarefasVencidas.results.length ? tarefasVencidas.results.map((t) => `- ${t.titulo} (venceu ${t.vencimento}, prioridade ${t.prioridade})`).join("\n") : "- Nenhuma tarefa vencida.";
      const linhasFunil = resumoFunil.results.length ? resumoFunil.results.map((r) => `- ${r.estagio}: ${r.total}`).join("\n") : "- Funil vazio.";
      const systemPromptChat = `Voc\xEA \xE9 o assistente interno do CRM de Thiago Nunes, corretor de im\xF3veis aut\xF4nomo em Fazenda Rio Grande/PR. Responda em portugu\xEAs, direto e sem enrola\xE7\xE3o. Use os dados reais abaixo \u2014 nunca invente n\xFAmeros. Se algo estiver vazio, diga que est\xE1 vazio.

DADOS DE HOJE (${hojeChat}):

Agenda de hoje:
${linhasAgenda}

Follow-ups vencidos ou vencendo hoje:
${linhasFollowUps}

Leads quentes parados h\xE1 mais de 3 dias sem atualiza\xE7\xE3o:
${linhasLeadsQuentes}

Tarefas vencidas:
${linhasTarefas}

Funil (leads ativos por est\xE1gio):
${linhasFunil}

Quando o Thiago pedir "diagn\xF3stico", "resumo" ou "como est\xE1 o CRM", priorize: 1) o que est\xE1 vencido/atrasado, 2) leads quentes esfriando, 3) agenda do dia. Seja proativo em apontar riscos, mas sem inventar dado que n\xE3o est\xE1 na lista acima.`;
      const chaveOpenAI = await lerIntegracao(env, "openai_api_key");
      if (!chaveOpenAI) {
        return json({ sucesso: false, erro: "Chave openai_api_key n\xE3o configurada em Integra\xE7\xF5es" }, 500);
      }
      const historicoOrdenado = historicoChat.results.reverse();
      const respostaOpenAI = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${chaveOpenAI}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPromptChat },
            ...historicoOrdenado.map((h) => ({ role: h.remetente === "user" ? "user" : "assistant", content: h.mensagem }))
          ],
          temperature: 0.4,
          max_tokens: 700
        })
      });
      if (!respostaOpenAI.ok) {
        const detalheErro = await respostaOpenAI.text();
        return json({ sucesso: false, erro: "Falha ao consultar a OpenAI", detalhe: detalheErro }, 502);
      }
      const dadosResposta = await respostaOpenAI.json();
      const respostaTexto = dadosResposta.choices?.[0]?.message?.content || "(sem resposta)";
      await env.DB.prepare(
        `INSERT INTO chat_assistente_mensagens (remetente, mensagem) VALUES ('assistente', ?)`
      ).bind(respostaTexto).run();
      return json({ sucesso: true, resposta: respostaTexto });
    }
    if (path === "/api/chat-crm/historico" && request.method === "GET") {
      const limiteHistorico = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const { results } = await env.DB.prepare(
        `SELECT id, remetente, mensagem, criado_em FROM chat_assistente_mensagens ORDER BY id DESC LIMIT ?`
      ).bind(limiteHistorico).all();
      return json({ sucesso: true, mensagens: results.reverse() });
    }
    if (path === "/api/auth/perfil" && request.method === "PUT") {
      const body = await request.json();
      const user = await env.DB.prepare(`SELECT * FROM users WHERE id = ?`).bind(auth.sub).first();
      if (!user)
        return json({ sucesso: false, erro: "Usu\xE1rio n\xE3o encontrado" }, 404);
      let novoHash = user.senha_hash;
      let novoSalt = user.senha_salt;
      if (body.nova_senha) {
        if (!body.senha_atual)
          return json({ sucesso: false, erro: "Informe a senha atual" }, 400);
        const { hash: hashAtual } = await hashSenha(body.senha_atual, user.senha_salt);
        if (hashAtual !== user.senha_hash)
          return json({ sucesso: false, erro: "Senha atual incorreta" }, 401);
        const gerado = await hashSenha(body.nova_senha);
        novoHash = gerado.hash;
        novoSalt = gerado.salt;
      }
      const nome = body.nome || user.nome;
      const email = body.email || user.email;
      const novaVersaoToken = body.nova_senha ? (user.token_version || 1) + 1 : user.token_version || 1;
      await env.DB.prepare(
        `UPDATE users SET nome = ?, email = ?, senha_hash = ?, senha_salt = ?, token_version = ? WHERE id = ?`
      ).bind(nome, email, novoHash, novoSalt, novaVersaoToken, auth.sub).run();
      const token = await signJWT({ sub: user.id, email, nome, papel: user.papel, tv: novaVersaoToken, exp: Math.floor(Date.now() / 1e3) + SESSAO_DURACAO_SEGUNDOS }, env.JWT_SECRET);
      return json({ sucesso: true, token, usuario: { id: user.id, nome, email, papel: user.papel } });
    }
    const enviarMatch = path.match(/^\/api\/disparos\/(\d+)\/enviar$/);
    if (enviarMatch && request.method === "POST") {
      const disparoId = enviarMatch[1];
      ctx.waitUntil(processarDisparo(env, disparoId));
      return json({ sucesso: true });
    }
    const disparoDelMatch = path.match(/^\/api\/disparos\/(\d+)$/);
    if (disparoDelMatch && request.method === "DELETE") {
      await env.DB.prepare(`DELETE FROM disparos_destinatarios WHERE disparo_id = ?`).bind(disparoDelMatch[1]).run();
      await env.DB.prepare(`DELETE FROM disparos WHERE id = ?`).bind(disparoDelMatch[1]).run();
      return json({ sucesso: true });
    }
    if (path === "/api/apify_leads" && request.method === "DELETE") {
      await env.DB.prepare(`DELETE FROM apify_leads`).run();
      return json({ sucesso: true });
    }
    if (path === "/api/disparos/midia" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("arquivo");
      if (!file)
        return json({ sucesso: false, erro: "Campo 'arquivo' obrigat\xF3rio" }, 400);
      const LIMITE_TAMANHO_MIDIA = 95 * 1024 * 1024;
      if (file.size > LIMITE_TAMANHO_MIDIA)
        return json({ sucesso: false, erro: "Arquivo muito grande (m\xE1ximo 95MB)" }, 400);
      const nomeArquivo = `${Date.now()}-${file.name}`;
      const key = `disparos/${nomeArquivo}`;
      await env.fotos_balde.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      const origem = new URL(request.url).origin;
      return json({ sucesso: true, midia_url: `${origem}/fotos/${key}`, midia_nome: file.name });
    }
    const integracaoMatch = path.match(/^\/api\/integracoes\/([a-z_]+)$/);
    if (integracaoMatch && request.method === "GET") {
      const row = await env.DB.prepare(`SELECT valor, atualizado_em FROM integracoes WHERE chave = ?`).bind(integracaoMatch[1]).first();
      let prefixo = null;
      if (row) {
        try {
          const valorReal = await descriptografarValor(env, row.valor);
          prefixo = String(valorReal).slice(0, 4) + "\u2022\u2022\u2022\u2022";
        } catch {
          prefixo = "(criptografado \u2014 chave INTEGRACOES_KEY ausente)";
        }
      }
      return json({
        sucesso: true,
        configurado: !!row,
        atualizado_em: row?.atualizado_em || null,
        prefixo
      });
    }
    if (integracaoMatch && request.method === "PUT") {
      const body = await request.json();
      if (!body.valor)
        return json({ sucesso: false, erro: "Campo 'valor' obrigat\xF3rio" }, 400);
      const valorParaGuardar = await criptografarValor(env, body.valor);
      await env.DB.prepare(`
INSERT INTO integracoes (chave, valor, atualizado_em) VALUES (?, ?, datetime('now'))
ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
`).bind(integracaoMatch[1], valorParaGuardar).run();
      return json({ sucesso: true });
    }
    if (path === "/api/integracoes/whatsapp/configurar-webhook" && request.method === "POST") {
      const resultadoWebhook = await configurarWebhookWhatsapp(env);
      return json(resultadoWebhook, resultadoWebhook.sucesso ? 200 : 400);
    }
    if (path === "/api/meta/trocar-token" && request.method === "POST") {
      const body = await request.json();
      const tokenCurto = String(body.token_curto || "").trim();
      const appSecret = String(body.app_secret || "").trim();
      const appId = String(body.app_id || "1753129749378164").trim();
      if (!tokenCurto || !appSecret) {
        return json({ sucesso: false, erro: "Informe o token e o App Secret" }, 400);
      }
      const qs = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: tokenCurto
      });
      const troca = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${qs}`).then((r) => r.json());
      if (troca.error || !troca.access_token) {
        return json({ sucesso: false, erro: troca.error?.message || "O Meta recusou a troca" }, 200);
      }
      const teste = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?${new URLSearchParams({ access_token: troca.access_token, fields: "id,name" })}`
      ).then((r) => r.json());
      if (teste.error) {
        return json({ sucesso: false, erro: `Token trocado, mas recusado ao consultar an\xFAncios: ${teste.error.message}` }, 200);
      }
      const tokenParaGuardar = await criptografarValor(env, troca.access_token);
      await env.DB.prepare(`
        INSERT INTO integracoes (chave, valor, atualizado_em) VALUES ('meta_access_token', ?, datetime('now'))
        ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
      `).bind(tokenParaGuardar).run();
      return json({
        sucesso: true,
        dias: troca.expires_in ? Math.floor(troca.expires_in / 86400) : null,
        contas: (teste.data || []).length
      });
    }
    if (path === "/api/meta/resumo" && request.method === "GET") {
      const token = await lerIntegracao(env, "meta_access_token");
      if (!token)
        return json({ sucesso: false, erro: "Token do Meta n\xE3o configurado", configurado: false }, 200);
      const periodo = url.searchParams.get("periodo") || "last_30d";
      const g = /* @__PURE__ */ __name22222(async (caminho, params = {}) => {
        const qs = new URLSearchParams({ access_token: token, ...params });
        const r = await fetch(`https://graph.facebook.com/v20.0/${caminho}?${qs}`);
        return r.json();
      }, "g");
      const [contas, debug] = await Promise.all([
        g("me/adaccounts", { fields: "id,name,currency,account_status" }),
        g("debug_token", { input_token: token })
      ]);
      if (contas.error) {
        return json({ sucesso: false, erro: contas.error.message, configurado: true, token_invalido: true }, 200);
      }
      const expiraEm = debug.data?.expires_at ?? null;
      const dataExpiraEm = debug.data?.data_access_expires_at ?? null;
      const camposInsight = "spend,impressions,clicks,ctr,cpc,cpm,reach,actions";
      const resultado = await Promise.all(
        (contas.data || []).map(async (conta) => {
          const [ins, camps] = await Promise.all([
            g(`${conta.id}/insights`, { fields: camposInsight, date_preset: periodo }),
            g(`${conta.id}/campaigns`, {
              fields: `name,status,objective,insights.date_preset(${periodo}){spend,impressions,clicks,ctr,cpc,actions}`,
              limit: "50"
            })
          ]);
          return {
            id: conta.id,
            nome: conta.name,
            moeda: conta.currency,
            ativa: conta.account_status === 1,
            total: ins.data?.[0] || null,
            campanhas: (camps.data || []).map((c) => ({
              id: c.id,
              nome: c.name,
              status: c.status,
              objetivo: c.objective,
              metricas: c.insights?.data?.[0] || null
            }))
          };
        })
      );
      return json({
        sucesso: true,
        configurado: true,
        periodo,
        expira_em: expiraEm,
        data_expira_em: dataExpiraEm,
        contas: resultado
      });
    }
    if (path === "/api/meta/sincronizar-leads" && request.method === "POST") {
      const resultadoSync = await sincronizarLeadsMeta(env);
      return json({ sucesso: !resultadoSync.erro, ...resultadoSync });
    }
    if (path === "/api/meta/assinar-webhook-instagram" && request.method === "POST") {
      const [pageToken, pageId] = await Promise.all([
        lerIntegracao(env, "meta_page_access_token"),
        lerIntegracao(env, "meta_page_id")
      ]);
      if (!pageToken || !pageId)
        return json({ sucesso: false, erro: "Token da p\xE1gina ou ID da p\xE1gina n\xE3o configurados em Integra\xE7\xF5es." }, 400);
      const resp = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_referrals,message_reactions&access_token=${encodeURIComponent(pageToken)}`,
        { method: "POST" }
      );
      const dadosResp = await resp.json();
      if (dadosResp.error) {
        return json({ sucesso: false, erro: dadosResp.error.message || "Erro ao assinar a p\xE1gina ao webhook." }, 400);
      }
      return json({ sucesso: true, resultado: dadosResp });
    }
    if (path === "/api/integracoes/meta/diagnostico" && request.method === "GET") {
      const resultadoDiagnostico = await diagnosticoMeta(env);
      return json(resultadoDiagnostico, resultadoDiagnostico.sucesso ? 200 : 400);
    }
    if (path === "/api/instagram/conversas" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, sender_id, nome, status, lead_capture_id, criado_em, atualizado_em FROM instagram_conversas ORDER BY atualizado_em DESC`
      ).all();
      return json({ sucesso: true, dados: results });
    }
    const instaConversaMatch = path.match(/^\/api\/instagram\/conversas\/(\d+)$/);
    if (instaConversaMatch && request.method === "GET") {
      const conversa = await env.DB.prepare(`SELECT * FROM instagram_conversas WHERE id = ?`).bind(instaConversaMatch[1]).first();
      if (!conversa)
        return json({ sucesso: false, erro: "Conversa n\xE3o encontrada" }, 404);
      let historicoConversa = [];
      try {
        historicoConversa = JSON.parse(conversa.historico) || [];
      } catch {
        historicoConversa = [];
      }
      return json({ sucesso: true, dados: { ...conversa, historico: historicoConversa } });
    }
    const instaResponderMatch = path.match(/^\/api\/instagram\/conversas\/(\d+)\/responder$/);
    if (instaResponderMatch && request.method === "POST") {
      const body = await request.json();
      if (!body.texto)
        return json({ sucesso: false, erro: "Campo 'texto' obrigat\xF3rio" }, 400);
      const conversa = await env.DB.prepare(`SELECT * FROM instagram_conversas WHERE id = ?`).bind(instaResponderMatch[1]).first();
      if (!conversa)
        return json({ sucesso: false, erro: "Conversa n\xE3o encontrada" }, 404);
      try {
        await enviarMensagemInstagram(env, conversa.sender_id, body.texto);
      } catch (erroEnvio) {
        return json({ sucesso: false, erro: erroEnvio.message }, 400);
      }
      let historicoConversa = [];
      try {
        historicoConversa = JSON.parse(conversa.historico) || [];
      } catch {
        historicoConversa = [];
      }
      historicoConversa.push({ direction: "out", texto: body.texto, em: (/* @__PURE__ */ new Date()).toISOString() });
      await env.DB.prepare(
        `UPDATE instagram_conversas SET historico = ?, status = 'respondida', atualizado_em = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(historicoConversa), conversa.id).run();
      return json({ sucesso: true });
    }
    if (path === "/api/apify/sincronizar" && request.method === "POST") {
      const resultadoInicio = await iniciarSincronizacaoApify(env);
      return json(resultadoInicio, resultadoInicio.sucesso ? 200 : 400);
    }
    const apifyStatusMatch = path.match(/^\/api\/apify\/sincronizar\/(\d+)$/);
    if (apifyStatusMatch && request.method === "GET") {
      const resultadoStatus = await processarSincronizacaoApify(env, apifyStatusMatch[1]);
      return json(resultadoStatus, resultadoStatus.sucesso ? 200 : 400);
    }
    if (path === "/api/apify/ultima-sincronizacao" && request.method === "GET") {
      const registroSync = await env.DB.prepare(`SELECT * FROM apify_sync_log ORDER BY id DESC LIMIT 1`).first();
      return json({ sucesso: true, dados: registroSync || null });
    }
    const anaPaulaMatch = path.match(/^\/api\/leads\/(\d+)\/ana-paula$/);
    if (anaPaulaMatch && request.method === "POST") {
      const forcarAtivacao = url.searchParams.get("forcar") === "true";
      const resultadoAtivacao = await ativarAnaPaula(env, anaPaulaMatch[1], { forcar: forcarAtivacao });
      return json(resultadoAtivacao, resultadoAtivacao.sucesso ? 200 : 400);
    }
    if (anaPaulaMatch && request.method === "GET") {
      const conversa = await env.DB.prepare(
        `SELECT * FROM ana_paula_conversas WHERE lead_id = ? ORDER BY id DESC LIMIT 1`
      ).bind(anaPaulaMatch[1]).first();
      if (!conversa)
        return json({ sucesso: true, dados: null });
      let historicoConversa = [];
      try {
        historicoConversa = JSON.parse(conversa.historico) || [];
      } catch {
        historicoConversa = [];
      }
      return json({ sucesso: true, dados: { ...conversa, historico: historicoConversa } });
    }
    const crudMatch = path.match(/^\/api\/(leads|imoveis|clientes|tarefas|metas|propostas|campanhas|avaliacoes|pos_vendas|follow_ups|agenda|apify_leads|disparos|disparos_destinatarios|lancamentos|simulacoes|contratos_locacao|cobrancas_locacao|chamados_manutencao|implantacoes)(?:\/(\d+))?$/);
    if (crudMatch) {
      const [, tabela, id] = crudMatch;
      return handleCrud(request, env, ctx, tabela, id);
    }
    const fotoUploadMatch = path.match(/^\/api\/imoveis\/(\d+)\/fotos$/);
    if (fotoUploadMatch && request.method === "POST") {
      const imovelId = fotoUploadMatch[1];
      const formData = await request.formData();
      const file = formData.get("foto");
      if (!file)
        return json({ sucesso: false, erro: "Campo 'foto' obrigat\xF3rio" }, 400);
      const nomeArquivo = `${Date.now()}-${file.name}`;
      const key = `imoveis/${imovelId}/${nomeArquivo}`;
      await env.fotos_balde.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      return json({ sucesso: true, url: `/fotos/${key}` });
    }
    if (fotoUploadMatch && request.method === "GET") {
      const imovelId = fotoUploadMatch[1];
      const listed = await env.fotos_balde.list({ prefix: `imoveis/${imovelId}/` });
      return json({ sucesso: true, fotos: listed.objects.map((o) => `/fotos/${o.key}`) });
    }
    if (fotoUploadMatch && request.method === "DELETE") {
      const imovelId = fotoUploadMatch[1];
      const body = await request.json();
      if (!body.key)
        return json({ sucesso: false, erro: "Campo 'key' obrigat\xF3rio" }, 400);
      const prefixoEsperado = `imoveis/${imovelId}/`;
      if (!body.key.startsWith(prefixoEsperado))
        return json({ sucesso: false, erro: "Chave inv\xE1lida para este im\xF3vel" }, 400);
      await env.fotos_balde.delete(body.key);
      return json({ sucesso: true });
    }
    if (path.startsWith("/fotos/") && request.method === "GET") {
      const key = decodeURIComponent(path.slice("/fotos/".length));
      const obj = await env.fotos_balde.get(key);
      if (!obj)
        return new Response("N\xE3o encontrado", { status: 404 });
      return new Response(obj.body, {
        headers: { "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream", ...corsHeaders() }
      });
    }
    const instagramRascunhoMatch = path.match(/^\/api\/imoveis\/(\d+)\/instagram-post$/);
    if (instagramRascunhoMatch && request.method === "POST") {
      const imovelId = instagramRascunhoMatch[1];
      const imovel = await env.DB.prepare(`SELECT * FROM imoveis WHERE id = ?`).bind(imovelId).first();
      if (!imovel)
        return json({ sucesso: false, erro: "Im\xF3vel n\xE3o encontrado" }, 404);
      const listado = await env.fotos_balde.list({ prefix: `imoveis/${imovelId}/` });
      const primeiraFoto = listado.objects[0];
      if (!primeiraFoto)
        return json({ sucesso: false, erro: "Este im\xF3vel ainda n\xE3o tem nenhuma foto cadastrada." }, 400);
      const fotoUrl = `${url.origin}/fotos/${primeiraFoto.key}`;
      const legenda = await gerarLegendaInstagram(env, imovel);
      const result = await env.DB.prepare(`
INSERT INTO instagram_posts (imovel_id, foto_url, legenda, status) VALUES (?, ?, ?, 'pendente')
`).bind(imovelId, fotoUrl, legenda).run();
      return json({ sucesso: true, id: result.meta.last_row_id });
    }
    if (path === "/api/instagram-posts" && request.method === "GET") {
      const filtroStatus = url.searchParams.get("status");
      const { results } = filtroStatus ? await env.DB.prepare(`SELECT * FROM instagram_posts WHERE status = ? ORDER BY id DESC`).bind(filtroStatus).all() : await env.DB.prepare(`SELECT * FROM instagram_posts ORDER BY id DESC`).all();
      return json({ sucesso: true, dados: results });
    }
    const instagramPostMatch = path.match(/^\/api\/instagram-posts\/(\d+)$/);
    if (instagramPostMatch && request.method === "PUT") {
      const postId = instagramPostMatch[1];
      const post = await env.DB.prepare(`SELECT * FROM instagram_posts WHERE id = ?`).bind(postId).first();
      if (!post)
        return json({ sucesso: false, erro: "N\xE3o encontrado" }, 404);
      if (post.status !== "pendente")
        return json({ sucesso: false, erro: "S\xF3 \xE9 poss\xEDvel editar posts pendentes" }, 400);
      const body = await request.json();
      const legenda = body.legenda !== void 0 ? body.legenda : post.legenda;
      const fotoUrl = body.foto_url !== void 0 ? body.foto_url : post.foto_url;
      await env.DB.prepare(`UPDATE instagram_posts SET legenda = ?, foto_url = ? WHERE id = ?`).bind(legenda, fotoUrl, postId).run();
      return json({ sucesso: true });
    }
    if (instagramPostMatch && request.method === "DELETE") {
      await env.DB.prepare(`DELETE FROM instagram_posts WHERE id = ?`).bind(instagramPostMatch[1]).run();
      return json({ sucesso: true });
    }
    const instagramAprovarMatch = path.match(/^\/api\/instagram-posts\/(\d+)\/aprovar$/);
    if (instagramAprovarMatch && request.method === "POST") {
      const postId = instagramAprovarMatch[1];
      const post = await env.DB.prepare(`SELECT * FROM instagram_posts WHERE id = ?`).bind(postId).first();
      if (!post)
        return json({ sucesso: false, erro: "N\xE3o encontrado" }, 404);
      if (post.status === "publicado")
        return json({ sucesso: false, erro: "Este post j\xE1 foi publicado" }, 400);
      try {
        const instagramPostId = await publicarNoInstagram(env, post.foto_url, post.legenda);
        await env.DB.prepare(`
UPDATE instagram_posts SET status = 'publicado', instagram_post_id = ?, erro = NULL, publicado_em = datetime('now') WHERE id = ?
`).bind(instagramPostId, postId).run();
        return json({ sucesso: true, instagram_post_id: instagramPostId });
      } catch (erro) {
        const mensagem = erro?.message || "Falha ao publicar no Instagram";
        await env.DB.prepare(`UPDATE instagram_posts SET status = 'erro', erro = ? WHERE id = ?`).bind(mensagem, postId).run();
        return json({ sucesso: false, erro: mensagem }, 502);
      }
    }
    const gerarCobrancaMatch = path.match(/^\/api\/contratos-locacao\/(\d+)\/gerar-cobranca$/);
    if (gerarCobrancaMatch && request.method === "POST") {
      const contratoId = gerarCobrancaMatch[1];
      const contrato = await env.DB.prepare(`SELECT * FROM contratos_locacao WHERE id = ?`).bind(contratoId).first();
      if (!contrato)
        return json({ sucesso: false, erro: "Contrato n\xE3o encontrado" }, 404);
      const body = await request.json().catch(() => ({}));
      const hoje = /* @__PURE__ */ new Date();
      const competencia = body.competencia || `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, "0")}`;
      const valor = body.valor !== void 0 ? Number(body.valor) : Number(contrato.valor_aluguel);
      const dia = String(contrato.dia_vencimento || 5).padStart(2, "0");
      const dataVencimento = `${competencia}-${dia}`;
      const chave = contrato.chave_pix_recebedor || await lerIntegracao(env, "pix_chave_padrao");
      const nomeRecebedor = await lerIntegracao(env, "pix_recebedor_nome") || "Thiago Nunes";
      const cidadeRecebedor = await lerIntegracao(env, "pix_recebedor_cidade") || "Fazenda Rio Grande";
      let pixPayload = null;
      try {
        pixPayload = gerarPixPayload({
          chave,
          valor,
          nomeRecebedor,
          cidadeRecebedor,
          txid: `LOC${contratoId}${competencia.replace("-", "")}`
        });
      } catch (erroPix) {
        return json({ sucesso: false, erro: erroPix.message }, 400);
      }
      const result = await env.DB.prepare(`
INSERT INTO cobrancas_locacao (contrato_id, competencia, valor, data_vencimento, status, pix_payload) VALUES (?, ?, ?, ?, 'pendente', ?)
`).bind(contratoId, competencia, valor, dataVencimento, pixPayload).run();
      return json({ sucesso: true, id: result.meta.last_row_id, pix_payload: pixPayload });
    }
    const marcarPagoMatch = path.match(/^\/api\/cobrancas-locacao\/(\d+)\/marcar-pago$/);
    if (marcarPagoMatch && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      await env.DB.prepare(`
UPDATE cobrancas_locacao SET status = 'pago', data_pagamento = datetime('now'), forma_pagamento = ?, atualizado_em = datetime('now') WHERE id = ?
`).bind(body.forma_pagamento || "pix", marcarPagoMatch[1]).run();
      return json({ sucesso: true });
    }
    const enviarLembreteMatch = path.match(/^\/api\/cobrancas-locacao\/(\d+)\/enviar-lembrete$/);
    if (enviarLembreteMatch && request.method === "POST") {
      const cobranca = await env.DB.prepare(`SELECT * FROM cobrancas_locacao WHERE id = ?`).bind(enviarLembreteMatch[1]).first();
      if (!cobranca)
        return json({ sucesso: false, erro: "Cobran\xE7a n\xE3o encontrada" }, 404);
      const contrato = await env.DB.prepare(`SELECT * FROM contratos_locacao WHERE id = ?`).bind(cobranca.contrato_id).first();
      if (!contrato || !contrato.inquilino_telefone)
        return json({ sucesso: false, erro: "Inquilino sem telefone cadastrado" }, 400);
      const mensagem = [
        `Ol\xE1 ${contrato.inquilino_nome}! Segue o boleto/Pix do aluguel referente a ${cobranca.competencia}.`,
        `Valor: ${formatarPrecoBRL(cobranca.valor)}`,
        `Vencimento: ${cobranca.data_vencimento}`,
        "",
        "Pix Copia e Cola:",
        cobranca.pix_payload || "(gerar cobran\xE7a primeiro)"
      ].join("\n");
      try {
        await enviarWhatsapp(env, contrato.inquilino_telefone, mensagem);
      } catch (erroEnvio) {
        return json({ sucesso: false, erro: erroEnvio.message }, 502);
      }
      await env.DB.prepare(`UPDATE cobrancas_locacao SET lembrete_enviado_em = datetime('now') WHERE id = ?`).bind(cobranca.id).run();
      return json({ sucesso: true });
    }
    const proporReajusteMatch = path.match(/^\/api\/contratos-locacao\/(\d+)\/propor-reajuste$/);
    if (proporReajusteMatch && request.method === "POST") {
      const contratoId = proporReajusteMatch[1];
      const contrato = await env.DB.prepare(`SELECT * FROM contratos_locacao WHERE id = ?`).bind(contratoId).first();
      if (!contrato)
        return json({ sucesso: false, erro: "Contrato n\xE3o encontrado" }, 404);
      const body = await request.json().catch(() => ({}));
      const percentual = Number(body.percentual);
      if (!percentual)
        return json({ sucesso: false, erro: "Informe o percentual do reajuste" }, 400);
      const valorAnterior = Number(contrato.valor_aluguel);
      const valorNovo = Math.round(valorAnterior * (1 + percentual / 100) * 100) / 100;
      const dataAplicacao = body.data_aplicacao || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const result = await env.DB.prepare(`
INSERT INTO reajustes_log (contrato_id, indice_usado, percentual, valor_anterior, valor_novo, data_aplicacao, status) VALUES (?, ?, ?, ?, ?, ?, 'pendente_aprovacao')
`).bind(contratoId, contrato.indice_reajuste, percentual, valorAnterior, valorNovo, dataAplicacao).run();
      return json({ sucesso: true, id: result.meta.last_row_id, valor_novo: valorNovo });
    }
    if (path === "/api/reajustes" && request.method === "GET") {
      const { results } = await env.DB.prepare(`SELECT * FROM reajustes_log ORDER BY id DESC`).all();
      return json({ sucesso: true, dados: results });
    }
    const aprovarReajusteMatch = path.match(/^\/api\/reajustes\/(\d+)\/aprovar$/);
    if (aprovarReajusteMatch && request.method === "POST") {
      const reajuste = await env.DB.prepare(`SELECT * FROM reajustes_log WHERE id = ?`).bind(aprovarReajusteMatch[1]).first();
      if (!reajuste)
        return json({ sucesso: false, erro: "N\xE3o encontrado" }, 404);
      if (reajuste.status !== "pendente_aprovacao")
        return json({ sucesso: false, erro: "Este reajuste j\xE1 foi processado" }, 400);
      await env.DB.prepare(`
UPDATE contratos_locacao SET valor_aluguel = ?, data_ultimo_reajuste = ?, data_proximo_reajuste = ?, atualizado_em = datetime('now') WHERE id = ?
`).bind(reajuste.valor_novo, reajuste.data_aplicacao, somarUmAno(reajuste.data_aplicacao), reajuste.contrato_id).run();
      await env.DB.prepare(`UPDATE reajustes_log SET status = 'aplicado', aprovado_em = datetime('now') WHERE id = ?`).bind(reajuste.id).run();
      return json({ sucesso: true });
    }
    const descartarReajusteMatch = path.match(/^\/api\/reajustes\/(\d+)$/);
    if (descartarReajusteMatch && request.method === "DELETE") {
      await env.DB.prepare(`DELETE FROM reajustes_log WHERE id = ? AND status = 'pendente_aprovacao'`).bind(descartarReajusteMatch[1]).run();
      return json({ sucesso: true });
    }
    if (path === "/api/modelos_contrato" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("arquivo");
      const nome = formData.get("nome");
      if (!file)
        return json({ sucesso: false, erro: "Campo 'arquivo' obrigat\xF3rio" }, 400);
      if (!nome)
        return json({ sucesso: false, erro: "Campo 'nome' obrigat\xF3rio" }, 400);
      const tipo = formData.get("tipo") || "";
      const key = `contratos/${Date.now()}-${file.name}`;
      await env.fotos_balde.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      const result = await env.DB.prepare(
        `INSERT INTO modelos_contrato (nome, tipo, arquivo_nome, mime, tamanho, storage_key) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(nome, tipo, file.name, file.type, file.size, key).run();
      return json({ sucesso: true, id: result.meta.last_row_id });
    }
    if (path === "/api/modelos_contrato" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, nome, tipo, arquivo_nome, mime, tamanho, criado_em FROM modelos_contrato ORDER BY id DESC`
      ).all();
      return json({ sucesso: true, dados: results });
    }
    const contratoArquivoMatch = path.match(/^\/api\/modelos_contrato\/(\d+)\/arquivo$/);
    if (contratoArquivoMatch && request.method === "GET") {
      const row = await env.DB.prepare(`SELECT * FROM modelos_contrato WHERE id = ?`).bind(contratoArquivoMatch[1]).first();
      if (!row)
        return json({ sucesso: false, erro: "N\xE3o encontrado" }, 404);
      const obj = await env.fotos_balde.get(row.storage_key);
      if (!obj)
        return json({ sucesso: false, erro: "Arquivo n\xE3o encontrado no armazenamento" }, 404);
      return new Response(obj.body, {
        headers: {
          "Content-Type": row.mime || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${row.arquivo_nome}"`,
          ...corsHeaders()
        }
      });
    }
    const contratoDelMatch = path.match(/^\/api\/modelos_contrato\/(\d+)$/);
    if (contratoDelMatch && request.method === "DELETE") {
      const row = await env.DB.prepare(`SELECT storage_key FROM modelos_contrato WHERE id = ?`).bind(contratoDelMatch[1]).first();
      if (row?.storage_key)
        await env.fotos_balde.delete(row.storage_key);
      await env.DB.prepare(`DELETE FROM modelos_contrato WHERE id = ?`).bind(contratoDelMatch[1]).run();
      return json({ sucesso: true });
    }
    if (path === "/webhook/instagram" && request.method === "GET") {
      const modo = url.searchParams.get("hub.mode");
      const tokenRecebido = url.searchParams.get("hub.verify_token");
      const desafio = url.searchParams.get("hub.challenge");
      const verificadorInstagram = env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
      if (modo === "subscribe" && verificadorInstagram && tokenRecebido === verificadorInstagram) {
        return new Response(desafio, { status: 200, headers: corsHeaders() });
      }
      return new Response("Token de verifica\xE7\xE3o inv\xE1lido", { status: 403, headers: corsHeaders() });
    }
    if (path === "/webhook/instagram" && request.method === "POST") {
      const bodyTexto = await request.text();
      if (env.META_APP_SECRET) {
        const assinatura = request.headers.get("X-Hub-Signature-256") || "";
        const valido = await validarAssinaturaMeta(bodyTexto, assinatura, env.META_APP_SECRET);
        if (!valido) {
          console.error("Webhook Instagram: assinatura inv\xE1lida, requisi\xE7\xE3o rejeitada");
          return json({ sucesso: false, erro: "Assinatura inv\xE1lida" }, 401);
        }
      }
      const body = (() => {
        try {
          return JSON.parse(bodyTexto);
        } catch {
          return null;
        }
      })();
      if (body)
        ctx.waitUntil(receberMensagemInstagram(env, body));
      return json({ sucesso: true });
    }
    if (path === "/webhook/green-api" && request.method === "POST") {
      if (env.GREEN_API_WEBHOOK_SECRET && url.searchParams.get("secreto") !== env.GREEN_API_WEBHOOK_SECRET) {
        console.error("Webhook Green API: segredo ausente ou incorreto, requisi\xE7\xE3o rejeitada");
        return json({ sucesso: false, erro: "N\xE3o autorizado" }, 401);
      }
      const body = await request.json().catch(() => null);
      if (body)
        ctx.waitUntil(receberMensagemWhatsapp(env, body));
      return json({ sucesso: true });
    }
    return new Response("Rota n\xE3o encontrada", { status: 404, headers: corsHeaders() });
  } catch (erroInesperado) {
    console.error("Erro n\xE3o tratado na rota:", path, erroInesperado);
    return json({ sucesso: false, erro: erroInesperado?.message || "Erro interno no servidor" }, 500);
  }
}
__name(tratarRequisicao, "tratarRequisicao");
__name2(tratarRequisicao, "tratarRequisicao");
var worker_default = {
  async fetch(request, env, ctx) {
    const resp = await tratarRequisicao(request, env, ctx);
    return aplicarCors(resp, request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sincronizarLeadsMeta(env));
    ctx.waitUntil(executarBackupAutomatico(env).catch((e) => console.error("Falha ao acionar backup automatico:", e)));
    ctx.waitUntil(marcarLeadsPerdidosAutomaticamente(env).catch((e) => console.error("Falha ao acionar varredura de perdidos:", e)));
    ctx.waitUntil(renovarTokenMetaAutomatico(env).catch((e) => console.error("Falha ao acionar renovacao de token Meta:", e)));
    ctx.waitUntil(processarFollowUpsAutomaticos(env).catch((e) => console.error("Falha no processamento de follow-ups automaticos:", e)));
    ctx.waitUntil((async () => {
      const { results: emAndamento } = await env.DB.prepare(
        `SELECT id FROM disparos WHERE status = 'Enviando'`
      ).all();
      for (const d of emAndamento || []) {
        await processarDisparo(env, d.id);
      }
    })());
    ctx.waitUntil((async () => {
      const { results: sincronizacoesEmAndamento } = await env.DB.prepare(
        `SELECT id FROM apify_sync_log WHERE status = 'em_andamento'`
      ).all();
      for (const s of sincronizacoesEmAndamento || []) {
        await processarSincronizacaoApify(env, s.id);
      }
    })());
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
