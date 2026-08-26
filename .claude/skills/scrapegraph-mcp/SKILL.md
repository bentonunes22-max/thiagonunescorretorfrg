---
name: scrapegraph-mcp
description: Configuração e uso do servidor MCP scrapegraph-mcp (ScrapeGraphAI) neste projeto (CRMTHIAGO), que dá a Claude acesso a scraping estruturado de páginas web via IA. Use esta skill sempre que o usuário pedir para raspar/extrair dados de imóveis ou anúncios de concorrentes em portais imobiliários, monitorar preços/anúncios de concorrentes, coletar dados estruturados de uma URL ou site, ou mencionar "scraping", "raspagem de dados", "scrapegraph", ou o robô/tabelas apify_leads e apify_sync_log citados em ARQUITETURA.md — mesmo que o usuário não peça explicitamente por "MCP" ou pelo nome do servidor. Também use quando o usuário pedir para configurar, revisar ou depurar a integração MCP deste repositório.
---

# scrapegraph-mcp — scraping estruturado via MCP

## O que é

Este repositório declara em `.mcp.json` (raiz do projeto) o servidor MCP
**scrapegraph-mcp**, da ScrapeGraphAI. Ele expõe ferramentas de scraping
com IA que recebem uma URL (ou HTML) e um objetivo em linguagem natural e
devolvem dados já estruturados (JSON), sem precisar escrever parser/regex
específico para cada site.

Config atual (`.mcp.json`):

```json
{
  "mcpServers": {
    "scrapegraph-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote@latest",
        "https://mcp.scrapegraphai.com/mcp",
        "--header",
        "X-API-Key:${SCRAPEGRAPH_API_KEY}"
      ]
    }
  }
}
```

A chave de API **não fica hardcoded** no arquivo — ela vem da variável de
ambiente `SCRAPEGRAPH_API_KEY`, resolvida pelo Claude Code no momento em
que o servidor MCP é iniciado.

## Quando usar

Este CRM (ver [README.md](../../../README.md) e
[ARQUITETURA.md](../../../ARQUITETURA.md)) já tem um robô de scraping de
concorrentes em portais imobiliários, com dados armazenados em
`apify_leads`/`apify_sync_log` no D1. O `scrapegraph-mcp` é a ferramenta a
usar sempre que a tarefa envolver:

- Extrair dados de um anúncio/imóvel de um portal (preço, endereço, m²,
  fotos, descrição) a partir de uma URL.
- Monitorar concorrentes: comparar preços, verificar se um anúncio ainda
  está no ar, listar novos anúncios de uma busca.
- Qualquer pedido de "raspar", "coletar", "extrair" ou "puxar" dados de um
  site/URL para estruturar em JSON/planilha/banco.
- Investigar ou evoluir o robô existente (`apify_leads`) — este MCP é uma
  alternativa/complemento ao Apify já em uso.

Não é a ferramenta certa para páginas que exigem login/sessão autenticada
complexa ou automação de ações (clicar, preencher formulário) — para isso,
seria necessário um servidor MCP diferente (ex.: automação de navegador).

## Como configurar (antes de usar)

1. Obter uma API key em https://scrapegraphai.com/.
2. Definir a variável de ambiente `SCRAPEGRAPH_API_KEY` no ambiente onde o
   Claude Code roda (shell local, secrets do CI, ou configuração do
   ambiente remoto/Cowork) — **nunca** colar a chave direto no
   `.mcp.json` nem em commits.
3. Abrir/reiniciar o Claude Code neste repositório. O `mcp-remote` cuida
   da autenticação via `npx` na hora que a sessão inicia; não é preciso
   instalar nada manualmente.
4. Se as ferramentas do `scrapegraph-mcp` não aparecerem, verificar:
   - se `SCRAPEGRAPH_API_KEY` está mesmo definida no ambiente da sessão;
   - se há acesso de rede de saída para `mcp.scrapegraphai.com` (ver nota
     sobre proxy de saída no ambiente remoto, se aplicável);
   - os logs de inicialização de MCP do Claude Code para erros do
     `mcp-remote`.

## Ao usar as ferramentas do servidor

- Descreva o objetivo da extração em linguagem natural e clara (ex.: "do
  anúncio nesta URL, extraia preço, endereço, área em m² e número de
  fotos") — o scrapegraph-mcp interpreta o pedido, não precisa de
  seletor CSS/XPath.
- Sempre confira o JSON retornado antes de gravar no CRM (D1) ou em
  qualquer planilha/relatório: campos ausentes ou nulos costumam indicar
  que a página mudou de estrutura ou bloqueou o acesso.
- Para várias URLs (ex.: uma lista de concorrentes), prefira rodar uma
  extração por vez e registrar/agregar os resultados, em vez de tentar
  processar um lote inteiro em uma única chamada.
- Respeite os termos de uso dos portais e o volume de requisições — este
  MCP é para extração pontual/monitoramento, não para scraping em massa
  sem controle de taxa.
