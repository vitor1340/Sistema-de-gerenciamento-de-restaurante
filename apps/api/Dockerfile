# syntax=docker/dockerfile:1

# Build de monorepo: precisa do workspace inteiro (pnpm-lock.yaml resolve
# todos os pacotes juntos), mesmo buildando só a API — por isso o contexto
# de build no Railway é a raiz do repo, não apps/api.
#
# Estágio único de propósito: pnpm workspaces usam symlinks entre
# node_modules e o pnpm store — copiar isso entre estágios de um multi-stage
# build é frágil sem poder testar localmente antes do deploy. A imagem final
# fica maior (leva devDependencies e o código do apps/web), mas evita essa
# classe inteira de erro.
FROM node:22-slim
# Sem isso, o Prisma não detecta a versão de libssl e o query engine pode
# falhar silenciosamente em runtime (aviso do próprio `prisma generate`).
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
# `prisma generate` só lê o schema (não conecta em nada), mas o
# prisma.config.ts valida a presença de DATABASE_URL assim que é carregado —
# esse valor fake só existe pra passar nessa validação durante o build; a
# URL de verdade vem da variável de ambiente configurada no Railway em
# runtime, sem relação com essa aqui.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build
WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
