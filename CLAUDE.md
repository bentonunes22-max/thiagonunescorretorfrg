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

## Convenções de trabalho

Desenvolva em branch, nunca direto na `main`. Abra o PR como rascunho.

Ao mexer no CRM, atualize o `CHANGELOG.md` na mesma alteração, seguindo o
padrão de versão de interface já usado (`v8_6`, `v8_5`, etc.).

Quando adicionar uma dependência externa ao repositório (uma skill, um
servidor MCP), mantenha junto a licença original e cite a origem no `README.md`.
