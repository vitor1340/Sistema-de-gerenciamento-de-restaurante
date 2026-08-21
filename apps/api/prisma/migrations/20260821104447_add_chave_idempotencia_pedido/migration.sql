-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "chaveIdempotencia" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_restauranteId_chaveIdempotencia_key" ON "Pedido"("restauranteId", "chaveIdempotencia");
