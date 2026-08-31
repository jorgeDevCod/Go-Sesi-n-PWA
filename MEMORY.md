 # Go Sesión — Memoria del proyecto

 > PWA de enfoque personal. "Reserva tu espacio y haz que cada momento cuente."
> **Fase actual:** 2.19 — Preparación para producción (Vercel + Neon). Sobre la base de la 2.18: refactor del auth para ser Edge-safe (build de Vercel), repo git inicializado con commits, y README actualizado con los pasos exactos de despliegue.

---

## Preparación para producción (fase 2.19)

- **Refactor auth edge-safe**: creación de `auth.config.ts` (NextAuthConfig sin bcrypt/Prisma, usada por el middleware) y `auth.ts` completo (providers + `authorize` con bcrypt/Prisma, runtime Node). `proxy.ts` ahora usa `NextAuth(authConfig).auth(...)` para no arrastrar módulos Node-only al bundle del middleware (evita que el build de Vercel/Edge falle).
- **Git**: `git init` + 2 commits (`Go Sesion - lista para produccion`, `Actualiza README`). `.gitignore` corregido (`next-env.d.ts`), verificado que no se suben `.env`, `node_modules`, `.next` ni `lib/generated/prisma`.
- **README**: reescrito con los pasos exactos de Neon (connection string pooled + `sslmode=require`) y Vercel (env vars `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`).
- **Verificación**: build de producción exitoso, tests 117/117, lint limpio.

---

## Fondos de temas verde y rosa (fase 2.18)

- **`.verde`**: `--background` de `#e8f3e6` → `#e2f0e1` (verde menta pastel más claro), acompañado de `surface-muted: #eef6ed`, `surface-hover: #e2eedf`, `border: #c3d5c2`, `border-hover: #94aa93`.
- **`.rosa`**: `--background` de `#f3dae5` → `#f6e2ec` (rosa pastel más claro), con `surface-muted: #fceff5`, `surface-hover: #f4dce7`, `border: #d5aec0`, `border-hover: #b07f95`.
- Los swatches del `ThemeToggle` (colores de marca) permanecen sin cambios por ser la identidad visual.

---

---

## Cards compactas y surface (fase 2.17)

- **`CategoryHomeCard`**: rediseño de columna a **layout horizontal compacto** (`px-3.5 py-3`, icono `size-10`, nombre + conteo, chevron a la derecha con hover accent). Más atractivo y denso.
- **Paleta de temas claros** (`globals.css`): `bling / :root, .celeste, .verde, .humo, .rosa` → `surface` blanco puro, `surface-muted` más suave y `border`/`border-hover` con mejor definición.
- **Tema `blanco`**: `surface` ahora blanco puro (antes `#f3f4f6`), `surface-muted` más suave y `border` sin alpha (`#d5d8e0`), para que las cards se vean limpias sobre fondo blanco.

---

---

## Accesos rápidos y cards de categorías (fase 2.16)

- **Store persistente `home-quick`** (`features/home/store/home-quick.store.ts`): Zustand + persist en localStorage (`gosession-home-quick`). Guarda actividades marcadas como "al inicio" (subcategoría + metadata de categoría + complejidad + orden). Exponer `add/remove/isAdded/reorder`.
- **Botón "Agregar al inicio"** (`SubcategoryItem`): icono Casa (`House`) que alterna agregar/quitar del home, junto a "Iniciar". Se rellena cuando está agregada.
- **Metadata de categoría** propagada: `SubcategoryList` ahora recibe `categoryIcon`/`categoryColor` y los pasa a cada `SubcategoryItem`. Se alimenta desde `CategoryTabs` (vista Actividades) y `ActivitiesTab` (Personalizar).
- **`HomeQuickSection`** (`features/home/components/HomeQuickSection.tsx`): nueva sección "Accesos rápidos" al final del home, con cards estilo actividades planificadas (icono, título, categoría, badge de dificultad, botón Play, botón para quitar en hover). Se rehidrata el store al montar.
- **Cards de categorías** (`CategoryHomeCard`): rediseño de 1 fila a columna (icono arriba + nombre + conteo de actividades), hover con elevación sutil (`-translate-y-0.5`), icono con `rounded-2xl` y tinte suave.
- **Sección de categorías** (`CategoryHomeGrid`): subtítulo de sección, grid más aireada.

---

---

## Flujo de guía en bienvenida (fase 2.15)

- **Tercera opción "Prefiero conocer cómo funciona la App primero"** (`AppShell`): al elegirla se consulta el plan del día; si existe un plan con items se muestra `PlanContinuePrompt`, si no se abre directamente `AppGuideModal`.
- **PlanContinuePrompt solo con planificación**: el prompt de "¿mantener o empezar desde cero?" únicamente se muestra cuando hay un plan guardado con items (`result.plan.items.length > 0`).
- **No continuar planificación → modal informativo primero**: al elegir "Iniciemos desde cero" ya no redirige de inmediato; ahora borra el plan, marca `redirectAfterGuide = true` y abre `AppGuideModal`. Al cerrar la guía, `closeGuide` navega al home.
- **Continuar planificación → guía**: "Continuemos planificación" mantiene el plan y abre la guía sin redirigir al cerrarla.

---

---

## Tema en landing y accesos (fase 2.14)

- **ThemeToggle en la landing** (`app/(marketing)/page.tsx`): el círculo de temas ahora aparece junto a "Iniciar sesión" en el header público, para cambiar el tema desde la página inicial.
- **Desplegable de temas sobre el toast** (`ThemeToggle.tsx` + `PersonalizeRoutineCard.tsx`): el dropdown pasó a `z-[200]`, el header sticky del app a `z-40`, y el toast "Personalizar tus recomendaciones" bajó a `z-30`. Así el desplegable siempre queda por encima del mensaje flotante al abrirse.
- **Botón "Inicio" en el header del app** (`AppShell.tsx`): primera acción del bloque de navegación (desktop), enlaza a `/app/home` con icono `Home` y `title="Ir a home"`.

---

---

## Pulido de energía, historial y plan (fase 2.13)

- **Selector de energía (`EnergyPicker`)**:
  - Contraste por nivel garantizado: ámbar (baja) → texto oscuro `#4a2d00`; verde/índigo → texto blanco.
  - Estado no seleccionado con **hover** que tiñe el botón con el color de energía (`ENERGY_TINT_HOVER`) y resalta el borde.
  - Nuevos utilitarios en `energy-level.ts`: `ENERGY_TEXT`, `ENERGY_TINT`, `ENERGY_TINT_HOVER`.
- **Historial: tiempo extendido**:
  - Añadido campo `extendedMinutes Int @default(0)` a `FocusSession` (migración `add_extended_minutes`), acumulado en `extend-session.service.ts`.
  - Expuesto en `SessionHistoryEntry`. La card ahora muestra "**Extendida: +Xmin**" (completada) o "**Extendida antes: +Xmin**" (interrumpida), con tooltip del nº de veces.
- **Scroll al planificar**: el listener `gosession-scroll-to-plan` en `PlannedCategories` ahora reintenta hasta que el ref esté montado (los items llegan tras `router.refresh()`).
- **Blindaje de claves**: claves potencialmente vacías en grupos (`PlannedCategories`) protegidas con fallback a un identificador estable.
- **Build**: migración aplicada, `prisma generate` OK, build y tests 117/117.

---

## Refinamiento visual (fase 2.12)

- **Tipografía dual** (`app/layout.tsx` + `app/globals.css`):
  - `Work_Sans` → `--font-work-sans`, expuesta como utilidad `font-work`. Se aplica a botones y controles (Button, ComplexityPicker, EnergyPicker, DifficultyPicker, botones inline de ActivityModal).
  - `Plus_Jakarta_Sans` → `--font-plus-jakarta`, mapeada a `--font-sans` (default). Se usa para títulos, descripciones y texto general.
  - Se mantiene `JetBrains_Mono` para números/código.
  - Se eliminó `Inter`/`--font-geist-sans`.
- **Párrafos en modales de dificultad**: el texto explicativo (`hint`) ahora se muestra **arriba de los botones, junto al label** (antes quedaba debajo de la grilla). Ajustado en `ComplexityPicker` (usado en CategoryModal/CategoryForm/PlanningModal).
- **Tema rosa**: se corrigió un fondo con alpha (`#f2dde3d8`) que rompía contraste por un fondo sólido rosado (`#fdf0f4`), y se reforzaron bordes/`muted-foreground` para mejor legibilidad.
- **Tema dark**: fondo y superficies ligeramente más profundos, bordes y `muted-foreground` más claros para mejor contraste sin perder armonía.

---

## Preparación para producción (fase 2.11)

- **Corrección crítica**: en `prisma/schema.prisma` el `generator client` usaba `provider = "prisma - client"` (con espacios), lo que hacía fallar `prisma generate` con `spawn prisma-client ENOENT`. Corregido a `provider = "prisma-client"`.
- **`package.json`**: `build` ahora es `prisma generate && prisma migrate deploy && next build`; se agregó el script `db:deploy` (`prisma migrate deploy`). Así el cliente se regenera y las migraciones se aplican automáticamente en cada deploy.
- **`vercel.json`**: framework `nextjs`, `buildCommand` explícito y `installCommand`, para dejar el pipeline de deploy claro.
- **`.env.example`**: documentadas `DATABASE_URL` (dev local + Neon pooled con `sslmode=require`), `AUTH_SECRET` y `NEXT_PUBLIC_SITE_URL`.
- **`README.md`**: reescrito con instrucciones de despliegue en **Vercel + Neon** (ambos con plan gratuito) y los pasos de subida a GitHub (git init / push).
- **Stack de producción recomendado**: Vercel (Hobby) como hosting de Next.js + Neon (free tier) como Postgres serverless, compatible con el `@prisma/adapter-pg` ya usado. Alias: `AUTH_SECRET` de 32 bytes en base64, `DATABASE_URL` pooled de Neon, `NEXT_PUBLIC_SITE_URL` al dominio del deploy.
- **Cliente Prisma** (`lib/generated/prisma`) sigue ignorado por Git: se genera durante el build en Vercel.

