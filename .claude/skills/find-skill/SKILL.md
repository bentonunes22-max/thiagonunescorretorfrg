---
name: find-skill
description: Encontra e instala Agent Skills prontas a partir de um catálogo local de ~590 skills vindas de 14 fontes (Anthropic oficial, ComposioHQ, vercel-labs, VoltAgent, awesome-lists), ranqueadas por confiança da fonte e estrelas no GitHub. Use quando o usuário pedir para achar, procurar, descobrir, recomendar ou instalar uma skill/habilidade para alguma tarefa — "tem alguma skill pra Docker?", "acha uma skill de testes", "instala a skill X", "quais skills existem pra design", "find a skill for...", "install skill owner/repo". Aceita parâmetros de limite, paginação, filtro por agente e categoria.
---

# find-skill — descobrir e instalar skills

Catálogo local, offline, com as skills públicas de 14 fontes. Busca primeiro no
catálogo empacotado; só vai à rede quando o catálogo está velho ou não encontra nada.

**Onde ficam os arquivos:** todos os caminhos abaixo são relativos à pasta desta
skill (a pasta que contém este `SKILL.md`). Chame-a de `$SKILL_DIR`. Se precisar
descobrir o caminho, use o do arquivo desta skill que já está carregado no contexto.

---

## Parâmetros aceitos

O usuário escreve em linguagem natural. Traduza o pedido para os parâmetros:

| Pedido | Parâmetro |
|---|---|
| `docker` | busca por palavra-chave, 5 resultados |
| "me mostra 10" | `--limite 10` |
| "próxima página" | `--pagina 2` |
| "mostra todas" | `--tudo` |
| "skill pro Cursor" | `--agente cursor` (ou `claude`, `codex`, `opencode`, `any`) |
| "as 20 mais populares" | `--top 20` |
| "quantas skills tem no catálogo" | `--stats` |
| "tudo de design" | `--categoria design` |

Padrões: `--limite 5`, `--pagina 1`, `--agente claude`.

Use `--agente any` para ver o catálogo inteiro, incluindo skills de outros agentes.

---

## Etapa 1 — Buscar

```bash
python3 "$SKILL_DIR/scripts/buscar.py" "<termo>" --limite 5
```

O script devolve JSON com `total`, `showing`, `page`, `total_pages`, `updated_at`
e a lista `results`. Cada resultado traz `name`, `description`, `source`,
`repo_url`, `stars` e `_trust` (nível de confiança já calculado).

**O catálogo é em inglês.** Traduza o termo antes de buscar: planilha →
`spreadsheet` ou `excel`, contrato → `contract`, imagem → `image`, apresentação →
`slides` ou `powerpoint`, testes → `test`, implantação → `deploy`. Se a primeira
busca vier vazia, tente sinônimos em inglês antes de dizer que não achou.

Se o pedido estiver vago ("acha uma skill boa"), pergunte **uma ou duas** coisas
antes de buscar: para qual tarefa, qual stack. Se estiver claro, busque direto.

---

## Etapa 2 — Apresentar os resultados

**Nunca instale sem confirmação.**

Até 5 resultados, formato compacto:

```
Achei N skills para "TERMO":

1. nome-da-skill  (RECOMENDADA)
   Fonte     : Anthropic — Oficial
   O que faz : descrição em uma ou duas frases
   Estrelas  : 105000
   Repo      : https://github.com/...

2. outra-skill
   Fonte     : SkillsMP — Marketplace, conferir o repo antes
   ...

Instalo alguma? (1, 2, todas, ou não)
```

6 ou mais resultados, use tabela com as colunas: #, Nome, Fonte, Confiança,
Estrelas, O que faz. No fim: `Página X de Y` e como pedir a próxima.

Os resultados já vêm ordenados por confiança da fonte e estrelas. Traduza a
descrição para português ao apresentar — o catálogo é em inglês.

