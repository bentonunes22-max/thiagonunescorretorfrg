# Marca — Thiago Nunes Corretor

Preset fixo deste repositório. Aplique **sem perguntar** em todo carrossel,
salvo quando o Thiago pedir explicitamente outra coisa. Isso existe pra ele
não ter que reconfigurar identidade a cada post.

## Identidade

| Campo | Valor |
|-------|-------|
| Nome | Thiago Nunes |
| Profissão | Corretor de imóveis autônomo |
| Registro | CRECI-PR 50.265 |
| Região | Fazenda Rio Grande / Região Metropolitana de Curitiba — PR |
| @handle | `@thiago_nunes_corretor` |
| Posicionamento | Corretor da região, que explica o processo em vez de só anunciar imóvel |

## Formato padrão

**4:5 (1080×1350)** para todo carrossel, salvo pedido contrário. É o formato que
ocupa mais tela no feed do Instagram. Use 1:1 só quando o mesmo material for
reaproveitado fora do Instagram.

Quantidade padrão: **6 a 8 slides** (capa + 4 a 6 de conteúdo + CTA).

## Paletas

Não proponha as 10 paletas do `palettes.md`. Proponha estas três, na ordem, e
diga qual você recomenda pro tema em questão:

1. **Navy / Profissional** — padrão da marca. Autoridade e confiança. Use em
   financiamento, documentação, tira-dúvidas, comparativos, estudo de caso.
2. **Forest / Growth** — dinheiro e crescimento. Use em investimento, valorização
   de bairro, "vale a pena comprar em X", rendimento de aluguel.
3. **Charcoal / Editorial** — sóbria. Use em conteúdo denso, jurídico, alerta de
   golpe, análise de mercado.

Fora dessas três, só com pedido do Thiago.

## Fontes

Combinação padrão: **Bebas Neue** (headline) + **Caveat** (accent) + **Inter** (body).
É a combinação 1 do `fonts-config.md`, versátil e legível em tela pequena.

Se o tema for mais técnico ou de mercado, a combinação 2 (**Oswald** + **Space
Grotesk**) é aceitável — proponha, não troque sozinho.

## Efeito de headline

Padrão: **Clean + Shadow** (efeito 6 do `headline-effects.md`). Vende confiança,
que é o ativo de corretor.

Exceções, quando o template for VIRAL (Polêmica, Revelação, Trends):
**Dupla Camada** (efeito 2). Nunca Neon Glow, Metálico ou Fogo/Lava — descem o
tom pra "curso de internet" e derrubam a autoridade de corretor.

## CTA — slide final

O último slide sempre fecha com:

- Chamada de ação direta ("Me chama no direct", "Manda um oi que eu te respondo")
- `@thiago_nunes_corretor`
- `CRECI-PR 50.265`
- Menção à região (Fazenda Rio Grande e região)

Nunca prometa retorno em prazo específico ("respondo em 5 minutos") no slide.

## Regras de conteúdo específicas de corretor

Estas valem por cima das regras gerais do `SKILL.md`:

1. **CRECI visível.** O número aparece no slide final de todo carrossel. É
   exigência do CRECI para publicidade imobiliária, não enfeite.
2. **Não prometa aprovação de financiamento.** "Simula com a Caixa", "dá pra
   verificar se você se enquadra" — nunca "você consegue", "aprovação garantida"
   ou taxa apresentada como certa. Taxa/faixa muda; se citar número, diga a data
   da referência.
3. **Não invente número de mercado.** Preço de bairro, valorização e ticket médio
   só entram no slide se vierem de dado real (base do CRM, portal, IBGE, tabela
   da Caixa). Sem fonte, o slide não usa número.
4. **LGPD.** Nunca use nome, telefone, foto de documento, matrícula ou valor de
   negociação de cliente real num slide. Caso real vira caso anonimizado
   ("comprador de 32 anos, primeira casa"), sem foto que identifique a pessoa.
5. **Foto de imóvel só com autorização** do proprietário para divulgação. Na
   dúvida, pergunte ao Thiago antes de colocar no carrossel.
6. **Humanizer obrigatório.** A skill `humanizer` roda em toda a copy antes do
   Gate 2 fechar — inclusive na caption e no CTA. Corretor que escreve como
   robô perde lead.
7. **Português de Fazenda Rio Grande, não de São Paulo.** "Financiamento",
   "entrada", "parcela", "sair do aluguel". Sem "solução imobiliária",
   "portfólio de ativos", "curadoria de imóveis".

## Templates que mais servem pro Thiago

Do `references/templates.md`, priorize:

| Template | Uso típico no imobiliário |
|----------|---------------------------|
| 2 — Tutorial / How-to | "Como usar o FGTS na entrada", "Passo a passo do financiamento Caixa" |
| 3 — Estudo de Caso | "Como o comprador saiu do aluguel em 60 dias" (anonimizado) |
| 4 — Listicle | "5 erros de quem compra o primeiro imóvel" |
| 6 — Comparativo | "Alugar x financiar em Fazenda Rio Grande" |
| 8 — Polêmica / Hot Take | "Esperar a taxa cair pra comprar é furada" — use com moderação |
| 1 — Revelação | Lançamento ou imóvel novo captado |

Template 9 (Ferramenta / Stack) raramente serve — é template de nicho tech.

## Onde salvar

PNGs e `roteiro.md` vão para uma pasta datada fora deste repositório
(ex.: `~/carrosseis/AAAA-MM-DD-tema/`). **Não commite PNG de carrossel aqui** —
este repositório é documentação do CRM, não acervo de mídia.
