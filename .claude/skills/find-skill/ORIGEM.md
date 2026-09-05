# Origem e licença

Esta skill é uma adaptação de
**[fockus/claude-skill-find-skill](https://github.com/fockus/claude-skill-find-skill)**,
versão 1.0.1, commit `74c2a4d`.

## Licença

MIT, declarada em `pyproject.toml` do projeto original
(`license = "MIT"` e o classifier `License :: OSI Approved :: MIT License`).

O repositório original **não publica um arquivo `LICENSE`** — por isso não há
cópia do texto da licença aqui. A declaração MIT no `pyproject.toml` é a única
manifestação de licença que o autor publicou. Copyright dos trechos reaproveitados:
autor do projeto original (fockus).

## O que foi mantido

- A lógica de ranqueamento: prioridade por fonte (Anthropic 60 → SkillsMP 3)
  somada a bônus por estrelas, com desempate por estrelas.
- As 14 fontes do catálogo e os parsers de cada uma.
- O fluxo de uso: buscar → apresentar com nível de confiança → confirmar → instalar.
- `scripts/atualizar-catalogo.sh` é o `update-skills-catalogue.sh` original.

## O que foi mudado

1. **Catálogo empacotado.** O original monta o catálogo na primeira execução,
   baixando de 14 fontes. Aqui o `catalogue.json` já vem pronto
   (592 skills, gerado em 2026-09-05T02:28:52Z), então a busca funciona offline e na
   primeira chamada.

2. **Sem caminhos fixos.** O original só funciona instalado em
   `~/.claude/skills/find-skill/` — todo o `SKILL.md` referencia esse caminho
   literal. Como skill de conta os arquivos ficam em outro lugar, então
   `buscar.py` resolve o catálogo a partir da própria localização, e
   `atualizar-catalogo.sh` aceita `FIND_SKILL_CACHE` / `FIND_SKILL_ENV`.

3. **Busca virou script.** O original embute o código Python dentro do
   `SKILL.md` como heredoc, com marcadores `QUERY`, `LIMIT`, `PAGE` que o
   agente precisa substituir por texto antes de rodar. Virou
   `scripts/buscar.py` com `argparse`.

4. **Catálogo limpo.** Os parsers de awesome-list do original deixam sobras de
   markdown nos nomes (`**docker-expert**`, `pdf](https://...`) e gravam
   caminhos relativos no campo de URL. Foram normalizados; 43 entradas
   irrecuperáveis foram descartadas.

5. **Fontes oficiais lidas por git.** `api.github.com` está bloqueado no
   ambiente onde este pacote foi montado, o que zera as fontes Anthropic e
   ComposioHQ. As duas foram lidas clonando os repositórios, com a descrição
   real do frontmatter de cada `SKILL.md` em vez do texto genérico que o
   original gera.

6. **Português.** `SKILL.md` reescrito em pt-BR, incluindo a descrição do
   frontmatter, para acionar com pedidos em português.

## O que ficou de fora

- O CLI `find-skill` (pacote Python/Homebrew/pipx) e os instaladores
  `install.sh`, `quick-install.sh`, `uninstall.sh`.
- Os adaptadores de formato para Codex, OpenCode e Cursor.
- O comando separado `/install-skill` — a instalação virou a etapa 3 do próprio
  `SKILL.md`.

Quem quiser a versão completa e multi-agente instala do repositório original.

## Fontes no catálogo empacotado

| Fonte | Skills |
|---|---:|
| VoltAgent | 100 |
| VoltAgent-subagents | 100 |
| daymade | 98 |
| BehiSecc | 92 |
| heilcheng | 72 |
| travisvn | 40 |
| mxyhi | 28 |
| ComposioHQ | 20 |
| Anthropic | 19 |
| hesreallyhim | 12 |
| vercel-labs | 8 |
| alirezarezvani | 3 |
| skills.sh (bloqueada na geração) | 0 |
| SkillsMP (bloqueada na geração) | 0 |
| **total** | **592** |
