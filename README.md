# CRMTHIAGO

CRM imobiliário próprio, construído sob medida para a operação autônoma de Thiago Nunes (CRECI-PR 50.265) em Fazenda Rio Grande/PR (@thiago_nunes_corretor).

Este repositório existe apenas como **documentação e versionamento** do sistema — o CRM roda em produção 100% na Cloudflare (Worker + D1 + R2). Nada aqui precisa ser "deployado" a partir do GitHub; é o registro histórico/técnico do que já está no ar.

## Status atual

- **Versão da interface:** v8_6
- **Ambiente de produção:** `https://crm-thiago-leads-worker.bento-nunes22.workers.dev/`
- **Stack:** Cloudflare Workers (backend/API) + D1 (banco relacional) + R2 (fotos de imóveis) — tudo na mesma conta Cloudflare já paga
- **Frontend:** HTML/JS único, com opção de operação 100% offline via localStorage e sincronização sob demanda com o D1

## Módulos ativos

- Leads (captação, temperatura quente/frio, conversa inicial de contexto)
- Kanban / Funil de Vendas (Lead → Negociação → Fechamento, com valor potencial por negócio)
- Clientes
- Imóveis (fotos com compressão automática, vídeo, matrícula/bairro, vínculo com cliente/proprietário, controle de estoque vendido/disponível)
- Propostas (biblioteca de modelos de contrato por tipo, incluindo Locação, com anexo do computador)
- Follow-up (histórico cronológico por lead, próximo follow-up agendado)
- Disparo em Massa via WhatsApp (limite diário configurável, fila quente/frio, intervalo aleatório)
- Marketing (registro de divulgação por imóvel: canal, orçamento, leads gerados, custo por lead)
- Metas & Relatórios (funil de conversão, ranking por origem, ticket médio, ciclo médio de venda)
- Tarefas & Checklist automático por tipo de contrato
- Autenticação JWT (PBKDF2 + HMAC-SHA256 via Web Crypto nativo do Workers, sem dependências externas)
- Recepção automatizada no WhatsApp ("Fernanda") via Evolution API + n8n + API Claude

Ver [ARQUITETURA.md](./ARQUITETURA.md) para detalhes técnicos e [CHANGELOG.md](./CHANGELOG.md) para o histórico de versões.

## Próximos passos em aberto

- Sincronizar fotos de imóveis e anexos de contrato para o R2 (hoje ficam fora do sync com o D1 por limite de 2MB/linha)
- Consolidar teste de upload de fotos via R2 (CORS ajustado, pendente reteste completo)
- Avaliar se o briefing full-stack (Node/Express+Postgres) ainda faz sentido ou se a operação segue 100% Cloudflare
