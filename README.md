# Go Sesión

PWA de enfoque personal. "Reserva tu espacio y haz que cada momento cuente."

Aplicación de sesiones de enfoque: elige una actividad, define un tiempo mínimo/recomendado/máximo, inicia el cronómetro y avanza sin fricción. Incluye recomendaciones personalizadas por energía y dificultad, plan del día, historial, accesos rápidos al home y PWA instalable.

## Stack

Next.js 16 (App Router) · TypeScript estricto · TailwindCSS v4 · Prisma 7 (driver adapter `@prisma/adapter-pg`) · PostgreSQL (Neon en producción) · Auth.js (NextAuth v5, Credentials + JWT) · Zustand · dnd-kit · Framer Motion · Vitest

## Requisitos

- Node.js 22+
- Docker Desktop (para Postgres en desarrollo)

## Puesta en marcha local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar Postgres
docker compose up -d

# 3. Aplicar el esquema (cada usuario nuevo siembra sus propias categorías al registrarse)
npm run db:migrate

# 4. Arrancar el servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 para la landing, o http://localhost:3000/register para crear una cuenta.

## Variables de entorno

Copia `.env.example` a `.env` y ajústalo. En desarrollo apunta al `docker-compose.yml` incluido.

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres. |
| `AUTH_SECRET` | Secreto de NextAuth. Genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` o `npx auth secret`. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (para SEO / OpenGraph). En dev: `http://localhost:3000`. |

## Despliegue en producción (Vercel + Neon)

Stack gratuito y rápido: **Vercel** (hosting Next.js) + **Neon** (Postgres serverless). El `.env` nunca se sube: las variables se configuran en el panel de Vercel.

### 1. Crear la base de datos en Neon

1. Crea una cuenta y un proyecto en [neon.tech](https://neon.tech).
2. En el proyecto, copia la **connection string "pooled"** (termina en `...-pooler` o incluye `/neondb`) y agrégale `?sslmode=require` al final.
   - Ejemplo: `postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

### 2. Subir el repo a GitHub

El proyecto ya está inicializado como repositorio Git y con un commit listo. Solo crea el repo en GitHub y sube:

```bash
# (desde la raíz del proyecto)
git branch -M main
git remote add origin https://github.com/<tu-usuario>/go-sesion.git
git push -u origin main
```

> `lib/generated/prisma` está ignorado en Git: se regenera con `prisma generate` durante el build en Vercel.

### 3. Configurar el proyecto en Vercel

1. Crea la app en [vercel.com](https://vercel.com) e importa el repo (framework **Next.js** se autodetecta).
2. En **Settings → Environment Variables** agrega (para los entornos **Production**, **Preview** y **Development**):
   - `DATABASE_URL` → la connection string pooled de Neon (con `?sslmode=require`)
   - `AUTH_SECRET` → un secreto de 32 bytes en base64
   - `NEXT_PUBLIC_SITE_URL` → la URL del deploy, p. ej. `https://<proyecto>.vercel.app`
3. Deploy → el build corre `prisma generate && prisma migrate deploy && next build`, de modo que las migraciones se aplican automáticamente en cada deploy.

La app queda en línea en `https://<proyecto>.vercel.app`.

### 4. Notas del plan gratuito

- **Neon** free tier: 0.5 GB de almacenamiento (sobra para este proyecto). Puede pausarse tras inactividad; se reactiva con la primera consulta.
- **Vercel** Hobby: deploys ilimitados para repos personales, sin costo.

### 5. Verificación post-deploy

- Registro + login, home, iniciar sesión (cronómetro), historial, recomendaciones, planificación, Personalizar, Actividades, acceso rápido al home, cambio de tema.
- PWA: instalable, manifest, icons, offline fallback.
- Revisar los logs de Vercel: sin errores de Edge/middleware ni de conexión a la BD.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el cliente Prisma, aplica migraciones y compila para producción |
| `npm run start` | Sirve el build de producción localmente |
| `npm run lint` | Lint (ESLint) |
| `npm run test` | Corre la suite de Vitest una vez |
| `npm run test:watch` | Vitest en modo watch |
| `npm run db:migrate` | `prisma migrate dev` (desarrollo) |
| `npm run db:deploy` | `prisma migrate deploy` (aplica migraciones en producción) |
| `npm run db:generate` | Regenera el cliente de Prisma |

## Estructura (Clean Architecture pragmática)

```
app/            rutas (App Router)
auth.ts         NextAuth (Credentials + JWT), runtime Node
auth.config.ts  Config de NextAuth Edge-safe (usada por el middleware)
features/       UI + hooks + acciones por dominio (auth, categories, home, session...)
services/       casos de uso (orquestan repositorios, validan reglas de negocio)
repositories/   acceso a datos vía Prisma
lib/            utilidades puras, cliente Prisma, constantes
prisma/         schema, migraciones
proxy.ts        Middleware de autenticación (edge-safe)
```
