-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "doisFatoresAtivo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "CodigoBackupDoisFatores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoBackupDoisFatores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodigoBackupDoisFatores_codigoHash_key" ON "CodigoBackupDoisFatores"("codigoHash");

-- CreateIndex
CREATE INDEX "CodigoBackupDoisFatores_usuarioId_idx" ON "CodigoBackupDoisFatores"("usuarioId");

-- AddForeignKey
ALTER TABLE "CodigoBackupDoisFatores" ADD CONSTRAINT "CodigoBackupDoisFatores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
