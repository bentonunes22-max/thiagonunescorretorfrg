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
- Divulgação automática de imóvel novo no Google Meu Negócio (ver seção abaixo)

Ver [ARQUITETURA.md](./ARQUITETURA.md) para detalhes técnicos e [CHANGELOG.md](./CHANGELOG.md) para o histórico de versões.

## Automação: Google Meu Negócio

Toda vez que um imóvel novo é cadastrado no CRM (tabela `imoveis` no D1, `status = 'ativo'`), uma rotina agendada do Claude Code verifica o banco periodicamente e cria um post automático na ficha "Thiago Nunes corretor de imóveis F.R.G/ PR" no Google Meu Negócio, com tipo/bairro/valor/descrição do imóvel e botão de contato via WhatsApp.

Detalhes técnicos:
- Conexão feita via **Zapier** (app Google Business Profile), autorizada com a conta Google que administra a ficha em business.google.com — não usa a API do Google diretamente nem passa por `worker.js`.
- Controle de duplicidade: coluna `gmb_postado_em` na tabela `imoveis` (D1), marcada após cada post bem-sucedido.
- **Pendência:** o post ainda não inclui foto do imóvel — falta mapear a URL pública de servir fotos do R2 (rota `/fotos/imoveis/...` do Worker) por imóvel para preencher isso.
- Essa automação roda como rotina do Claude Code (fora do `worker.js` publicado); se a sessão/rotina for removida, o post automático para de funcionar até ser recriada.

## MCP e Skills (Claude Code)

Este repositório declara em `.mcp.json` o servidor MCP **scrapegraph-mcp** (ScrapeGraphAI), usado para dar a assistentes de IA acesso a scraping estruturado de páginas web — útil no contexto do robô de scraping de concorrentes em portais (ver `apify_leads`/`apify_sync_log` em [ARQUITETURA.md](./ARQUITETURA.md)).

Para usar, defina a variável de ambiente `SCRAPEGRAPH_API_KEY` com sua chave da [ScrapeGraphAI](https://scrapegraphai.com/) antes de abrir o Claude Code neste repositório — a chave não fica hardcoded no `.mcp.json`.

O arquivo [CLAUDE.md](./CLAUDE.md) na raiz reúne as instruções permanentes de trabalho para o Claude Code neste repositório: idioma, cuidados com dados de leads e chaves de API, e as convenções de commit e PR.

Também está incluída em `.claude/skills/humanizer/` a skill **humanizer** ([blader/humanizer](https://github.com/blader/humanizer), MIT), que reescreve texto com "cara de IA" para soar como escrito por uma pessoa, sem mudar o conteúdo. É útil para revisar mensagens geradas por IA antes de enviar a um lead ou cliente — por exemplo, respostas da recepcionista automatizada "Fernanda" no WhatsApp, textos de proposta ou de follow-up — removendo clichês, linguagem de vendas genérica e outros padrões típicos de texto gerado por IA.

Em `.claude/skills/find-skill/` está a skill **find-skill**, adaptada de
[fockus/claude-skill-find-skill](https://github.com/fockus/claude-skill-find-skill) (MIT —
a licença é declarada no `pyproject.toml` do projeto original, que não publica arquivo
`LICENSE`). Ela busca skills prontas num catálogo local de 592 skills vindas de 12 fontes
públicas (Anthropic oficial, ComposioHQ, vercel-labs, VoltAgent, awesome-lists), ranqueadas
por confiança da fonte e estrelas no GitHub, e conduz a instalação. O que foi mudado em
relação ao original está em [`.claude/skills/find-skill/ORIGEM.md`](./.claude/skills/find-skill/ORIGEM.md).

O catálogo empacotado envelhece: para reconstruí-lo, rode
`bash .claude/skills/find-skill/scripts/atualizar-catalogo.sh`.

Para usar a `find-skill` em **outro projeto** sem depender deste repositório aberto:

```bash
git clone --depth 1 https://github.com/bentonunes22-max/thiagonunescorretorfrg /tmp/crmthiago
mkdir -p ~/.claude/skills
cp -r /tmp/crmthiago/.claude/skills/find-skill ~/.claude/skills/find-skill
rm -rf /tmp/crmthiago
```

Em `~/.claude/skills/` ela vale para todos os projetos daquela máquina. Em ambiente remoto
e efêmero (Claude Code na web) esse diretório é descartado no fim da sessão — nesse caso o
caminho que persiste de verdade é subir a pasta como skill de conta em
claude.ai → Settings → Capabilities → Skills.

## Próximos passos em aberto

- Sincronizar fotos de imóveis e anexos de contrato para o R2 (hoje ficam fora do sync com o D1 por limite de 2MB/linha)
- Consolidar teste de upload de fotos via R2 (CORS ajustado, pendente reteste completo)
- Avaliar se o briefing full-stack (Node/Express+Postgres) ainda faz sentido ou se a operação segue 100% Cloudflare
