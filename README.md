# Atelier Culinaire

App fullstack del prototipo "Atelier Culinaire". Cuaderno digital del chef del **Ristorante Marche**.

**Stack:** Next.js 14 (App Router) · TypeScript · React 18 · Tailwind (vars CSS del prototipo) · Prisma + SQLite · NextAuth · Anthropic SDK.

## Funcionalidades

1. **Auth** — login/logout (NextAuth credenciales). Cuenta del chef sembrada al primer arranque.
2. **Inicio** — bloc de ideas (CRUD), estadísticas en vivo (ideas, en desarrollo, aprobadas, menús).
3. **Asistente IA** — chat con Anthropic (`claude-sonnet-4-20250514` por defecto). El system prompt inyecta identidad del Ristorante Marche, despensa y recetas. Historial persistido por conversación.
4. **Recetas** — CRUD, estados (draft → testing → approved), prioridad, versiones de prueba con notas, fotos adjuntas.
5. **Menús** — lista + editor con categorías y platos, drag-and-drop dentro de categoría, vista previa en vivo (3 plantillas), exportación PDF para cliente y para cocina (vía `window.print`).
6. **Despensa** — tabla editable inline con filtros por categoría (verduras, pescados, carnes, secos, lácteos).
7. **Casa** — identidad del restaurante, perfil del chef (nombre, rol, iniciales, foto), equipo con roles.
8. **i18n** — ES / IT / EN en toda la app.

## Setup local

```bash
cp .env.example .env
# edita .env y pon ANTHROPIC_API_KEY y NEXTAUTH_SECRET (openssl rand -base64 32)

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

App en http://localhost:3000. Login con las credenciales del seed:

- **Email:** `chef@ristorantemarche.it`
- **Password:** `atelier2026`

(O lo que pongas en `SEED_CHEF_EMAIL` / `SEED_CHEF_PASSWORD`.)

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | SQLite por defecto. En Vercel cambiar a Postgres (Neon/Supabase) y editar `provider` en `prisma/schema.prisma`. |
| `NEXTAUTH_SECRET` | Secreto JWT. Generar con `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | URL pública (en Vercel se autodetecta). |
| `ANTHROPIC_API_KEY` | Clave de la API de Anthropic. |
| `ANTHROPIC_MODEL` | Modelo (default `claude-sonnet-4-20250514`). |
| `SEED_CHEF_EMAIL/PASSWORD/NAME` | Cuenta inicial creada por el seed. |

## Deploy en Vercel

1. **Base de datos:** SQLite no funciona en Vercel (filesystem efímero). Usa Postgres serverless (Neon, Supabase o Vercel Postgres):
   - Cambia `provider = "postgresql"` en `prisma/schema.prisma`.
   - Define `DATABASE_URL` en Vercel.
2. **Subidas de fotos:** la API `/api/upload` escribe en `public/uploads/` (también efímero en Vercel). Para producción cambia a Vercel Blob, S3 o Cloudinary editando `src/app/api/upload/route.ts`.
3. **Variables:** añade `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (URL del deploy), `ANTHROPIC_API_KEY`, `DATABASE_URL`.
4. **Build:** `vercel.json` ya define `prisma generate && prisma migrate deploy && next build`.
5. **Seed (primer arranque):** ejecuta `npx prisma db seed` desde la pestaña "Logs" o conectado por CLI.

## Estructura

```
prisma/
  schema.prisma         # User, Restaurant, TeamMember, Idea, Recipe(+Version,+Photo),
                        # Menu(+Category,+Dish), PantryItem, Conversation(+Message)
  seed.ts               # Chef + restaurante + recetas/menú/despensa de ejemplo
src/
  app/
    layout.tsx, globals.css   # Diseño del prototipo (vars CSS, sidebar, etc.)
    page.tsx                  # Redirect login/dashboard
    login/                    # Login NextAuth credenciales
    (app)/                    # Layout protegido (sidebar)
      dashboard/  chat/  recipes/  menus/  pantry/  casa/
    api/
      auth/[...nextauth]/  auth/register/
      profile/  restaurant/  team/[id]
      ideas/[id]
      recipes/[id]/{versions,photos}
      menus/[id]/{categories/[catId], dishes/[dishId]}
      pantry/[id]
      conversations/[id]
      chat/                   # Anthropic call + persistencia
      upload/                 # Multipart → public/uploads/
  components/
    AppShell.tsx              # Sidebar + nav + lang switch + logout
    LangProvider.tsx          # Hook + persistencia del lang en /api/profile
    Toast.tsx                 # Toast global
    RecipeModal.tsx           # Edición + versiones + fotos
    icons.tsx                 # SVGs del prototipo
  lib/
    auth.ts  db.ts  i18n.ts  utils.ts  anthropic.ts
```

## Notas de implementación

- **Persistencia:** todo en BD vía Prisma. No hay `localStorage` (`useLang` guarda el idioma en `User.lang`).
- **Anthropic:** se llama desde el server (`/api/chat`); la key NUNCA llega al cliente.
- **PDF:** se abre una pestaña con HTML + CSS print + `window.print()`. Sin librerías pesadas. Los estilos copian los del prototipo.
- **Drag & drop de platos:** HTML5 nativo dentro de cada categoría, con persistencia del nuevo `order` en el server.
- **Diseño:** `globals.css` reproduce 1:1 los tokens y componentes del prototipo. No se usa Tailwind utility-first significativamente: el diseño es CSS clásico para mantener el look exacto.

## Endpoints rápidos

- `GET /api/profile` · `PUT /api/profile`
- `GET/PUT /api/restaurant` · `GET/POST /api/team` · `PUT/DELETE /api/team/:id`
- `GET/POST /api/ideas` · `PUT/DELETE /api/ideas/:id`
- `GET/POST /api/recipes` · `GET/PUT/DELETE /api/recipes/:id`
- `POST /api/recipes/:id/versions` · `POST/DELETE /api/recipes/:id/photos`
- `GET/POST /api/menus` · `GET/PUT/DELETE /api/menus/:id`
- `POST /api/menus/:id/categories` · `PUT/DELETE/POST /api/menus/:id/categories/:catId`
- `PUT/DELETE /api/menus/:id/dishes/:dishId`
- `GET/POST /api/pantry` · `PUT/DELETE /api/pantry/:id`
- `GET/POST /api/conversations` · `GET/DELETE /api/conversations/:id`
- `POST /api/chat` `{ conversationId?, message, lang? }`
- `POST /api/upload` (multipart `file`)
