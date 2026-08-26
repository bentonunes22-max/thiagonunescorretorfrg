---
name: humanizer-ptbr
description: |
  Complemento em português brasileiro para a skill humanizer. Cobre os vícios de
  texto gerado por IA que a lista original (escrita em inglês) não pega: palavras
  que a IA usa demais em português, vocabulário de anúncio imobiliário, gerúndio
  de call center, aberturas e fechamentos de chatbot, e formatação que quebra no
  WhatsApp. Use sempre junto da skill humanizer quando o texto a reescrever estiver
  em português: respostas da recepcionista "Fernanda", mensagens de follow-up,
  disparo em massa, textos de proposta, legendas de anúncio e posts. Use também
  quando o usuário pedir para revisar, humanizar ou "tirar a cara de IA" de
  qualquer texto em português.
---

# humanizer-ptbr — vícios de IA em português brasileiro

Este arquivo **estende** a skill `humanizer` (`.claude/skills/humanizer/SKILL.md`).
Ele não substitui nada: leia a skill original primeiro, aplique os 35 padrões
dela, e use as seções abaixo por cima.

Motivo de existir: a skill original é escrita em inglês. Os padrões estruturais
dela atravessam o idioma sem problema (emoji, negrito decorativo, tríade forçada,
"não é apenas X, é Y", fechamento de chatbot). Já as listas de palavras, em
especial o §7, são em inglês e não pegam nada em texto brasileiro.

Valem aqui as mesmas três regras da skill original: preserve todas as
informações, não invente fato nenhum, e mantenha a voz de quem escreve.

## §7-BR. Palavras que a IA usa demais em português

Nenhuma dessas palavras é proibida. O sinal é o acúmulo: três ou mais na mesma
mensagem, ou uma delas em posição onde uma palavra comum resolveria.

Adjetivos inflados: crucial, fundamental, essencial, primordial, robusto,
abrangente, transformador, inovador, singular, ímpar, notável, verdadeiro (como
intensificador, "um verdadeiro sonho"), riquíssimo, valioso.

Verbos e locuções empoladas: proporcionar (em vez de dar), possibilitar (em vez
de deixar), desempenhar um papel, aprimorar, otimizar (fora de contexto técnico),
alavancar, potencializar, agregar valor, desvendar, explorar ("vamos explorar"),
mergulhar ("vamos mergulhar").

Substantivos abstratos de encher linguiça: cenário, panorama, universo, jornada,
leque, gama ("ampla gama"), espectro.

Conectivos de redação escolar: vale ressaltar, vale destacar, é importante
ressaltar, cabe mencionar, no que diz respeito a, em suma, por fim mas não menos
importante, dito isso.

**Antes:**
> Vale ressaltar que este imóvel proporciona um verdadeiro leque de possibilidades
> e desempenha um papel fundamental para quem busca aprimorar sua qualidade de vida.
**Depois:**
> O apartamento tem dois quartos e fica a dez minutos do centro.

(O "depois" só pode citar dois quartos e dez minutos se esses dados vierem do
cadastro do imóvel. Sem eles, corte a frase em vez de inventar.)

## §4-BR. Vocabulário de anúncio imobiliário

Estende o §4 (linguagem de vendas). É o vício mais comum em texto de corretor
gerado por IA, porque o modelo aprendeu com milhões de anúncios de portal.

Palavras a vigiar: aconchegante, charmoso, imperdível, exclusivo, diferenciado,
privilegiado ("localização privilegiada"), alto padrão, altíssimo padrão,
impecável, deslumbrante, encantador, sofisticado, requintado.

Frases a vigiar: no coração de, a poucos passos de, oportunidade única,
oportunidade imperdível, não perca essa chance, pronto para morar, infraestrutura
completa, lazer completo, excelente custo-benefício, realize o sonho da casa
própria, seu novo lar está esperando por você, venha conferir, agende já a sua
visita, condições especiais.

Troque o adjetivo pelo dado. "Localização privilegiada" não diz nada; "a 400 m
do terminal" diz. Se o dado não existe no cadastro, corte o adjetivo e não
coloque nada no lugar.

**Antes:**
> Aconchegante apartamento em localização privilegiada, no coração do bairro,
> com lazer completo e acabamento impecável. Uma oportunidade imperdível!
**Depois:**
> Apartamento no Bairro Nações, com área de lazer e churrasqueira no condomínio.

## §20-BR. Fechamentos de chatbot em português

Estende o §20. Cuidado redobrado com falso positivo aqui: um corretor de verdade
escreve "qualquer dúvida me chama" o tempo todo, e isso é correto. O sinal de IA
é empilhar dois ou três fechamentos na mesma mensagem, ou usar a versão longa e
formal onde a curta bastaria.

Frases a vigiar: estou à disposição, fico à disposição para quaisquer dúvidas,
ficarei no aguardo do seu retorno, aguardo seu breve retorno, espero ter ajudado,
espero ter esclarecido, conte comigo, estamos juntos, será um prazer atendê-lo,
fico feliz em poder ajudar, qualquer dúvida não hesite em perguntar.

Uma mensagem de WhatsApp termina na pergunta ou na informação. Não precisa de
despedida cerimonial.

**Antes:**
> Espero ter ajudado! Fico à disposição para quaisquer dúvidas.
> Ficarei no aguardo do seu retorno. Conte comigo!
**Depois:**
> Quer que eu marque a visita para sábado?

