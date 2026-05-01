-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "category" TEXT NOT NULL DEFAULT 'otros',
    "hasGluten" BOOLEAN NOT NULL DEFAULT false,
    "hasCrustaceans" BOOLEAN NOT NULL DEFAULT false,
    "hasEggs" BOOLEAN NOT NULL DEFAULT false,
    "hasFish" BOOLEAN NOT NULL DEFAULT false,
    "hasPeanuts" BOOLEAN NOT NULL DEFAULT false,
    "hasSoy" BOOLEAN NOT NULL DEFAULT false,
    "hasMilk" BOOLEAN NOT NULL DEFAULT false,
    "hasNuts" BOOLEAN NOT NULL DEFAULT false,
    "hasCelery" BOOLEAN NOT NULL DEFAULT false,
    "hasMustard" BOOLEAN NOT NULL DEFAULT false,
    "hasSesame" BOOLEAN NOT NULL DEFAULT false,
    "hasSulphites" BOOLEAN NOT NULL DEFAULT false,
    "hasLupin" BOOLEAN NOT NULL DEFAULT false,
    "hasMolluscs" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Recipe — add yield fields
ALTER TABLE "Recipe" ADD COLUMN "yieldPortions" INTEGER;
ALTER TABLE "Recipe" ADD COLUMN "yieldGrams" DOUBLE PRECISION;

-- AlterTable: PantryItem — add ingredient link and costUnit
ALTER TABLE "PantryItem" ADD COLUMN "ingredientId" TEXT;
ALTER TABLE "PantryItem" ADD COLUMN "costUnit" TEXT NOT NULL DEFAULT 'kg';

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
