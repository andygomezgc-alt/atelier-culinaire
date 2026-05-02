# Fase 2 — Inicio + Asistente: Design Spec

## Goal

Rediseñar las páginas Inicio (dashboard) y Asistente (chat) usando el design system de Fase 0/1. Las dos pantallas tienen funcionalidad existente pero usan CSS legacy y el hook `useLang` del sistema viejo; necesitan ser reescritas usando `useTranslations()` de next-intl y clases Tailwind con tokens.

## Architecture

**Reescrituras completas (misma lógica, nueva UI):**
- `src/app/[locale]/(app)/dashboard/page.tsx`
- `src/app/[locale]/(app)/chat/page.tsx`

**Nuevos componentes:**
- `src/components/RecipeCard.tsx` — card de receta estructurada renderizada en el chat
- `src/components/Toast.tsx` — notificación toast global (si no existe ya usable con el design system)

**Modificaciones:**
- `src/lib/anthropic.ts` — `buildSystemPrompt()` actualizado para instruir al modelo a emitir bloques `%%RECIPE_START%%...%%RECIPE_END%%` cuando produzca una receta completa

**Sin cambios:**
- `src/hooks/useIdeas.ts`, `src/services/ideas.ts` — se reutilizan tal cual
- `src/app/api/chat/route.ts`, `src/app/api/ideas/` — sin cambios en backend
- `src/app/api/recipes/route.ts` — ya existe, solo verificar que el POST acepta `status: "draft"`

---

## Pantalla 1 — Inicio

### Layout

Grid de 2 columnas en desktop: `grid-cols-[1fr_280px] gap-s-8`. En mobile: columna única.

Padding de página: `px-s-6 py-s-8`.

### Columna izquierda

```
h2 sans: "Inicio"
caption mono gris: "miércoles, 1 mayo 2026"   ← fecha actual formateada
gap s-6
Textarea hero
Botón GUARDAR
```

**Textarea hero:**
- `min-h-[140px]` (5 filas aprox)
- Placeholder: "Anotá una idea…" en `font-serif italic text-text-tertiary`
- Border `border-border`, focus `border-text` (2px outline)
- Sin border-radius o radius mínimo (`r-sm`)
- Componente `<Textarea>` del design system si encaja, o directo si necesita extensión

**Botón GUARDAR:**
- Alineado a la derecha bajo el textarea
- `<Button variant="ghost" size="sm">GUARDAR</Button>`
- Deshabilitado si textarea vacío

### Columna derecha

```
caption uppercase "Ideas recientes"
gap s-3
lista de rows
```

**Cada row de idea:**
- `flex justify-between items-baseline py-s-3 border-b border-border cursor-pointer`
- Hover: `bg-surface` (fondo sutil)
- Texto: `font-serif italic text-h4 text-text`
- Timestamp: `font-mono text-micro text-text-tertiary` (float right / ml-auto)
- Click → navega a `/[locale]/chat?idea=<encodeURIComponent(texto)>`

**Estado vacío:** caption italic gris "Todavía no hay ideas."

### Eliminado respecto al diseño anterior

- Nav cards con emojis (💬📋🍽️🧺) — fuera
- Stats block (contadores de recetas/menús) — fuera
- Botones de borrar idea individuales — fuera en Fase 2 (context menu en Fase 6)

### Lógica de datos

- `useIdeas()` para la lista de ideas
- `useCreateIdea()` para guardar
- `useLocale()` para construir la URL del chat
- Fecha: `new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())`

---

## Pantalla 2 — Asistente

### Layout

Pantalla completa menos topbar (ya absorbida por AppShell). Estructura:

```
┌─────────────────────────────────────────┐
│  header fijo: título + subtítulo idea   │
├─────────────────────────────────────────┤
│                                         │
│  thread (scroll)                        │
│                                         │
├─────────────────────────────────────────┤
│  input sticky                           │
└─────────────────────────────────────────┘
```

`flex flex-col h-[calc(100vh-56px)]` (56px = topbar).

### Header

```
h2 sans "Asistente"
font-serif italic text-sm text-text-secondary: "Sobre: «<texto idea>»"  ← solo si hay idea activa
border-b border-border
px-s-6 py-s-4
```

Si no hay idea activa (conversación libre), omitir el subtítulo.

### Thread (área de mensajes)

`flex-1 overflow-y-auto px-s-6 py-s-6 space-y-s-6`

**Mensaje de usuario:**
```
text-align: right
font-serif italic text-body text-text
max-w-[60%] ml-auto
py-s-2
```

**Mensaje de IA:**
```
text-align: left
font-sans text-body text-text
max-w-[75%]
py-s-2
```

Separador entre pares de turnos: `border-t border-border my-s-4`

**Estado "thinking":** tres puntos animados en `font-sans text-text-tertiary` alineados izquierda.

**RecipeCard:** ver sección abajo. Se renderiza inline en el thread, ocupa el ancho completo del mensaje de IA.

### Input sticky

`sticky bottom-0 bg-bg border-t border-border px-s-6 py-s-4`

```
flex gap-s-3 items-end
Textarea (1 línea, auto-expand hasta 120px)   placeholder: "Seguí conversando…" italic serif
Botón → (Button variant="primary" size="sm")
```

### Precarga desde Inicio

