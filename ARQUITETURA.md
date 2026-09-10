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

### Lembretes no WhatsApp
- `POST /api/lembretes` — cria lembrete (aceita `quando` pronto ou `frase` em português)
- `POST /api/lembretes/teste` — envia mensagem de teste
- Despacho dentro do `scheduled()` que já existe, junto das outras tarefas do cron

### Avisos dentro do CRM
- `GET /api/avisos?desde=<ISO>` — leads novos, lembretes disparados e compromissos avisados, em ordem cronológica inversa. Só leitura: não cria nem grava nada

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
- `agenda`, `tarefas`, `follow_ups` — compromissos, pendências e retornos, todos com CRUD em `/api/...`. As colunas `lembrar_em` e `alertado_em` (ver [`sql/2026-09-lembretes.sql`](./sql/2026-09-lembretes.sql)) controlam o aviso no WhatsApp
- `integracoes` — credenciais em banco, lidas por `lerIntegracao()`: `green_api_id_instance`, `green_api_token_instance`, `alerta_whatsapp_telefone`, chaves da Meta, `openai_api_key` e dados de PIX

`imoveis.gmb_postado_em` — coluna de controle usada pela automação de Google Meu Negócio (ver abaixo), marca quando o imóvel já foi postado para evitar duplicidade.

## Alerta de lead novo (já em produção)

`registrarLeadEntrante()` é o caminho único de entrada de lead — site, webhook e
sincronização com a Meta passam todos por ela — e sempre chama
`enviarAlertaLead()`, que manda no WhatsApp do Thiago nome, telefone, e-mail,
interesse e origem. O destino é a chave `alerta_whatsapp_telefone` da tabela
`integracoes`; se ela estiver vazia, a função sai em silêncio, sem erro.

## Lembretes no WhatsApp

Complementa o alerta de lead: avisa o Thiago dos compromissos e pendências que
ele já cadastra no CRM, em vez de criar uma agenda paralela.

- **De onde sai o lembrete:** das tabelas que já existem — `tarefas` (pendência,
  com `lembrar_em`) e `agenda` (compromisso; sem `lembrar_em`, avisa 1h antes de
  `data` + `hora_inicio`). Duas colunas novas em cada uma: `lembrar_em` (quando
  avisar) e `alertado_em` (quando o aviso saiu), no mesmo padrão de
  `imoveis.gmb_postado_em`.
- **Como se cria:** pelo CRUD que já existe, ou por `POST /api/lembretes` com
  frase solta — `{"frase": "me lembra amanhã 9h de ligar pro proprietário"}` —
  interpretada por `interpretarLembrete()`, que entende "hoje", "amanhã",
  "sexta", "12/09", "14:30", "9h" e "em 40 minutos".
- **Como sai:** pela `enviarWhatsapp()` que já existe (Green API), para o número
  de `alerta_whatsapp_telefone`. Nenhuma credencial nova.
- **Quando sai:** no `scheduled()` que já roda. A precisão do lembrete é a
  frequência do Cron Trigger.
- **Sem duplicar:** `alertado_em` é marcado antes do envio, numa atualização
  condicionada a `alertado_em IS NULL`; se o envio falhar, a coluna volta a nulo
  e o ciclo seguinte tenta de novo.

Fuso: `lembrar_em` e `alertado_em` ficam em horário de Brasília, como
`agenda.data`, `agenda.hora_inicio` e `tarefas.vencimento` — o Worker roda em
UTC, então essas colunas nunca devem ser comparadas com `datetime('now')`.

Código de referência: [`snippets/lembrete-whatsapp.js`](./snippets/lembrete-whatsapp.js).
Como todo o resto deste repositório, **não é deployado daqui**.

## Painel de avisos dentro do CRM

A mesma informação do WhatsApp aparece numa janela lateral do CRM, para quem
está com o sistema aberto não precisar olhar o celular.

- **Servidor:** `GET /api/avisos` junta três fontes que já existem — `leads`
  (por `criado_em`), `tarefas` e `agenda` (por `alertado_em`, preenchido pelo
  despacho de lembretes). Nenhuma tabela nova, nenhuma gravação: se o aviso já
  saiu no WhatsApp, ele aparece no painel; são as duas pontas do mesmo evento.
- **Navegador:** bloco de HTML/CSS/JS sem dependência, colado no fim do HTML do
  CRM. Botão flutuante com contador, painel lateral, som curto e notificação do
  sistema operacional quando a permissão é concedida.
- **Autenticação:** o painel manda o mesmo JWT que o CRM já guarda no
  `localStorage`, no header `Authorization`. O CORS já é liberado por
  `aplicarCors()`, então funciona com o CRM aberto de qualquer endereço.
- **Consulta:** a cada 45 segundos, e para de consultar quando a aba está
  escondida (`document.hidden`), voltando a atualizar assim que o Thiago
  retorna para a aba.
- **O que é "novo":** o painel guarda no `localStorage` o instante da última
  leitura. O contador zera ao abrir, mas o destaque verde de cada item só sai
  quando o painel é fechado — senão o aviso sumiria antes de ser lido.

Fuso: `leads.criado_em` está em UTC e `alertado_em` em horário de Brasília; a
rota converte tudo para UTC ISO e o navegador exibe no fuso local.

Código de referência: [`snippets/painel-avisos-worker.js`](./snippets/painel-avisos-worker.js)
e [`snippets/painel-avisos-crm.html`](./snippets/painel-avisos-crm.html).

## Divergências entre esta documentação e o worker publicado

Conferido no worker `crm-thiago-leads-worker` em 07/09/2026. Registrado aqui
porque a documentação antiga levava a decisões técnicas erradas.

- **WhatsApp é Green API, não Evolution API.** O worker usa
  `https://api.green-api.com/waInstance...`, com as credenciais em `integracoes`
  e webhook próprio em `/webhook/green-api`. As funções são `enviarWhatsapp()` e
  `enviarWhatsappComMidia()`.
- **A assistente no worker se chama "Ana Paula"**, com prompt próprio e histórico
  na tabela `ana_paula_conversas`, ativada por `ativarAnaPaula()` a cada lead com
  telefone. Se a "Fernanda" (Evolution + n8n) ainda existir, é fora da Cloudflare.
- **O banco tem bem mais tabelas do que as listadas acima** — locação
  (`contratos_locacao`, `cobrancas_locacao`, `chamados_manutencao`, `reajustes_log`),
  disparos, campanhas, propostas, metas, simulações, avaliações, pós-venda,
  lançamentos, auditoria e backups com prefixo `_bkp_`.
- **`scheduled()` já existe** e roda três tarefas: sincronização de leads da Meta,
  processamento de disparos em andamento e sincronização do Apify.
- **`getAuth()` aceita `X-Automation-Key`** além do JWT, que é como o n8n chama a
  API sem login.

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
