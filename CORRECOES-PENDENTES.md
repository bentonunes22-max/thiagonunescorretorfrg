# Correções do WhatsApp — APLICADAS

> **Situação atual:** estas duas correções já foram aplicadas no repositório do site
> (https://github.com/bentonunes22-max/thiago-nunes-imoveis), no PR #1, e validadas com
> `tsc`, `vite build` e teste das rotas no SSR. Este documento fica como registro técnico
> do diagnóstico e da solução.

Estas são as correções dos dois bugs de conversão apontados em
[SITE-IMOBILIARIO.md](./SITE-IMOBILIARIO.md). O código completo está aqui, pronto para ser
aplicado direto no repositório do site — **nenhuma delas passa pelo agente do Lovable, então
não consomem crédito**.

## Por que dá para fazer sem crédito

Crédito no Lovable é gasto quando o **agente de IA** escreve código para você. Editar os
arquivos por fora — pelo GitHub ou pelo editor de código do próprio Lovable — não gasta nada.

Duas formas de aplicar:

1. **GitHub** (recomendado) — conectar o projeto do Lovable a um repositório. Depois disso o
   código pode ser editado por git para sempre, e o Lovable puxa as alterações sozinho.
   Ver "Como conectar" no fim deste documento.
2. **Editor do Lovable** — abrir o arquivo no modo de código dentro do próprio Lovable e colar
   a alteração à mão.

---

## Bug 1 — Botão flutuante cobre o CTA no celular

**Arquivo:** `src/routes/__root.tsx`

O componente `WhatsAppFloatingButton` já aceita a prop `offsetBottom`, que sobe o botão quando a
página tem barra fixa inferior. O problema é que ela nunca é passada. A correção é fazer o botão
saber em que rota está.

### 1.1 — Acrescentar `useRouterState` ao import do TanStack Router

```diff
 import {
   Outlet,
   Link,
   createRootRouteWithContext,
   useRouter,
+  useRouterState,
   HeadContent,
   Scripts,
 } from "@tanstack/react-router";
```

### 1.2 — Criar um wrapper que detecta a rota

Adicione este componente no arquivo, logo antes de `RootComponent`:

```tsx
/**
 * A página de detalhe do imóvel (/imoveis/algum-slug) tem uma barra fixa
 * inferior no mobile. Sem este ajuste, o botão flutuante fica por cima do
 * botão "Falar no WhatsApp" — justamente o CTA mais importante do site.
 */
function BotaoWhatsAppGlobal() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const temBarraFixa = /^\/imoveis\/[^/]+$/.test(pathname);

  return <WhatsAppFloatingButton offsetBottom={temBarraFixa} />;
}
```

### 1.3 — Usar o wrapper em `RootComponent`

```diff
-      <WhatsAppFloatingButton />
+      <BotaoWhatsAppGlobal />
```

> A expressão regular casa `/imoveis/casa-no-eucaliptos` mas **não** casa `/imoveis` — que é a
> listagem e não tem barra fixa. É exatamente o comportamento desejado.

---

## Bug 2 — WhatsApp bloqueado pelo Safari no iPhone

**Arquivos:** `src/data/leads.repository.ts` e `src/components/forms/LeadForm.tsx`

O `window.open()` acontece depois de um `await`, fora do contexto do clique — e o Safari no iOS
bloqueia isso como pop-up. A correção separa duas coisas que hoje estão grudadas:

- **montar a URL do WhatsApp** → é puro e instantâneo, pode ser feito de forma síncrona
- **guardar o lead** → é assíncrono, e não precisa segurar o contato

Assim a navegação sai imediatamente no clique (nunca bloqueada) e o registro do lead acontece em
paralelo.

### 2.1 — Expor uma função síncrona de montagem da URL

Em `src/data/leads.repository.ts`, acrescente esta função exportada (ela reaproveita o que já
existe no arquivo):

```ts
/**
 * Monta a URL do WhatsApp de forma SÍNCRONA, a partir dos dados do formulário.
 *
 * Precisa ser síncrona: navegadores móveis (Safari/iOS em especial) bloqueiam
 * a abertura de janelas que acontece depois de um `await`, porque o contexto do
 * clique do usuário já se perdeu. Montando a URL aqui, o formulário consegue
 * abrir o WhatsApp no mesmo instante do clique.
 */
export function buildLeadWhatsAppUrl(dados: Omit<Lead, "id" | "criadoEm">): string {
  const mensagem = buildMessageFromForm(introducoes[dados.tipo], {
    Nome: dados.nome,
    WhatsApp: dados.whatsapp,
    "E-mail": dados.email,
    Cidade: dados.cidade,
    Bairro: dados.bairro,
    "Tipo de imóvel": dados.tipoImovel,
    "Valor pretendido": dados.valorPretendido,
    "Faixa de investimento": dados.faixaInvestimento,
    "Renda aproximada": dados.rendaAproximada,
    "Valor de entrada": dados.valorEntrada,
    "Valor do imóvel": dados.valorImovel,
    "Código do imóvel": dados.codigoImovel,
    Observações: dados.observacoes,
  });

  return buildWhatsAppUrl(mensagem);
}
```

Para não duplicar a montagem da mensagem, o `createLead` pode passar a usá-la também:

```diff
-    const mensagem = buildMessageFromForm(introducoes[lead.tipo], {
-      Nome: lead.nome,
-      ...
-    });
-
-    return { lead, whatsappUrl: buildWhatsAppUrl(mensagem) };
+    return { lead, whatsappUrl: buildLeadWhatsAppUrl(lead) };
```

### 2.2 — Abrir o WhatsApp no clique, com plano B visível

Em `src/components/forms/LeadForm.tsx`:

```diff
-import { leadRepository, type LeadTipo } from "@/data/leads.repository";
+import { buildLeadWhatsAppUrl, leadRepository, type LeadTipo } from "@/data/leads.repository";
```

Acrescente um estado para o link de reserva:

```diff
   const [enviando, setEnviando] = useState(false);
+  const [linkReserva, setLinkReserva] = useState<string | null>(null);
```

E troque a função `enviar` inteira por esta:

```tsx
const enviar = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validar()) return;

  const dados = {
    tipo,
    nome: valores["nome"]!.trim(),
    whatsapp: valores["whatsapp"]!.trim(),
    email: valores["email"],
    cidade: valores["cidade"],
    bairro: valores["bairro"],
    tipoImovel: interesses.length > 0 ? interesses.join(", ") : valores["tipoImovel"],
    valorPretendido: valores["valorPretendido"],
    faixaInvestimento: valores["faixaInvestimento"],
    rendaAproximada: valores["rendaAproximada"],
    valorEntrada: valores["valorEntrada"],
    valorImovel: valores["valorImovel"],
    codigoImovel,
    observacoes: valores["observacoes"],
    origemPagina,
  };

  // 1) Navegação SÍNCRONA, ainda dentro do clique — não é bloqueada pelo iOS.
  const whatsappUrl = buildLeadWhatsAppUrl(dados);
  const janela = window.open(whatsappUrl, "_blank");

  // 2) Se ainda assim o navegador bloquear, mostramos um link visível.
  if (!janela) setLinkReserva(whatsappUrl);

  // 3) O registro do lead corre em paralelo e nunca segura o contato.
  setEnviando(true);
  void leadRepository
    .createLead(dados)
    .catch(() => {
      /* o contato pelo WhatsApp já foi aberto; falha no registro não trava o usuário */
    })
    .finally(() => setEnviando(false));

  toast.success("Abrindo o WhatsApp para finalizar o contato.");
};
```

E, logo abaixo do botão de envio, o plano B:

```tsx
{linkReserva && (
  <p className="mt-3 text-sm">
    Seu navegador bloqueou a abertura automática.{" "}
    <a
      href={linkReserva}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4"
    >
      Toque aqui para abrir o WhatsApp
    </a>
    .
  </p>
)}
```

> **Atenção ao `noopener`:** o `window.open` acima usa só `"_blank"`, de propósito. Passar
> `"noopener"` como terceiro argumento faz a função devolver `null` em vários navegadores, e aí
> não dá para saber se a janela abriu ou foi bloqueada. Para links de saída em nova aba, o risco
> de `noopener` é irrelevante aqui, porque o destino é o próprio WhatsApp.

---

## Como conectar o Lovable ao GitHub

No editor do projeto:

1. Abrir https://lovable.dev/projects/5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc
2. Botão **GitHub** no canto superior direito → **Connect to GitHub**
3. Autorizar a conta `bentonunes22-max` e escolher o nome do repositório
   (sugestão: `thiago-nunes-site-imobiliario` — separado deste, que é do CRM)

A partir daí o código do site inteiro passa a viver no GitHub. Alterações feitas por lá aparecem
no Lovable automaticamente, e o preview continua funcionando normalmente.

> Se a opção estiver bloqueada no plano gratuito, o caminho alternativo é aplicar as correções
> pelo editor de código do próprio Lovable, copiando os trechos deste documento.

## Depois de conectar

Com o repositório no ar, dá para tocar sem crédito nenhum:

- as duas correções acima
- os depoimentos da Roseli e do Valdeci
- a remoção dos imóveis de demonstração e a entrada dos reais
- o painel administrativo consumindo a API do Worker do CRM
- a ligação dos leads ao CRM (`LEAD_WEBHOOK_URL`)

E a hospedagem pode sair do Lovable a qualquer momento: como o projeto é TanStack Start, ele
roda no **Cloudflare Pages/Workers** — a mesma conta que já hospeda o CRM e que você já paga.
Isso juntaria site e CRM na mesma infraestrutura e simplificaria o CORS entre os dois.