Al llegar con `?idea=<texto>`:
1. `useSearchParams()` lee el parámetro `idea`
2. Construye el primer mensaje: `"${texto}"` y lo envía automáticamente al montar
3. El subtítulo del header muestra "Sobre: «<texto>»"

Si no hay `?idea`, la conversación empieza vacía.

### Lógica de conversación

- Al enviar: POST a `/api/chat` con `{ message: texto, conversationId: convId | null }`
- La respuesta incluye `{ conversationId, message: { role, content } }`
- `setConvId` al recibir la primera respuesta
- Mensajes en estado local `useState<Msg[]>`

---

## Componente RecipeCard

### Detección

En `src/lib/anthropic.ts`, `buildSystemPrompt()` añade instrucción al final:

```
Cuando el chef pida una receta completa, devuelve exactamente este formato:

%%RECIPE_START%%
{
  "title": "Nombre del plato",
  "yield": "4 pax",
  "prepTime": "2h",
  "costPerServing": "38,00 €",
  "composition": "Lista de ingredientes principales separados por coma",
  "method": ["Paso 1.", "Paso 2.", "Paso 3."]
}
%%RECIPE_END%%

Fuera del bloque puedes añadir texto introductorio o conclusión.
```

### Parsing en el frontend

En `chat/page.tsx`, antes de renderizar un mensaje de IA:

```typescript
const RECIPE_RE = /%%RECIPE_START%%([\s\S]*?)%%RECIPE_END%%/;

function parseMessage(content: string): { text: string; recipe: RecipeData | null } {
  const match = content.match(RECIPE_RE);
  if (!match) return { text: content, recipe: null };
  try {
    const recipe = JSON.parse(match[1].trim());
    const text = content.replace(RECIPE_RE, "").trim();
    return { text, recipe };
  } catch {
    return { text: content, recipe: null };
  }
}
```

### Estructura del componente

`src/components/RecipeCard.tsx`:

```
border border-border rounded-sm overflow-hidden my-s-4
├── header: px-s-6 py-s-4 border-b border-border
│   ├── font-serif italic text-h3: título
│   └── font-mono text-caption text-text-secondary: "rinde X · Yh prep · €"
├── section Composition: px-s-6 py-s-4 border-b border-border
│   ├── label: caption uppercase text-text-tertiary
│   └── font-sans text-body text-text-secondary: texto
├── section Method: px-s-6 py-s-4 border-b border-border
│   ├── label: caption uppercase text-text-tertiary
│   └── ol numerada: font-sans text-body
└── footer: px-s-6 py-s-3 text-right
    └── Button variant="ghost" size="sm": "GUARDAR COMO RECETA →"
```

```typescript
type RecipeData = {
  title: string;
  yield: string;
  prepTime: string;
  costPerServing: string;
  composition: string;
  method: string[];
};
```

Props: `{ data: RecipeData; onSave: () => void; saved: boolean }`

Cuando `saved=true`: botón cambia a "Guardada ✓" deshabilitado.

### Flujo GUARDAR

El schema de `/api/recipes` usa `name` (string), `ingredients` (string), `content` (string), `status` enum.

1. Click en botón → POST a `/api/recipes` con:
   ```json
   {
     "name": "<recipe.title>",
     "ingredients": "<recipe.composition>",
     "content": "<recipe.method.join('\\n')>",
     "status": "draft"
   }
   ```
2. En `onSuccess`: `setSaved(true)` + mostrar Toast "Guardada como borrador"
3. Toast: aparece en esquina inferior derecha, desaparece a los 3s

---

## Toast

`src/components/Toast.tsx` — si el existente (`src/components/Toast.tsx`) no usa los tokens del design system, reemplazarlo.

Spec visual:
```
position: fixed bottom-s-6 right-s-6 z-[70]
bg-invert text-invert-text
px-s-5 py-s-3 rounded-sm shadow-sm
font-serif italic text-body
transición: fade-in 120ms, fade-out 120ms, auto-dismiss 3s
```

API: `useToast()` hook que acepta `toast("mensaje")`.

---

## Internacionalización

Claves nuevas a añadir en `messages/{es,it,fr,en}.json`:

```json
"inicio-title": "Inicio",
"idea-placeholder": "Anotá una idea…",
"idea-save": "GUARDAR",
"ideas-recent": "Ideas recientes",
"ideas-empty": "Todavía no hay ideas.",
"chat-title": "Asistente",
"chat-about": "Sobre:",
"chat-placeholder": "Seguí conversando…",
"chat-thinking": "pensando…",
"recipe-save-btn": "GUARDAR COMO RECETA →",
"recipe-saved-btn": "Guardada ✓",
"recipe-saved-toast": "Guardada como borrador",
"recipe-composition": "Composition",
"recipe-method": "Method"
```

---

## Verificación (GATE 2)

1. Inicio: textarea visible y funcional, ideas aparecen como rows clickeables
2. Click en idea → `/[locale]/chat?idea=<texto>`, header muestra "Sobre: «...»", mensaje se pre-envía
3. Chat: mensajes de usuario en serif italic derecha, IA en sans izquierda, sin globos
4. Cuando la IA devuelve receta: se renderiza RecipeCard con secciones Composition + Method
5. Click GUARDAR COMO RECETA → POST /api/recipes, botón cambia a "Guardada ✓", toast aparece
6. Toast aparece y desaparece en 3s
7. En mobile: layout de columna única, input sticky funciona
8. Los 4 locales renderizan sin errores
