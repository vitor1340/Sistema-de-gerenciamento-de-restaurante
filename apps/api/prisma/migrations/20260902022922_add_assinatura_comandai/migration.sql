-- CreateEnum
CREATE TYPE "FaixaAssinatura" AS ENUM ('ATE_150', 'DE_151_A_250', 'ACIMA_250');

-- AlterTable
ALTER TABLE "Restaurante" ADD COLUMN     "faixaAssinatura" "FaixaAssinatura",
ADD COLUMN     "mercadoPagoPreapprovalId" TEXT,
ALTER COLUMN "trialEndsAt" SET DEFAULT (now() + interval '7 days');

-- CreateTable
CREATE TABLE "EventoAssinatura" (
    "id" TEXT NOT NULL,
    "restauranteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "payloadBruto" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoAssinatura_restauranteId_createdAt_idx" ON "EventoAssinatura"("restauranteId", "createdAt");

-- AddForeignKey
ALTER TABLE "EventoAssinatura" ADD CONSTRAINT "EventoAssinatura_restauranteId_fkey" FOREIGN KEY ("restauranteId") REFERENCES "Restaurante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