## §22-BR. Bajulação de abertura

Estende o §22. Mesmo cuidado: "Perfeito!" e "Claro!" soltos são normais entre
brasileiros no WhatsApp. O sinal é toda mensagem abrir com elogio ao cliente.

Frases a vigiar: que ótimo, que legal, ótima pergunta, excelente escolha,
excelente pergunta, com certeza (como abertura vazia), fico muito feliz com o seu
interesse, que bom que você perguntou isso.

**Antes:**
> Que ótimo receber sua mensagem! Fico muito feliz com o seu interesse!
> Excelente escolha de imóvel!
**Depois:**
> Oi! Sobre o apartamento do Bairro Nações:

## §23-BR. Enrolação e verbo perifrástico

Estende o §23. O português de atendimento troca o verbo simples por um par
"verbo genérico + substantivo". Desfaça o par.

- realizar o agendamento → agendar
- efetuar o pagamento → pagar
- fazer uma análise → analisar
- proceder com o envio → enviar
- dar início ao processo → começar
- ter a possibilidade de → poder
- vir a ser → ser

Frases inteiras de enrolação:

- para que eu possa te ajudar da melhor forma possível → para te ajudar
- você poderia me informar se teria interesse em → você quer
- gostaria de saber se seria possível → dá para
- devido ao fato de que → porque
- no momento em que → quando
- venho por meio desta / informamos que / ressaltamos que → (corte)

## 36. Gerúndio de call center

Padrão que só existe em português e não tem equivalente na lista original. O
futuro perifrástico com gerúndio é a marca registrada de atendimento robotizado
no Brasil, e o modelo reproduz isso porque aprendeu com transcrição de SAC.

- vou estar verificando → vou verificar
- vou estar enviando → te envio
- vamos estar analisando → vamos analisar
- vou estar passando as informações → te passo as informações

**Antes:**
> Vou estar verificando a disponibilidade e vou estar retornando para você.
**Depois:**
> Vou verificar a disponibilidade e te aviso.

## 37. "O mesmo" como pronome

Também exclusivo do português. Linguagem de ofício e de peça jurídica que vaza
para dentro de mensagem de WhatsApp.

**Antes:**
> O cliente visitou o imóvel e o mesmo demonstrou interesse. A proposta foi
> enviada e a mesma está em análise.
**Depois:**
> O cliente visitou o imóvel e gostou. A proposta está em análise.

Vale a mesma coisa para "o referido imóvel", "a supracitada proposta" e
"conforme mencionado anteriormente". Em contrato, tudo bem. Em conversa, não.

## 38. Formatação que quebra no WhatsApp

O modelo escreve em Markdown por hábito, e o WhatsApp não renderiza Markdown.
Antes de mandar qualquer texto para o WhatsApp, converta:

- `**negrito**` vira `*negrito*` (asterisco simples), ou vira nada
- `## Título` não existe: vire uma frase, ou apague
- `- item` de lista vira uma frase corrida, ou vire uma linha começando com "•"
- link em `[texto](url)` vira a URL solta, que é o que o WhatsApp transforma em link
- bloco de código com crases não renderiza

Além do Markdown: quebre parágrafo longo. Uma mensagem de WhatsApp com seis
linhas seguidas parece disparo automático. Duas ou três mensagens curtas parecem
uma pessoa digitando.

## 39. Tratamento inconsistente

O modelo mistura "você" e "senhor" na mesma mensagem, ou começa formal e termina
íntimo. Escolha um e mantenha até o fim da conversa.

Nesta operação o padrão é "você", que é como Thiago fala. Só use "senhor" ou
"senhora" se o próprio lead tratar assim primeiro.

## Falsos positivos em português

Além da lista da skill original, não marque como IA:

- Diminutivo afetivo. "Uma perguntinha", "só um minutinho", "casinha" são fala
  brasileira normal, não enfeite de robô.
- "Bom dia" e "boa tarde". Saudação por horário é obrigatória na cultura de
  WhatsApp comercial. Tirar deixa a mensagem seca e mal-educada.
- Emoji isolado no fim de uma frase amigável. O §18 da skill original mira emoji
  como decoração de título e de item de lista. Um 👍 respondendo "combinado" é
  outra coisa. Thiago usa emoji no Instagram, e o lead usa no WhatsApp.
- Exclamação. Português brasileiro informal usa mais exclamação que inglês. Uma
  ou duas numa mensagem curta é normal; cinco não.
- Repetição de "que". "Acho que que ele falou" é erro de digitação; "disse que
  quer que eu ligue" é português correto.
- Vocabulário técnico do setor. Matrícula, averbação, ITBI, habite-se,
  escritura, financiamento, alienação fiduciária, CRECI. São termos exatos, não
  jargão inflado. Não simplifique nenhum deles.

## Limite importante para a recepcionista Fernanda

A regra 3 da skill original ("não invente fatos") é a mais crítica neste
projeto. A Fernanda fala com lead real, e um dado inventado sobre um imóvel vira
problema comercial e problema com o CRECI.

Nunca acrescente na reescrita um valor, uma metragem, um número de quartos, uma
data de entrega, uma condição de pagamento ou uma distância que não esteja no
cadastro do imóvel. Quando faltar o dado e a frase precisar dele, escreva uma
frase mais simples ou avise que vai confirmar. "Vou confirmar o valor com o
Thiago e já te falo" é uma resposta melhor que um número plausível.
