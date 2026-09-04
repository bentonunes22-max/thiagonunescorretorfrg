# Arquitetura — CRMTHIAGO

## Backend

**Cloudflare Worker** (`crm-thiago-leads-worker`), publicado em `https://crm-thiago-leads-worker.bento-nunes22.workers.dev/`.

### Rotas legadas (sincronização com o CRM HTML atual)
- `POST /lead` — ingestão de leads (webhook WhatsApp/Meta Ads)
- `POST /sync` — envio automático do estado local a cada `save()` no frontend
- `POST /ack`
- `GET/POST /state`

### API autenticada (Fase 1 — CRUD relacional)
- `POST /api/auth/login` — login, retorna JWT
- `GET /api/auth/login-test?email=X&senha=Y` — variante de teste via query string (contorna bloqueio de `fetch()` em pré-visualizações sandboxed)
- CRUD genérico autenticado: `/api/leads`, `/api/imoveis`, `/api/clientes`
- Autenticação aceita token tanto via header `Authorization` quanto via query string `?token=...`

### Fotos (R2)
- Bucket: `crm-thiago-fotos-imoveis`
- Binding no Worker: `fotos_balde`
- Rotas de upload/listagem/serving em `/fotos/imoveis/...`
- CORS habilitado globalmente no worker.js atual

### Autenticação
- Hash de senha: PBKDF2 (Web Crypto nativo do Workers)
- JWT: assinatura manual HMAC-SHA256
- Sem dependências externas — tudo roda nativo no runtime do Worker

## Banco de dados (D1)

Banco: `crm-thiago-leads` (ID `20c39ac4-6d59-41cc-b1dd-2e9e6e14dfa9`)

Tabelas:
- `users` — usuário admin (login: `thiago@imobiliariaferreira.com`)
- `clientes`
- `imoveis`
- `leads`
- `leads_capture` (com campo `synced`)
- `crm_state` (blob de estado geral, usado pelo sync legado)
- `apify_leads` / `apify_sync_log` — de um robô separado de scraping de concorrentes em portais (não relacionado ao fluxo de leads do CRM)
- `instagram_posts` — fila de posts automáticos no Instagram por imóvel (`imovel_id`, `foto_url`, `legenda`, `status`), ainda sem uso registrado

`imoveis.gmb_postado_em` — coluna de controle usada pela automação de Google Meu Negócio (ver abaixo), marca quando o imóvel já foi postado para evitar duplicidade.

## Automação de posts no Google Meu Negócio

Roda **fora do Worker publicado**, como rotina agendada do Claude Code:
1. A cada hora, consulta `imoveis` no D1 filtrando `status = 'ativo' AND gmb_postado_em IS NULL`.
2. Para cada imóvel novo, cria um post via **Zapier** (app Google Business Profile, ação `create_post`) na ficha `locations/14972441350928932829` ("Thiago Nunes corretor de imóveis F.R.G/ PR"), com botão de ação apontando para `https://wa.me/5541998921475`.
3. Marca `gmb_postado_em = datetime('now')` no imóvel após o post ter sucesso.

Diferente da integração Meta (Instagram/Facebook), que usa tokens próprios guardados em `integracoes` e é chamada diretamente pelo Worker, esta automação passa pelo Zapier e depende da sessão/rotina do Claude Code estar ativa — não é código do `worker.js`.

## Frontend

HTML/JS único, capaz de operar 100% offline via `localStorage`, com sincronização sob demanda:
- Envio automático a cada `save()` para o D1
- Download manual com merge que preserva fotos/anexos locais (propositalmente fora do sync por limite de 2MB/linha no D1)

## Incidentes conhecidos (histórico)

- O código publicado em produção já reverteu, ao menos uma vez, para uma versão mínima (só rota `/lead`), perdendo login/JWT/CRUD — causa exata não identificada. O banco D1 permaneceu intacto nesse incidente. Reconstruído a partir de um worker.js único consolidado.
- Duas tentativas de salvar o binding R2 no painel Cloudflare geraram bindings duplicados (`fotos_balde` e "BALDE DE FOTOS" com espaço) por trás de um erro genérico de UI — o duplicado foi removido, mantendo `fotos_balde`.

## Decisão de stack (Fase 1 do briefing full-stack)

Avaliadas duas opções para evoluir o CRM para um sistema profissional completo (multiusuário, módulos de Locação e Financeiro, marketing Meta/Google Ads):
- **Opção A — 100% Cloudflare** (Workers + D1 + R2): reaproveita a infraestrutura já paga — **opção escolhida**, em desenvolvimento
- Opção B — Node/Express + PostgreSQL tradicional: descartada por ora
