# Site institucional — Thiago Nunes Soluções Imobiliárias

Especificação e decisões de arquitetura da **plataforma imobiliária pública** (site de captação),
construída no Lovable e separada do CRM interno documentado em [ARQUITETURA.md](./ARQUITETURA.md).

- **Marca:** Thiago Nunes Soluções Imobiliárias
- **Corretor:** Thiago Nunes — CRECI 50.265
- **Região de atuação:** Fazenda Rio Grande/PR e Região Metropolitana de Curitiba
- **Objetivo:** gerar leads e apoiar a venda e a locação de imóveis

## Status

| Item | Situação |
| --- | --- |
| Projeto Lovable criado | Sim — `5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc` ("Prime Imóveis Online", nome automático a renomear) |
| Knowledge do projeto (regras permanentes do agente) | Configurado |
| Código gerado | **Pendente — workspace do Lovable sem créditos** |
| Publicação | Pendente |

Editor: https://lovable.dev/projects/5c6f97e6-bcf9-4a14-8c84-d894a3ee36cc

### Projeto anterior (não tocar)

Existe uma landing page antiga publicada em `https://thiagonunescorretorparana.lovable.app`
(projeto `c9ae44e5-e905-4b35-83ed-fc58feacbf6b`). Ela **não foi alterada**: a plataforma nova
nasceu em projeto separado para não derrubar o que já está no ar. A migração do domínio, quando
o site novo estiver aprovado, é uma troca de publicação — não exige refazer nada.

## Decisões de arquitetura

### 1. Projeto novo em vez de evoluir a landing page

A landing page existente é uma página única já publicada, com escopo e estrutura de conteúdo
diferentes. Reescrevê-la significaria deixar o site do ar em estado intermediário durante toda a
construção. Projeto novo isola o risco e permite comparar os dois antes de trocar o domínio.

### 2. Repository pattern na camada de dados

Nenhuma página importa dados diretamente. Tudo passa por `propertyRepository` e `leadRepository`,
com **todos os métodos assíncronos** desde o primeiro dia, mesmo lendo de arquivo estático.

Motivo: quando os imóveis passarem a vir do banco, troca-se apenas a implementação do repositório —
nenhuma página, componente ou filtro precisa mudar. Se as páginas lessem o array direto, cada tela
teria de ser reescrita na migração para backend.

### 3. Configuração centralizada em um único arquivo

`src/config/site.ts` concentra WhatsApp, telefone, e-mail, Instagram, endereço, nome da marca,
CRECI e URL do site. Nenhum componente pode ter esses valores hardcoded.

Motivo: trocar o número de WhatsApp precisa ser uma edição de uma linha, não uma caça em vinte
arquivos.

### 4. Querystring como fonte da verdade dos filtros

Em `/imoveis`, o estado dos filtros vive na URL (`?transacao=venda&cidade=...&quartos=3`),
validado com Zod. Não há estado de filtro escondido em componente.

Motivo: URLs de busca ficam compartriláveis por WhatsApp, indexáveis pelo Google e reproduzíveis —
o corretor pode mandar "todas as casas até R$ 400 mil em Fazenda Rio Grande" como link direto.

### 5. Leads com ponto de extensão pronto

`leads.repository.ts` grava o lead localmente, monta a mensagem de WhatsApp com os campos
preenchidos e tem a constante `LEAD_WEBHOOK_URL` (vazia por padrão). Preenchendo essa constante
com a URL do n8n, do CRM ou de um webhook, todo lead passa a ser enviado automaticamente em JSON,
sem mexer em nenhum formulário.

Motivo: o CRM próprio (Cloudflare Worker + D1) já tem a rota `POST /lead`. A integração é ligar
uma ponta na outra, e a arquitetura já está preparada para isso.

### 6. Dados de demonstração explicitamente marcados

Os imóveis de exemplo ficam num único arquivo (`src/data/properties.seed.ts`), todos com
`isDemo: true` e badge visível "Imóvel de demonstração" na interface. Removê-los é apagar um arquivo.

Motivo: o site precisa ser navegável antes de existir estoque real cadastrado, mas nenhum
visitante pode confundir imóvel de exemplo com imóvel disponível.

### 7. Nada inventado

Não há no site: número de imóveis vendidos, anos de experiência, depoimentos, avaliações, prêmios,
certificações, taxas de financiamento, prazos ou condições de crédito. Onde falta informação real,
existe uma variável de configuração com comentário `// CONFIRMAR`.

## Dados de contato configurados

Carregados do briefing do projeto Lovable anterior — **confirmar antes de publicar**:

| Campo | Valor | Observação |
| --- | --- | --- |
| WhatsApp | `5541998921475` | dígitos com DDI, usado em todos os CTAs |
| Telefone exibido | (41) 99892-1475 | |
| E-mail | bento_nunes22@hotmail.com | avaliar um e-mail comercial próprio |
| Instagram | @thiagonunes_corretor | o README do CRM cita `@thiago_nunes_corretor` — **confirmar qual é o correto** |
| Endereço | Rua Vitória, 706 — Fazenda Rio Grande/PR | oculto por padrão (`exibirEnderecoCompleto: false`); o site mostra só cidade/estado até a confirmação |

## Estrutura planejada

