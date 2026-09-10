# Modelo de `_CLAUDE.md` para o cofre

Este arquivo **não faz nada aqui**. Ele é um modelo para copiar.

Quando você criar o cofre do Obsidian (passo a passo em
[OBSIDIAN-SEGUNDO-CEREBRO.md](./OBSIDIAN-SEGUNDO-CEREBRO.md)), copie o bloco
abaixo para um arquivo chamado `_CLAUDE.md` na **raiz do cofre**. É o primeiro
arquivo que o Claude lê ao trabalhar lá dentro, e é ele que manda na hora de
decidir em que pasta cada nota vai.

Já vem preenchido com a sua operação: as pastas, o funil do CRM, os tipos de
nota e as regras de LGPD. Os nomes de pessoas na tabela são fictícios — troque
pelos reais depois, direto no cofre.

Se preferir, você pode pular esse passo e rodar `/obsidian-init` dentro do
cofre: a skill gera um `_CLAUDE.md` sozinha. Mas ela vai gerar o padrão dela,
sem a pasta `Imoveis/` nem as regras abaixo. Copiar este modelo primeiro e
rodar o `/obsidian-init` depois dá o melhor dos dois.

---

```markdown
# Manual de operação do cofre — Thiago Nunes

> Leia este arquivo antes de fazer qualquer coisa neste cofre.
> Ele é a fonte da verdade sobre como o Claude opera aqui.

---

## Seção 0 — Regra AI-first (vale para toda nota)

Este cofre é escrito para o Claude ler e raciocinar em cima, não para leitura
humana. O dono raramente abre uma nota direto: ele chama o Claude para buscar,
resumir e cruzar informação de anos.

Toda nota escrita aqui precisa seguir estas regras:

1. **Contexto fechado em si.** Cada nota tem que se explicar sozinha. Uma busca
   futura pode trazer só ela, sem nada em volta. Não dependa de backlink para o
   texto fazer sentido.
2. **Resumo de abertura.** Toda nota começa com 2 ou 3 frases em português
   simples dizendo do que se trata, para dar para decidir em 10 segundos se
   interessa.
3. **Frontmatter consistente.** Metadados filtráveis (`tipo`, `data`, `tags`,
   `pessoas`, `imovel`, `fontes`, `confianca`). Tipos diferentes podem ter
   campos diferentes, mas toda nota tem frontmatter.
4. **Data grudada em cada afirmação externa.** "Taxa da Caixa em 10,49% a.a.
   (em 2026-09)" — assim dá para saber o que precisa ser reconferido.
5. **Fonte preservada.** Toda afirmação vinda de fora carrega o link junto.
6. **Links obrigatórios.** Toda pessoa, imóvel, projeto ou decisão citada usa
   `[[wikilink]]`, para o grafo ficar navegável.
7. **Nível de confiança.** Onde couber, marque `dito | alta | media | suposição`.

---

## Seção 0.5 — Confira o estado real antes de agir

Antes de afirmar um número, montar uma proposta ou dar um parecer: leia o dado
real. Taxa de financiamento, valor de ITBI, saldo de campanha e status de
matrícula mudam. Suposição tirada de memória vira erro caro na frente do
cliente.

---

## Identidade do cofre

- **Dono:** Thiago Nunes — corretor de imóveis autônomo, CRECI-PR 50.265
- **Praça:** Fazenda Rio Grande / região metropolitana de Curitiba, PR
- **Instagram:** @thiago_nunes_corretor
- **Para que serve:** memória da operação — captação, leads, negociações,
  conteúdo de rede social e o que já foi aprendido em cada uma dessas frentes
- **Atualizado em:** [AAAA-MM-DD]

---

## Mapa de pastas

| Pasta | Para quê |
|---|---|
| `Daily/` | Uma nota por dia, nome `AAAA-MM-DD.md`. Visitas, ligações, o que travou |
| `Imoveis/` | Uma nota por imóvel captado: matrícula, bairro, valor, dono, pendências |
| `People/` | Uma nota por pessoa: lead, cliente, proprietário, gerente de banco, despachante, parceiro |
| `Projects/` | Campanhas, lançamentos, metas do trimestre |
| `Meetings/` | Visitas e reuniões |
| `Tasks/` | Tarefas avulsas, ligadas aos quadros |
| `Boards/` | Kanban: `Funil de Vendas`, `Captação`, `Conteúdo` |
| `Ideas/` | Ideia de post, roteiro de Reels, gancho que funcionou |
| `Knowledge/` | Referência: financiamento, ITBI, documentação, jurídico, condomínios |
| `Reviews/` | Fechamento de semana e de mês |
| `Research/` | Saída dos comandos de pesquisa |
| `Logs/` | Log de operações do cofre |
| `Templates/` | Modelos de nota |

`Imoveis/` não é pasta padrão da skill — é desta tabela que ela aprende que a
pasta existe. Não mova nem renomeie sem atualizar aqui.

---

## Convenções de nome

- Nota do dia: `AAAA-MM-DD.md`
- Imóvel: `Bairro - Tipo - Referência.md` (ex.: `Eucaliptos - Terreno - 300m2.md`)
- Pessoa: nome completo (`Maria Aparecida Souza.md`, não `Maria.md`)
- Visita: `AAAA-MM-DD - Nome do imóvel.md`
- Campanha: `Campanha - Canal - Mês Ano.md`
- Arquivado: prefixo `_arquivado_`

---

## Tipos de nota

`diario` · `imovel` · `pessoa` · `visita` · `projeto` · `campanha` ·
`tarefa` · `ideia` · `conteudo` · `decisao` · `referencia` · `revisao`

Frontmatter mínimo:

```yaml
---
tipo: imovel
data: AAAA-MM-DD
tags:
  - captacao
