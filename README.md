# CRMTHIAGO

CRM imobiliário próprio, construído sob medida para a operação autônoma de Thiago Nunes (CRECI-PR 50.265) em Fazenda Rio Grande/PR (@thiago_nunes_corretor).

Este repositório existe apenas como **documentação e versionamento** do sistema — o CRM roda em produção 100% na Cloudflare (Worker + D1 + R2). Nada aqui precisa ser "deployado" a partir do GitHub; é o registro histórico/técnico do que já está no ar.

## Status atual

- **Versão da interface:** v8_6
- **Ambiente de produção:** `https://crm-thiago-leads-worker.bento-nunes22.workers.dev/`
- **Stack:** Cloudflare Workers (backend/API) + D1 (banco relacional) + R2 (fotos de imóveis) — tudo na mesma conta Cloudflare já paga
- **Frontend:** HTML/JS único, com opção de operação 100% offline via localStorage e sincronização sob demanda com o D1

## Módulos ativos

- Leads (captação, temperatura quente/frio, conversa inicial de contexto)
- Kanban / Funil de Vendas (Lead → Negociação → Fechamento, com valor potencial por negócio)
- Clientes
- Imóveis (fotos com compressão automática, vídeo, matrícula/bairro, vínculo com cliente/proprietário, controle de estoque vendido/disponível)
- Propostas (biblioteca de modelos de contrato por tipo, incluindo Locação, com anexo do computador)
- Follow-up (histórico cronológico por lead, próximo follow-up agendado)
- Disparo em Massa via WhatsApp (limite diário configurável, fila quente/frio, intervalo aleatório)
- Marketing (registro de divulgação por imóvel: canal, orçamento, leads gerados, custo por lead)
- Metas & Relatórios (funil de conversão, ranking por origem, ticket médio, ciclo médio de venda)
- Tarefas & Checklist automático por tipo de contrato
- Autenticação JWT (PBKDF2 + HMAC-SHA256 via Web Crypto nativo do Workers, sem dependências externas)
- Recepção automatizada no WhatsApp ("Fernanda") via Evolution API + n8n + API Claude

Ver [ARQUITETURA.md](./ARQUITETURA.md) para detalhes técnicos e [CHANGELOG.md](./CHANGELOG.md) para o histórico de versões.

## MCP e Skills (Claude Code)

Este repositório declara em `.mcp.json` o servidor MCP **scrapegraph-mcp** (ScrapeGraphAI), usado para dar a assistentes de IA acesso a scraping estruturado de páginas web — útil no contexto do robô de scraping de concorrentes em portais (ver `apify_leads`/`apify_sync_log` em [ARQUITETURA.md](./ARQUITETURA.md)).

Para usar, defina a variável de ambiente `SCRAPEGRAPH_API_KEY` com sua chave da [ScrapeGraphAI](https://scrapegraphai.com/) antes de abrir o Claude Code neste repositório — a chave não fica hardcoded no `.mcp.json`.

O arquivo [CLAUDE.md](./CLAUDE.md) na raiz reúne as instruções permanentes de trabalho para o Claude Code neste repositório: idioma, cuidados com dados de leads e chaves de API, e as convenções de commit e PR.

Também está incluída em `.claude/skills/humanizer/` a skill **humanizer** ([blader/humanizer](https://github.com/blader/humanizer), MIT), que reescreve texto com "cara de IA" para soar como escrito por uma pessoa, sem mudar o conteúdo. É útil para revisar mensagens geradas por IA antes de enviar a um lead ou cliente — por exemplo, respostas da recepcionista automatizada "Fernanda" no WhatsApp, textos de proposta ou de follow-up — removendo clichês, linguagem de vendas genérica e outros padrões típicos de texto gerado por IA.

O `.mcp.json` também declara o servidor MCP **superpowers**, vendorizado em
`.claude/skills/superpowers-mcp/vendor/` a partir de
[erophames/superpowers-mcp](https://github.com/erophames/superpowers-mcp)
(servidor) e [obra/superpowers](https://github.com/obra/superpowers)
(conteúdo das skills), ambos MIT — ver
[`.claude/skills/superpowers-mcp/SKILL.md`](./.claude/skills/superpowers-mcp/SKILL.md)
para detalhes de licença e origem. Ele expõe skills de processo de
desenvolvimento de software (planejamento, TDD, debugging sistemático,
revisão de código, git worktrees) como ferramentas MCP — úteis ao evoluir
este repositório ou o `worker.js` de produção, sem relação com o domínio
do CRM em si. Antes de usar, é preciso buildar uma vez por máquina: `cd
.claude/skills/superpowers-mcp/vendor/server && npm install && npm run
build` (instruções completas na `SKILL.md`).

## Próximos passos em aberto

- Sincronizar fotos de imóveis e anexos de contrato para o R2 (hoje ficam fora do sync com o D1 por limite de 2MB/linha)
- Consolidar teste de upload de fotos via R2 (CORS ajustado, pendente reteste completo)
- Avaliar se o briefing full-stack (Node/Express+Postgres) ainda faz sentido ou se a operação segue 100% Cloudflare
