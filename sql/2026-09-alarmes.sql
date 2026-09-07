-- Canal de alarme/lembrete no WhatsApp — CRMTHIAGO
-- Aplicar no D1 `crm-thiago-leads` (painel Cloudflare > D1 > Console,
-- ou `npx wrangler d1 execute crm-thiago-leads --remote --file=sql/2026-09-alarmes.sql`).
--
-- Datas são gravadas em UTC (mesmo relógio do Worker e do `datetime('now')` do D1).
-- A conversão para o horário de Brasília (UTC-3) é feita na borda, ao criar e ao exibir.

CREATE TABLE IF NOT EXISTS alarmes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo      TEXT    NOT NULL,
  mensagem    TEXT,
  disparar_em TEXT    NOT NULL,                        -- 'YYYY-MM-DD HH:MM:SS' em UTC
  destino     TEXT,                                    -- número; NULL = usa ALARME_DESTINO do Worker
  origem      TEXT    NOT NULL DEFAULT 'manual',       -- manual | lead_novo | sistema
  lead_id     INTEGER,
  imovel_id   INTEGER,
  repetir     TEXT,                                    -- NULL | diario | semanal | mensal
  status      TEXT    NOT NULL DEFAULT 'pendente',     -- pendente | enviado | erro | cancelado
  tentativas  INTEGER NOT NULL DEFAULT 0,
  erro        TEXT,
  enviado_em  TEXT,
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Índice que o cron usa para varrer a fila (status + horário de disparo).
CREATE INDEX IF NOT EXISTS idx_alarmes_fila ON alarmes (status, disparar_em);

-- Evita alarme duplicado do mesmo lead se o webhook `/lead` reenviar o mesmo evento.
CREATE UNIQUE INDEX IF NOT EXISTS idx_alarmes_lead_novo
  ON alarmes (origem, lead_id) WHERE origem = 'lead_novo' AND lead_id IS NOT NULL;
