# Changelog — CRMTHIAGO

## Site Imobiliário (novo sistema, paralelo ao CRM)
- Criada a plataforma imobiliária pública no Lovable (projeto `Prime Imóveis Online`): catálogo com filtros na URL, página de detalhe do imóvel, landings de venda/investidores/financiamento, blog, SEO técnico (JSON-LD, sitemap dinâmico, Open Graph) e integração central com WhatsApp
- Arquitetura com repository pattern para imóveis e leads, preparada para consumir o Worker/D1 do CRM sem duplicar banco de dados
- Configuração da marca centralizada em um único arquivo (`src/config/site.ts`)
- Documentação, auditoria de código e pendências em [SITE-IMOBILIARIO.md](./SITE-IMOBILIARIO.md)
- **Pendente:** 2 bugs de conversão identificados, painel administrativo, remoção dos imóveis de demonstração e publicação — bloqueados por falta de créditos no Lovable

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
- Automação de post no Google Meu Negócio a cada imóvel novo cadastrado (via Zapier, rotina agendada do Claude Code) + coluna `imoveis.gmb_postado_em` no D1 para controle de duplicidade
- Deploy do Cloudflare Worker `crm-thiago-leads-worker` + D1 `crm-thiago-leads`
- Integração WhatsApp/Meta Ads via webhook
- Recepcionista automatizada "Fernanda" (Evolution API + n8n + API Claude)
- Autenticação JWT nativa (PBKDF2 + HMAC-SHA256, Web Crypto)
- Sincronização do CRM local (localStorage) com D1: envio automático a cada `save()`, download manual com merge preservando fotos/anexos locais
- Ativação do R2 para armazenamento de fotos de imóveis

## Escolha de arquitetura
- Fase 1 do briefing full-stack: escolhida a Opção A (100% Cloudflare — Workers + D1 + R2) em vez de Node/Express + PostgreSQL tradicional