---

## Cambios recientes (fase 2.9, no registrados antes)

- **Rebrand a Go Sesión**: `Logo` con icono `[Go]` + texto "Sesión", landing con tagline "Reserva tu espacio de enfoque", PWA ícono "G", claves de storage renombradas a `gosession-*`.
- **Tipografía**: `Geist Sans` → `Inter` (400/500/600/700) + `JetBrains Mono`.
- **Pestañas de rutina**: eliminadas las pestañas "Recomendaciones" y "Por defecto" viejas; quedan **Categorías / Actividades / Recomendaciones**. `DefaultsTab.tsx` eliminado.
- **`TimeChipList`** (reemplaza `TimeStepper`): chips de tiempo siempre visibles, editables y eliminables; botón "Agregar tiempo" abre selector de horas/minutos + rol (Mín/Rec/Máx); valores se persisten en `recommendationCombos` y alimentan `suggestedMinutesFor`.
- **RecommendationsTab**: selector de energía (auto-selecciona dificultad según energía: baja→Ligera, media→Moderada, alta→Intensa), dificultades, acordeones de categorías con actividades seleccionables por combinación energía+dificultad, tiempos por defecto según `effectiveRecommendedDuration`.
- **Modales categoría/actividad**: sección simplificada a 2 filas (`Dificultad` + `Energía` con `EnergyPicker`), sin tercera fila redundante.
- **Plan del día**: colapsable como dropdown; eliminación por categoría con "Eliminar todo" + icono X por actividad (hover con title), sin selección múltiple.
- **Home**: título central "Tu espacio personal...", CTA "No sé qué hacer" bajo el selector de energía, categorías abiertas por defecto, auto-scroll según entrada (4ª opción / sin plan).
- **Card "Personalizar recomendaciones"**: convertida en **toast flotante descartable** (X, sessionStorage `gosession-personalize-seen`, solo al iniciar sesión).
- **RecommendedActivityCard**: uniformizada (borde sutil en destacada, badge "Recomendada", razón truncada a 2 líneas).
- **Historial**: cards rectas (sin rotación aleatoria), grilla `grid-cols-1 sm:2 lg:3`.
- **Colores de bordes por tema**: `globals.css` — bordes y `muted-foreground` ajustados en los 6 temas para mejor contraste.
- **Skeleton de carga**: `components/ui/Skeleton.tsx` + `SessionLoading` en `SessionExperience` (antes pantalla en blanco).
- **Countdown**: default reducido 5s → 3s.
- **Empty state de recomendaciones**: eliminado el early-return viejo; sin recomendaciones cae a búsqueda/exploración.
- **Seguridad**: `proxy.ts` matcher ahora incluye `/api/:path*`.

---

## Cambios recientes (fase 2.10)

- **Cronómetro para sesiones largas**: `TimerScreen` y `deriveTimerView` ahora detectan tiempos ≥1h y los muestran en dos líneas (`1h 23m` + `45s restantes`) para evitar que el texto se vea apretado dentro del anillo.
- **Sesiones inconclusas**: nuevo `ResumeSessionPrompt` que detecta una sesión `ACTIVE` al volver a la app, muestra la actividad y tiempo restante, y permite continuar (`/app/session`) o ignorarla (interrumpe la sesión en el servidor vía `interruptSessionAction`).
- **WelcomeModal "No mostrar más hoy"**: opción visible en el modal de bienvenida. El guard pasó de `sessionStorage` a `localStorage` con clave por día (`gosession-welcome-seen-YYYY-MM-DD`).
- **Energía una vez al día**: `MoodModal` y `EnergySurvey` comparten el guard `gosession-mood-answered-<YYYY-MM-DD>`. Si el usuario respondió su ánimo hoy, no se vuelve a preguntar en ningún flujo. El `MoodModal` incluye texto explicativo.
- **Crear actividades desde planificación**: `PlanningModal` permite crear una actividad personalizada por categoría con `ActivityModal`; al guardar se crea en BD y se vincula automáticamente al plan.
- **Control de etiquetas en Recomendaciones**: `TimeChipList` ahora protege los tiempos con etiqueta Mín/Rec/Máx (no se eliminan, muestra alerta), evita duplicados al crear/editar/reemplazar y mantiene el reemplazo de etiquetas sin perder el tiempo anterior.
- **Etiquetas "ex:" y "Agregado"**: cualquier chip puede asumir el rol Mín/Rec/Máx. El chip desplazado muestra `ex: Mín/Rec/Máx` para recordar su última etiqueta. Solo los tiempos agregados manualmente muestran el badge `Agregado` cuando no tienen rol activo ni etiqueta `ex:`. Los duplicados se bloquean con el mensaje "Este tiempo ya existe, agregue otro.".
- **FinishScreen motivacional**: mensajes diferenciados y cercanos para sesiones completadas vs. interrumpidas. El tiempo terminado ofrece volver al Home o seguir con algo más ligero; la interrupción ofrece ver todas las actividades o encontrar algo más corto/diferente.
- **Filtros de actividades**: nuevo componente `ActivityFilters` (energía + dificultad) integrado en `SubcategoryList` (`/app/subcategories`) y `SessionWizard` (`/app/session/new`).
- **AppGuideModal actualizado**: 8 secciones reescritas con la funcionalidad actual de la plataforma y tono descriptivo/cercano.
- **Tests**: 115 tests en 14 archivos.

---

## Stack

Next.js 16 (App Router) · TypeScript estricto · TailwindCSS v4 · Prisma 7 (driver adapter `@prisma/adapter - pg`) · PostgreSQL · Auth.js (NextAuth v5, Credentials + JWT) · Zustand · dnd - kit · Framer Motion · Zod · Vitest

 -  -  - 

## Arquitectura (Clean Architecture pragmática)

