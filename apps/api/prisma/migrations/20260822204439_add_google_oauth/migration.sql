-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "senhaHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");
