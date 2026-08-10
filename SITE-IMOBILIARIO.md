# Site Imobiliário — Thiago Nunes Soluções Imobiliárias

Plataforma imobiliária pública (catálogo de imóveis + captação de leads), construída no **Lovable**.
Não confundir com o **CRMTHIAGO** (ver [README.md](./README.md)): o CRM é a ferramenta interna de
gestão; este site é a vitrine pública que alimenta o CRM com leads.

| | |
|---|---|
| **Repositório (fonte da verdade)** | https://github.com/bentonunes22-max/thiago-nunes-imoveis |
| **Projeto Lovable (origem)** | `Prime Imóveis Online` — `5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc` |
| **Editor Lovable** | https://lovable.dev/projects/5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc |
| **Publicado** | ❌ ainda não — falta publicar e apontar o domínio |
| **Stack** | TanStack Start (SSR) + React + TypeScript + Tailwind + shadcn/ui |

> **O código agora vive no GitHub.** O site foi criado no Lovable, mas o código-fonte foi
> espelhado para o repositório acima, onde a evolução acontece por git — **sem consumir créditos
> do Lovable**. O projeto no Lovable permanece como origem histórica e pode ser usado para
> conferência visual, mas não é mais a fonte da verdade.
>
> O espelho foi validado: `npx tsc --noEmit` e `npx vite build` passam sem erros, as 15 rotas
> respondem 200 no servidor SSR e a rota inexistente responde 404.

> O nome interno do projeto no Lovable ("Prime Imóveis Online") foi gerado automaticamente e
> **não aparece em lugar nenhum do site**. A marca exibida vem toda de `src/config/site.ts`.
> Pode ser renomeado no editor sem risco.

---

## 1. O que já está pronto

**Páginas públicas**

| Rota | Conteúdo |
|---|---|
| `/` | Hero + barra de busca + imóveis em destaque + categorias + credibilidade + CTAs |
| `/imoveis` | Listagem com filtros na URL, ordenação, chips de filtro ativo, estado vazio |
| `/imoveis/$slug` | Galeria, ficha técnica, descrição, características, financiamento, mapa, semelhantes, CTA fixo |
| `/vender` | Landing de captação + formulário completo |
| `/investidores` | Categorias de oportunidade + formulário com faixa de investimento |
| `/financiamento` | Explicação do apoio no processo + formulário de simulação |
| `/sobre` | Apresentação do corretor + CRECI |
| `/blog` e `/blog/$slug` | Blog com categorias e 3 artigos escritos |
| `/contato` | Dados de contato + formulário |
| `/casas-a-venda-fazenda-rio-grande` | Landing de SEO → listagem filtrada |
| `/apartamentos-fazenda-rio-grande` | Landing de SEO → listagem filtrada |
| `/terrenos-fazenda-rio-grande` | Landing de SEO → listagem filtrada |
| `/sitemap.xml` | Gerado dinamicamente (rotas + imóveis + posts) |
| 404 | Página personalizada com atalhos úteis |

**Infraestrutura de código**

- Configuração central da marca em um único arquivo
- Integração WhatsApp centralizada, com mensagem diferente por origem do lead
- Repository pattern para imóveis e para leads (troca de fonte de dados sem mexer nas páginas)
- SEO: meta tags, canonical, Open Graph, Twitter Card, JSON-LD, sitemap, robots.txt
- Design system em tokens HSL (azul-marinho, grafite, off-white, acento areia)

---

## 2. Onde mexer em cada coisa

### Trocar WhatsApp, e-mail, Instagram, endereço, CRECI

**Um único arquivo: `src/config/site.ts`.** Nenhum outro arquivo do projeto tem esses dados
escritos no código — todas as páginas e componentes leem daqui.

```ts
contato: {
  whatsapp: "5541998921475",        // só dígitos, com o 55 na frente
  telefoneExibicao: "(41) 99892-1475",
  email: "bento_nunes22@hotmail.com",
  instagram: "@thiagonunes_corretor",
}
```

### Cadastrar, editar ou remover imóveis (hoje)

`src/data/properties.seed.ts` — array de imóveis em TypeScript. Os 12 imóveis atuais são de
**demonstração**, marcados com `isDemo: true`, e o site mostra o selo "Imóvel de demonstração"
nos cards e na página de detalhe.

> ⚠️ **Antes de divulgar o site, os imóveis de demonstração precisam sair.** Ou apague o arquivo
> e substitua pelos reais, ou zere o array.

### Ligar os leads a um CRM / n8n / webhook

`src/data/leads.repository.ts` → preencher a constante `LEAD_WEBHOOK_URL`.

O bloco de envio já está escrito e o payload JSON já é estável. Hoje, com a constante vazia,
o lead é salvo no `localStorage` do navegador e transformado numa mensagem de WhatsApp já
preenchida com todos os campos do formulário.