```
app/ (rutas) → features/ (UI + hooks + actions) → services/ (casos de uso) → repositories/ (acceso datos) → Prisma
                              ↕                                              ↕
                    lib/ (utensilios puros)                    types/ (augmentación de tipos)
```

 -  **app/** - App Router: layouts, pages, API routes, PWA icons
 -  **features/** - Organizado por dominio (auth, categories, session, history, home, recommendation, planning, routine). Cada dominio contiene: schemas (Zod), actions (Server Actions), components, hooks, store (Zustand), utils
 -  **services/** - Casos de uso puros, orquestan repositorios, validan reglas de negocio, lanzan errores personalizados
 -  **repositories/** - Acceso a datos vía Prisma. Sin lógica de negocio
 -  **lib/** - Utilidades puras (sin imports de Next/prisma): timer math, order, duration - parser, password, prisma client singleton
 -  **components/** - Componentes UI compartidos (Button, Input, AppShell, ConfirmModal, Breadcrumbs, etc.)
 -  **types/** - Augmentación de tipos (next - auth.d.ts)

 -  -  - 

## Modelo de datos (PostgreSQL via Prisma 7)

### User (`users`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| name | String | |
| email | String | Único |
| passwordHash | String | bcryptjs, 10 rounds |
| defaultsSeeded | Boolean | Backfill legacy (obsoleto por `seedVersion`) |
| seedVersion | Int | Versión de semillas aplicadas; backfill idempotente la compara con `CURRENT_SEED_VERSION` |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| **Relaciones:** categories, subcategories, focusSessions, dailyPlans | | |

### Category (`categories`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| key | String? | Para seed data: "aprender", "salud", etc. |
| name | String | Único por usuario |
| icon | String | Nombre de lucide - react |
| color | String | Hex |
| order | Int | Posición |
| isDefault | Boolean | Si es seed |
| complexity | Complexity | Dificultad de la categoría (LOW/MEDIUM/HIGH) - usada por la recomendación y como default al crear actividades |
| energyLevel | String? | Ánimo (baja/media/alta) para el que se personaliza la dificultad |
| energyComplexity | Complexity? | Dificultad a usar cuando la energía coincide con energyLevel |
| userId | String | FK → User (Cascade) |
| **Unique:** `[userId, key]`, `[userId, name]` | | |
| **Index:** `[userId, order]` | | |

### Subcategory (`subcategories`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| name | String | Único por usuario+category |
| icon | String | Nombre de lucide - react |
| color | String | Hex |
| order | Int | Posición |
| complexity | Complexity | Dificultad (LOW/MEDIUM/HIGH) |
| energyLevel | String? | Ánimo para el que se personaliza la dificultad |
| energyComplexity | Complexity? | Dificultad cuando la energía coincide |
| categoryId | String | FK → Category (Restrict) |
| userId | String | FK → User (Cascade) |
| **Unique:** `[userId, categoryId, name]` | | |
| **Index:** `[userId, categoryId, order]` | | |

### FocusSession (`focus_sessions`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| status | SessionStatus | ACTIVE \| COMPLETED \| INTERRUPTED |
| startedAt | DateTime | |
| endedAt | DateTime? | |
| plannedMinutes | Int | Minutos planificados |
| actualMinutes | Int? | Minutos reales (sin pausas) |
| pausedMs | Int | Tiempo total acumulado en pausa (ms) |
| pausedAt | DateTime? | null = no pausado |
| extendedCount | Int | Veces que se extendió |
| energyLevel | String? | (futuro) |
| comment | String? | (futuro) |
| activeUserId | String? | @unique - enforce 1 sesión activa por usuario |
| subcategoryId | String | FK → Subcategory (Restrict) |
| userId | String | FK → User (Cascade) |
| **Indexes:** `[userId, status]`, `[userId, startedAt]` | | |

### DailyPlan (`daily_plans`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| userId | String | FK → User (Cascade) |
| date | DateTime | Solo día vía UTC truncation |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| **Unique:** `[userId, date]` | Una planificación por usuario y día | |
| **Relación:** items → PlanItem[] | | |

### PlanItem (`plan_items`)
| Campo | Tipo | Notas |
| -  -  -  -  -  -  - | -  -  -  -  -  - | -  -  -  -  -  -  - |
| id | String (cuid) | PK |
| planId | String | FK → DailyPlan (Cascade) |
| categoryId | String? | FK → Category (SetNull) - referencial |
| subcategoryId | String? | FK → Subcategory (SetNull) - actividad vinculada |
| title | String | Nombre visible |
| icon | String | Nombre de lucide - react |
| color | String | Hex |
| order | Int | Posición |
| completed | Boolean | false por defecto |
| **Index:** `[planId, order]` | | |

### SessionStatus enum
`ACTIVE` | `COMPLETED` | `INTERRUPTED`

 -  -  - 

## Flujo de navegación

```
/ (landing marketing - hero, beneficios, FAQ, footer)
│
├─ /login → AuthShell → LoginForm (useActionState + loginAction)
│   → credentials → verifyPassword → JWT
│
├─ /register → AuthShell → RegisterForm (useActionState + registerAction)
│   → hashPassword + createUser en transacción con 5 seed categories + 13 seed subcategories
│   → auto - signIn("credentials") → redirect /app/home
│
└─ /app/* (protegido por proxy.ts - middleware)
      └─ /api/* (también protegido por el matcher `["/app/:path*", "/api/:path*"]`)
    │
    ├─ /app/home → AppShell (sin flecha back, sin breadcrumbs) + greeting + CategoryHomeGrid
    │   ├─ [PlanningModal] (si no hay plan para hoy) - modal bloqueante
    │   │   ├─ Título: "Hola [nombre], ¿qué haremos hoy?"
    │   │   ├─ Lista de categorías seleccionables
    │   │   ├─ Sección "Selección para hoy. ¡Tú puedes!!"
    │   │   ├─ Editar/Eliminar items seleccionados inline
    │   │   ├─ "Agregar nueva categoría" inline (crea categoría y la añade al plan)
    │   │   └─ "Saltar planificación y ver recomendación" → /app/session/recommend
    │   ├─ [ExistingPlanPrompt] (si ya hay plan para hoy)
    │   │   ├─ "¿Deseas cambiar tu planificación actual o la mantenemos?"
    │   │   └─ Sí → PlanningModal con items existentes | No → continuar
    │   ├─ PlannedCategories: Cards del plan del día colapsables por categoría (si hay items planificados)
    │   │   ├─ Check derivado de sesión real (COMPLETED/INTERRUPTED hoy) → badge "Realizada"
    │   │   ├─ Tap selecciona cards → toolbar Eliminar (estilo Outlook)
    │   │   ├─ Play → /app/session/new?category=<id> · lápiz → editar título inline
    │   │   └─ Contador "X/Y realizadas"
    │   ├─ Categorías dinámicas desde DB (icono+color+nombre reales)
    │   │   ├─ Botón X (esquina sup. der., visible en hover) → ConfirmModal
    │   │   │   ├─ Si categoría vacía (sin Actividades): permite eliminar
    │   │   │   ├─ Si isDefault: pide contraseña
    │   │   │   └─ Si no isDefault: confirmación simple
    │   │   └─ Click → loading spinner overlay → /app/session/new?category=<id>
    │   ├─ CreateCategoryCard al final del grid
    │   ├─ AddTaskFlow - Botón "Agregar tareas" con flujo completo:
    │   │   ├─ Paso 1: Seleccionar categoría (lista de chips)
    │   │   ├─ Paso 2: Formulario de tarea (nombre, icono, color) → createSubcategoryAction
    │   │   └─ Al crear: cierra el flow, refresca la página
    │   └─ "No sé qué hacer" → /app/session/recommend
    │
    ├─ /app/subcategories → AppShell (con flecha back + breadcrumbs: Inicio →)
    │   ├─ Tabs sin botones X (no se eliminan categorías aquí)
    │   ├─ CRUD de Actividades (crear, editar, eliminar, reordenar con dnd - kit)
    │   └─ CreateCategoryCard en tabs
    │
    ├─ /app/history → AppShell (con flecha back + breadcrumbs: Inicio →)
    │   ├─ Agrupado por día calendario local (formato español)
    │   └─ Eliminación con optimistic delete
    │
    ├─ /app/session/new?category=<key|id> → AppShell (flecha back + breadcrumbs: Inicio →)
    │   ├── AnimatePresence fade entre lista de Actividades y StartSessionFlow
    │   ├─ SessionWizard:
    │   │   ├─ Lista de actividades ordenada por energía
    │   │   ├─ Filtros por energía/ánimo y dificultad (`ActivityFilters`)
    │   │   └─ Tap en actividad → StartSessionFlow
    │   ├─ StartSessionFlow:
    │   │   1. DurationPicker (chips + input manual "1h 30m")
    │   │   2. ConfirmScreen (resumen + countdown preference + Loader2 spinner)
    │   │   3. CountdownOverlay (3, 2, 1...)
    │   │   4. ✅ startSessionAction → TimerScreen
    │   └─ RecommendationScreen
    │
    ├─ /app/session/recommend → AppShell (flecha back + breadcrumbs: Inicio →) + EnergySurvey
    │   ├── [Energy Survey] (si dontAskAgain=false)
    │   │   ├─ Fila compacta: chips ánimo (Baja/Media/Alta) → chips dificultad (Ligera/Moderada/Intensa) → duración derivada
    │   │   │   ├─ Saltar → defaults (media, 25 min)
    │   │   │   ├─ No volver a preguntar → dontAskAgain=true
    │   │   │   └─ Ver recomendación → loading → ranking filtrado
    │   │   └── Transición fade entre la fila y el loading
    │   ├── [Loading] spinner + "Buscando recomendación..."
    │   ├── [Ranking] carrusel horizontal / 3 columnas (top 6) con la #1 destacada y Te recomendamos!!
    │   │   ├─ Cards: icono, categoría, X min sugeridos, intensidad, razón (solo #1)
    │   │   ├─ Editar / Eliminar por card
    │   │   └─ Empezar esta / Empezar (con defaultMinutes según energía)
    │   ├── [Search] barra + resultados
    │   └── [Browse All] "Ver todas las opciones" + CRUD inline
    │
    └─ /app/session → SessionExperience (SIN AppShell, pantalla completa)
        ├─ TimerScreen (si ACTIVE):
        │   ├─ CircularProgress animado (SVG stroke - dashoffset)
        │   ├─ Tiempo formateado + botones pausa/reanudar/finalizar
        │   ├─ Auto - completa al llegar a 0 (con guard)
        │   └─ Para tiempos ≥1h muestra layout de 2 líneas (`1h 23m` + `45s restantes`)
        └─ FinishScreen (si COMPLETED o INTERRUPTED):
            ├─ COMPLETED → mensaje de reconocimiento, "Volver al Home", extender sesión o ir a recomendaciones
            └─ INTERRUPTED → mensaje por progreso avanzado, "Ver todas las actividades" o ir a recomendaciones
```

 -  -  - 

## AppShell: Header con flecha de retroceso + Breadcrumbs

`components/layout/AppShell.tsx` es un **componente cliente** (`"use client"`) que:

 -  Usa `usePathname()` para detectar la ruta actual
 -  **Ruta `/app/home`**: header completo sin flecha, sin breadcrumbs
 -  **Cualquier otra ruta**: añade botón `←` (ArrowLeft) + `Breadcrumbs` debajo del header
 -  El botón ejecuta `router.back()` si `window.history.length > 1`, con fallback a `router.push("/app/home")`
 -  Touch target: `size - 10` (40px, ≥ 44px con padding) para mobile
  -  **Botón "Planificación"** (`CalendarCheck2`): abre el `PlanningModal` desde cualquier página vía `PlanningManager`
  -  **Botón "Rutina"** (`SlidersHorizontal`): enlace a `/app/routine` (Personaliza tu rutina como más te acomode.)
  -  **`ResumeSessionPrompt`**: si el usuario tiene una sesión `ACTIVE` y no está en `/app/session`, muestra un modal para continuar o ignorar la sesión inconclusa

### PlanningManager (`features/planning/components/PlanningManager.tsx`)
 -  Renderizado dentro de AppShell (disponible en todas las páginas del shell)
 -  Al abrirse, carga el contexto con `getPlanningContextAction()` (`{ userName, categories, planItems }`)
 -  Renderiza `ExistingPlanPrompt` y `PlanningModal`; `onSave` → `saveTodayPlanAction` + `bumpPlanVersion()` + `router.refresh()`
 -  El store `features/planning/store/planning.store.ts` mantiene `isOpen`, `isPromptOpen`, `context` y `planVersion` (los modales ya no viven en `CategoryHomeGrid`)

### Breadcrumbs (`components/layout/Breadcrumbs.tsx`)
 -  Barra minimalista debajo del header (border - bottom + padding slim)
 -  Muestra SOLO los padres de la ruta actual (no el leaf), ej: `Inicio →`
 -  Mapeo de segmentos a labels legibles (historial, Actividades, sesión, etc.)
 -  Separador `>` con `ChevronRight` icon
 -  No se renderiza en `/app/home`

 -  -  - 

## Home: Categorías dinámicas con CRUD

### Home page (`app/app/(shell)/home/page.tsx`)
 -  Server component que obtiene `session.user.id`
 -  Llama a `listCategoriesWithSubcategoryCount(userId)` del repositorio
 -  Mapea las categorías a `CategoryHomeData` (incluye `_count.subcategories`)
 -  Renderiza `CategoryHomeGrid` con los datos iniciales
 -  **`WelcomeBackCard` ya NO muestra opciones de energía** (solo bienvenida/ánimo); las opciones de energía viven en la categoría seleccionada (`/app/session/new`)
 -  **`PersonalizeRoutineCard`** debajo del saludo (usuarios nuevos y recurrentes): invitación amigable + enlace a `/app/routine`

### CategoryHomeCard (`features/home/components/CategoryHomeCard.tsx`)
 -  Botón (no Link) con `useRouter().push()` + `useTransition`
 -  Loading spinner overlay animado mientras `isPending`
 -  Muestra icono real + color + nombre de la categoría
 -  Botón X en esquina superior derecha (solo si `subcategoryCount === 0`)
 -  Hover reveal del X con `group - hover/card:opacity - 100`
 -  `whileTap={{ scale: 0.97 }}` para feedback táctil inmediato
 -  La edición de categorías se hace con el lápiz en `CategoryTabs` / `/app/routine`, no en el home

### CategoryHomeGrid (`features/home/components/CategoryHomeGrid.tsx`)
 -  Grid `grid - cols - 1 sm:grid - cols - 2` de `CategoryHomeCard`
 -  **Los modales de planificación ya no viven aquí**: al montar (guard `gosession - plan - checked`) verifica el plan vía `getTodayPlanAction` y dispara `usePlanningStore.open()` / `openPrompt()`
 -  Se sincroniza con `planVersion` del store para refrescar `PlannedCategories` tras guardar desde cualquier página
 -  **`PlannedCategories`**: plan del día colapsable con desplegables por categoría, eliminación por categoría y estados de sesión (En curso, En espera, Realizada)
 -  `CreateCategoryCard` al final del grid
 -  **`AddTaskFlow`**: botón "Agregar Actividad" → abre el `ActivityModal` compartido
 -  **CTA destacado "No sé qué hacer hoy"**: tarjeta `bg - accent - aprender` a ancho completo (antes enlace punteado gris) → `/app/session/recommend`
 -  Estado local optimista: al eliminar, filtra del array local + `router.refresh()`
 -  Modal `ConfirmModal` para confirmar eliminación

### AddTaskFlow (`features/home/components/AddTaskFlow.tsx`)
 -  Botón "Agregar Actividad" → abre `ActivityModal` con selector de categoría integrado (un solo modal, sin pasos inline)
 -  Al crear: `createSubcategoryAction` + `router.refresh()`

### PlannedCategories (`features/home/components/PlannedCategories.tsx`)
 -  **Cards en grilla** `grid - cols - 1 sm:grid - cols - 2` (1 col móvil, 2 en tablet/desktop), NO lista
 -  **Check derivado**: badge `CheckCircle2` "Realizada" solo si `practiced` (hubo sesión COMPLETED o INTERRUPTED hoy de esa categoría). Se eliminó el checkbox manual (`completed` de DB queda sin uso en UI)
 -  **Eliminación estilo Outlook**: tap selecciona cards (multi - select, ring + check); con ≥1 seleccionada aparece toolbar con **Eliminar** (deletePlanItemAction) y **Quitar selección**
 -  Botón `Play` por card → `/app/session/new?category=<categoryId>`; lápiz → edición inline del título
 -  Contador "X/Y realizadas"
 -  `CategoryHomeGrid` **siempre refresca** `planItems` al montar (para badges frescos tras una sesión); el prompt de planificación sigue con el guard `gosession - plan - checked`

### Repositorios
 -  `repositories/category.repository.ts` - `listCategoriesWithSubcategoryCount(userId)` incluye `_count: { select: { subcategories: true } }`
 -  `repositories/planning.repository.ts` - `findPlanByUserAndDate`, `createPlan`, `updatePlanItems`, `updatePlanItem`, `deletePlanItem`, `deletePlan`

 -  -  - 

## CategoryTabs: Solo Actividades

`features/categories/components/CategoryTabs.tsx` se simplificó:
  -  **Eliminados**: botones X por categoría, flujo de confirmación con password, `confirmingDeleteId`, `password`, `deleteError`, `runDelete`
  -  **Conservado**: tabs funcionales, `SubcategoryList` (con botones `whileTap`), `CreateCategoryCard`
  -  La eliminación de categorías ahora solo ocurre desde el home
  -  **Nuevo: lápiz por tab** → abre `CategoryModal` para editar nombre/icono/color (`updateCategoryAction`) y actualiza la lista en caliente
  -  `SubcategoryList` recibe `categoryName` y usa el `ActivityModal` compartido para crear/editar actividades (con dificultad)

### Filtros de actividades
  -  Nuevo componente `ActivityFilters` con dos filas de chips: **energía/ánimo** (Baja/Media/Alta) y **dificultad** (Ligera/Moderada/Intensa).
  -  Integrado en `SubcategoryList` (`/app/subcategories`) y en `SessionWizard` (`/app/session/new`).
  -  Las actividades se filtran por `energyLevel` y `complexity`. Si no hay coincidencias se muestra un empty state amigable.

  -  -  - 

## Crear/editar Actividades con dificultad (ActivityModal)

`features/categories/components/ActivityModal.tsx` - modal único, accesible y moderno (portal, Escape, scroll - lock):

 -  Campos: nombre, icono, color y **dificultad** (Baja/Media/Alta con hint Ligera/Moderada/Intensa)
 -  **Dificultad por defecto desde la categoría**: al crear en una categoría con contexto, `complexity` inicial = `categoryComplexity` (de la categoría); al elegir categoría en el paso 1, se adopta su dificultad
 -  Títulos fluidos: "Nueva actividad", "Editar {nombre}", "Paso 1: Elige una categoría", "Paso 2: Crea tu próxima actividad para esta categoría" (pasos solo cuando NO hay contexto de categoría)
 -  `onSubmit` opcional para que el padre sincronice estado local; por defecto llama `createSubcategoryAction` / `updateSubcategoryAction`
 -  Se usa en: `SubcategoryList` (Tus Actividades), `RecommendationScreen` (por categoría vía `+` del accordion, y creación global), `AddTaskFlow` (Home)
 -  **Eliminados como código muerto**: `SubcategoryForm.tsx`, `CategoryChipPicker.tsx`

### Complejidad en el pipeline
 -  `subcategory.schema.ts`: `complexity` enum (`LOW|MEDIUM|HIGH`) con default `MEDIUM` en create, opcional en update
 -  Services create/update + `subcategory.actions.ts` + `subcategory.store.ts` (`SubcategoryItem.complexity`)
 -  Badge de dificultad en `SubcategoryItem` y `SubcategoryPickerList`
 -  Sin migración: la columna `complexity` ya existía en `Subcategory` (default MEDIUM)

 -  -  - 

## ConfirmModal: Componente UI reutilizable

`components/ui/ConfirmModal.tsx`:

 -  Renderizado vía `createPortal` a `document.body`
 -  Guard SSR: `if (typeof document === "undefined") return null`
 -  Overlay oscuro con `bg - black/50` + `backdrop - blur - sm`
 -  Animación Framer Motion: overlay fade, card scale (0.92→1) + slide (y: 16→0)
 -  `role="dialog"`, `aria - modal="true"`, Escape para cerrar
 -  `body.style.overflow = "hidden"` mientras abierto
 -  Props:
   -  `variant: "danger" | "primary"` - danger muestra icono AlertTriangle
   -  `requirePassword` - muestra Input password
   -  `confirmLabel` / `cancelLabel` - personalizables
   -  `isPending` - deshabilita botones y muestra "Eliminando..."
   -  `error` - muestra mensaje de error
 -  Mobile responsive: `max - w - sm` + padding `p - 4`

 -  -  - 

## Energy Survey: Encuesta de energía y dificultad antes de recomendar

### Store (`features/recommendation/store/recommendation.store.ts`)
 -  Zustand + persist localStorage (`gosession - recommendation - prefs`)
 -  Keys: `energy` (EnergyLevel | null), `preferredMinutes` (number | null), `dontAskAgain` (boolean)
 -  `reset()` limpia las tres (incluye `dontAskAgain`)

### Energy types (`services/recommendation/energy - level.ts`)
 -  `EnergyLevel`: `"baja" | "media" | "alta"`
 -  `CATEGORY_ENERGY_KEYS`: mapeo de categoría semilla → niveles compatibles
   -  `aprender`: alta, media - `salud`: media, alta - `finanzas`: media
   -  `descanso - consciente`: baja - `trabajo`: alta, media
 -  `ENERGY_RECOMMENDED_DURATION` (opción "más promedio" Te recomendamos!!): baja→15, media→25, alta→40
 -  `ENERGY_DURATION_OPTIONS` (chips por nivel): baja→[5,10,15,20,30,40], media→[10,15,20,25,30,45,60], alta→[20,30,40,50,60,75]
 -  `ENERGY_MAX_MINUTES` / `ENERGY_MAX_LABEL`: baja→40 ("máx. 40 min"), media→60 ("máx. 1 hora"), alta→90 ("hasta 1 h 30")
 -  `ENERGY_COMPLEXITY_TARGETS`: qué complejidad encaja por nivel - baja→[LOW], media→[LOW,MEDIUM], alta→[MEDIUM,HIGH]
 -  `ENERGY_ACTIVITY_DESCRIPTIONS`: qué tareas propone cada nivel (simples · cotidianas · desafiantes)
 -  `energyMaxMinutes(energy)`, `filterSubcategoriesByEnergy(items, energy)` (filtra por targets con fallback a todas si queda vacío), `energyDurationHint(energy)`, `preferredComplexity(energy, minutes)`
 -  `energyMessage()`: mensaje motivacional contextual

### Energía por categoría (fuera del Home)
 -  `WelcomeBackCard` ya NO ofrece opciones de energía; las opciones están en la categoría seleccionada
 -  **`EnergyPromptModal`** (`features/session/components/EnergyPromptModal.tsx`): modal de 1 paso que se muestra en `/app/session/new` antes de la lista de actividades (solo si no respondió antes; "Saltar" → media). Se vuelve a abrir con "Cambiar" desde el indicador de la lista
 -  **`sortActivitiesByEnergy`** (`features/session/sort - activities.ts`, con tests): ordena por complejidad según energía
   -  `alta` → HIGH/MEDIUM/LOW · `media` → MEDIUM/LOW/HIGH (cotidianas primero) · `baja` → LOW/MEDIUM/HIGH
 -  **`prepareActivitiesForEnergy`**: filtra por `ENERGY_COMPLEXITY_TARGETS` (con fallback) y luego ordena → la primera de la lista es la "más promedio" para ese nivel de energía
 -  Al iniciar una actividad: `defaultMinutes = ENERGY_RECOMMENDED_DURATION[energía]` (40/25/15). `DurationPicker` **preselecciona y destaca** la opción promedio (estado "seleccionado" + badge) y muestra `maxLabel` ("hasta 1 hora - tareas normales...")
 -  `StartSessionFlow` recibe `energy` y usa los chips **efectivos** (`effectiveDurationOptions[energy]` desde prefs) y el `maxLabel` efectivo

### Componente (`features/recommendation/components/EnergySurvey.tsx`)
 -  Modal de **una sola fila compacta** con `AnimatePresence`, diseño simplificado: **chips de ánimo** (Baja/Media/Alta, con colores distintivos, Media Te recomendamos!! con check y badge "Recomendado") + **flecha →** + **chips de dificultad** (Ligera/Moderada/Intensa). Ya no usa el grid de 3 cards grandes ni el paso 2 de tiempo separado.
 -  La duración se deriva automáticamente de la combinación ánimo + dificultad vía `effectiveRecommendedDuration`, mostrada inline junto con `energyDurationHint`.
 -  Opciones: Saltar (usa defaults media/25 min), No volver a preguntar (setea flag en localStorage).
 -  Guard SSR: `if (typeof document === "undefined") return null`
  -  **Se pregunta solo la primera vez**: en `RecommendationScreen` el survey se muestra si `!prefs.energy` y no se ha respondido el ánimo hoy (o forzado con "Cambiar mi nivel de energía"); si ya hay energía guardada, auto - carga la recomendación con los prefs persistidos
  -  `MoodModal` (ánimo diario) comparte el mismo lenguaje visual (chips con color de energía) y ambos modales comparten el guard diario `gosession-mood-answered-<YYYY-MM-DD>`.

### Flujo completo
```
/session/recommend → server carga Actividades
  → EnergySurvey (solo si no se respondió antes: !prefs.energy && !hasAnsweredMoodToday())
    → Fila compacta: chips de ánimo (Baja/Media/Alta, Media Te recomendamos!!)
      → chips de dificultad (Ligera/Moderada/Intensa) → duración derivada
    → getRecommendationsAction(energy, preferredMinutes) → ranking top 6
    → ruleBasedRecommendationService filtra por complejidad (targets + energía),
      luego aplica regla de "más tiempo sin practicar"
    → devuelve Recommendation[] con suggestedMinutes (tope por energía)
  → RecommendationScreen muestra carrusel horizontal / 3 columnas,
    la #1 destacada y Te recomendamos!! ("Empezar esta")
```

 -  -  - 

## Personaliza tu rutina como más te acomode. (`/app/routine`)

Página dentro del shell (`app/app/(shell)/routine/page.tsx`), accesible desde el header (botón "Rutina") y desde `PersonalizeRoutineCard` en el Home.

### `RoutineTabs` - 3 pestañas (`features/routine/components/RoutineTabs.tsx`)
  -  `/app/routine` renderiza `RoutineTabs` (cliente) con pestañas **Categorías · Actividades · Recomendaciones** (transición suave). `RecommendationPreferences.tsx` y `DefaultsTab.tsx` se eliminaron.
  -  **`CategoriesTab`**: tarjetas de categorías (icono + nombre + dificultad) con lápiz → `CategoryModal` (nombre/icono/color/dificultad) + `CreateCategoryCard`. Eliminar categorías sigue en el Home.
  -  **`ActivitiesTab`**: selector de categoría (chips) + `SubcategoryList` (CRUD de actividades con dificultad).
  -  **`RecommendationsTab`**: selector de energía y dificultad; `TimeChipList` permite definir tiempos mínimo, recomendado y máximo, además de tiempos personalizados; acordeones de categorías para marcar qué actividades recomendar por combinación energía+dificultad.
  -  Sin cambios de BD: todo se persiste en `gosession - recommendation - prefs`.

### `TimeChipList` y etiquetas de tiempo
  -  Todos los chips se pueden editar en valor y re-etiquetar como Mín/Rec/Máx.
  -  Al re-etiquetar, el chip desplazado pierde el rol activo y muestra `ex: Mín/Rec/Máx` (se persiste en `exRoles` del combo).
  -  Solo los tiempos agregados manualmente muestran el badge `Agregado`; los tiempos por defecto de la combinación energía+dificultad no lo muestran.
  -  No se permiten valores duplicados en ninguna operación (crear, editar, reemplazar). El mensaje es `"Este tiempo ya existe, agregue otro."`.
  -  Los chips con rol activo Mín/Rec/Máx no se pueden eliminar; primero hay que mover la etiqueta a otro chip.
  -  **Las operaciones usan el valor único del chip como identidad** (los valores no se repiten), nunca el índice del arreglo ordenado — así la edición siempre impacta al chip correcto aunque se reordenen.
  -  **Balance estricto `min < rec < max`**: los roles no pueden compartir valor entre sí, lo que garantiza que jamás existan dos chips con el mismo tiempo.
  -  Al reconstruir los chips desde el combo se deduplican por valor (roles primero, luego custom), descartando tiempos repetidos incluso si el storage guarda datos viejos inválidos.

### Edición de categorías
 -  Pipeline nuevo: `updateCategorySchema`, `updateCategory` (repository), `update - category.service.ts`, `updateCategoryAction`
 -  **`CategoryModal`** (`features/categories/components/CategoryModal.tsx`): crear/editar nombre, icono y color (portal accesible, `onSubmit` opcional)
 -  Lápiz en cada tab de `CategoryTabs` (Tus Actividades y Rutina) → actualiza la lista en caliente + `router.refresh()`
 -  `category.actions` y `subcategory.actions` revalidan `/app/subcategories` **y** `/app/routine`

 -  -  - 

## Interfaz de recomendación

 -  **Ranking por energía** (`RecommendationScreen` + `RecommendedActivityCard`): `getRecommendationsAction(energy, minutes)` devuelve el **top 6** de `Recommendation[]` (complejidad preferida + "más tiempo sin practicar"); se presentan en **carrusel horizontal** (`snap - x`) que en desktop muestra **3 columnas** (`lg:w - [31%]`), con buen espacio (`gap - 4`)
 -  **Preselección y destacado**: la **#1 del ranking** ("más promedio" para la energía elegida) lleva ring `accent - aprender`, badge "**Te recomendamos!!**", razón visible y botón "Empezar esta"; el resto son cards con icono, categoría, `X min sugeridos`, badge de intensidad y botón "Empezar"
 -  **Header de energía**: chip con batería del nivel, `energyDurationHint` (qué tareas + límite), sugerido `ENERGY_RECOMMENDED_DURATION` y botón "Cambiar energía" → reabre el `EnergySurvey`
 -  **`SubcategoryPickerList`** (búsqueda y "ver todas"): cada actividad muestra badge de dificultad (Baja/Media/Alta)
 -  `PickableSubcategory` ahora incluye `complexity`
 -  **Algoritmo (`ruleBasedRecommendationService`)**: `fitScore = (complexityFit(preferred, sub.complexity) + complexityFit(preferred, cat.complexity)) / 2` - combina la dificultad de la actividad y la de su categoría; `Recommendation.categoryComplexity` alimenta el badge. El servicio expone `getRecommendations` (ranking top N) además de `getRecommendation` (top 1)
 -  `suggestedMinutes` se limita por los límites efectivos de energía y dificultad (`suggestedMinutesFor` + `effectiveEnergyMax`)

 -  -  - 

## Multi - tema (6 temas de color)

`components/ui/ThemeToggle.tsx` + `app/globals.css` + `app/layout.tsx`:

 -  **6 temas** vía next - themes (`attribute="class"`, `defaultTheme="dark"`): `celeste`, `verde`, `humo`, `rosa`, `blanco`, `dark`
 -  **Eficiencia**: cada tema SOLO sobreescribe los tokens neutros (` -  - background`, ` -  - foreground`, ` -  - surface*`, ` -  - border*`, ` -  - muted - foreground`); acentos (`accent - *`), sombras y formas se comparten en `:root` → ninguna interfaz/card/color de marca cambia entre temas
 -  Celeste usa fondo `#e4e6f6` (lavanda); rosa neutros rosados; blanco puro y minimalista
 -  **Selector**: botón circular con **swatch 2×2** (celeste/verde/rosa/oscuro); menú popover (click - outside + Escape) con las 6 opciones, muestra de color y check en la activa; SSR - safe con `useMounted`
 -  Se mantiene la key `dark` para el tema oscuro → todas las utilidades `dark:` siguen funcionando sin tocar `@custom - variant dark`
 -  `viewport.themeColor` actualizado a fondos celeste (`#e4e6f6`) / oscuro (`#161617`)

 -  -  - 

## Guía de uso y descarga como app

### Landing (`app/(marketing)/page.tsx`)
 -  **Go Sesión** branding: hero "Go Sesión: Reserva tu espacio y haz que cada momento cuente.

", logo, footer "Go Sesión - Tu siguiente paso, sin fricción."
 -  Sección **"Cómo usar Go Sesión"**: 6 pasos con instrucciones de uso (cuenta, plan del día, sesiones, recomendaciones, Personaliza tu rutina como más te acomode., descarga/temas)
 -  **`LandingActions`** (`components/marketing/LandingActions.tsx`): botón **"Descargar como app"** + **"¿Cómo funciona?"** (abre el modal)

### AppGuideModal (`components/ui/AppGuideModal.tsx`)
 -  Modal informativo (portal, Framer Motion, SSR - safe con `useMounted`) con guía de uso de la app: plan del día, categorías/actividades, sesiones, recomendaciones, **Personaliza tu rutina como más te acomode.**, temas y **descarga como app**
 -  Sección de descarga usa `usePwaInstall` (`hooks/use - pwa - install.ts`): captura `beforeinstallprompt` → botón de instalación; si no hay evento, muestra instrucciones manuales ("Añadir a pantalla de inicio")

### Onboarding post - login
 -  `AppShell` abre `AppGuideModal` automáticamente al entrar (guard `sessionStorage: gosession - guide - seen`) → se muestra **al iniciar sesión antes de las opciones del Home** (z - [60], por encima de PlanningManager)
 -  Al cerrar sesión se limpia la guard → el modal vuelve a aparecer en el próximo login

 -  -  - 

## Selector de color con paleta expandible

`features/categories/components/IconColorPicker.tsx`:

 -  **12 swatches default** (colores base)
 -  **Fila "Personalizados"**: solo si hay colores guardados en localStorage (`gosession - custom - colors`)
   -  Cada swatch con X superpuesta (hover reveal) para eliminar
 -  **Swatch arcoíris** `🌈`: gradiente con 7 colores, abre popover con:
   -  `<input type="color">` nativo del sistema
   -  Botón "Añadir color"
 -  Popover con click - outside - to - close
 -  Al añadir/eliminar color, se persiste en localStorage y se actualiza el estado

 -  -  - 

## Iconos de Diversión

`lib/constants/icon - options.ts` - Nuevo grupo al final:

```
Diversión: Trophy, Medal, Timer, Target, Palette, Camera, Headphones,
Music, Book, Pencil, Gamepad2, Puzzle, TreePine, Mountain, Sunrise,
Compass, Map, Tent
```

 -  -  - 

## Planificación diaria (Daily Planning)

### Modelo de datos
 -  `DailyPlan` (`daily_plans`): uno por usuario y día, único `[userId, date]`
 -  `PlanItem` (`plan_items`): items del plan, con título, icono, color, orden, completado
 -  Relación `PlanItem.categoryId` → `Category` (SetNull al eliminar categoría)
 -  Cascade: al eliminar plan se eliminan sus items

### Flujo al cargar `/app/home`
1. `CategoryHomeGrid` monta → llama `getTodayPlanAction` **solo para mostrar** el plan y los estados de sesión
2. **El modal de planificación ya NO se auto - abre**: se abre únicamente cuando el usuario lo elige - desde la opción **"Quiero planificar mi día"** del `WelcomeModal` o desde el botón **"Planificación"** del header (desktop) / menú móvil
3. `PlanningManager` carga el contexto y muestra `PlanningModal` (si no hay plan) o `ExistingPlanPrompt` (si ya existe y se abrió por el botón) con los items existentes precargados
4. Al guardar: `saveTodayPlanAction` → reemplaza todos los items → `router.refresh()` + `refreshPlan()`

### PlanningModal (`features/planning/components/PlanningModal.tsx`)
 -  Modal bloqueante con `createPortal` a `document.body`
 -  Animación Framer Motion (overlay fade + card scale/slide)
 -  Título personalizado con `userName`
 -  Lista de categorías como chips seleccionables (toggle on/off); al elegir una se expande su **dropdown** de actividades (solo la última elegida queda abierta, las demás colapsadas, reabribles)
 -  **"Tu plan para hoy" en filas tipo lista** (círculo de selección + icono + título + lápiz) agrupadas por categoría, con **círculo de "elegir todo"** en cada cabecera; toolbar **Eliminar** / **Quitar selección** cuando hay selección
 -  "Agregar nueva categoría" inline: formulario (nombre, **dificultad**, icono, color) → `createCategoryAction`
 -  "Saltar planificación y ver recomendación" → redirige a `/app/session/recommend`
 -  "Guardar planificación" → `saveTodayPlanAction`

### ExistingPlanPrompt (`features/planning/components/ExistingPlanPrompt.tsx`)
 -  Modal confirmación simple (Sí/No) + Escape para cerrar

### Servicio y repositorio
 -  `services/planning/daily - plan.service.ts`:
   -  `getTodayPlan(userId)` - busca plan por userId y fecha UTC
   -  `saveTodayPlan(userId, items[])` - crea o reemplaza items del plan
   -  `updatePlanItemDetails(itemId, data)` - editar item
   -  `removePlanItem(itemId)` - eliminar item
 -  `repositories/planning.repository.ts` - acceso directo a Prisma con transacciones

### Server Actions
 -  `features/planning/actions/planning.actions.ts`:
   -  `getTodayPlanAction` - obtener plan del día (o null)
   -  `saveTodayPlanAction` - guardar plan (borra y recrea items en transacción)
   -  `updatePlanItemAction` - editar/completar item
   -  `deletePlanItemAction` - eliminar item

 -  -  - 

## Paleta de colores optimizada (tema claro)

`app/globals.css` - Mejora de contraste, sombras y consistencia visual:

| Variable | Antes | Ahora | Notas |
| -  -  -  -  -  -  -  -  -  - | -  -  -  -  -  -  - | -  -  -  -  -  -  - | -  -  -  -  -  -  - |
| ` -  - background` | `#F9FAFB` | `#F9FAFB` | Sin cambio |
| ` -  - surface` | `#fcfcf9` | `#FFFFFF` | Blanco puro para tarjetas |
| ` -  - surface - muted` | `#eeedea` | `#F3F4F6` | Gris neutro claro |
| ` -  - surface - hover` | `#e6e5e1` | `#E5E7EB` | Más claro y neutro |
| ` -  - border` | `#c8c7c3` | `#D1D5DB` | Gris más visible |
| ` -  - border - hover` | `#b8b7b3` | `#9CA3AF` | Mayor contraste en hover |
| ` -  - muted - foreground` | `#4f4f4b` | `#4B5563` | ~7:1 sobre surface ✅ AA |

**Nuevas variables de sombra** (usadas manualmente en componentes):
 -  ` -  - shadow - sm`, ` -  - shadow - md`, ` -  - shadow - lg`, ` -  - shadow - xl`

**Componentes actualizados**:
 -  `Button`: variante `primary` usa `shadow - sm` + `hover:bg - accent - aprender - hover`; `secondary` usa `bg - surface` + `shadow - sm`
 -  `Input`: `transition - all duration - 200` + `focus - visible:border - accent - aprender/30`
 -  `CategoryHomeCard`: `shadow - sm` + `hover:shadow - md`
 -  `CategoryForm`, `SubcategoryForm`: bordes y fondos consistentes

**Empty states**: Todos los contenedores `border - dashed` ahora usan `bg - surface - muted` para fondo distinguible (SessionWizard, SubcategoryList, RecommendationScreen).

 -  -  - 

## Efectos de carga y feedback visual

### Transiciones rápidas
 -  `AnimatePresence` con `duration: 0.15s` (reducido de 0.25s)
 -  `whileTap={{ scale: 0.97 }}` + `transition={{ duration: 0.08 }}` en todos los botones

### Loading spinners
 -  **CategoryHomeCard**: overlay spinner absoluto cuando `isPending` (navegación)
 -  **ConfirmScreen (COMENZAR)**: `Loader2` con `animate - spin` + "Comenzando..."
 -  **RecommendationScreen (carga)**: Spinner centrado + "Buscando recomendación..."
 -  **EnergySurvey (paso loading)**: Spinner + texto

### whileTap + hover aplicados en:
 -  `CategoryHomeCard`, `SessionWizard` (Actividades), `DurationPicker` (chips)
 -  `ConfirmScreen` (botones), `RecommendationScreen` (editar, eliminar, iniciar)
 -  `SubcategoryList` (agregar), `CategoryHomeGrid` (No sé qué hacer), `CategoryTabs` (tabs)

 -  -  - 

## Flujo del timer (sesión de enfoque)

### Estado
 -  **Server** = fuente de verdad absoluta
 -  **Cliente** = deriva vista visual con `deriveTimerView(session, nowMs + skewMs)`
 -  **Zustand store** cachea sesión activa con persistencia localStorage (`gosession - active - session`)

### Clock skew
 -  En start - session, server devuelve `serverNowMs`
 -  Cliente calcula `skewMs = serverNowMs  -  Date.now()`
 -  Todos los cálculos locales usan `Date.now() + skewMs`

### Tick
 -  `useTimer` hook usa `setInterval` con `Date.now()` (no cuenta regresiva local)
 -  Renderiza cada ~1s con el tiempo corregido

### Pausa/Reanudar
 -  **Pausar:** Server setea `pausedAt = now`. Idempotente (si ya pausado, lo devuelve)
 -  **Reanudar:** Server calcula duración pausa, suma a `pausedMs`, limpia `pausedAt`. Idempotente (si no pausado, lo devuelve)

### Auto - completar
 -  Cuando `hasReachedTarget === true` en `deriveTimerView`, se llama a `completeSessionAction`
 -  Guard: `autoCompletingForId` ref evita doble disparo

### Extender
  -  Solo permitido en sesiones COMPLETED sin pausa activa
  -  Resetea status a ACTIVE, suma minutos a `plannedMinutes`, incrementa `extendedCount`
  -  Recalibra `startedAt` para que el tiempo transcurrido efectivo sea el plan original y el tiempo restante mostrado sea exactamente los minutos extra solicitados (funciona aunque hayan pasado minutos desde que terminó la sesión)

### Finalizar (complete vs interrupt)
 -  `endSession.util.ts` computa `actualMinutes` (tiempo transcurrido  -  pausas acumuladas)
 -  Limpia `activeUserId` y setea `endedAt`

### Rediseño UI de sesión
 -  **`DurationPicker`**: chips → tarjetas grandes (número + "min"), badge "recomendado" con nuevo prop `suggestedMinutes`, input manual separado por divisor
 -  **`ConfirmScreen`**: tarjeta centrada con icono de la actividad, duración grande, frase contextual, chips de countdown y botón `COMENZAR` full - width
 -  **`StartSessionFlow`**: pasa `icon`/`color` a `ConfirmScreen` y `suggestedMinutes` a `DurationPicker`
  -  **`TimerScreen`**: glow radial del color de la subcategoría, anillo grande (`CircularProgress` 260px) con tiempo dentro (`text - 4xl/5xl`), pill "Pausado" con pulse (anillo ámbar), meta "Restante ≈ X · Planificado Y min", botón circular Pausa/Reanudar + "Finalizar sesión". Para tiempos ≥1h usa layout de 2 líneas (`1h 23m` + `45s restantes`).
  -  **`FinishScreen`**: mensajes motivacionales diferenciados según la sesión haya terminado o sido interrumpida; reutiliza `DurationPicker` para extender (chips con `+`)

 -  -  - 

## Decisiones técnicas importantes

### `activeUserId @unique` (DB - level lock)
 -  Previene dos sesiones activas simultáneas por usuario
 -  `startSessionForUser` maneja P2002: si falla, lee la activa existente y la retorna con `reused: true`
 -  Es una "optimistic insert" - asume que no hay sesión activa, y si la hay, la reusa

### `onDelete: Restrict` en Category→Subcategory y Subcategory→FocusSession
 -  Previene borrados accidentales en cascada
 -  Delete category falla si tiene Actividades (error `CategoryHasSubcategoriesError`)
 -  Delete subcategory falla si tiene sesiones asociadas (P2003 → `SubcategoryHasSessionsError`)

### Seed data por usuario
 -  No hay seed global. Cada usuario recibe 7 categorías y su banco de Actividades al registrarse
 -  Categorías semilla tienen `key` único para lookup por ruta (`/app/session/new?category=aprender`) e `isDefault: true`
 -  **Bancos ampliados (v2)**: Entrenamiento/Salud/Diversión tienen 14 c/u y Finanzas 13 (se añadieron 4 - 5 actividades nuevas por categoría)
 -  **Versión de semillas**: `CURRENT_SEED_VERSION` (en `lib/constants/categories.ts`) + `User.seedVersion`. `ensureDefaultCategoriesForUser` corre el seed idempotente si `seedVersion < CURRENT` y lo actualiza; los registros crean con `seedVersion = CURRENT`
 -  **Alineación por nombre**: si el usuario ya tiene una categoría con el mismo nombre del seed (creada manualmente, sin `key`), el seed le asigna `key` y `complexity` del seed y le aplica el banco de actividades (sin duplicarla, sin tocar `isDefault`)
 -  El seed es idempotente: no duplica categorías (por key/nombre) ni actividades (por nombre); re - aplica `complexity` de categorías default por key

### Server Actions con estado
 -  Patrón: `"use server"` → parse Zod → `requireUserId()` → call service → typed result
 -  Componentes usan `useActionState` para manejar loading/error
 -  Mutaciones llaman `revalidatePath()` tras éxito
 -  Return tipos: `SessionActionResult | ActiveSessionActionResult`, etc.

### Zustand + SSR safety
 -  `skipHydration: true` en store para control manual
 -  `useSyncExternalStore` en DismissibleHint para evitar hydration mismatches
 -  Rehidratación desde localStorage en `useActiveSession`

### Recuperación de sesiones inconclusas
  -  `useSessionStore` persiste la sesión activa en `localStorage` (`gosession - active - session`).
  -  `ResumeSessionPrompt` (renderizado en `AppShell` fuera de `/app/session`) detecta una sesión `ACTIVE` y muestra un modal con la actividad y tiempo restante.
  -  "Continuar" redirige a `/app/session`; "Ignorar" llama a `interruptSessionAction` en el servidor y limpia el store.
  -  Se reconcilia con el servidor al montar: si el server no tiene sesión activa, se limpia el store local.

### Sincronización entre pestañas
  -  `useActiveSession` escucha:
   -  `visibilitychange` - al volver a la pestaña
   -  `focus` de window - al enfocar
   -  `storage` event - cambios en otra pestaña
 -  Server siempre gana: si server dice no hay ACTIVE, se limpia store

### PWA
 -  Service worker (`public/sw.js`): cache - first offline.html, network - first navegaciones
 -  Iconos generados dinámicamente via `next/og` `ImageResponse`
 -  Manifest con `display: standalone`, `start_url: /app/home`

### Energy Survey / Mood (client - side)
  -  Modal con `createPortal` a `document.body`
  -  **Fila compacta**: chips de ánimo → chips de dificultad → duración derivada automáticamente
  -  Comparte guard diario con `MoodModal` (`gosession - mood - answered - <YYYY - MM - DD>`): si ya respondió hoy, no se vuelve a preguntar.
  -  `Saltar`: usa defaults (media, 25 min)
  -  `No volver a preguntar`: setea flag en localStorage, nunca más pregunta

 -  -  - 

## Patrón de creación de archivos

### Nuevo servicio
1. Crear archivo en `services/<domain>/` con lógica pura
2. Exportar función que recibe dependencias (repos) o usa imports directos
3. Usar `requireUserId()` de `lib/auth` (o similar) para obtener userId
4. Validar ownership del recurso antes de operar
5. Lanzar errores personalizados (extender Error con nombre), NO return {ok, error}
6. Errores se capturan en la Server Action y se convierten a respuesta amigable

### Nueva Server Action
1. Schema Zod en `features/<domain>/schemas/`
2. Action en `features/<domain>/actions/` con `"use server"`
3. Parsear input, `requireUserId()`, llamar servicio
4. Capturar errores del servicio, retornar typed result
5. `revalidatePath()` en éxito

### Nuevo componente UI
1. Usar `cn()` de `lib/utils` para combinar clases
2. Seguir variantes: `Button` con `forwardRef` + `buttonClassName()` utility
3. Componentes compartidos en `components/ui/`
4. Componentes de dominio en `features/<domain>/components/`
5. Modales con `createPortal` a `document.body` + Framer Motion para animaciones
6. Botones con `motion.button` + `whileTap={{ scale: 0.97 }}` para feedback táctil

 -  -  - 

## Onboarding y personalización (fases 2.9 y 2.10)

### Header móvil con menú hamburguesa (<600px)
 -  `components/layout/AppShell.tsx` + `components/layout/MobileMenu.tsx`
 -  En móvil (<600px vía `max - [600px]:` / `min - [600px]:`, sin tocar breakpoints globales) las acciones del header (Planificación, Historial, Actividades, Rutina, Logout) se pliegan en un botón hamburguesa (`Menu`).
 -  **El `ThemeToggle` queda siempre visible fuera del menú**, agrupado en un contenedor derecho junto al hamburguesa: en móvil el tema va **a la izquierda del botón de menú** (no centrado); en desktop/tablet el tema queda a la izquierda de **Cerrar sesión**, que siempre está en la esquina derecha extrema.
 -  **Orden del menú hamburguesa**: Planificación, Actividades, Historial, Personaliza tu rutina como más te acomode. (Cerrar sesión queda al final, abajo).
 -  `MobileMenu`: overlay `fixed inset - 0 z - [60]` con panel que desliza desde la derecha (spring), por encima del contenido sin reducir la vista. Cierre por overlay, X, Escape o navegación. El logout limpia las keys de onboarding.

### Cards recomendadas y flechas de fila
 -  `RecommendedActivityCard`: se eliminó el solapamiento (badge "Preseleccionada" y acciones ahora en flujo, no `absolute` sobre el título) y se usa `line - clamp - 2/ - 3` + más padding para que títulos/textos respiren.
 -  `components/ui/ScrollArrows.tsx`: flechas ‹ › que desplazan filas horizontales (`scrollBy` suave), ocultas en los bordes; aplicadas al carrusel de `RecommendationScreen` (visible ≥600px).

### Modal de bienvenida (cada inicio de sesión)
  -  `components/ui/WelcomeModal.tsx` + `features/onboarding/store/onboarding.store.ts` (`welcomeDone`, `moodOpen`)
  -  Se muestra en cada login/registro. Guard movido a `localStorage` con clave por día: `gosession - welcome - seen - <YYYY - MM - DD>` (se limpia en logout).
  -  Opción visible "No mostrar este mensaje de nuevo hoy".
  -  4 opciones:
  1. **"Personaliza tu App"** → `/app/routine`
  2. **"Ya realicé mi personalización. Quiero planificar mi día"** → abre PlanningModal
  3. **"Prefiero conocer cómo funciona la App primero!"** → abre el `AppGuideModal` actualizado
  4. **"¡Ya realicé todo lo anterior. Saltemos!!"** (recomendada) → abre el `MoodModal` antes de mostrar Home (si no se respondió hoy)
  -  `CategoryHomeGrid` ya no abre el prompt de planificación tras el welcome (el modal de planificación solo se abre por elección explícita: opción del welcome o botón "Planificación").

### Modal "¿Cómo te sientes hoy, [nombre]?" (por día)
  -  `features/recommendation/components/MoodModal.tsx` + `features/recommendation/mood.storage.ts` + `lib/day.ts` (`todayKey`)
  -  Per - day: `localStorage: gosession - mood - answered - <YYYY - MM - DD>`; solo se pregunta una vez por día.
  -  3 niveles de energía + tiempo sugerido (config efectiva) + "!No mostrar más. Por Hoy!!".
  -  Texto informativo explicando que se pregunta diariamente para adaptar Go Sesión al estado de ánimo del usuario.
  -  Al elegir → `prefs.setEnergy` + minutos → Home **personalizada por ánimo**: `CategoryHomeGrid` reordena las categorías por complejidad (`sortActivitiesByEnergy`) y muestra un banner con la energía activa y botón "Cambiar".

### Personaliza tu rutina como más te acomode. (tiempos por energía y dificultad: mín/rec/máx)
 -  `recommendation.store.ts` extiende `gosession - recommendation - prefs` con `energyDurations`, `energyMinDurations`, `energyMaxDurations`, `energyComplexityTargets`, `difficultyDurations`, `difficultyMinDurations`, `difficultyMaxDurations` (merge seguro con defaults). Setters nuevos con `null` para **eliminar** el custom (`setEnergyMinDuration/setEnergyMaxDuration/setDifficultyMinDuration/setDifficultyMaxDuration`); `resetEnergyPrefs` limpia todo.
 -  Helpers puros en `energy - level.ts`: `EnergyOverrides` ampliado, `effectiveRecommendedDuration`, `effectiveEnergyMin/Max`, `effectiveDifficultyMin/Max`, `effectiveDurationOptions`, `effectiveMaxLabel`/`formatMaxLabel`, `energyDurationHint(overrides?)`, `suggestedMinutesFor` (clamp por mín/máx de energía **y** dificultad), `filterSubcategoriesByEnergy` acepta targets.
  -  Página en **3 pestañas** (Categorías / Actividades / Recomendaciones) con `TimeChipList` para definir tiempos Mín/Rec/Máx y personalizados por combinación energía+dificultad.
 -  Se propaga a toda la app: `EnergySurvey`, `MoodModal`, `StartSessionFlow`, `RecommendationScreen` y `ruleBasedRecommendationService` usan los valores efectivos (chips entre [mín,máx], validación manual del input, labels dinámicos y clamp del servidor).

### Planificación con actividades vinculadas + mensaje motivador
 -  **Migración Prisma**: `PlanItem.subcategoryId String?` → `Subcategory` (`SetNull`). `prisma migrate dev` aplicado.
  -  `PlanningModal`: al elegir una categoría se ofrece **vincular sus actividades** dentro de cada grupo del plan (solo una categoría abierta a la vez, chevron; reabrible para agregar más, sin secciones acumuladas). `saveTodayPlanAction` persiste `subcategoryId`.
  -  **Crear actividad personalizada en planificación**: dentro de cada categoría expandida hay un botón "Crear actividad personalizada" que abre `ActivityModal`; al crear se guarda en BD y se vincula automáticamente al plan.
 -  **"Tu plan para hoy" sin redundancia**: cada categoría aparece **una sola vez como título** y dentro solo sus actividades vinculadas. El item placeholder de categoría (`subcategoryId: null`) NO se renderiza como fila (ni aquí ni en Home).
 -  **Eliminar por categoría**: botón "Eliminar actividades" **al lado del título** de cada categoría con el mismo flujo del Home (abre círculos → "Eliminar actividad"/"Eliminar actividades" según selección, contador; con 0 seleccionadas cierra). En modo selección, tocar una fila selecciona; lápiz para editar el título.
 -  `PlanningManager`: al guardar con éxito muestra un **mensaje motivador** ("¡Plan listo, [nombre]! ¡Tú puedes! 💪") antes de cerrar.

### Home: desplegables por categoría con estados de sesión
 -  `features/home/components/PlannedCategories.tsx`: acordeones por categoría (grid `grid - cols - 1 sm:grid - cols - 2`); cada actividad navega a `/app/session/new?category=<id>` (o `/app/session` si hay sesión activa).
 -  **Sin redundancia**: los items placeholder de categoría (`subcategoryId: null`) se filtran; cada categoría aparece una sola vez como título del grupo con sus actividades dentro.
 -  **Eliminar por categoría (debajo del título)**: botón "Eliminar actividades" a ancho completo **bajo el título** de cada categoría (así el nombre se aprecia bien) que activa los círculos de selección de esa categoría (y expande el grupo si está cerrado); cambia a **"Eliminar actividad"** (1) o **"Eliminar actividades"** (N) según la selección y elimina (con contador). Con 0 seleccionadas, el mismo botón cierra los círculos. En modo selección, tocar una fila selecciona (no navega). Se eliminó la toolbar global y los círculos siempre visibles.
 -  `getTodayPlanAction` devuelve `categoryName/Icon/Color`, `subcategoryId` y `activeSession` (`{ categoryId, subcategoryId, isPaused } | null`).
 -  Estados (siempre positivos, nunca "incompleta"):
   -  Terminada hoy (COMPLETED o INTERRUPTED) → **"Realizada"** (verde, check)
   -  Sesión activa pausada → **"En espera"** (ámbar, pulse; hover "Continuemos. ¡Tú puedes!!") → `/app/session`
   -  Sesión activa corriendo → **"En curso"** (azul) → `/app/session`
 -  Refresco de estados al volver a la pestaña (`visibilitychange`).

### AppGuideModal actualizado
  -  **8 secciones** reescritas con la funcionalidad actual y un tono descriptivo/cercano: (1) bienvenida y energía del día, (2) plan del día con creación de actividades, (3) categorías y actividades con filtros por energía y dificultad, (4) sesiones de enfoque con recuperación de sesiones inconclusas, (5) recomendaciones inteligentes por energía, (6) Personaliza tu rutina (**3 pestañas**: Categorías, Actividades, Recomendaciones), (7) navegación y menú en móvil, (8) temas de color.
  -  Cada sección tiene ícono de lucide - react y descripción resumida.
  -  Sección de descarga con `usePwaInstall` (instalación directa o instrucciones manuales).
  -  Botón "¡Comprendo. Iniciemos!" para cerrar.

 -  -  - 

## Tests

| Archivo | Qué prueba |
| -  -  -  -  -  -  -  -  - | -  -  -  -  -  -  -  -  -  -  - |
| `features/auth/schemas/auth.schema.test.ts` | Validación Zod de login/register |
| `features/session/timer - view.test.ts` | `deriveTimerView` edge cases, `formatRemaining` |
| `features/history/group - by - day.test.ts` | Agrupación por día, orden, formato español |
| `lib/session - time.test.ts` | Matemáticas de timer: elapsed, remaining, actual minutes, pausas |
| `lib/duration - parser.test.ts` | Parseo de duración: "45", "1h 30m", "1:25", etc. |
| `lib/order.test.ts` | Reordenación de arrays, mapeo de posiciones a enteros |
| `services/recommendation/format - reason.test.ts` | Cálculo de `daysSince`, formato de razón legible |
| `components/ui/ConfirmModal.test.tsx` | Modal render, confirm/cancel, password, error, pending |
| `features/home/components/CategoryHomeCard.test.tsx` | Render, X visibilidad, delete click, navegación |
| `features/home/components/CategoryHomeGrid.test.tsx` | Render categorías, X solo vacías |
| `components/layout/AppShell.test.tsx` | Flecha visible/oculta según ruta, router.back(), botón Planificación abre el store |
| `features/session/sort - activities.test.ts` | Orden de actividades según energía (alta/media/baja) |
| `services/recommendation/energy - level.test.ts` | Reglas de energía: duraciones/máximos por nivel, complejidad preferida, filtro por targets con fallback, overrides personalizados y límites mín/máx por energía y dificultad |
| `lib/day.test.ts` | `todayKey` formatea la fecha local (YYYY - MM - DD) |

**Total: 115 tests, 14 archivos** - Ejecutar: `npm run test`

 -  -  - 

## Comandos de desarrollo

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build producción
npm run test          # Tests (Vitest)
npm run test:watch    # Tests en watch
npm run db:migrate    # prisma migrate dev
npm run db:generate   # prisma generate
npm run lint          # ESLint
```

 -  -  - 

## Checklist de próxima fase

Fase 3 (pendiente de definir) podría incluir:
 -  [ ] **Opciones de recomendación**: filtro "¿Te recomiendo algo de estas categorías?" (filas) + "Prefiero algo al azar" → extender `ruleBasedRecommendationService` con `categoryId` y modo `random`
 -  [x] **Backfill idempotente** de actividades semilla para cuentas existentes (vía `seedVersion` + alineación por nombre; Entrenamiento/Salud/Diversión 14 c/u y Finanzas 13)
 -  [ ] Limpieza final de código muerto tras las implementaciones
 -  [ ] Dashboard analytics (sesiones por día, rachas, tiempo total)
 -  [ ] Editar perfil de usuario
 -  [ ] Exportar datos de sesiones
 -  [ ] Navegación por pestañas inferior en mobile
 -  [ ] Notificaciones push
 -  [ ] Sincronización offline con IndexedDB + sync cuando vuelva conexión
 -  [ ] Múltiples temporizadores (Pomodoro clásico, etc.)
