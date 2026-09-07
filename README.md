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

## Conteúdo: carrossel de Instagram

Geração de carrossel para o `@thiago_nunes_corretor` direto no Claude Code, sem Canva:
a skill monta os slides em HTML e o Playwright renderiza cada um como PNG no tamanho
certo do Instagram.

Como usar — no Claude Code, dentro deste repositório:

```
cria um carrossel sobre [tema]
```

A skill conduz um pipeline de 4 etapas (briefing → texto → direção visual → geração),
pedindo aprovação em cada uma. Identidade visual, CRECI, formato e regras de conteúdo
do mercado imobiliário já vêm pré-configurados em
`.claude/skills/carrossel-instagram/references/marca-thiago.md` — não precisa
reconfigurar a cada post.

Pré-requisitos (uma vez, na máquina onde o Claude Code roda):

- Node 18+ (o servidor MCP sobe via `npx`, não precisa instalar nada manualmente)
- navegador do Playwright: `npx playwright install chromium`

O servidor MCP `playwright` usa o perfil de navegador persistente padrão. Se você fizer
login no Instagram por ele uma vez, as capturas seguintes de posts e perfis funcionam
sem novo login.

Os PNGs e o `roteiro.md` de cada carrossel são salvos **fora deste repositório**
(pasta datada, ex.: `~/carrosseis/2026-09-07-financiamento-caixa/`). Este repositório é
documentação do CRM, não acervo de mídia.

## MCP e Skills (Claude Code)

Este repositório declara em `.mcp.json` o servidor MCP **scrapegraph-mcp** (ScrapeGraphAI), usado para dar a assistentes de IA acesso a scraping estruturado de páginas web — útil no contexto do robô de scraping de concorrentes em portais (ver `apify_leads`/`apify_sync_log` em [ARQUITETURA.md](./ARQUITETURA.md)).

Para usar, defina a variável de ambiente `SCRAPEGRAPH_API_KEY` com sua chave da [ScrapeGraphAI](https://scrapegraphai.com/) antes de abrir o Claude Code neste repositório — a chave não fica hardcoded no `.mcp.json`.

O arquivo [CLAUDE.md](./CLAUDE.md) na raiz reúne as instruções permanentes de trabalho para o Claude Code neste repositório: idioma, cuidados com dados de leads e chaves de API, e as convenções de commit e PR.

Também está incluída em `.claude/skills/humanizer/` a skill **humanizer** ([blader/humanizer](https://github.com/blader/humanizer), MIT), que reescreve texto com "cara de IA" para soar como escrito por uma pessoa, sem mudar o conteúdo. É útil para revisar mensagens geradas por IA antes de enviar a um lead ou cliente — por exemplo, respostas da recepcionista automatizada "Fernanda" no WhatsApp, textos de proposta ou de follow-up — removendo clichês, linguagem de vendas genérica e outros padrões típicos de texto gerado por IA.

O `.mcp.json` também declara o servidor MCP **playwright** ([@playwright/mcp](https://github.com/microsoft/playwright-mcp), Apache-2.0, Microsoft), que dá ao Claude Code controle de um navegador real — abrir páginas, capturar screenshot e renderizar HTML como imagem. Ele não pede chave de API. É o motor de renderização da skill de carrossel descrita acima, e também serve para conferir anúncios de concorrentes em portais quando o scraping estruturado não basta.

Em `.claude/skills/carrossel-instagram/` está a skill **carrossel-instagram** ([ahoydig/carrossel-instagram](https://github.com/ahoydig/carrossel-instagram), MIT, por [@flavioahoy](https://instagram.com/flavioahoy)), que gera carrosséis de Instagram a partir de um tema, URL, post ou ideia solta: 9 templates, 10 paletas e 8 efeitos tipográficos, com aprovação em cada etapa. A licença original está preservada em `.claude/skills/carrossel-instagram/LICENSE`.

Sobre a skill original foram acrescentados, sem alterar o pipeline:

- `references/marca-thiago.md` — preset da marca (formato 4:5, paletas Navy/Forest/Charcoal, fontes, CTA com CRECI-PR 50.265) e as regras de conteúdo de corretor: CRECI visível, nada de prometer aprovação de financiamento, nenhum número de mercado sem fonte, e dado de cliente real fora do slide por LGPD;
- ganchos no `SKILL.md` para ler esse preset antes do Gate 1 e no Gate 3.

## Próximos passos em aberto

- Sincronizar fotos de imóveis e anexos de contrato para o R2 (hoje ficam fora do sync com o D1 por limite de 2MB/linha)
- Consolidar teste de upload de fotos via R2 (CORS ajustado, pendente reteste completo)
- Avaliar se o briefing full-stack (Node/Express+Postgres) ainda faz sentido ou se a operação segue 100% Cloudflare