---

## 3. Decisão de arquitetura: leads vão para o CRM que já existe

O CRM da operação (`crm-thiago-leads-worker` + D1 + R2, ver [ARQUITETURA.md](./ARQUITETURA.md))
**já tem** rota de ingestão de leads e cadastro de imóveis. Por isso o site **não** criou banco
de dados próprio: um segundo cadastro de imóveis e leads significaria dado duplicado e
retrabalho de sincronização.

O caminho previsto é ligar as duas pontas pelos pontos de extensão já preparados:

```
Site (formulários)  ──POST──►  LEAD_WEBHOOK_URL  ──►  Worker /lead  ──►  D1
Site (catálogo)     ◄──GET───  PropertyRepository ──►  Worker /api/imoveis  ──►  D1 + R2 (fotos)
```

**Para os leads** — preencher `LEAD_WEBHOOK_URL` com a rota `/lead` do Worker. O payload do site
tem campos que a rota atual não conhece (`faixaInvestimento`, `rendaAproximada`, `valorEntrada`,
`origemPagina`), então o Worker precisa aceitá-los ou ignorá-los sem quebrar.

**Para os imóveis** — criar um `workerPropertyRepository` implementando a mesma interface
`PropertyRepository` e trocar a instância exportada no fim de `properties.repository.ts`.
Nenhuma página precisa ser alterada: todos os métodos já são assíncronos justamente para
permitir essa troca. Requer CORS liberado no Worker para o domínio do site.

---

## 4. Pendências e problemas encontrados na revisão

Auditoria feita sobre o código-fonte do projeto. Os itens 1 e 2 são bugs reais confirmados.

### ✅ 1. Botão flutuante cobria o CTA da página de imóvel no celular — CORRIGIDO (PR #1)

`src/components/layout/WhatsAppFloatingButton.tsx` recebe uma prop `offsetBottom` criada
exatamente para subir o botão quando a página tem barra fixa inferior. Mas em
`src/routes/__root.tsx` ele é renderizado como `<WhatsAppFloatingButton />`, **sem a prop** —
ou seja, o recurso existe e nunca é acionado.

Efeito: na página de detalhe do imóvel, no celular, o botão flutuante fica por cima do botão
"Falar no WhatsApp" da barra fixa — justamente o CTA mais importante do site.

*Corrigido:* um wrapper lê a rota atual via `useRouterState` e ativa `offsetBottom` apenas em
`/imoveis/<slug>`. Verificado no SSR renderizado: a home traz `bottom-5` e a página de imóvel
traz `bottom-24`.

### ✅ 2. WhatsApp podia não abrir no iPhone após enviar formulário — CORRIGIDO (PR #1)

`src/components/forms/LeadForm.tsx` chama `window.open(whatsappUrl, "_blank")` **depois** de um
`await leadRepository.createLead(...)`. Como a chamada sai do contexto do clique do usuário, o
Safari no iOS costuma bloquear a abertura como pop-up.

Efeito: a pessoa preenche o formulário inteiro, vê a mensagem de sucesso e o WhatsApp não abre.
Lead perdido.

*Corrigido:* a montagem da URL (pura) foi separada da gravação do lead (assíncrona).
`buildLeadWhatsAppUrl` monta a URL de forma síncrona, a navegação sai ainda dentro do clique e o
registro do lead corre em paralelo. Se algum navegador ainda bloquear, aparece um link de reserva
visível.

### ✅ 3. Painel administrativo — IMPLEMENTADO (PR #3)

Rotas `/admin`, `/admin/imoveis` e `/admin/leads`, consumindo a API do Worker do CRM — sem criar
banco próprio. Permite alterar **preço**, **status** e **destaque**, e ver/exportar os leads.

Cadastro de imóvel do zero e upload de fotos continuam no CRM, que já tem a rota do R2 pronta.
Enquanto `VITE_CRM_API_URL` não estiver configurada, o painel abre em modo explicativo — não
existe tela de edição que não salva.

**Ponto de segurança levantado:** a API do CRM aceita o token por query string (`?token=`). O site
usa sempre o header `Authorization`, porque token em query string vaza em log de servidor,
histórico do navegador e cabeçalho `Referer`. Vale desativar essa variante no Worker quando ela
não for mais necessária para testes.

### ✅ 4. Depoimentos aprovados — INCLUÍDOS (PR #2)

Depoimentos da Roseli e do Valdeci na home, em `src/config/depoimentos.ts` — editável num arquivo
só, com aviso explícito de que apenas depoimentos reais e autorizados podem entrar. Nada de notas,
estrelas ou contagem de avaliações.

### 🟡 5. `robots.txt` aponta para um domínio que ainda não existe

