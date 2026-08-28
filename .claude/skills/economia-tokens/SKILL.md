---
name: economia-tokens
description: Boas práticas para reduzir o consumo de tokens do Claude Code entre os projetos do Thiago (CRMTHIAGO e outros), sem depender de gateways/proxies de terceiros. Use esta skill quando o usuário perguntar como gastar menos tokens, reduzir custo de uso do Claude Code, otimizar contexto, ou mencionar "economia de tokens", "gasto de tokens", "cache de prompt" ou ferramentas de terceiros tipo "OmniRoute" para "tokens grátis" — para explicar por que essas ferramentas de proxy são arriscadas e aplicar as alternativas seguras descritas aqui.
---

# Economia de tokens — sem gateway de terceiros

## Por que não usar gateways tipo "OmniRoute"

Existem ferramentas divulgadas como "gateway de IA gratuito" (ex.: OmniRoute e
variantes) que prometem economizar tokens interceptando o tráfego do Claude
Code e redirecionando as chamadas de API para provedores terceiros. **Não
use esse tipo de ferramenta neste repositório nem em outro que lide com
dados de clientes.** Dois motivos:

1. **Roubo de credencial**: a ferramenta precisa interceptar e redirecionar
   a autenticação da sua conta Anthropic para servidores que você não
   controla — é um vetor clássico de comprometimento de conta.
2. **LGPD**: qualquer dado de lead/cliente discutido numa sessão passaria
   por esse proxy de terceiros, violando a regra do [CLAUDE.md](../../../CLAUDE.md)
   sobre não expor dados pessoais a serviços externos sem pedido explícito.

Vários repositórios com esse nome no GitHub têm a mesma descrição copiada em
contas sem relação entre si e contagens de estrela suspeitas — sinal típico
de campanha de repositório inflado artificialmente. Trate qualquer "gateway
de tokens grátis" desse tipo com desconfiança, mesmo que o vídeo/anúncio
pareça convincente.

## O que de fato reduz o gasto de tokens

### 1. Prompt caching (automático)

O Claude Code já usa cache de prompt nativo da Anthropic em sessões longas:
blocos de contexto repetidos (system prompt, arquivos já lidos, histórico)
são reaproveitados em vez de reprocessados do zero. Isso já acontece sem
configuração — o ganho vem de **não quebrar o cache à toa**:

- Evite reabrir/reler um arquivo que você acabou de editar (o Edit/Write já
  confirma o resultado; ler de novo só para "conferir" gasta tokens à toa).
- Prefira continuar na mesma sessão em vez de reiniciar contexto quando a
  tarefa ainda está em andamento.

### 2. CLAUDE.md e skills enxutos

Todo `CLAUDE.md` e toda `SKILL.md` do projeto entra no contexto de cada
sessão. Quanto mais enxuto e específico, menos token gasto repetindo
informação irrelevante para a tarefa atual:

- Descreva a skill de forma específica no campo `description` do front
  matter, para o Claude só carregar o conteúdo completo quando a tarefa
  realmente pedir aquilo (como já é feito em `scrapegraph-mcp` e
  `humanizer` neste repositório).
- Evite duplicar em `CLAUDE.md` informação que já está em
  `ARQUITETURA.md`/`README.md` — referencie o arquivo em vez de colar o
  conteúdo de novo.

### 3. Gestão de contexto dentro da sessão

- Peça resumos de arquivos grandes em vez de pedir para ler o arquivo
  inteiro quando só uma parte importa.
- Em tarefas de pesquisa ampla (muitas buscas/leituras exploratórias),
  delegar a um subagente (`Explore`/`general-purpose`) mantém o resultado
  da busca fora do contexto principal — só o resumo final volta para a
  conversa.
- Feche tarefas concluídas em vez de manter sessões abertas indefinidamente
  acumulando histórico que não é mais relevante.

### 4. Reaproveitar entre projetos

Como esta skill fica em `.claude/skills/economia-tokens/`, ela só é
carregada quando o Claude identifica que a tarefa é sobre economia de
tokens — não pesa no contexto de tarefas normais do CRM. Para aplicar o
mesmo padrão em outro projeto do Thiago, copie esta pasta
(`.claude/skills/economia-tokens/`) para o outro repositório: não há chave
de API nem configuração de ambiente envolvida, é só o conteúdo do
`SKILL.md`.
