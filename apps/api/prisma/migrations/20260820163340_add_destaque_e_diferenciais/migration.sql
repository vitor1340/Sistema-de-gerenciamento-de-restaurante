-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "destaque" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Restaurante" ADD COLUMN     "diferenciais" TEXT[] DEFAULT ARRAY[]::TEXT[];
