# Instruções para o Claude Code — CRMTHIAGO

## Idioma

Responda sempre em português do Brasil, em qualquer situação: explicações,
perguntas, resumos, mensagens de commit, títulos e descrições de PR,
comentários no GitHub e comentários no código. Não troque para inglês nem
quando a pergunta vier em inglês ou quando o contexto técnico for em inglês.

Termos técnicos consagrados (commit, branch, deploy, worker, lead, follow-up)
podem ficar em inglês. O texto ao redor deles, não.

## O que é este repositório

Documentação e versionamento do CRM imobiliário de Thiago Nunes (CRECI-PR
50.265), corretor autônomo em Fazenda Rio Grande/PR.

O sistema roda em produção 100% na Cloudflare (Worker + D1 + R2) e **não é
publicado a partir deste repositório**. Nada aqui é deployado. Alterar um
arquivo daqui não muda nada no ar.

Consequência prática: quando o pedido envolver mudar o comportamento do CRM
em produção, avise que a alteração precisa ser aplicada no painel da
Cloudflare (ou no `worker.js` publicado), e não apenas neste repositório.

Contexto técnico completo em [ARQUITETURA.md](./ARQUITETURA.md), histórico de
versões em [CHANGELOG.md](./CHANGELOG.md) e visão geral em
[README.md](./README.md). Leia esses arquivos antes de responder qualquer
coisa sobre a arquitetura, em vez de supor como o sistema funciona.

## Parâmetros de viabilidade — incorporação e condomínios

Regra fixa do Thiago, válida para **todo** estudo de projeto de apartamentos,
condomínio ou incorporação: o preço do terreno tem de equivaler de **14% a 20%
do VGV**, sendo 20% o teto máximo. Aplique isso sem precisar ser lembrado
sempre que aparecer um terreno com estudo de projeto.

VGV (Valor Geral de Vendas) = soma do preço de venda de todas as unidades do
empreendimento, a preço de mercado da região.

Leitura do percentual (preço do terreno ÷ VGV):

- **até 14%** — terreno bem comprado, folga na margem;
- **14% a 20%** — faixa de trabalho, viabilidade normal;
- **acima de 20%** — reprovar. Ou o preço do terreno cai até caber na faixa,
  ou o VGV sobe (mais unidades, produto melhor, outro padrão) para o
  percentual voltar ao teto. Não siga com o estudo tratando isso como
  detalhe: avise que estourou.

Em qualquer análise, mostre o cálculo e os dois números de referência:

- preço máximo admissível do terreno = VGV × 0,20;
- preço confortável = VGV × 0,14.

Em negociação por permuta, converta a permuta em dinheiro (unidades ofertadas
× preço de venda) antes de calcular o percentual — o que vale é o custo real
do terreno dentro do VGV, não a forma de pagamento.

## Dados de clientes e leads

Os dados que circulam neste projeto são reais: nomes, telefones, endereços,
valores de negociação e matrículas de imóveis de pessoas. Trate como dado
pessoal sujeito à LGPD.

Não cole dados de leads ou clientes em serviços externos (incluindo
ferramentas de scraping ou APIs de terceiros) sem que Thiago peça de forma
explícita. Se for necessário um exemplo em documentação, use dados fictícios.

## Segredos

Chaves de API ficam em variáveis de ambiente, nunca no repositório. O
`.mcp.json` referencia `${SCRAPEGRAPH_API_KEY}` justamente por isso.

Antes de commitar, confira o que entrou no stage. Se aparecer token, senha,
chave ou string longa de aparência aleatória, pare e pergunte.

## Skills deste repositório

- `.claude/skills/scrapegraph-mcp/` — scraping estruturado de portais
  imobiliários via MCP da ScrapeGraphAI. Use para monitorar anúncios e preços
  de concorrentes.
- `.claude/skills/humanizer/` — reescreve texto com cara de IA para soar
  natural. Use antes de enviar qualquer texto gerado por IA a um lead ou
  cliente: respostas da recepcionista "Fernanda" no WhatsApp, textos de
  proposta, mensagens de follow-up e disparo em massa.
- `.claude/skills/carrossel-instagram/` — gera carrossel de Instagram (HTML
  renderizado como PNG pelo MCP `playwright`). Antes do Gate 1, leia sempre
  `references/marca-thiago.md`: ele fixa formato, paletas, fontes, CTA com
  CRECI e as regras de conteúdo do imobiliário, e evita perguntar identidade
  visual a cada post. PNG de carrossel não entra neste repositório.

## Convenções de trabalho

Desenvolva em branch, nunca direto na `main`. Abra o PR como rascunho.

Ao mexer no CRM, atualize o `CHANGELOG.md` na mesma alteração, seguindo o
padrão de versão de interface já usado (`v8_6`, `v8_5`, etc.).

Quando adicionar uma dependência externa ao repositório (uma skill, um
servidor MCP), mantenha junto a licença original e cite a origem no `README.md`.