```
src/
  config/site.ts              # dados da marca — ÚNICO lugar a editar
  lib/
    whatsapp.ts               # URLs e mensagens por origem do lead
    format.ts                 # moeda BRL, área, data, máscaras
  types/property.ts           # tipos de domínio
  data/
    properties.seed.ts        # imóveis de DEMONSTRAÇÃO (descartável)
    properties.repository.ts  # acesso a imóveis (troca por banco sem mexer nas páginas)
    leads.repository.ts       # captura de leads + LEAD_WEBHOOK_URL
    posts.ts                  # artigos do blog
  components/
    layout/                   # Header, Footer, WhatsAppFloatingButton, MobileNav
    property/                 # PropertyCard, PropertyGrid, PropertyGallery, Filters, SearchBar
    forms/                    # LeadForm reutilizável
    seo/                      # Seo, StructuredData
    ui/                       # shadcn/ui
  routes/                     # TanStack Start (roteamento por arquivos)
    __root.tsx                # shell: header, footer, botão flutuante
    index.tsx                 # home
    imoveis/index.tsx         # listagem com filtros na URL
    imoveis/$slug.tsx         # detalhe do imóvel
    vender.tsx                # captação de imóveis
    investidores.tsx          # oportunidades para investidores
    financiamento.tsx         # apoio ao financiamento
    sobre.tsx
    blog/index.tsx
    blog/$slug.tsx
    contato.tsx
```

## Mensagens de WhatsApp por origem do lead

| Origem | Mensagem |
| --- | --- |
| Geral / botão flutuante | Olá Thiago, encontrei seu site e gostaria de receber informações sobre imóveis. |
| Card de imóvel ("Tenho interesse") | Olá Thiago, tenho interesse no imóvel código [CÓDIGO]. Gostaria de receber mais informações. |
| Página do imóvel | Olá Thiago, vi o imóvel código [CÓDIGO] no seu site e gostaria de saber mais. |
| Vender meu imóvel | Olá Thiago, gostaria de anunciar meu imóvel para venda. |
| Investidor | Olá Thiago, gostaria de receber oportunidades para investimento imobiliário. |
| Financiamento | Olá Thiago, gostaria de simular o financiamento do meu imóvel. |
| Comprar | Olá Thiago, quero comprar um imóvel em Fazenda Rio Grande e região. |

Os formulários anexam os campos preenchidos ao final da mensagem, então o lead chega qualificado.

## SEO

- URLs amigáveis com slug, `sitemap.xml` e `robots.txt`
- Meta title, meta description, canonical, Open Graph e Twitter Card por página
- JSON-LD: `RealEstateAgent` + `LocalBusiness` no site; `Residence` + `Offer` nos imóveis;
  `BreadcrumbList` na navegação; `BlogPosting` nos artigos
- Rotas de categoria com H1 e description próprios:
  `/casas-a-venda-fazenda-rio-grande`, `/apartamentos-fazenda-rio-grande`,
  `/terrenos-fazenda-rio-grande`
- Palavras-chave trabalhadas naturalmente: imóveis em Fazenda Rio Grande, casas à venda em Fazenda
  Rio Grande, terrenos em Fazenda Rio Grande, apartamentos em Fazenda Rio Grande, imobiliária
  Fazenda Rio Grande, corretor de imóveis Fazenda Rio Grande
- Blog com as categorias: Mercado imobiliário, Financiamento, Minha Casa Minha Vida, Investimentos
  imobiliários, Fazenda Rio Grande, Curitiba e região, Compra e venda de imóveis, Documentação
  imobiliária

## Painel administrativo — o que depende de backend

O painel (cadastrar, editar, excluir imóveis, alterar preços e status, marcar destaque, subir fotos,
ver leads) **exige backend**. Nada disso será simulado na interface: ou funciona de verdade, ou não
existe. Para funcionar é preciso configurar:

1. **Banco de dados** — tabelas `imoveis`, `fotos_imovel` e `leads`
2. **Autenticação** — login do administrador e proteção das rotas `/admin/*`
3. **Storage de imagens** — upload e redimensionamento das fotos dos imóveis
4. **Row Level Security** — leitura pública apenas de imóveis publicados; escrita só para o admin

Duas rotas possíveis, a decidir:

- **Backend nativo do Lovable (Supabase)** — mais rápido de configurar, integrado ao editor,
  RLS e storage prontos. Custo adicional de plano.
- **Reaproveitar o CRM já pago (Cloudflare Worker + D1 + R2)** — já existem tabela `imoveis`,
  bucket de fotos e autenticação JWT em produção. O site consumiria a API do Worker. Evita pagar
  uma segunda infraestrutura e mantém uma única fonte de verdade do estoque de imóveis, que é
  justamente o que um corretor autônomo precisa: cadastrar o imóvel uma vez só.

A camada de repositório foi desenhada para que qualquer uma das duas seja plugada sem reescrever
as telas.

## Próximos passos

1. Adicionar créditos no workspace do Lovable (https://lovable.dev/settings/billing)
2. Rodar as etapas de construção: fundação e imóveis → páginas de captação, blog e SEO →
   backend e painel administrativo → revisão de responsividade, links, formulários e navegação
3. Confirmar Instagram, e-mail comercial e se o endereço deve aparecer publicamente
4. Substituir os imóveis de demonstração pelo estoque real
5. Definir a rota do backend (Supabase do Lovable ou API do CRM na Cloudflare)
6. Publicar e apontar o domínio
