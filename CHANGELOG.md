# Changelog — CRMTHIAGO

## v8_7
- Chat da Ana Paula dentro do CRM: janela lateral com resumo do dia, avisos ao vivo e conversa
- Resumo diário com agenda, follow-up vencido, tarefa vencida e leads parados priorizados por estágio e temperatura (não por antiguidade)
- Avisos de lead novo, lembrete e compromisso entram na conversa; lead novo com link direto para o WhatsApp
- "Me lembra amanhã 9h de..." escrito no chat cria o lembrete na hora, sem passar pela IA
- Botão flutuante com contador, som curto e notificação do sistema; consulta a cada 45s, pausada com a aba escondida
- Tabela `assistente_conversa` no D1, separada das conversas com lead

## v8_6
- Controle de estoque em Meus Imóveis: campo vendido/dataVenda, botão de marcar/reverter venda, filtros Estoque/Vendidos/Todos, cards de resumo
- Imóveis vendidos saem dos alertas de vencimento e da contagem de "Imóveis Ativos" no dashboard
- Ativação do R2 (bucket `crm-thiago-fotos-imoveis`) e rotas de upload/listagem/serving de fotos no Worker

## v8_5
- Aba de controle de marketing por imóvel: canal, status, período, orçamento, leads gerados, link do anúncio
- Resumo com total investido, total de leads, custo médio por lead

## v8_4 → v8_5
- Biblioteca de modelos de contrato por tipo (incluindo "Locação"), com sugestão automática no modal de proposta e anexo avulso do computador

## v8_3
- Follow-up: textarea de mensagem, campo de próximo follow-up, histórico cronológico por lead

## Marcos de infraestrutura (paralelos às versões de interface)
- Lembretes no WhatsApp a partir da `agenda` e das `tarefas` (colunas `lembrar_em` e `alertado_em`), despachados pelo cron do Worker via Green API, com criação por frase em português ("amanhã 9h", "12/09 14:30", "em 40 minutos")
- Documentação conferida contra o worker publicado: WhatsApp é Green API (não Evolution), assistente "Ana Paula" no próprio Worker, `scheduled()` já ativo e módulos de locação/financeiro no D1
- Automação de post no Google Meu Negócio a cada imóvel novo cadastrado (via Zapier, rotina agendada do Claude Code) + coluna `imoveis.gmb_postado_em` no D1 para controle de duplicidade
- Deploy do Cloudflare Worker `crm-thiago-leads-worker` + D1 `crm-thiago-leads`
- Integração WhatsApp/Meta Ads via webhook
- Recepcionista automatizada "Fernanda" (Evolution API + n8n + API Claude)
- Autenticação JWT nativa (PBKDF2 + HMAC-SHA256, Web Crypto)
- Sincronização do CRM local (localStorage) com D1: envio automático a cada `save()`, download manual com merge preservando fotos/anexos locais
- Ativação do R2 para armazenamento de fotos de imóveis

## Escolha de arquitetura
- Fase 1 do briefing full-stack: escolhida a Opção A (100% Cloudflare — Workers + D1 + R2) em vez de Node/Express + PostgreSQL tradicional
