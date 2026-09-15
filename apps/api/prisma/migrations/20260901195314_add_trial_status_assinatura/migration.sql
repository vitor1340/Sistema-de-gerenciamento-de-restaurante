-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "Restaurante" ADD COLUMN     "statusAssinatura" "StatusAssinatura" NOT NULL DEFAULT 'TRIALING',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '7 days');
