# Segundo cérebro no Obsidian

Guia de instalação e uso da skill **obsidian-second-brain** neste projeto e na
sua máquina.

## O que é

A skill faz o Claude tratar um cofre (*vault*) do Obsidian como memória de
trabalho: ele lê e escreve as notas sozinho. Em vez de reexplicar a cada
conversa quem é um lead, o que ficou combinado na negociação de um terreno ou
qual campanha já deu prejuízo, isso vira arquivo markdown no seu computador — e
o Claude consulta e atualiza esse arquivo quando o assunto voltar.

São 47 comandos de barra divididos em gestão do cofre, ferramentas de
pensamento, pesquisa e agentes agendados.

Origem: [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain),
versão 0.15.0, licença MIT (cópia em
[`.claude/skills/obsidian-second-brain/LICENSE`](./.claude/skills/obsidian-second-brain/LICENSE)).

## O que já está instalado

A skill completa está em `.claude/skills/obsidian-second-brain/`. Isso vale
**só para este repositório**: abrir o Claude Code na pasta do CRMTHIAGO já
ativa a skill, sem instalar nada.

Ficaram de fora da cópia, por serem peso morto que não afeta o funcionamento:
`media/` (GIFs de demonstração), `docs/` e `_includes/` (site do autor) e
`.github/` (workflows do repositório dele).

O `CLAUDE.md` dentro da pasta da skill é do autor original e trata de como
contribuir com o projeto dele — não vale para este repositório. As regras do
CRMTHIAGO seguem no [CLAUDE.md](./CLAUDE.md) da raiz.

## Deixar disponível em todos os projetos

A cópia acima não sai deste repositório. Para a skill valer em qualquer pasta
que você abrir no Claude Code, instale na sua máquina. Dois caminhos:

### Opção A — como plugin (recomendada)

Atualiza sozinha e não mexe em arquivo nenhum na mão. Dentro do Claude Code:

```
/plugin marketplace add eugeniughelbur/obsidian-second-brain
/plugin install obsidian-second-brain
```

### Opção B — instalador do autor

No terminal:

```bash
git clone https://github.com/eugeniughelbur/obsidian-second-brain ~/.claude/skills/obsidian-second-brain
cd ~/.claude/skills/obsidian-second-brain
bash install.sh
```

O `install.sh` cria links dos 47 comandos em `~/.claude/commands/`, aponta a
skill em `~/.claude/skills/` e registra um hook de `SessionStart` no seu
`~/.claude/settings.json`. Esse hook informa ao Claude onde a skill mora e, se a
sessão estiver dentro do cofre, carrega o manual `_CLAUDE.md` do cofre.

O instalador pergunta se você quer configurar o toolkit de pesquisa. **Responda
não** — veja "Cuidados" abaixo. Depois reinicie o Claude Code.

Para atualizar depois: `cd ~/.claude/skills/obsidian-second-brain && bash update.sh`.

## Criar o cofre do zero

Você ainda não usa Obsidian. Passo a passo:

