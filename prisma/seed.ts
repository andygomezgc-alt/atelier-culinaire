import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

async function main() {
  // ── Chef accounts ────────────────────────────────────────────────────────
  const chefEmail = process.env.SEED_CHEF_EMAIL || "chef@ristorantemarche.it";
  const chefPassword = process.env.SEED_CHEF_PASSWORD || "atelier2026";
  const chefName = process.env.SEED_CHEF_NAME || "Marco Rossi";

  const existing = await prisma.user.findUnique({ where: { email: chefEmail } });
  let chef = existing;
  if (!chef) {
    chef = await prisma.user.create({
      data: {
        email: chefEmail,
        passwordHash: await bcrypt.hash(chefPassword, 10),
        name: chefName,
        role: "exec",
        accessLevel: "admin",
        initials: initials(chefName),
        lang: "es",
      },
    });
    console.log(`Created chef: ${chefEmail} / ${chefPassword}`);
  } else if (chef.accessLevel !== "admin") {
    chef = await prisma.user.update({ where: { id: chef.id }, data: { accessLevel: "admin" } });
    console.log(`Promoted ${chefEmail} to admin.`);
  }

  // Sous chef
  let sousChef = await prisma.user.findUnique({ where: { email: "elena@ristorantemarche.it" } });
  if (!sousChef) {
    sousChef = await prisma.user.create({
      data: {
        email: "elena@ristorantemarche.it",
        passwordHash: await bcrypt.hash("atelier2026", 10),
        name: "Elena Conti",
        role: "sous",
        accessLevel: "editor",
        initials: "EC",
        lang: "it",
      },
    });
    console.log("Created sous chef: elena@ristorantemarche.it");
  }

  // R&D chef
  let rdChef = await prisma.user.findUnique({ where: { email: "luca@ristorantemarche.it" } });
  if (!rdChef) {
    rdChef = await prisma.user.create({
      data: {
        email: "luca@ristorantemarche.it",
        passwordHash: await bcrypt.hash("atelier2026", 10),
        name: "Luca Bianchi",
        role: "rd",
        accessLevel: "editor",
        initials: "LB",
        lang: "es",
      },
    });
    console.log("Created R&D chef: luca@ristorantemarche.it");
  }

  // ── Restaurant ───────────────────────────────────────────────────────────
  await prisma.restaurant.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: "Ristorante Marche",
      style: "Cucina mediterranea moderna con tecnica contemporanea. Producto de mar Adriático y huerta de las Marcas, técnica precisa, plato sin ostentación.",
      season: "Otoño 2026 — productos de las Marcas y del Adriático: pichón, radicchio de Treviso, remolacha, hongos porcini, Verdicchio",
      price: "Fine dining premium · 45–65€ por persona · Menú degustación 95€",
      restrictions: "Sin restricciones específicas. Tener siempre alternativa sin gluten y sin lactosa identificada en cocina.",
    },
    update: {},
  });

  // ── Team ─────────────────────────────────────────────────────────────────
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: "Marco Rossi", role: "admin" },
        { name: "Elena Conti", role: "editor" },
        { name: "Luca Bianchi", role: "contributor" },
        { name: "Sofia Esposito", role: "viewer" },
        { name: "Nicolás García", role: "contributor" },
      ],
    });
  }

  // ── Pantry ───────────────────────────────────────────────────────────────
  if ((await prisma.pantryItem.count()) === 0) {
    await prisma.pantryItem.createMany({
      data: [
        // Carnes
        { name: "Pichón Marchigiano", category: "carnes", cost: 18, season: "autumn", supplier: "Macelleria Marchigiano", stock: "8 unidades" },
        { name: "Conejo de granja Marche", category: "carnes", cost: 14, season: "allyear", supplier: "Macelleria Conti", stock: "4 unidades" },
        { name: "Panceta ibérica curada", category: "carnes", cost: 22, season: "allyear", supplier: "Importador Ibérico", stock: "2 kg" },
        // Pescados
        { name: "Gambero rosso di Mazara", category: "pescados", cost: 68, season: "allyear", supplier: "Mazara Frutti di Mare", stock: "3 kg" },
        { name: "Bottarga di muggine", category: "pescados", cost: 110, season: "allyear", supplier: "Sardegna import", stock: "600 g" },
        { name: "Rombo chiodato Adriatico", category: "pescados", cost: 32, season: "spring", supplier: "Pescadería Adriático", stock: "2 unidades" },
        { name: "Calamar de potera", category: "pescados", cost: 24, season: "summer", supplier: "Pescadería Adriático", stock: "1,5 kg" },
        // Verduras
        { name: "Patata Kennebec", category: "verduras", cost: 0.8, season: "allyear", supplier: "Marche local", stock: "15 kg" },
        { name: "Remolacha de huerta", category: "verduras", cost: 1.2, season: "autumn", supplier: "Huerta Asis", stock: "6 kg" },
        { name: "Radicchio di Treviso IGP", category: "verduras", cost: 2.4, season: "autumn", supplier: "Treviso IGP", stock: "4 kg" },
        { name: "Hongos porcini", category: "verduras", cost: 22, season: "autumn", supplier: "Bosque Sibillini", stock: "2 kg" },
        { name: "Tupinambo de Marche", category: "verduras", cost: 3.5, season: "winter", supplier: "Huerta Asis", stock: "3 kg" },
        { name: "Espárrago verde Marchigiano", category: "verduras", cost: 4.8, season: "spring", supplier: "Marche local", stock: "5 kg" },
        { name: "Limón Amalfi", category: "verduras", cost: 1.8, season: "allyear", supplier: "Importador Amalfi", stock: "3 kg" },
        // Secos
        { name: "Katsuobushi", category: "secos", cost: 8.5, season: "allyear", supplier: "Importador Milán", stock: "400 g" },
        { name: "Verdicchio Castelli di Jesi", category: "secos", cost: 9, season: "allyear", supplier: "Cantina Bucci", stock: "12 botellas" },
        { name: "Aceite Marche DOP nuevo", category: "secos", cost: 28, season: "autumn", supplier: "Frantoio Conero", stock: "12 L" },
        { name: "Harina 00 Caputo", category: "secos", cost: 2.2, season: "allyear", supplier: "Distribuciones Napoli", stock: "10 kg" },
        { name: "Trufa negra Périgord", category: "secos", cost: 280, season: "winter", supplier: "Truffières du Périgord", stock: "150 g" },
        // Lácteos
        { name: "Mantequilla cruda", category: "lacteos", cost: 16, season: "allyear", supplier: "Latteria Sibilla", stock: "4 kg" },
        { name: "Mascarpone", category: "lacteos", cost: 14, season: "allyear", supplier: "Latteria Sibilla", stock: "2 kg" },
        { name: "Parmigiano Reggiano 36 meses", category: "lacteos", cost: 38, season: "allyear", supplier: "Consorzio Parmigiano", stock: "3 kg" },
        { name: "Ricotta di pecora", category: "lacteos", cost: 12, season: "allyear", supplier: "Latteria Sibilla", stock: "2 kg" },
      ],
    });
  }

  // ── Recipes ──────────────────────────────────────────────────────────────
  if ((await prisma.recipe.count()) === 0) {
    const r1 = await prisma.recipe.create({
      data: {
        name: "Pichón en dos cocciones, puré bicolor",
        category: "Carnes",
        status: "approved",
        priority: true,
        summary: "Pichón de 450-500g, pechuga rara a la plancha 56°C, piernas sous vide 11h 30m a 70°C. Puré bicolor patata-remolacha, radicchio encurtido, jus de Verdicchio.",
        content: `## Pichón en dos cocciones — v1.2\n\n**Técnica:** plancha para la pechuga + sous vide para las piernas.\n\n### Ingredientes (1 comensal)\n- 1 pichón de 450–500g\n- 150g patata Kennebec\n- 100g remolacha asada\n- 80g radicchio de Treviso IGP\n- 100ml Verdicchio Castelli di Jesi\n\n### Técnica\n1. Sellar piernas, sous vide 70°C / 11h 30m.\n2. Pechuga plancha, núcleo 56°C.\n3. Puré bicolor, mantecado.\n4. Jus reducido con Verdicchio.`,
        ingredients: "pichón, patata Kennebec, remolacha, radicchio di Treviso, Verdicchio, mantequilla",
        technique: "sous vide, plancha, puré, encurtido rápido",
        authorId: chef.id,
        versions: {
          create: [
            { v: 1, tester: "Marco Rossi", note: "Versión inicial. Sous vide 12h." },
            { v: 2, tester: "Elena Conti", note: "Sous vide reducido a 11h 30m, mejor textura." },
            { v: 3, tester: "Marco Rossi", note: "Aprobada para carta otoño 2026." },
          ],
        },
      },
    });

    const r2 = await prisma.recipe.create({
      data: {
        name: "Tartare di gambero rosso, agrumi e bottarga",
        category: "Entradas frías",
        status: "testing",
        summary: "Tartar de gamba roja de Mazara cortada a cuchillo, aceite Marche, ralladura de cítricos y velo de bottarga di muggine.",
        content: `## Tartare di gambero rosso\n\nCorte a cuchillo en frío (8mm), aliño mínimo, terminación a la mesa.\n\n### Ingredientes\n- 90g gambero rosso di Mazara\n- Aceite Marche DOP nuevo\n- Ralladura limón Amalfi + naranja sanguina\n- Bottarga di muggine, 4 lascas finas`,
        ingredients: "gambero rosso, aceite Marche DOP, limón Amalfi, bottarga di muggine",
        technique: "corte a cuchillo, aliño en frío",
        authorId: chef.id,
        versions: {
          create: [
            { v: 1, tester: "Elena Conti", note: "Bottarga demasiado dominante en v1." },
            { v: 2, tester: "Marco Rossi", note: "Con 4 lascas finas el equilibrio es mejor." },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Tagliatelle al ragù bianco di coniglio",
        category: "Primeros",
        status: "draft",
        summary: "Tagliatelle al huevo con ragù blanco de conejo de las Marcas, Verdicchio y hierbas de monte. Sin tomate.",
        content: `## Tagliatelle al ragù bianco di coniglio\n\nSin tomate. Conejo deshuesado y picado a cuchillo, soffritto fino, Verdicchio, cocción larga.`,
        ingredients: "conejo de granja Marche, harina 00, huevos, Verdicchio, Parmigiano Reggiano",
        technique: "pasta fresca, ragù blanco, cocción lenta",
        authorId: sousChef!.id,
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Risotto al Verdicchio, katsuobushi e bottarga",
        category: "Primeros",
        status: "approved",
        priority: true,
        summary: "Risotto mantecato al Verdicchio, caldo dashi de katsuobushi Adriático, terminado con virutas de bottarga.",
        content: `## Risotto al Verdicchio, katsuobushi e bottarga\n\n### Técnica\n1. Soffritto mínimo con mantequilla cruda.\n2. Tostar arroz Carnaroli 2 min.\n3. Mojar con Verdicchio, reducir.\n4. Caldo dashi-Adriático, 18 min mantecando fuera del fuego.\n5. Terminar con bottarga rallada.`,
        ingredients: "arroz Carnaroli, Verdicchio, katsuobushi, bottarga di muggine, mantequilla cruda, Parmigiano Reggiano",
        technique: "risotto, mantecatura, dashi",
        authorId: chef.id,
        versions: {
          create: [
            { v: 1, tester: "Luca Bianchi", note: "Concepto funciona. El katsuobushi necesita más presencia." },
            { v: 2, tester: "Marco Rossi", note: "Aprobado. Bottarga solo al final, no durante la cocción." },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Rombo chiodato, espuma de patata, trufa negra",
        category: "Pescados",
        status: "testing",
        summary: "Lomo de rombo chiodato Adriático a la plancha, espuma de patata Kennebec con aceite de trufa negra Périgord.",
        content: `## Rombo chiodato, espuma de patata, trufa negra\n\n### Ingredientes\n- 180g rombo chiodato Adriático\n- 200g patata Kennebec\n- 15g trufa negra Périgord\n- Aceite Marche DOP\n\n### Técnica\n1. Lomo de rombo, piel seca 24h en nevera.\n2. Plancha bien caliente, lado piel 4 min.\n3. Espuma de patata con sifón, montada con aceite de oliva.`,
        ingredients: "rombo chiodato Adriático, patata Kennebec, trufa negra Périgord, aceite Marche DOP, mantequilla cruda",
        technique: "plancha, espuma de sifón, laminado de trufa",
        authorId: rdChef!.id,
        versions: {
          create: [{ v: 1, tester: "Marco Rossi", note: "Muy prometedor. Cantidad de trufa a revisar por coste." }],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Tupinambo asado, ricotta de oveja, hongos porcini",
        category: "Entradas calientes",
        status: "approved",
        summary: "Tupinambo de Marche asado entero al carbón, ricotta di pecora acidificada, porcini salteados y aceite de katsuobushi.",
        content: `## Tupinambo asado, ricotta di pecora, porcini\n\n### Técnica\n1. Tupinambo entero, carbón 45 min hasta piel quemada.\n2. Abrir en caliente, ricotta acidificada con limón.\n3. Porcini salteados con mantequilla y ajo.\n4. Terminar con aceite de katsuobushi.`,
        ingredients: "tupinambo, ricotta di pecora, hongos porcini, katsuobushi, mantequilla cruda, limón Amalfi",
        technique: "asado al carbón, fermentación rápida, salteo",
        authorId: sousChef!.id,
        versions: {
          create: [{ v: 1, tester: "Elena Conti", note: "Plato aprobado. Excelente equilibrio vegetal." }],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Calamar di potera alla brace, emulsione di panceta",
        category: "Pescados",
        status: "draft",
        summary: "Calamar de potera Adriático a la brasa entera, emulsión caliente de panceta ibérica.",
        content: `## Calamar di potera alla brace\n\nTécnica japonesa de yakiniku adaptada al Adriático.\n\n### Ingredientes\n- 1 calamar de potera entero (~250g)\n- 80g panceta ibérica curada\n- Aceite Marche DOP`,
        ingredients: "calamar de potera, panceta ibérica, aceite Marche DOP",
        technique: "brasa, emulsión, corte a la mesa",
        authorId: rdChef!.id,
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Semifreddo di amaretto e mascarpone",
        category: "Postres",
        status: "approved",
        summary: "Semifreddo de amaretto di Saronno con mascarpone Sibilla, granizado de espresso, tuile de Parmigiano.",
        content: `## Semifreddo di amaretto e mascarpone\n\n### Ingredientes\n- 250g mascarpone\n- 100ml amaretto di Saronno\n- 60g azúcar\n- 4 huevos\n\n### Técnica\n1. Merengue italiano a 121°C.\n2. Montar mascarpone frío, incorporar amaretto.\n3. Mezclar merengue plegando, congelar en molde.`,
        ingredients: "mascarpone, amaretto di Saronno, huevos, Parmigiano Reggiano, café espresso",
        technique: "merengue italiano, semifreddo, granizado",
        authorId: chef.id,
        versions: {
          create: [{ v: 1, tester: "Marco Rossi", note: "Postre aprobado para carta permanente." }],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Espárrago verde, yema curada, Parmigiano",
        category: "Entradas frías",
        status: "testing",
        summary: "Espárrago verde de las Marcas ligeramente blanqueado, yema curada 72h en sal y azúcar, láminas de Parmigiano.",
        content: `## Espárrago verde, yema curada, Parmigiano\n\n### Técnica\n1. Yema curada: sal+azúcar 72h, deshidratada 4h.\n2. Espárrago blanqueado 90 seg, agua con hielo.\n3. Emplatar con aceite Marche DOP y láminas de Parmigiano.`,
        ingredients: "espárrago verde Marchigiano, huevos, Parmigiano Reggiano 36 meses, aceite Marche DOP",
        technique: "cura en sal, blanqueado, laminado",
        authorId: sousChef!.id,
        versions: {
          create: [{ v: 1, tester: "Luca Bianchi", note: "Concepto limpio. Testear punto de sal de la yema." }],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        name: "Gnocchi di patata, ragù di coniglio, tartufo nero",
        category: "Primeros",
        status: "draft",
        priority: true,
        summary: "Gnocchi de patata Kennebec trabajados en caliente, ragù de coniglio blanco, virutas de trufa negra Périgord.",
        content: `## Gnocchi di patata, ragù di coniglio, tartufo nero\n\n### Ingredientes\n- 500g patata Kennebec\n- 1 conejo de granja\n- 20g trufa negra Périgord\n- Harina 00\n\n### Técnica\n1. Patata al horno, pasar en caliente por tamiz.\n2. Incorporar harina mínima, no amasar.\n3. Ragù de conejo cocido 3h.\n4. Laminar trufa en el momento.`,
        ingredients: "patata Kennebec, conejo de granja Marche, harina 00, trufa negra Périgord, Parmigiano Reggiano",
        technique: "gnocchi, ragù blanco, laminado de trufa",
        authorId: rdChef!.id,
      },
    });

    // ── Menus ──────────────────────────────────────────────────────────────
    await prisma.menu.create({
      data: {
        name: "Menú Carta Otoño 2026",
        template: "elegante",
        categories: {
          create: [
            {
              name: "Entradas frías",
              order: 0,
              dishes: {
                create: [
                  { name: "Tartare di gambero rosso, agrumi e bottarga", price: 28, recipeId: r2.id },
                  { name: "Espárrago verde, yema curada, Parmigiano", price: 22 },
                ],
              },
            },
            {
              name: "Entradas calientes",
              order: 1,
              dishes: {
                create: [
                  { name: "Tupinambo asado, ricotta di pecora, hongos porcini", price: 24 },
                ],
              },
            },
            {
              name: "Primeros",
              order: 2,
              dishes: {
                create: [
                  { name: "Risotto al Verdicchio, katsuobushi e bottarga", price: 28 },
                  { name: "Tagliatelle al ragù bianco di coniglio", price: 24 },
                ],
              },
            },
            {
              name: "Pescados",
              order: 3,
              dishes: {
                create: [{ name: "Rombo chiodato, espuma de patata, trufa negra", price: 38 }],
              },
            },
            {
              name: "Carnes",
              order: 4,
              dishes: {
                create: [{ name: "Pichón en dos cocciones, puré bicolor", price: 42, recipeId: r1.id }],
              },
            },
            {
              name: "Postres",
              order: 5,
              dishes: {
                create: [{ name: "Semifreddo di amaretto e mascarpone", price: 14 }],
              },
            },
          ],
        },
      },
    });

    await prisma.menu.create({
      data: {
        name: "Menú Degustación 7 Pasos",
        template: "moderna",
        categories: {
          create: [
            { name: "Apertura", order: 0, dishes: { create: [{ name: "Snacks de bienvenida · Tupinambo chip, bottarga, aceituna esférica", price: 0 }] } },
            { name: "Primer acto", order: 1, dishes: { create: [{ name: "Tartare di gambero rosso, agrumi e bottarga", price: 0, recipeId: r2.id }] } },
            { name: "Segundo acto", order: 2, dishes: { create: [{ name: "Espárrago verde, yema curada 72h, Parmigiano 36 meses", price: 0 }] } },
            { name: "Tercer acto", order: 3, dishes: { create: [{ name: "Risotto al Verdicchio, katsuobushi e bottarga", price: 0 }] } },
            { name: "Cuarto acto", order: 4, dishes: { create: [{ name: "Rombo chiodato, espuma de patata, trufa negra", price: 0 }] } },
            { name: "Quinto acto", order: 5, dishes: { create: [{ name: "Pichón en dos cocciones, puré bicolor, radicchio encurtido", price: 0, recipeId: r1.id }] } },
            { name: "Final", order: 6, dishes: { create: [{ name: "Semifreddo di amaretto e mascarpone, granizado espresso", price: 0 }] } },
          ],
        },
      },
    });
  }

  console.log("Seed done — 3 users, 10 recipes, 23 pantry items, 2 menus.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