`public/robots.txt` traz `Sitemap: https://thiagonunesimoveis.lovable.app/sitemap.xml`, e
`src/config/site.ts` usa a mesma URL. Nenhuma das duas é o domínio final. Precisam ser
atualizadas juntas na hora de publicar — é o único lugar do projeto onde uma URL aparece fora
do arquivo de configuração, porque `robots.txt` é um arquivo estático.

### ✅ 6. Imagem padrão de compartilhamento — CORRIGIDO (PR #2)

Há fallback configurável em `siteConfig.site.imagemCompartilhamento`. Ainda usa uma foto genérica:
**vale trocar por arte própria da marca (1200×630)**, já que é essa a imagem que aparece quando o
site é compartilhado no WhatsApp e no Instagram.

### ✅ 7. Detalhe no Schema.org — CORRIGIDO (PR #2)

O `slogan` passou a receber o slogan da marca; a localização já estava em `address` e `areaServed`.

### ⚪ 8. Dados a confirmar antes de publicar

- ~~**Instagram**~~ — ✅ confirmado: `@thiagonunes_corretor`, que é justamente a grafia já usada
  no site. Nada a alterar no Lovable. O README do CRM, que trazia `@thiago_nunes_corretor`, foi
  corrigido.
- **Endereço** — `Rua Vitória, 706` está no config, mas com `exibirEnderecoCompleto: false`,
  então o site mostra apenas "Fazenda Rio Grande – PR". Se for endereço de atendimento ao
  público, vale ativar (ajuda no SEO local). Se for residencial, manter desligado.
- **CRECI** — o site exibe "CRECI 50.265"; o README do CRM usa "CRECI-PR 50.265".

---

## 5. Checklist para colocar no ar

- [ ] Revisar e mesclar os PRs abertos: **#1** (bugs do WhatsApp), **#2** (depoimentos e SEO),
      **#3** (painel administrativo)
- [ ] Remover ou substituir os 12 imóveis de demonstração
- [ ] Configurar `VITE_CRM_API_URL` e conferir o JSON de `GET /api/imoveis` contra o adapter
- [ ] Criar arte própria de compartilhamento (1200×630)
- [x] Confirmar o Instagram — `@thiagonunes_corretor`
- [ ] Confirmar o endereço (exibir ou não) e o formato do CRECI
- [ ] Definir o domínio e atualizar `src/config/site.ts` + `public/robots.txt`
- [ ] Definir imagem padrão de compartilhamento
- [ ] Publicar pelo Lovable e apontar o domínio
- [ ] Cadastrar o site no Google Search Console e enviar o `sitemap.xml`
- [ ] Preencher `LEAD_WEBHOOK_URL` apontando para o Worker
- [ ] Decidir se o catálogo passa a vir do CRM (`workerPropertyRepository`)
- [ ] Avaliar o que fazer com o site antigo (`thiagonunescorretorparana.lovable.app`):
      redirecionar para o novo ou desativar

---

## 6. Créditos do Lovable — problema resolvido

O workspace (`thiago's Lovable`, plano **free**) ficou **sem créditos**, o que impedia o agente do
Lovable de aplicar qualquer alteração.

Isso deixou de ser um bloqueio: o código foi espelhado para o GitHub e a evolução acontece por
git. **Editar arquivo não consome crédito** — crédito é consumido apenas quando o agente de IA do
Lovable escreve código. Daqui em diante, correções, novas páginas, o painel administrativo e a
integração com o CRM podem ser feitos sem custo de créditos.

## 7. Como trabalhar no site a partir de agora

```bash
git clone https://github.com/bentonunes22-max/thiago-nunes-imoveis
cd thiago-nunes-imoveis
npm install
npm run dev      # servidor local em http://localhost:5173
npm run build    # build de produção (alvo Cloudflare, gera .output/)
npx tsc --noEmit # checagem de tipos
```

> **Componentes shadcn/ui:** o Lovable inclui 45 componentes por padrão, mas o site importa
> apenas 8 (`button`, `checkbox`, `input`, `label`, `select`, `sheet`, `sonner`, `textarea`).
> Só esses foram espelhados. Se algum outro for necessário no futuro, basta adicioná-lo com o
> CLI do shadcn — a configuração em `components.json` já está pronta.

> **`src/routeTree.gen.ts`** é gerado automaticamente pelo plugin do TanStack Router durante o
> build. Não precisa ser editado à mão.

## 8. Hospedagem: Cloudflare Pages/Workers

O build já sai com **alvo Cloudflare** por padrão — o nitro gera `wrangler.json` e
`.wrangler/deploy/config.json` sozinho, sem nenhuma configuração adicional. Isso confirma que o
site pode ser publicado na mesma conta Cloudflare que já hospeda o CRM (Worker + D1 + R2), que
você já paga.

Vantagens de concentrar tudo lá: uma infraestrutura só, CORS trivial entre site e CRM, domínio
gerenciado no mesmo lugar e independência total do Lovable.
