<<<<<<< HEAD
# Comandaí

Plataforma de delivery multi-restaurante (SaaS multi-tenant). Este repositório contém a
**Fatia 1**: scaffolding do monorepo + painel administrativo "Visão Geral", com dados
reais vindos de um seed no banco (não mockados no frontend).

## Stack

- **Frontend**: Next.js 16 (App Router) + TailwindCSS v4 + Zustand + Recharts — `apps/web`
- **Backend**: NestJS + Prisma 7 (driver adapter `@prisma/adapter-pg`) — `apps/api`
- **Banco**: PostgreSQL (Neon, dev)
- **Monorepo**: pnpm workspaces + Turborepo

## Setup

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Banco de dados (Neon)

Crie um projeto gratuito em [neon.tech](https://neon.tech) e copie a connection string.
Configure `apps/api/.env` (copie de `.env.example` na raiz):

```
DATABASE_URL="postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="dev-only-change-me"
JWT_EXPIRES_IN="8h"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

E `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Migração + seed

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

O seed cria o restaurante **Brasa & Ponto**, o usuário **vitor@brasaeponto.com / 123456**
(dono), um cardápio de exemplo e pedidos dos últimos 7 dias com números consistentes com
o painel de Visão Geral (vendas, ticket médio, canais de venda, etc).

### 4. Rodar em dev

Na raiz do monorepo:

```bash
pnpm turbo run dev
```

- API: http://localhost:3001/api
- Painel: http://localhost:3000 → redireciona para `/login`

Login com `vitor@brasaeponto.com` / `123456`.

## Estrutura

```
apps/
  api/     NestJS — auth (JWT), restaurantes, dashboard, pedidos
  web/     Next.js — painel do dono do restaurante (Visão Geral + stubs)
packages/
  shared-types/   DTOs compartilhados entre web e api
```

## Escopo desta fatia

Inclui: scaffolding completo, login (sem 2FA), layout do painel (sidebar + header) e a
tela de Visão Geral (métricas do dia, gráfico de vendas dos últimos 7 dias, canais de
venda, pedidos recentes, ações rápidas).

Fora de escopo (fases futuras): checkout do cliente final, pagamentos reais, WebSocket de
pedidos em tempo real, CRUD completo de cardápio, 2FA, multi-tenant real (há apenas um
restaurante fixo no seed).
=======
# Comandaí-
>>>>>>> 016da216cb346aa0e0fdf94454b7ef9465369249
