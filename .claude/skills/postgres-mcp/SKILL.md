---
name: postgres-mcp
description: Configuração e uso do servidor MCP postgres (Postgres MCP Pro, da Crystal DBA) neste projeto (CRMTHIAGO), que dá a Claude acesso de consulta e análise a um banco PostgreSQL. Use esta skill sempre que o usuário pedir para consultar, analisar ou depurar um banco PostgreSQL, rodar SQL em Postgres, ver esquema/tabelas/índices de um Postgres, investigar consulta lenta ou saúde do banco, ou mencionar "postgres", "postgresql", "DATABASE_URI" ou "MCP de banco de dados" — mesmo sem citar o nome do servidor. Use também quando pedir para configurar, revisar ou depurar essa integração MCP. Atenção: o banco de produção do CRM é o D1 (SQLite) na Cloudflare, não PostgreSQL — este servidor não enxerga o D1.
---

# postgres — consulta e análise de PostgreSQL via MCP

## O que é

Este repositório declara em `.mcp.json` (raiz do projeto) o servidor MCP
**postgres**, que roda o [Postgres MCP Pro](https://github.com/crystaldba/postgres-mcp)
(pacote `postgres-mcp`, da Crystal DBA, licença MIT). Ele conecta o Claude
a um banco PostgreSQL e expõe nove ferramentas:

| Ferramenta | Para que serve |
| --- | --- |
| `list_schemas` | lista os schemas do banco |
| `list_objects` | lista tabelas, views e sequences de um schema |
| `get_object_details` | colunas, tipos, chaves e índices de um objeto |
| `execute_sql` | roda SQL (em modo `restricted`, só leitura) |
| `explain_query` | plano de execução de uma consulta |
| `analyze_query_indexes` | sugere índices para consultas específicas |
| `analyze_workload_indexes` | sugere índices olhando a carga do banco |
| `analyze_db_health` | saúde geral: bloat, índices ociosos, conexões, cache |
| `get_top_queries` | consultas mais lentas/caras (precisa de `pg_stat_statements`) |

Config atual (`.mcp.json`):

```json
{
  "postgres": {
    "command": "uvx",
    "args": [
      "--with",
      "mcp<2",
      "postgres-mcp@0.3.0",
      "--access-mode=restricted"
    ],
    "env": {
      "DATABASE_URI": "${DATABASE_URI}"
    }
  }
}
```

Três detalhes dessa configuração são propositais:

- **`--access-mode=restricted`** — modo somente leitura com proteções. Um
  `SELECT` passa; `DELETE`, `UPDATE`, `DROP` e afins são recusados pelo
  próprio servidor. É o padrão deste projeto porque o banco tem dado real
  de cliente (LGPD). Só troque para `unrestricted` se o Thiago pedir de
  forma explícita, e nunca contra um banco de produção sem backup.
- **`--with mcp<2`** — o `postgres-mcp` 0.3.0 ainda usa a API `FastMCP` do
  SDK `mcp` 1.x. Sem esse pino, o `uvx` instala o `mcp` 2.x e o servidor
  quebra no start com `ModuleNotFoundError: No module named
  'mcp.server.fastmcp'`. Se um dia sair uma versão do `postgres-mcp`
  compatível com o SDK 2.x, dá para subir a versão e remover o pino.
- **`postgres-mcp@0.3.0`** — versão fixa, para a sessão não mudar de
  comportamento sozinha quando sair release novo.

A string de conexão **não fica no arquivo** — vem da variável de ambiente
`DATABASE_URI`, resolvida na hora que a sessão inicia. Ela contém usuário e
senha do banco; nunca comite isso.

## Atenção: o CRM não roda em PostgreSQL

O banco de produção do CRMTHIAGO é o **D1 da Cloudflare** (SQLite), ver
[ARQUITETURA.md](../../../ARQUITETURA.md). Este servidor MCP **não** enxerga
o D1 e não substitui as ferramentas Cloudflare. Para consultar o banco do
CRM, use o MCP da Cloudflare (`d1_database_query`) ou o painel da
Cloudflare.

Use o MCP `postgres` quando a tarefa envolver um Postgres de verdade, por
exemplo:

- um banco auxiliar de marketing/scraping hospedado fora da Cloudflare
  (Supabase, Neon, Render, VPS);
- o Postgres do n8n ou da Evolution API, no fluxo da recepcionista
  "Fernanda";
- um teste do briefing full-stack Opção B (Node/Express + PostgreSQL), que
  segue descartado por ora;
- qualquer migração futura de dado do CRM para Postgres.

## Como configurar (antes de usar)

1. Ter o `uv`/`uvx` instalado ([astral.sh/uv](https://docs.astral.sh/uv/)).
   O `uvx` baixa o `postgres-mcp` sozinho na primeira execução; não precisa
   instalar o pacote na mão.
2. Definir `DATABASE_URI` no ambiente onde o Claude Code roda, no formato
   `postgresql://usuario:senha@host:5432/nome_do_banco`. Em shell local,
   secrets do CI ou configuração do ambiente remoto — **nunca** dentro do
   `.mcp.json` nem em commit.
3. Sempre que possível, aponte para um **usuário de banco somente leitura**.
   O `--access-mode=restricted` já barra escrita, mas uma permissão restrita
   no próprio Postgres é a segunda trava.
4. Abrir/reiniciar o Claude Code neste repositório e aprovar o servidor.
5. Se as ferramentas não aparecerem, verificar:
   - se `DATABASE_URI` está definida na sessão e se a senha tem caractere
     especial que precise de encoding na URL (`@`, `/`, `#`);
   - se o host do banco aceita conexão da máquina/ambiente (firewall, IP
     liberado, `sslmode=require` em bancos gerenciados);
   - se o `uvx` conseguiu baixar os pacotes (rede de saída/proxy);
   - os logs de inicialização de MCP do Claude Code.

## Ao usar as ferramentas do servidor

- Comece por `list_schemas` e `list_objects` antes de escrever SQL — não
  presuma nomes de tabela.
- `execute_sql` em modo `restricted` recusa escrita. Se a resposta vier
  como `Error validating query`, não é bug: é a trava fazendo o trabalho
  dela. Peça confirmação ao Thiago antes de cogitar modo irrestrito.
- Sempre use `LIMIT` em consulta exploratória: banco de lead pode ter
  volume grande e a resposta inteira volta para o contexto.
- Dado de cliente é dado pessoal (LGPD). Não jogue resultado de consulta em
  serviço externo, e em exemplo de documentação use dado fictício.
- Para consulta lenta: `explain_query` primeiro, `analyze_query_indexes`
  depois. Sugestão de índice é sugestão — o `CREATE INDEX` é decisão do
  Thiago e não passa por este servidor em modo `restricted`.
- `get_top_queries` exige a extensão `pg_stat_statements` habilitada no
  banco; sem ela a ferramenta avisa e não retorna nada.

## Licença e origem

`postgres-mcp` (Postgres MCP Pro) — Crystal Corp., licença MIT. Cópia da
licença em [LICENSE](./LICENSE). Código-fonte:
https://github.com/crystaldba/postgres-mcp
