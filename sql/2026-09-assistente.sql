-- ⚠️ APLICADO EM 14/09/2026, MAS PROVAVELMENTE DESNECESSÁRIO.
-- O Worker publicado já guarda a conversa do assistente em
-- `chat_assistente_mensagens`, criada depois deste arquivo. A tabela abaixo
-- existe no banco e está vazia; se o chat de produção for o que vai ficar,
-- ela pode ser removida com:  DROP TABLE assistente_conversa;
--
-- Chat da Ana Paula com o Thiago (assistente interno do CRM)
-- Aplicar no D1 `crm-thiago-leads`.
--
-- Tabela nova, e desta vez ela se justifica: `ana_paula_conversas` guarda as
-- conversas COM LEADS (uma por telefone, com outro prompt e outro objetivo).
-- Misturar a conversa do Thiago ali faria o histórico dele aparecer em
-- relatório de atendimento e poderia ser confundido com lead pelo webhook.

CREATE TABLE IF NOT EXISTS assistente_conversa (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL,
  historico    TEXT    NOT NULL DEFAULT '[]',   -- [{papel, texto, em}], mais antigo primeiro
  resumo_em    TEXT,                            -- data do último resumo do dia entregue
  criado_em    TEXT    NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT   NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assistente_usuario ON assistente_conversa (usuario_id);
