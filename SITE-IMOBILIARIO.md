# Site Imobiliário — Thiago Nunes Soluções Imobiliárias

Plataforma imobiliária pública (catálogo de imóveis + captação de leads), construída no **Lovable**.
Não confundir com o **CRMTHIAGO** (ver [README.md](./README.md)): o CRM é a ferramenta interna de
gestão; este site é a vitrine pública que alimenta o CRM com leads.

| | |
|---|---|
| **Projeto Lovable** | `Prime Imóveis Online` — `5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc` |
| **Editor** | https://lovable.dev/projects/5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc |
| **Preview** | https://id-preview--5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc.lovable.app |
| **Publicado** | ❌ ainda não — falta publicar e apontar o domínio |
| **Stack** | TanStack Start (SSR) + React + TypeScript + Tailwind + shadcn/ui |

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

### 🔴 1. Botão flutuante cobre o CTA da página de imóvel no celular

`src/components/layout/WhatsAppFloatingButton.tsx` recebe uma prop `offsetBottom` criada
exatamente para subir o botão quando a página tem barra fixa inferior. Mas em
`src/routes/__root.tsx` ele é renderizado como `<WhatsAppFloatingButton />`, **sem a prop** —
ou seja, o recurso existe e nunca é acionado.

Efeito: na página de detalhe do imóvel, no celular, o botão flutuante fica por cima do botão
"Falar no WhatsApp" da barra fixa — justamente o CTA mais importante do site.

*Correção:* o botão precisa saber se a rota atual tem barra fixa (ou a página de imóvel precisa
renderizar sua própria versão do botão com `offsetBottom`).

### 🔴 2. WhatsApp pode não abrir no iPhone após enviar formulário

`src/components/forms/LeadForm.tsx` chama `window.open(whatsappUrl, "_blank")` **depois** de um
`await leadRepository.createLead(...)`. Como a chamada sai do contexto do clique do usuário, o
Safari no iOS costuma bloquear a abertura como pop-up.

Efeito: a pessoa preenche o formulário inteiro, vê a mensagem de sucesso e o WhatsApp não abre.
Lead perdido.

*Correção:* montar a URL e disparar a navegação de forma síncrona no submit, ou mostrar um link
visível "Abrir WhatsApp" como plano B caso a janela seja bloqueada.

### 🟡 3. Painel administrativo não foi implementado

Não existe rota `/admin`. A arquitetura está preparada (repository pattern isola a fonte de
dados), mas a tela em si não foi criada.

Para funcionar de verdade — cadastrar imóvel, alterar preço, subir foto, marcar destaque, ver
leads — o painel depende de **autenticação e backend**. O CRM já tem os dois (JWT + D1 + R2), então
o caminho mais barato é o painel do site consumir a API autenticada do Worker em vez de criar
login e banco novos.

### 🟡 4. Depoimentos aprovados ainda não estão no site

Você autorizou reaproveitar os depoimentos da Roseli e do Valdeci (do projeto anterior). Eles
ainda não foram incluídos. Devem entrar num arquivo de configuração editável, não escritos
dentro de um componente.

### 🟡 5. `robots.txt` aponta para um domínio que ainda não existe

`public/robots.txt` traz `Sitemap: https://thiagonunesimoveis.lovable.app/sitemap.xml`, e
`src/config/site.ts` usa a mesma URL. Nenhuma das duas é o domínio final. Precisam ser
atualizadas juntas na hora de publicar — é o único lugar do projeto onde uma URL aparece fora
do arquivo de configuração, porque `robots.txt` é um arquivo estático.

### 🟡 6. Sem imagem padrão de compartilhamento

Só as páginas de imóvel e do blog têm `og:image`. Home, `/vender`, `/investidores` e as demais
compartilham no WhatsApp e no Instagram sem imagem. Falta definir uma imagem padrão no
`src/config/site.ts` e usá-la como fallback.

### 🟡 7. Detalhe no Schema.org

Em `src/components/seo/seo.ts`, o campo `slogan` do JSON-LD recebe a localização
(`"Fazenda Rio Grande – PR"`) em vez do slogan da marca.

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

- [ ] Remover ou substituir os 12 imóveis de demonstração
- [ ] Corrigir os bugs 🔴 1 e 2
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

> As correções dos itens 🔴 1 e 2 já estão escritas e prontas para aplicar em
> [CORRECOES-PENDENTES.md](./CORRECOES-PENDENTES.md) — sem gastar créditos.

## 6. Estado dos créditos do Lovable

O workspace (`thiago's Lovable`, plano **free**) está **sem créditos**. As correções dos itens
acima precisam ser feitas pelo agente do Lovable, o que exige créditos ou upgrade de plano:
https://lovable.dev/settings/billing

Enquanto isso, o código pode ser lido e revisado normalmente — só não pode ser alterado pelo
agente.
