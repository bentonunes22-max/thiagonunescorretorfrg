# Deploy do Worker pelo GitHub

Desde 14/09/2026 o código do Worker mora neste repositório, em
[`worker/worker.js`](./worker/worker.js). O que está lá é exatamente o que
estava publicado na Cloudflare naquele dia — baixado e commitado sem nenhuma
alteração.

## Por que isso importa

Antes, o `worker.js` só existia dentro do painel da Cloudflare. Duas
consequências práticas:

1. **Não havia de onde restaurar.** O código publicado já reverteu sozinho para
   uma versão mínima uma vez (ver "Incidentes conhecidos" em
   [ARQUITETURA.md](./ARQUITETURA.md)), e a recuperação foi manual.
2. **Não dava para saber o que mudou.** Entre 07/09 e 14/09 o Worker ganhou
   umas 460 linhas — chat do assistente, follow-up automático, backup, renovação
   de token da Meta — sem registro de quando nem por quê.

Com o código versionado, cada alteração vira um commit, o histórico mostra o que
mudou, e voltar atrás é um comando.

## Como passa a funcionar

```
alteração no worker/worker.js  →  PR  →  validação automática  →  você aprova
                                                                      ↓
                                            merge na main  →  deploy automático
```

- **Em pull request:** o GitHub confere a sintaxe do arquivo e monta o bundle
  sem publicar (`wrangler deploy --dry-run`). Erro de sintaxe aparece antes do
  merge, não em produção.
- **No merge para a main:** publica na Cloudflare.
- O workflow só roda quando `worker/**` ou `wrangler.toml` mudam — mexer na
  documentação não dispara deploy.

## Ligar a esteira (uma vez)

### 0. Antes de tudo: o token do Instagram

O código que estava publicado trazia o token de verificação do webhook do
Instagram **escrito dentro do arquivo**, como reserva para quando
`env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN` não existisse. Como este repositório é
público, esse valor foi retirado do código antes do commit: hoje a constante
vale `null` e a verificação só aceita o que vier do secret.

Consequência: **antes do primeiro deploy**, cadastre o secret no Worker, senão a
Meta deixa de conseguir verificar o webhook e os leads do Instagram param de
entrar.

1. No painel da Cloudflare, abra o código publicado (que ainda é a versão
   antiga) e copie o valor da linha `var INSTAGRAM_WEBHOOK_VERIFY_TOKEN = "..."`.
2. Em **Settings** › **Variables and Secrets** › *Add*, crie
   `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` com esse valor, marcando como **Secret**
   (encrypt).
3. Confirme que ficou salvo antes de publicar qualquer coisa.

Se preferir trocar o token por um novo, ele precisa ser alterado nos dois lados:
no secret do Worker e no painel de webhooks da Meta.

### 1. Criar o token na Cloudflare

Em [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
→ **Create Token** → template **Edit Cloudflare Workers**, ou token
personalizado com:

- `Account` › `Workers Scripts` › **Edit**
- `Account` › `D1` › **Edit** (só se um dia o deploy precisar criar binding)

Copie o token **na hora** — ele não é mostrado de novo.

### 2. Guardar no GitHub

No repositório: **Settings** › **Secrets and variables** › **Actions** ›
*New repository secret*. Crie dois:

| Nome | Valor |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | o token criado acima |
| `CLOUDFLARE_ACCOUNT_ID` | o Account ID, na barra lateral do dashboard da Cloudflare |

O token fica guardado no GitHub, cifrado. Ele não aparece no código, nem nos
logs do workflow, nem em conversa nenhuma.

### 3. Conferir a data de compatibilidade

No painel do Worker › **Settings** › **Runtime**, veja a *Compatibility date*.
Se for diferente de `2026-07-05`, ajuste a linha `compatibility_date` no
[`wrangler.toml`](./wrangler.toml) antes do primeiro deploy. Essa data muda
sutilmente o comportamento do runtime, então ela precisa bater com a que já está
valendo.

### 4. Primeiro deploy

Rode uma vez pela aba **Actions** › *Deploy do Worker* › **Run workflow**, com o
código idêntico ao que já está no ar. Se publicar sem erro e o CRM continuar
funcionando, a esteira está válida — e a partir daí toda mudança segue pelo PR.

## O que o deploy NÃO mexe

- **Secrets do Worker** (`JWT_SECRET`, `AUTOMATION_KEY`, `META_APP_SECRET`,
  `INTEGRACOES_KEY`, `APIFY_TOKEN`, `GREEN_API_WEBHOOK_SECRET`,
  `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`): continuam guardados no Worker.
- **Variáveis criadas pelo painel**: o deploy roda com `--keep-vars`, que as
  preserva.
- **Credenciais da Green API, OpenAI e Meta**: ficam na tabela `integracoes` do
  D1, não no código.
- **O banco**: nenhuma migração roda no deploy. Mudança de schema continua
  manual, pelo Console do D1.

## Cron

O `wrangler.toml` declara `*/10 * * * *` — a frequência que já rodava, conferida
pelos registros de `meta_sync_log`. Está declarado de propósito: assim o deploy
não altera o agendamento por omissão.

Esse cron é quem dispara, a cada dez minutos: sincronização de leads da Meta,
backup automático, varredura de leads perdidos, renovação do token da Meta,
follow-ups automáticos, disparos em massa em andamento e sincronização do Apify.

## Se o deploy quebrar produção

1. No GitHub, reverta o commit (`Revert` no PR) e faça merge — a esteira publica
   a versão anterior sozinha.
2. Se for urgente e o GitHub não estiver acessível, o painel da Cloudflare tem
   **Deployments**, com a lista de versões publicadas e opção de voltar para uma
   anterior.
