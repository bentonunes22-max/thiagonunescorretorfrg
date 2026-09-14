-- Lembretes no WhatsApp — CRMTHIAGO
-- Aplicar no D1 `crm-thiago-leads` (painel Cloudflare > D1 > Console).
--
-- Não cria tabela nova: o CRM já tem `agenda` (compromissos) e `tarefas`
-- (pendências) com CRUD em /api/agenda e /api/tarefas. Faltava só marcar
-- QUANDO avisar e SE já avisou — mesmo padrão de `imoveis.gmb_postado_em`.
--
-- Convenção de fuso: `lembrar_em` e `alertado_em` ficam em horário de Brasília
-- ('YYYY-MM-DD HH:MM'), igual a `agenda.data`, `agenda.hora_inicio` e
-- `tarefas.vencimento`. Só as colunas `criado_em`/`atualizado_em` seguem em UTC,
-- como já estavam.

ALTER TABLE tarefas ADD COLUMN lembrar_em  TEXT;   -- quando mandar o aviso
ALTER TABLE tarefas ADD COLUMN alertado_em TEXT;   -- quando o aviso saiu

ALTER TABLE agenda  ADD COLUMN lembrar_em  TEXT;   -- se vazio, 1h antes de data+hora_inicio
ALTER TABLE agenda  ADD COLUMN alertado_em TEXT;

CREATE INDEX IF NOT EXISTS idx_tarefas_lembrete ON tarefas (alertado_em, lembrar_em);
CREATE INDEX IF NOT EXISTS idx_agenda_lembrete  ON agenda  (alertado_em, status, data);
