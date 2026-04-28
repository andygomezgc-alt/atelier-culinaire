import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- Chef account ----------
  const email = process.env.SEED_CHEF_EMAIL || "chef@ristorantemarche.it";
  const password = process.env.SEED_CHEF_PASSWORD || "atelier2026";
  const name = process.env.SEED_CHEF_NAME || "Marco Rossi";

  const existing = await prisma.user.findUnique({ where: { email } });
  let chef = existing;
  if (!chef) {
    chef = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        name,
        role: "exec",
        accessLevel: "admin",
        initials: "MR",
        lang: "es",
      },
    });
    console.log(`Created chef: ${email} / ${password}`);
  } else if (chef.accessLevel !== "admin") {
    chef = await prisma.user.update({
      where: { id: chef.id },
      data: { accessLevel: "admin" },
    });
    console.log(`Promoted ${email} to admin.`);
  }

  // ---------- Restaurant ----------
  await prisma.restaurant.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: "Ristorante Marche",
      style:
        "Cucina mediterranea moderna con tecnica contemporanea. Producto de mar Adriático y huerta de las Marcas, técnica precisa, plato sin ostentación.",
      season:
        "Otoño 2026 — productos de las Marcas y del Adriático: pichón, radicchio de Treviso, remolacha, hongos porcini, Verdicchio",
      price: "Fine dining premium · 45–65€ por persona · Menú degustación 95€",
      restrictions:
        "Sin restricciones específicas. Tener siempre alternativa sin gluten y sin lactosa identificada en cocina.",
    },
    update: {},
  });

  // ---------- Team ----------
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: "Marco Rossi", role: "admin" },
        { name: "Elena Conti", role: "editor" },
        { name: "Luca Bianchi", role: "contributor" },
        { name: "Sofia Esposito", role: "viewer" },
      ],
    });
  }

  // ---------- Pantry ----------
  if ((await prisma.pantryItem.count()) === 0) {
    await prisma.pantryItem.createMany({
      data: [
        { name: "Pichón Marchigiano", category: "carnes", cost: 18, season: "autumn", supplier: "Macelleria Marchigiano", stock: "8 unidades" },
        { name: "Conejo de granja Marche", category: "carnes", cost: 14, season: "allyear", supplier: "Macelleria Conti", stock: "4 unidades" },
        { name: "Patata Kennebec", category: "verduras", cost: 0.8, season: "allyear", supplier: "Marche local", stock: "15 kg" },
        { name: "Remolacha de huerta", category: "verduras", cost: 1.2, season: "autumn", supplier: "Huerta Asis", stock: "6 kg" },
        { name: "Radicchio di Treviso IGP", category: "verduras", cost: 2.4, season: "autumn", supplier: "Treviso IGP", stock: "4 kg" },
        { name: "Hongos porcini", category: "verduras", cost: 22, season: "autumn", supplier: "Bosque Sibillini", stock: "2 kg" },
        { name: "Gambero rosso di Mazara", category: "pescados", cost: 68, season: "allyear", supplier: "Mazara Frutti di Mare", stock: "3 kg" },
        { name: "Bottarga di muggine", category: "pescados", cost: 110, season: "allyear", supplier: "Sardegna import", stock: "600 g" },
        { name: "Katsuobushi", category: "secos", cost: 8.5, season: "allyear", supplier: "Importador Milán", stock: "400 g" },
        { name: "Verdicchio Castelli di Jesi", category: "secos", cost: 9, season: "allyear", supplier: "Cantina Bucci", stock: "12 botellas" },
        { name: "Aceite Marche DOP nuevo", category: "secos", cost: 28, season: "autumn", supplier: "Frantoio Conero", stock: "12 L" },
        { name: "Mantequilla cruda", category: "lacteos", cost: 16, season: "allyear", supplier: "Latteria Sibilla", stock: "4 kg" },
        { name: "Mascarpone", category: "lacteos", cost: 14, season: "allyear", supplier: "Latteria Sibilla", stock: "2 kg" },
      ],
    });
  }

  // ---------- Recipes ----------
  if ((await prisma.recipe.count()) === 0) {
    const r1 = await prisma.recipe.create({
      data: {
        name: "Pichón en dos cocciones, puré bicolor",
        category: "Carnes",
        status: "approved",
        priority: true,
        summary:
          "Pichón de 450-500g, pechuga rara a la plancha 56°C, piernas sous vide 11h 30m a 70°C. Puré bicolor patata-remolacha, radicchio encurtido, jus de Verdicchio.",
        content: `## Pichón en dos cocciones — v1.2

**Técnica:** plancha para la pechuga + sous vide para las piernas.

### Ingredientes (1 comensal)
- 1 pichón de 450–500g
- 150g patata Kennebec
- 100g remolacha asada
- 80g radicchio de Treviso IGP
- 100ml Verdicchio Castelli di Jesi

### Técnica
1. Sellar piernas, sous vide 70°C / 11h 30m.
2. Pechuga plancha, núcleo 56°C.
3. Puré bicolor, mantecado.
4. Jus reducido con Verdicchio.

### Coste
13,50€ · PVP 42€ · Margen 68%`,
        authorId: chef!.id,
        versions: {
          create: [
            { v: 1, tester: "Marco Rossi", note: "Versión inicial." },
            { v: 2, tester: "Andy", note: "Sous vide reducido a 11h 30m." },
            { v: 3, tester: "Marco Rossi", note: "Aprobada para carta." },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Tartare di gambero rosso, agrumi e bottarga",
        category: "Entradas frías",
        status: "testing",
        summary:
          "Tartar de gamba roja de Mazara cortada a cuchillo, aceite Marche, ralladura de cítricos del Gargano y velo de bottarga de muggine.",
        content: `## Tartare di gambero rosso

Corte a cuchillo en frío (8mm), aliño mínimo, terminación a la mesa.

### Ingredientes
- 90g gambero rosso di Mazara
- Aceite Marche DOP nuevo
- Ralladura limón Amalfi + naranja sanguina
- Bottarga di muggine

### Coste
10€/comensal.`,
        authorId: chef!.id,
        versions: {
          create: [
            { v: 1, tester: "Elena Conti", note: "Bottarga demasiado dominante." },
            { v: 2, tester: "Marco Rossi", note: "Equilibrio mejor con 4 lascas finas." },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Tagliatelle al ragù bianco di coniglio",
        category: "Primeros",
        status: "draft",
        summary:
          "Tagliatelle al huevo con ragù blanco de conejo de las Marcas, Verdicchio y hierbas de monte. Sin tomate.",
        content: `## Tagliatelle al ragù bianco di coniglio

Sin tomate. Conejo deshuesado y picado a cuchillo, soffritto fino, Verdicchio, cocción larga.`,
        authorId: chef!.id,
      },
    });

    // Sample menu
    const menu = await prisma.menu.create({
      data: {
        name: "Menú Otoño Marcas 2026",
        template: "elegante",
        categories: {
          create: [
            {
              name: "Entradas frías",
              order: 0,
              dishes: { create: [{ name: "Tartare di gambero rosso, agrumi e bottarga", price: 28 }] },
            },
            {
              name: "Primeros",
              order: 1,
              dishes: { create: [{ name: "Tagliatelle al ragù bianco di coniglio", price: 24 }] },
            },
            {
              name: "Carnes",
              order: 2,
              dishes: {
                create: [{ recipeId: r1.id, name: "Pichón en dos cocciones, puré bicolor", price: 42 }],
              },
            },
            { name: "Postres", order: 3, dishes: { create: [{ name: "Semifreddo di amaretto", price: 14 }] } },
          ],
        },
      },
    });
    void menu;
  }

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
