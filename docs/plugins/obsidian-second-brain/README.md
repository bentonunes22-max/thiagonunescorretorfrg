# Plugin obsidian-second-brain

Plugin do Claude Code que transforma um vault do Obsidian em memória pesquisável
pelo Claude: as notas se reescrevem quando chega informação nova, contradições
são reconciliadas e fatos velhos ficam marcados como desatualizados.

- Origem: [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain)
- Versão declarada no upstream: `0.15.0` (commit `d631fd6`, 2026-09-06)
- Licença: MIT — cópia em [LICENSE](./LICENSE)

## Como está instalado neste repositório

O plugin **não foi copiado** para cá. O que existe é a declaração em
`.claude/settings.json`, na raiz do projeto:

```json
{
  "extraKnownMarketplaces": {
    "obsidian-second-brain": {
      "source": {
        "source": "github",
        "repo": "eugeniughelbur/obsidian-second-brain"
      }
    }
  },
  "enabledPlugins": {
    "obsidian-second-brain@obsidian-second-brain": true
  }
}
```

Com isso, ao abrir este repositório no Claude Code e confiar na pasta do
projeto, o marketplace é registrado e o plugin é baixado e ativado sozinho — sem
precisar rodar `/plugin marketplace add` e `/plugin install` na mão. O download
vem sempre do repositório original, então `/plugin update obsidian-second-brain`
continua funcionando normalmente.

Detalhe importante: `extraKnownMarketplaces` só passa a valer **depois** que a
pasta do projeto é marcada como confiável. Antes disso o Claude Code ignora a
chave e nenhum comando do plugin aparece.

## O que precisa ser configurado na máquina

1. **Caminho do vault.** O plugin não sabe onde ficam suas notas. Defina no
   `~/.claude/settings.json` (arquivo pessoal, fora deste repositório):

   ```json
   "env": { "OBSIDIAN_VAULT_PATH": "/caminho/para/o/seu/vault" }
   ```

2. **`uv` instalado.** O servidor MCP `vault`, que o plugin registra sozinho,
   sobe com `uv run`. Sem o `uv` no PATH, os comandos que leem/escrevem no vault
   falham.

3. **Reiniciar o Claude Code** e rodar `/obsidian-second-brain:obsidian-init`
   dentro do vault, uma única vez, para criar a estrutura de pastas.

4. **Chaves de pesquisa (opcional).** Sete comandos de pesquisa (`/x-read`,
   `/x-pulse`, `/research`, `/research-deep`, `/notebooklm`, `/youtube`,
   `/podcast`) usam APIs pagas de terceiros (xAI, Perplexity, Gemini, YouTube).
   As chaves vão em `~/.config/obsidian-second-brain/.env` — nunca neste
   repositório.

## Comandos

São 47 comandos, todos com prefixo do plugin: `/obsidian-second-brain:<nome>`.
Digite `/obsidian-second-brain:` no Claude Code para ver a lista. Os mais úteis
no dia a dia da corretagem:

| Comando | Para quê |
| --- | --- |
| `obsidian-capture` | Jogar uma informação solta no vault sem parar o que está fazendo |
| `obsidian-save` | Salvar o que saiu da conversa atual como nota |
| `obsidian-daily` | Nota do dia (visitas, ligações, o que andou) |
| `obsidian-person` | Ficha de pessoa (proprietário, parceiro, cliente) |
| `obsidian-project` | Acompanhar uma captação/negociação como projeto |
| `obsidian-decide` | Registrar uma decisão e o porquê dela |
| `obsidian-find` | Achar o que já foi anotado |
| `obsidian-recap` | Resumo do que aconteceu no período |
| `obsidian-health` | Checagem de saúde do vault (notas órfãs, links quebrados) |

## Cuidado com dados de cliente (LGPD)

O vault é um arquivo local, e o plugin escreve nele sozinho. Vale a mesma regra
do [CLAUDE.md](../../../CLAUDE.md): nome, telefone, endereço, valor de
negociação e matrícula são dados pessoais de gente real.

- A base oficial de leads e clientes continua sendo o D1 do CRM. O vault serve
  para conhecimento e contexto de trabalho, não para virar um segundo cadastro
  de clientes.
- Se o vault estiver em pasta sincronizada (iCloud, Drive, Obsidian Sync), esses
  dados saem do computador. Decida isso conscientemente antes de anotar.
- Os comandos de pesquisa mandam o texto do prompt para APIs de terceiros. Não
  cole dado de cliente neles.

## Hooks que o plugin traz

O plugin registra três hooks próprios:

- `SessionStart` — carrega contexto do vault no início da sessão.
- `PostToolUse` — valida as regras de escrita depois de Write/Edit.
- `PostCompact` — agente de manutenção em segundo plano. Vem **inerte**; só roda
  se for armado manualmente (ver `hooks/postcompact.hook.example.json` no
  repositório original).

Como o plugin fica ativo neste projeto, esses hooks rodam também nas sessões
abertas aqui dentro, não só dentro do vault. Se atrapalhar o trabalho no CRM,
desative o plugin com `/plugin` ou trocando `enabledPlugins` para `false` em
`.claude/settings.json`.
