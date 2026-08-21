-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('DELIVERY_E_FISICA', 'SOMENTE_DELIVERY', 'SOMENTE_FISICA');

-- AlterTable
ALTER TABLE "Restaurante" ADD COLUMN     "corDestaque" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "horarioFuncionamento" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "tipoAtendimento" "TipoAtendimento" NOT NULL DEFAULT 'DELIVERY_E_FISICA';