**Sinalize o risco** quando a fonte for `SkillsMP` ou `Comunidade`: diga que o
repositório não passou por curadoria e que vale abrir o `SKILL.md` antes de instalar.

---

## Etapa 3 — Instalar (só depois do "sim")

Uma skill é uma pasta com `SKILL.md` dentro. Instalar é copiar essa pasta para o
diretório de skills do agente.

```bash
mkdir -p ~/.claude/skills
git clone --depth 1 <REPO_URL> /tmp/skill-tmp

# Acha o SKILL.md — pode estar na raiz ou em subpasta (monorepos de skills)
find /tmp/skill-tmp -maxdepth 4 -name SKILL.md
```

Com o `SKILL.md` localizado, copie a pasta que o contém:

```bash
cp -r "<pasta-do-SKILL.md>" ~/.claude/skills/<nome-da-skill>
rm -rf /tmp/skill-tmp

head -10 ~/.claude/skills/<nome-da-skill>/SKILL.md
```

Se o repositório tiver várias skills, pergunte qual antes de copiar.

**Escopo da instalação:**

| Destino | Caminho | Vale para |
|---|---|---|
| Usuário (todos os projetos) | `~/.claude/skills/<nome>/` | qualquer projeto na mesma máquina |
| Projeto | `.claude/skills/<nome>/` no repositório | só aquele projeto, e vai junto no git |
| Conta (todas as máquinas e sessões) | upload em claude.ai → Settings → Capabilities → Skills | tudo, inclusive Claude Code na web |

Em ambiente remoto/efêmero (Claude Code na web), `~/.claude/skills/` **some quando a
sessão acaba**. Se o usuário quer a skill valendo sempre, diga isso e ofereça o
caminho de conta ou o commit no repositório.

---

## Etapa 4 — Confirmar

Depois de instalar, diga:
1. Onde a skill foi parar.
2. Que é preciso reiniciar o agente para ele enxergar a skill nova.
3. Um exemplo concreto de uso no contexto do projeto atual.

---

## Catálogo: idade e atualização

O catálogo empacotado tem data em `updated_at` (veja com `--stats`). Se estiver
com mais de ~30 dias e o usuário reclamar de resultado velho ou faltando:

```bash
bash "$SKILL_DIR/scripts/atualizar-catalogo.sh"
```

O script reconstrói o catálogo em `~/.claude/skills/find-skill/catalogue.json`, e
`buscar.py` passa a usar o mais recente entre esse e o empacotado. Ele precisa de
rede para `api.github.com`, `raw.githubusercontent.com` e `skills.sh`; onde a
política de rede bloquear algum desses hosts, aquela fonte simplesmente vem vazia
e o resto do catálogo continua funcionando.

A fonte SkillsMP (busca ao vivo) exige chave gratuita de https://skillsmp.com:

```bash
mkdir -p ~/.claude/skills/find-skill
echo 'export SKILLSMP_API_KEY="smp_SUA_CHAVE"' >> ~/.claude/skills/find-skill/.env
chmod 600 ~/.claude/skills/find-skill/.env
```

Sempre faça `source` desse arquivo antes de usar a chave. Nunca dê `cat` nele nem
imprima a chave.

---

## Regras

- Nunca instalar sem confirmação explícita.
- Catálogo local primeiro; rede só quando necessário.
- 5 resultados por padrão; tabela a partir de 6.
- Avisar quando a fonte for de baixa confiança.
- Prioridade das fontes: Anthropic > skills.sh > hesreallyhim > ComposioHQ >
  vercel-labs > VoltAgent > travisvn > BehiSecc > alirezarezvani > heilcheng >
  daymade > mxyhi > SkillsMP.
- Skill instalada roda código no ambiente do agente. Em repositório com dados de
  cliente, revise o `SKILL.md` antes de instalar de fonte não curada.

---

## Origem

Adaptação de [fockus/claude-skill-find-skill](https://github.com/fockus/claude-skill-find-skill)
(MIT). Detalhes do que mudou em `ORIGEM.md`.
