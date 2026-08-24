# Comandaí

SaaS multi-tenant de gestão de restaurantes: cardápio digital, loja pública com pedidos
reais, acompanhamento de pedido para o cliente e painel administrativo com métricas.

## Stack

- **Frontend**: Next.js 16 (App Router) + TailwindCSS v4 + Zustand + Recharts — `apps/web`
- **Backend**: NestJS + Prisma 7 (driver adapter `@prisma/adapter-pg`) — `apps/api`
- **Banco**: PostgreSQL (Neon)
- **Armazenamento de imagens**: Supabase Storage
- **Monorepo**: pnpm workspaces + Turborepo

## Setup

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Copie o `.env.example` da raiz para `apps/api/.env` e `apps/web/.env.local` e preencha os
valores. Todas as variáveis abaixo são **obrigatórias** para `apps/api` — o backend falha
ao subir se qualquer uma delas faltar:

```
# apps/api/.env
DATABASE_URL="postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="..."
JWT_EXPIRES_IN="8h"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="comandai"
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

```
# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

`DATABASE_URL` vem de um projeto gratuito em [neon.tech](https://neon.tech). As credenciais
do Supabase vêm de um projeto em [supabase.com](https://supabase.com) (usadas só para
armazenar imagens de produtos/logo, não como banco). `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
vêm de um OAuth Client "Web application" no
[Google Cloud Console](https://console.cloud.google.com/), com `GOOGLE_CALLBACK_URL` cadastrado
como URI de redirecionamento autorizado.

### 3. Migração + seed

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

O seed cria o restaurante **Brasa & Ponto**, o usuário **vitor@brasaeponto.com / 123456**
(dono), um cardápio de exemplo e pedidos dos últimos 7 dias.

### 4. Rodar em dev

Na raiz do monorepo:

```bash
pnpm turbo run dev
```

- API: http://localhost:3001/api
- Painel: http://localhost:3000 → redireciona para `/login`
- Loja pública de exemplo: http://localhost:3000/loja/brasa-e-ponto

### 5. Rodar os testes

```bash
pnpm --filter api test:e2e
```

Os testes e2e rodam contra o Postgres e o Supabase Storage reais configurados no `.env`
(não há banco/bucket isolado por execução — ver "Limitações conhecidas" abaixo).

## Funcionalidades implementadas

- **Autenticação**: cadastro e login por e-mail/senha, login com Google (conta nova cria
  restaurante automaticamente; e-mail já existente por senha vincula a conta ao Google),
  JWT com expiração configurável, rate limiting nas rotas de auth e globalmente.
- **Cardápio**: CRUD de categorias e produtos, com upload e otimização de fotos.
- **Loja pública**: cardápio digital por slug (`/loja/[slug]`), carrinho, criação de pedido
  real (preço sempre recalculado no backend, idempotente por chave de idempotência),
  acompanhamento de status do pedido pelo cliente (sem precisar de conta).
- **Painel**: Visão Geral com métricas reais (vendas, ticket médio, canais de venda),
  gestão de Pedidos (transições de status validadas), Configurações (identidade visual,
  logo, endereço, WhatsApp).
- **Multi-tenant real**: isolamento por `restauranteId` em todas as queries, coberto por
  testes automatizados.

## CI

O workflow em `.github/workflows/ci.yml` roda lint, build e os testes e2e a cada push/PR
na branch `main`. Ele precisa dos mesmos secrets do `.env.example` cadastrados em
`Settings → Secrets and variables → Actions` no GitHub.

## Estrutura

```
apps/
  api/     NestJS — auth, restaurantes, categorias, produtos, upload, dashboard, pedidos, loja
  web/     Next.js — painel do dono do restaurante + loja pública
packages/
  shared-types/   DTOs compartilhados entre web e api
```

## Limitações conhecidas / próximos passos

- Sem refresh token nem revogação de JWT — um token roubado (ou de usuário desativado)
  continua válido até expirar.
- Testes e2e batem em banco/storage reais de desenvolvimento, não em uma instância isolada
  por execução.
- Fora de escopo por enquanto: recuperação de senha por e-mail, gestão de equipe
  (convite de outros usuários do restaurante), módulo de clientes, relatórios financeiros
  detalhados, gestão de entregadores, pagamentos reais, WebSocket de pedidos em tempo real,
  2FA, deploy/containerização.
