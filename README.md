# Atelier Culinaire

App fullstack de gestión culinaria para el **Ristorante Marche**. Cuaderno digital del chef: recetas, menús, despensa, asistente IA.

**Stack:** Next.js 14 (App Router) · TypeScript · React 18 · Tailwind + CSS vars · Prisma + PostgreSQL · NextAuth · Anthropic SDK · Vercel Blob.

## Setup local (< 2 minutos)

**Requisitos:** Node 20+, Docker Desktop.

```bash
git clone <repo>
cd atelier-culinaire-app

cp .env.example .env
# Edita .env: añade ANTHROPIC_API_KEY y genera NEXTAUTH_SECRET:
#   openssl rand -base64 32

docker compose up -d          # Arranca PostgreSQL en localhost:5432
npm install
npm run db:migrate            # Crea tablas (prisma migrate dev)
npm run db:seed               # Inserta chef + datos de ejemplo
npm run dev                   # http://localhost:3000
```

Login con las credenciales del seed (o las que pongas en `.env`):
- **Email:** `chef@ristorantemarche.it`
- **Password:** `atelier2026`

### Comandos útiles

```bash
npm test              # Vitest (39 tests)
npm run test:watch    # Modo watch
npm run test:coverage # Coverage report
npm run format        # Prettier
npm run lint          # ESLint
npm run db:seed       # Re-seed (idempotente)
```

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://postgres:postgres@localhost:5432/atelier` |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | URL pública (`http://localhost:3000` en dev) |
| `ANTHROPIC_API_KEY` | ✅ | Clave Anthropic |
| `ANTHROPIC_MODEL` | — | Modelo (default `claude-sonnet-4-20250514`) |
| `BLOB_READ_WRITE_TOKEN` | Prod | Vercel Blob token para subida de fotos |
| `GOOGLE_CLIENT_ID/SECRET` | — | OAuth de Google (opcional) |
| `SEED_CHEF_*` | — | Credenciales del chef inicial |

## Deploy en Vercel

1. Crea un Postgres serverless (Neon, Supabase o Vercel Postgres) y configura `DATABASE_URL`.
2. Crea un Vercel Blob store y configura `BLOB_READ_WRITE_TOKEN` — necesario para que las fotos persistan entre deploys.
3. Añade `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`.
4. El build (`vercel.json`) ya ejecuta `prisma generate && prisma migrate deploy && next build`.
5. Primer arranque: ejecuta `npm run db:seed` desde Vercel CLI o la pestaña Logs.

## Funcionalidades

| Módulo | Estado |
|---|---|
| Auth (credenciales + Google OAuth) | ✅ |
| Dashboard — ideas, stats en vivo | ✅ |
| Recetas — CRUD, versiones, fotos, estados | ✅ |
| Menús — editor visual, drag-drop, export PDF | ✅ |
| Despensa — tabla editable, filtros por categoría | ✅ |
| Casa — restaurante, equipo, permisos | ✅ |
| Perfil — foto, idioma, cambio de contraseña | ✅ |
| Chat IA (Anthropic SDK, historial persistido) | ✅ |
| i18n ES / IT / EN | ✅ |
| Escandallos + alérgenos UE | 🔜 Fase 4 |
| Lista de compra + proveedores | 🔜 Fase 5 |
| Calendario de servicios | 🔜 Fase 5 |

## Estructura

```
prisma/
  schema.prisma       # Modelos: User, Recipe, Menu, Pantry, Restaurant, Team, Chat
  seed.ts             # Datos de ejemplo: 3 chefs, 10 recetas, 2 menús, 15+ ingredientes

src/
  lib/
    auth.ts           # NextAuth config + requireUser()
    db.ts             # Prisma client singleton
    env.ts            # Validación zod de env vars al boot
    logger.ts         # Pino logger (pretty en dev, JSON en prod)
    storage.ts        # Abstracción de subida de archivos (Vercel Blob / local)
    anthropic.ts      # Cliente Anthropic + system prompt
    i18n.ts           # Diccionario trilingüe (ES/IT/EN, ~150 keys)
    validation/       # Schemas zod por entidad (recipe, menu, pantry, …)
    api/
      handler.ts      # ok() · err() · parseBody() · withErrorHandler()

  app/
    api/              # 25 endpoints REST (todos validados con zod + withErrorHandler)
    (app)/            # Rutas protegidas: dashboard, recipes, menus, pantry, casa, chat
    login/            # Login page

  components/
    AppShell.tsx      # Layout: sidebar desktop + bottom nav móvil
    RecipeModal.tsx   # Editor de recetas (CRUD + versiones + fotos)
    …

  test/
    setup.ts          # Vitest global setup
```

## Arquitectura de API

Todos los endpoints siguen el mismo patrón:

```typescript
export const POST = withErrorHandler(async (req: Request) => {
  const u = await requireUser()              // 401 si no autenticado
  const parsed = await parseBody(req, schema) // 400 si payload inválido
  if (!parsed.success) return parsed.response
  // lógica de negocio…
  return NextResponse.json(result)
})
```