---
```

---

## Kanban

Colunas do quadro `Funil de Vendas`, espelhando o CRM:
`📥 Lead` · `🔥 Qualificado` · `🏠 Visita` · `🤝 Negociação` · `📄 Documentação` · `✅ Fechado` · `❌ Perdido`

Prioridade: 🔴 urgente · 🟡 importante · 🟢 baixa

Formato do item:

```
- [ ] 🔴 **Nome do lead** · @{AAAA-MM-DD}
	Contexto em uma linha. [[Imoveis/Imóvel]] [[People/Pessoa]]
```

---

## O que salvar sem perguntar

- Decisão tomada na conversa → nota do projeto ou do imóvel + nota do dia
- Pessoa nova citada → `People/` (cria o esboço se não existir)
- Imóvel novo captado → `Imoveis/` + quadro `Captação` + nota do dia
- Visita realizada → `Meetings/` + nota do imóvel + nota da pessoa + nota do dia
- Tarefa assumida → quadro certo + `Tasks/`
- Ideia de post ou gancho que funcionou → `Ideas/` + nota do dia
- Resultado de campanha (custo por lead, alcance) → nota da campanha + nota do dia

## O que perguntar antes de salvar

- Valor de comissão, margem e qualquer número financeiro pessoal
- Nota que envolva apagar ou arquivar algo que já existe
- Qualquer coisa marcada como `Private/`

---

## Propagação

| Aconteceu | Também atualize |
|---|---|
| Imóvel captado | `Imoveis/` + quadro `Captação` + nota do dia |
| Lead novo | `People/` + quadro `Funil de Vendas` (📥 Lead) + nota do dia |
| Visita feita | `Meetings/` + nota do imóvel + nota da pessoa + nota do dia |
| Proposta enviada | Nota do imóvel + nota da pessoa + quadro (🤝 Negociação) |
| Negócio fechado ou perdido | Quadro + nota do imóvel + nota da pessoa + nota do dia + `Reviews/` do mês |
| Post publicado | `Ideas/` (marca o que rendeu) + nota da campanha + nota do dia |
| Decisão tomada | Nota do projeto ou do imóvel + nota do dia |

---

## Pessoas para conhecer

> Nomes abaixo são fictícios, só para mostrar o formato. Troque pelos reais.

| Pessoa | Papel | Contexto |
|---|---|---|
| Fulano de Tal | Gerente de habitação, banco X | Contato para simulação e análise de crédito |
| Sicrana de Tal | Despachante | Cuida de ITBI e registro |
| Beltrano de Tal | Advogado | Consulta em contrato e questão de matrícula |

---

## LGPD — vale para toda nota deste cofre

Este cofre guarda nome, telefone, endereço, valor de negociação e matrícula de
gente real. É dado pessoal.

- Não jogue conteúdo de nota deste cofre em serviço de terceiro.
- Os comandos de pesquisa (`/research`, `/research-deep`, `/x-read`, `/x-pulse`,
  `/youtube`, `/notebooklm`, `/podcast`) mandam a consulta para APIs de fora.
  **Nunca passe nome, telefone ou dado de cliente por eles.** Use para
  pesquisar mercado, bairro, norma e concorrência — nunca pessoa.
- Se precisar de exemplo em documentação, use dado fictício.

---

## Não mexer

- `Templates/` — não altere durante operação normal
- `Private/` — só leia se pedirem explicitamente

---

*Modelo mantido em `MODELO-COFRE-CLAUDE.md` no repositório CRMTHIAGO.*
*Para regenerar a partir do cofre real: "Claude, atualiza meu _CLAUDE.md".*
```
