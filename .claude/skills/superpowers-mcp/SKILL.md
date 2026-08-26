---
name: superpowers-mcp
description: Configuração e uso do servidor MCP superpowers-mcp, vendorizado neste projeto (CRMTHIAGO), que expõe as "Superpowers skills" (brainstorming, planejamento, TDD, debugging sistemático, revisão de código, git worktrees, etc.) como ferramentas MCP. Use esta skill quando o usuário pedir para configurar, revisar, depurar ou atualizar o superpowers-mcp neste repositório, ou quando quiser entender como uma tarefa de desenvolvimento (planejar uma mudança, fazer TDD, investigar um bug, revisar um PR) pode ser conduzida com uma dessas skills.
license: MIT
---

# superpowers-mcp — skills de workflow de desenvolvimento via MCP

## O que é

Este repositório vendoriza em `.claude/skills/superpowers-mcp/vendor/` o
código-fonte de dois projetos de terceiros, MIT, que juntos formam o
servidor MCP **superpowers-mcp**:

- `vendor/server/` — [erophames/superpowers-mcp](https://github.com/erophames/superpowers-mcp)
  (commit `7199130`, 2026-03-15): o servidor MCP em si (TypeScript), que lê
  um diretório de skills e expõe ferramentas (`list_skills`, `use_skill`,
  `get_skill_file`, `recommend_skills`, `compose_workflow`,
  `validate_workflow`, `semantic_search_skills`), prompts
  (`superpowers:{skill-name}`) e resources
  (`superpowers://skills/{skillName}/{fileName}`). Licença declarada como
  MIT no `package.json`/README do projeto (não havia `LICENSE` no
  repositório original — o texto padrão MIT foi reproduzido em
  `vendor/server/LICENSE`, com nota explicando a origem).
- `vendor/skills/` — o conteúdo real das 14 skills, de
  [obra/superpowers](https://github.com/obra/superpowers) (commit
  `b36e082`), MIT, Copyright (c) 2025 Jesse Vincent. `LICENSE` original
  copiado para `vendor/skills/LICENSE`.

As 14 skills disponíveis: `brainstorming`, `writing-plans`,
`executing-plans`, `subagent-driven-development`,
`dispatching-parallel-agents`, `test-driven-development`,
`systematic-debugging`, `verification-before-completion`,
`requesting-code-review`, `receiving-code-review`, `using-git-worktrees`,
`finishing-a-development-branch`, `writing-skills`, `using-superpowers`.
São skills de **processo de desenvolvimento de software** (como planejar,
testar, depurar e revisar código) — não têm relação com o domínio do CRM
(imóveis/leads), mas ajudam a conduzir mudanças neste próprio repositório
ou no `worker.js` de produção com mais rigor.

## Como configurar (setup único por máquina)

`node_modules/` e `build/` **não são versionados** (vendorizar código-fonte
de terceiros é aceitável; vendorizar artefatos de build/dependências não
é). É preciso buildar uma vez em cada ambiente antes de abrir o Claude Code
neste repositório:

```bash
cd .claude/skills/superpowers-mcp/vendor/server
npm install
npm run build
```

Isso gera `vendor/server/build/index.js`, que é o binário que o `.mcp.json`
já aponta (via `${CLAUDE_PROJECT_DIR}`, caminho relativo à raiz do repo —
funciona em qualquer máquina sem editar `.mcp.json`).

Config em `.mcp.json` (raiz do projeto):

```json
"superpowers": {
  "command": "node",
  "args": ["${CLAUDE_PROJECT_DIR}/.claude/skills/superpowers-mcp/vendor/server/build/index.js"],
  "env": {
    "SUPERPOWERS_SKILLS_DIR": "${CLAUDE_PROJECT_DIR}/.claude/skills/superpowers-mcp/vendor/skills"
  }
}
```

A variável `SUPERPOWERS_SKILLS_DIR` aponta direto para o
`vendor/skills/` já vendorizado, então o servidor **não** tenta clonar nada
da internet no primeiro uso nem depende de wizard interativo — isso foi
testado (`node build/index.js` roda em modo não-interativo quando invocado
sem TTY, que é como o Claude Code inicia servidores MCP via stdio).

Não é necessário rodar o "setup wizard" do projeto original nem definir a
variável de ambiente manualmente fora do `.mcp.json` — já está tudo fixado
nos arquivos deste repositório.

## Atualizando o vendor

Este servidor faz auto-update diário via `git pull` **apenas quando o
diretório de skills é um clone git** — como `vendor/skills/` foi copiado
sem histórico `.git` (para não aninhar repositórios git dentro deste
repositório), esse auto-update fica inerte e as skills só mudam quando
alguém atualizar manualmente:

1. Repita o processo de vendorização: clone
   `erophames/superpowers-mcp` e `obra/superpowers` upstream, copie o
   conteúdo (sem `.git`, `node_modules`, `build`) para
   `vendor/server/` e `vendor/skills/` respectivamente.
2. Rode `npm install && npm run build` de novo em `vendor/server/`.
3. Confira se a licença de cada projeto upstream não mudou.

## Quando usar

Sempre que a tarefa em mãos for de engenharia de software neste próprio
repositório (não de operação do CRM) e se beneficiar de um processo mais
disciplinado:

- Planejar uma mudança maior antes de codar → `writing-plans` /
  `brainstorming`.
- Implementar algo testável → `test-driven-development`.
- Investigar um bug sem sair "chutando" correções → `systematic-debugging`.
- Preparar ou revisar um PR → `requesting-code-review` /
  `receiving-code-review`.
- Trabalhar em paralelo em mudanças isoladas → `using-git-worktrees` /
  `dispatching-parallel-agents`.

Não é a ferramenta certa para tarefas do dia a dia do CRM em si (cadastro
de lead, follow-up, proposta) — para isso não há skill de workflow
necessária.
