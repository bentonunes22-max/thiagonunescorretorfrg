# Como colocar os lembretes e o chat no ar

Passo a passo para aplicar em produção o que está em `snippets/` e `sql/`.
Nada deste repositório é deployado automaticamente — tudo abaixo é feito à mão,
no painel da Cloudflare e no arquivo do CRM.

Tempo: uns 20 minutos. Dá para parar depois de qualquer passo — cada um
funciona sozinho.

---

## Antes de começar: faça uma cópia do worker.js

No painel do Worker, selecione todo o código e salve num arquivo no seu
computador (`worker-backup-AAAA-MM-DD.js`). O código publicado já reverteu para
uma versão mínima uma vez (está registrado em `ARQUITETURA.md`); com a cópia,
voltar é questão de colar de novo.

---

## Passo 1 — Banco (D1)

**Caminho:** [dash.cloudflare.com](https://dash.cloudflare.com) → menu lateral
**Storage & Databases** → **D1 SQL Database** → **crm-thiago-leads** → aba
**Console**.

Cole e execute, um de cada vez:

1. o conteúdo de [`sql/2026-09-lembretes.sql`](./sql/2026-09-lembretes.sql)
2. o conteúdo de [`sql/2026-09-assistente.sql`](./sql/2026-09-assistente.sql)

Para conferir, rode:

```sql
SELECT name FROM pragma_table_info('tarefas') WHERE name IN ('lembrar_em','alertado_em');
SELECT name FROM sqlite_master WHERE name = 'assistente_conversa';
```

Tem de devolver `lembrar_em`, `alertado_em` e `assistente_conversa`. Se o
`ALTER TABLE` reclamar que a coluna já existe, está feito — pode seguir.

---

## Passo 2 — Worker

**Caminho:** dash.cloudflare.com → **Compute (Workers)** →
**crm-thiago-leads-worker** → botão **Edit code** (canto superior direito).

### 2.1 Colar as funções

Cole os três arquivos **um embaixo do outro, nesta ordem**, em qualquer ponto
antes da linha `var worker_default = {` (o fim do arquivo é um bom lugar):

1. [`snippets/lembrete-whatsapp.js`](./snippets/lembrete-whatsapp.js)
2. [`snippets/painel-avisos-worker.js`](./snippets/painel-avisos-worker.js)
3. [`snippets/assistente-ana-paula-worker.js`](./snippets/assistente-ana-paula-worker.js)

A ordem importa: o assistente usa `criarLembrete()` e `interpretarLembrete()`,
que vêm do primeiro arquivo.

Nos três, apague o cabeçalho de comentário se quiser — ele é explicação, não
código. **Não** cole as funções `json`, `enviarWhatsapp`, `lerIntegracao`,
`getAuth` e `chamarOpenAI`: elas já existem no worker, e duplicar quebra.

### 2.2 Ligar as rotas

Procure por `async function tratarRequisicao`. Logo abaixo dela existe isto:

```js
    if (path === "/" && request.method === "GET") {
      return json({ status: "CRM Thiago Nunes - Worker ativo" });
    }
```

Cole **logo depois desse bloco**:

```js
    const rLembrete = await rotasLembrete(request, env);
    if (rLembrete) return rLembrete;

    const rAvisos = await rotasAvisos(request, env);
    if (rAvisos) return rAvisos;

    const rAssistente = await rotasAssistente(request, env);
    if (rAssistente) return rAssistente;
```

### 2.3 Ligar o despacho no cron

Procure por `async scheduled(event, env, ctx) {`. Dentro dele já existem três
linhas `ctx.waitUntil(...)`. Adicione mais uma, junto das outras:

```js
    ctx.waitUntil(despacharLembretes(env));
```

### 2.4 Publicar

Botão **Deploy**, no canto superior direito.

### 2.5 Conferir a frequência do cron

**Caminho:** na página do Worker → aba **Settings** → **Triggers** →
**Cron Triggers**.

A precisão do lembrete é a do cron. Se estiver rodando de hora em hora, um
lembrete das 9h pode chegar às 9h50. O recomendado é `*/5 * * * *` (de 5 em 5
minutos). Se já houver um cron configurado, pode manter — só saiba a margem.

---

## Passo 3 — CRM

Abra o arquivo HTML do CRM num editor de texto, cole o conteúdo de
[`snippets/chat-ana-paula-crm.html`](./snippets/chat-ana-paula-crm.html)
**imediatamente antes da linha `</body>`**, e salve.

Não precisa mexer em mais nada do arquivo: o bloco tem o próprio CSS (todo
prefixado com `crmav-`, para não esbarrar no estilo que já existe), o próprio
HTML e o próprio JavaScript.

---

## Sobre o token: não há nada para colar

O chat usa o **mesmo login que você já faz no CRM**. Ele lê o token de
`crmToken` no `localStorage` do navegador, que é onde o CRM já guarda, e manda
no cabeçalho `Authorization` a cada consulta.

- Não existe token para copiar e colar em lugar nenhum do código.
- O token nasce quando você faz login e morre quando a sessão expira — por isso
  ele não fica salvo em arquivo nem neste repositório.
- Se quiser ver o seu, com o CRM aberto: `F12` → aba **Application** →
  **Local Storage** → o endereço do CRM → linha `crmToken`. É um texto longo em
  três partes separadas por ponto. **Não mande esse valor para ninguém**: quem
  tiver ele entra no seu CRM sem senha até a sessão expirar.

As chaves da Green API e da OpenAI também não precisam ser tocadas: já estão na
tabela `integracoes` do D1, e o código novo lê de lá pela `lerIntegracao()`.

---

## Passo 4 — Testar

Faça na ordem. Se um falhar, o problema está nesse passo.

**1. O Worker respondeu?**
Abra o CRM, faça login, aperte `F12` → aba **Console** e cole:

```js
fetch('https://crm-thiago-leads-worker.bento-nunes22.workers.dev/api/avisos', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('crmToken') }
}).then(r => r.json()).then(console.log);
```

Tem de aparecer `{sucesso: true, avisos: [...]}`. Se vier `401`, refaça o login.

**2. O chat aparece?**
Recarregue o CRM. Deve surgir o botão redondo no canto inferior direito. Clique:
ela abre com o resumo do dia.

**3. O lembrete funciona?**
No chat, escreva: `me lembra em 6 minutos de testar o alarme`.
Ela responde "Marquei: ...". Espere o cron rodar — a mensagem chega no seu
WhatsApp.

**4. A conversa funciona?**
Pergunte no chat: `quem eu devia ligar primeiro?`. Se ela responder que não
conseguiu pensar, o problema é a chave da OpenAI — o resto continua de pé.

---

## Se der errado

| Sintoma | Onde olhar |
| --- | --- |
| Chat não aparece | Console do navegador (`F12`): erro de JavaScript indica que o bloco foi colado no meio de outra tag |
| "faça login no CRM" no rodapé | O token não está em `crmToken` — confira no `F12` → Application → Local Storage |
| Erro 500 nas rotas novas | Worker → aba **Logs** (tempo real). Provável função colada duas vezes ou fora de ordem |
| Lembrete não chega no WhatsApp | Instância da Green API desconectada. Teste com `POST /api/lembretes/teste` |
| Resumo vazio | Normal se não houver lead parado, agenda nem tarefa vencida |

Para voltar atrás: cole a cópia do `worker.js` que você salvou no começo e
publique. As colunas novas no banco podem ficar — não atrapalham nada.