1. Baixe o Obsidian em [obsidian.md](https://obsidian.md) (grátis para uso pessoal).
2. Abra e escolha **Create new vault**. Nome sugerido: `SegundoCerebro`.
   Guarde numa pasta que sincronize (OneDrive, Google Drive) para não perder se
   o computador morrer.
3. Anote o caminho da pasta e exporte a variável de ambiente antes de abrir o
   Claude Code:

   ```bash
   export OBSIDIAN_VAULT_PATH="/caminho/completo/do/SegundoCerebro"
   ```

   No Windows (PowerShell): `setx OBSIDIAN_VAULT_PATH "C:\Users\SeuUsuario\SegundoCerebro"`.

4. Abra o Claude Code dentro da pasta do cofre e rode:

   ```
   /obsidian-init
   ```

   Esse comando varre o cofre e gera o `_CLAUDE.md` (manual de operação do
   cofre), o `index.md` (catálogo de notas) e a pasta `Logs/`.

## Estrutura sugerida para corretor

A skill decide onde salvar cada nota lendo a tabela **Folder Map** do
`_CLAUDE.md` do cofre. Ela tem nomes padrão, mas essa tabela manda. Crie estas
pastas antes de rodar o `/obsidian-init` e depois confira se o Folder Map gerado
bate com elas:

| Pasta | Para quê |
|---|---|
| `People/` | Leads, clientes, proprietários, gerentes da Caixa, despachantes, parceiros |
| `Imoveis/` | Uma nota por imóvel captado: matrícula, bairro, valor, dono, pendências |
| `Projects/` | Campanhas, lançamentos, metas do trimestre |
| `Ideas/` | Ideias de post, roteiro de Reels, ganchos que funcionaram |
| `Knowledge/` | Regras de financiamento, ITBI, documentação, jurídico — o que você precisa consultar e não decorar |
| `Daily/` | Nota do dia: visitas, ligações, o que travou |
| `Tasks/` e `Boards/` | Tarefas e kanban |
| `Meetings/` | Visitas e reuniões |
| `Reviews/` | Fechamento de semana e de mês |

`Imoveis/` é pasta sua, não é padrão da skill. Para ela funcionar, o Folder Map
do `_CLAUDE.md` precisa citá-la explicitamente — peça isso ao Claude quando
rodar o `/obsidian-init`, ou edite a tabela depois.

## Comandos que valem no dia a dia

| Comando | O que faz |
|---|---|
| `/obsidian-save` | Salva no cofre o que valeu desta conversa |
| `/obsidian-capture` | Captura rápida de ideia, sem fricção |
| `/obsidian-person` | Cria ou atualiza a nota de uma pessoa a partir da conversa |
| `/obsidian-project` | Cria ou atualiza projeto e já joga no kanban e na nota do dia |
| `/obsidian-daily` | Nota do dia, puxando tarefas atrasadas e contexto |
| `/obsidian-task` | Joga uma tarefa no quadro certo, inferindo prioridade e prazo |
| `/obsidian-find` | Busca no cofre devolvendo o trecho, não só o nome do arquivo |
| `/obsidian-recap` | Resumo de um período: hoje, semana ou mês |
| `/obsidian-decide` | Registra uma decisão e o porquê dela |
| `/obsidian-review` | Fechamento de semana ou de mês a partir do histórico |
| `/obsidian-health` | Checagem do cofre: contradições, notas velhas, buracos |
| `/obsidian-brainstorm` | Brainstorm socrático, uma pergunta por vez, até fechar numa recomendação |
| `/idea-discovery` | Aponta 3 a 5 frentes que valem atenção agora |

A skill também age sozinha: quando a conversa produz algo que merece ser
guardado (uma decisão, uma pessoa nova, uma lição), ela salva sem você pedir.
Ela é conservadora — não apaga nem arquiva nada por conta própria.

## Cuidados

**Dados de cliente (LGPD).** O cofre vai acumular nome, telefone, endereço,
valor de negociação e matrícula de gente real. Vale a mesma regra do
[CLAUDE.md](./CLAUDE.md): é dado pessoal. Guarde o cofre em pasta sua, não
publique o cofre em repositório público e não jogue nota de lead em serviço de
terceiro.

**Toolkit de pesquisa.** Os comandos `/research`, `/research-deep`, `/x-read`,
`/x-pulse`, `/youtube`, `/notebooklm` e `/podcast` mandam o conteúdo da consulta
para APIs de fora (Grok/xAI, Perplexity, YouTube) e exigem chaves pagas. Eles
ficam desligados até você configurar as chaves. Se um dia ligar, não passe dado
de lead por eles — o `/research` é para pesquisar mercado, não cliente.

**Chaves de API.** As chaves ficam em `~/.config/obsidian-second-brain/.env`, na
sua máquina, fora deste repositório. Não commite esse arquivo.

## Atualizar a cópia deste repositório

A cópia em `.claude/skills/` congela na versão 0.15.0 e não se atualiza sozinha.
Para trazer uma versão nova:

```bash
# rode da raiz deste repositório
REPO=$(pwd)
DEST="$REPO/.claude/skills/obsidian-second-brain"

git clone --depth 1 https://github.com/eugeniughelbur/obsidian-second-brain /tmp/osb
rm -rf "$DEST" && mkdir -p "$DEST"
tar -C /tmp/osb --exclude=./.git --exclude=./media --exclude=./docs \
    --exclude=./_includes --exclude=./_config.yml --exclude=./.github -cf - . \
  | tar -C "$DEST" -xf -
rm -rf /tmp/osb
```

Se você instalou global pela Opção A, o plugin se atualiza sozinho e essa cópia
vira só um espelho versionado.
