# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responda sempre em português do Brasil, em qualquer situação: explicações,
perguntas, resumos, mensagens de commit, títulos e descrições de PR,
comentários no GitHub e comentários no código. Não troque para inglês nem
quando a pergunta vier em inglês ou quando o contexto técnico for em inglês.

Termos técnicos consagrados (commit, branch, deploy, worker, lead, follow-up)
podem ficar em inglês. O texto ao redor deles, não.

## O que é este repositório

Documentação e versionamento do CRM imobiliário de Thiago Nunes (CRECI-PR
50.265), corretor autônomo em Fazenda Rio Grande/PR (@thiago_nunes_corretor).

Este repositório contém apenas arquivos Markdown e configuração de Claude
Code (`README.md`, `ARQUITETURA.md`, `CHANGELOG.md`, `.mcp.json`,
`.claude/skills/`) — **não há código-fonte do CRM aqui** (nem `worker.js`,
nem frontend). O sistema roda em produção 100% na Cloudflare (Worker + D1 +
R2) e **não é publicado a partir deste repositório**. Nada aqui é
deployado; alterar um arquivo daqui não muda nada no ar.

Consequência prática:
- Não existem comandos de build, lint ou teste a rodar neste repositório —
  não tente inventar ou procurar `package.json`, scripts de CI, etc.
- Quando o pedido envolver mudar o comportamento do CRM em produção
  (rotas, schema do D1, lógica do worker), avise que a alteração precisa
  ser aplicada no painel da Cloudflare ou no `worker.js` publicado, e
  registre a mudança aqui como documentação/changelog — este repo não é o
  lugar onde o código roda.
- "Testar" uma mudança, neste contexto, normalmente significa validar a
  descrição técnica contra o que está de fato em produção (perguntando ao
  Thiago ou inspecionando o painel Cloudflare), não rodar uma suíte local.

## Arquitetura do sistema (documentada aqui, roda na Cloudflare)

Visão resumida — para detalhes, ler [ARQUITETURA.md](./ARQUITETURA.md)
(técnico) e [README.md](./README.md) (visão geral de produto) antes de
responder qualquer coisa sobre o sistema, em vez de supor como ele
funciona.

- **Backend**: Cloudflare Worker `crm-thiago-leads-worker`, com dois
  conjuntos de rotas coexistindo: rotas legadas de sincronização
  (`/lead`, `/sync`, `/ack`, `/state`) usadas pelo frontend HTML/JS
  atual, e uma API autenticada mais nova (`/api/auth/login`,
  CRUD em `/api/leads`, `/api/imoveis`, `/api/clientes`). O token JWT pode
  vir por header `Authorization` ou por query string `?token=` (existe até
  uma rota de teste via query string para contornar bloqueio de `fetch()`
  em previews sandboxed).
- **Autenticação**: PBKDF2 + HMAC-SHA256 implementados à mão sobre a Web
  Crypto nativa do Workers — sem bibliotecas externas. Isso é intencional
  (ambiente serverless sem `node_modules`), não um TODO a "corrigir".
- **Banco (D1)** `crm-thiago-leads`: tabelas `users`, `clientes`,
  `imoveis`, `leads`, `leads_capture` (com campo `synced`), `crm_state`
  (blob usado pelo sync legado), e `apify_leads`/`apify_sync_log` — estas
  últimas pertencem a um robô de scraping de concorrentes **separado** do
  fluxo de leads do CRM, não confundir os dois.
- **Fotos (R2)**: bucket `crm-thiago-fotos-imoveis`, binding `fotos_balde`
  no Worker, rotas de upload/listagem/serving em `/fotos/imoveis/...`.
  Fotos e anexos ficam fora do sync automático com o D1 por limite de
  2MB/linha — o merge manual no frontend preserva esses arquivos locais.
- **Frontend**: um único HTML/JS, capaz de operar 100% offline via
  `localStorage`, com envio automático a cada `save()` para o D1 e
  download manual com merge.
- **Recepção automatizada "Fernanda"**: atendimento no WhatsApp via
  Evolution API + n8n + API Claude, fora deste Worker.
- **Decisão de arquitetura em vigor**: evoluir 100% dentro da Cloudflare
  (Workers + D1 + R2), reaproveitando a infra já paga — a alternativa
  Node/Express + PostgreSQL foi avaliada e descartada (ver
  [ARQUITETURA.md](./ARQUITETURA.md)).
- **Incidentes conhecidos** (ver ARQUITETURA.md antes de "corrigir" algo
  que pareça estranho): o worker em produção já reverteu ao menos uma vez
  para uma versão mínima, perdendo login/JWT/CRUD sem causa identificada
  (o D1 ficou intacto); e o painel Cloudflare já criou bindings R2
  duplicados por trás de um erro genérico de UI.

O histórico de versões de interface (`v8_6`, `v8_5`, ...) e de
infraestrutura fica em [CHANGELOG.md](./CHANGELOG.md).

## Dados de clientes e leads

Os dados que circulam neste projeto são reais: nomes, telefones, endereços,
valores de negociação e matrículas de imóveis de pessoas. Trate como dado
pessoal sujeito à LGPD.

Não cole dados de leads ou clientes em serviços externos (incluindo
ferramentas de scraping ou APIs de terceiros) sem que Thiago peça de forma
explícita. Se for necessário um exemplo em documentação, use dados fictícios.

## Segredos

Chaves de API ficam em variáveis de ambiente, nunca no repositório. O
`.mcp.json` referencia `${SCRAPEGRAPH_API_KEY}` justamente por isso.

Antes de commitar, confira o que entrou no stage. Se aparecer token, senha,
chave ou string longa de aparência aleatória, pare e pergunte.

## Skills deste repositório

- `.claude/skills/scrapegraph-mcp/` — scraping estruturado de portais
  imobiliários via MCP da ScrapeGraphAI. Use para monitorar anúncios e preços
  de concorrentes (relacionado às tabelas `apify_leads`/`apify_sync_log`).
- `.claude/skills/humanizer/` — reescreve texto com cara de IA para soar
  natural. Use antes de enviar qualquer texto gerado por IA a um lead ou
  cliente: respostas da recepcionista "Fernanda" no WhatsApp, textos de
  proposta, mensagens de follow-up e disparo em massa.

## Convenções de trabalho

Desenvolva em branch, nunca direto na `main`. Abra o PR como rascunho.

Ao mexer no CRM (mesmo que só na documentação de uma mudança já feita em
produção), atualize o `CHANGELOG.md` na mesma alteração, seguindo o padrão
de versão de interface já usado (`v8_6`, `v8_5`, etc.) ou registrando como
"marco de infraestrutura" quando não for uma versão de interface.

Quando adicionar uma dependência externa ao repositório (uma skill, um
servidor MCP), mantenha junto a licença original e cite a origem no `README.md`.
