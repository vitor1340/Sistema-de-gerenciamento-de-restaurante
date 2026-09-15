-- Extensão pra normalizar acentos ao gerar o slug (Comida -> comida, Ração -> racao)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- AlterTable: novos campos em Categoria — slug fica nullable nesta etapa,
-- é preenchido logo abaixo a partir do nome já existente, e só então travado
-- como NOT NULL + único por loja.
ALTER TABLE "Categoria" ADD COLUMN     "slug" TEXT;
ALTER TABLE "Categoria" ADD COLUMN     "ativa" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Categoria" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill do slug a partir do nome já existente
UPDATE "Categoria"
SET "slug" = lower(
  regexp_replace(
    regexp_replace(unaccent("nome"), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+)|(-+$)', '', 'g'
  )
)
WHERE "slug" IS NULL;

-- Nome vazio ou só símbolos gera slug vazio — usa um fallback genérico
UPDATE "Categoria" SET "slug" = 'categoria' WHERE "slug" = '' OR "slug" IS NULL;

-- Desempata slugs duplicados dentro da mesma loja (ex: duas categorias "Bebidas")
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "restauranteId", "slug" ORDER BY "createdAt") AS rn
  FROM "Categoria"
)
UPDATE "Categoria" c
SET "slug" = c."slug" || '-' || ranked.rn
FROM ranked
WHERE c."id" = ranked."id" AND ranked.rn > 1;

-- Agora que todo slug está preenchido e sem duplicidade por loja, trava as regras
ALTER TABLE "Categoria" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Categoria_restauranteId_slug_key" ON "Categoria"("restauranteId", "slug");

-- AlterTable: Produto.categoriaId vira opcional — excluir uma categoria nunca
-- apaga produtos em cascata (ver CategoriasService.remover), eles são
-- movidos ou ficam sem categoria.
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_categoriaId_fkey";
ALTER TABLE "Produto" ALTER COLUMN "categoriaId" DROP NOT NULL;
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
