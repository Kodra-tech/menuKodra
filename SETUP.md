# 🚀 Setup — Sprint 0

Pasos para inicializar el proyecto. Corre los comandos en orden desde la raíz del repo (`MenuKodra/`).

> **Nota:** Estos comandos NO están corridos todavía. Yo (Claude) solo dejé listos los archivos auxiliares: `lib/supabase/*`, `lib/utils.ts`, `types/database.types.ts`, `.env.local.example`.

---

## 1. Crear el proyecto Next.js en esta misma carpeta

```powershell
npx create-next-app@latest . --typescript --tailwind --app --eslint --import-alias "@/*" --no-src-dir
```

- El `.` instala en la carpeta actual.
- Si te avisa que la carpeta no está vacía (por `PLAN_DESARROLLO.md`, `SETUP.md`, `lib/`, etc.), confirma con **Yes** — los archivos que ya creé no chocan con los que genera Next.
- Si te pregunta por Turbopack, di lo que prefieras (yo recomiendo **No** por ahora, más estable).

---

## 2. Dependencias core

```powershell
npm install @supabase/supabase-js @supabase/ssr
npm install zustand react-hook-form zod @hookform/resolvers
npm install qrcode
npm install -D @types/qrcode
```

`clsx` y `tailwind-merge` (que usa `lib/utils.ts`) los instala shadcn en el siguiente paso.

---

## 3. shadcn/ui

```powershell
npx shadcn@latest init
```

Responde:
- Style: **Default** (o New York, a gusto)
- Base color: **Neutral** o **Slate**
- CSS variables: **Yes**

Luego agrega los componentes base que usaremos en Sprint 1:

```powershell
npx shadcn@latest add button card dialog input form sheet sonner badge
```

> Si shadcn te pregunta por sobrescribir `lib/utils.ts`, dile **No** — ya está creado.

---

## 4. Variables de entorno

```powershell
Copy-Item .env.local.example .env.local
```

Luego edita `.env.local` con las llaves reales de Supabase cuando crees el proyecto en https://supabase.com.

---

## 5. Crear el proyecto en Supabase

1. Entra a https://supabase.com → New project (región más cercana: `us-east-1` o `us-west-1`).
2. Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`.
3. Copia `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copia `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`.
5. En el SQL Editor pega el schema completo de `PLAN_DESARROLLO.md` (sección "Schema de Base de Datos") y córrelo.

---

## 6. Generar tipos de la DB (cuando ya esté el schema corrido)

```powershell
npx supabase gen types typescript --project-id TU_PROJECT_ID > types/database.types.ts
```

Esto reemplaza el placeholder que dejé en `types/database.types.ts`.

---

## 7. Probar que arranca

```powershell
npm run dev
```

Abre http://localhost:3000 — debería verse el "Hello World" de Next.

---

## 8. Git + Vercel (opcional ahora, recomendado antes de Sprint 1)

```powershell
git init
git add .
git commit -m "chore: sprint 0 — setup inicial"
git branch -M main
# Crea repo vacío en GitHub y:
git remote add origin <tu-repo-url>
git push -u origin main
```

Luego en https://vercel.com importa el repo y agrega las mismas env vars que tengas en `.env.local`.

---

## ✅ Estado actual

Archivos ya creados por mí:

```
lib/
├── supabase/
│   ├── client.ts        # createClient() para componentes client
│   ├── server.ts        # createClient() para Server Components / Route Handlers
│   └── middleware.ts    # updateSession() para refrescar tokens
└── utils.ts             # cn() helper (shadcn)

types/
└── database.types.ts    # placeholder — regenerar con supabase gen types

.env.local.example       # plantilla de variables
SETUP.md                 # este archivo
```

Falta crear todo lo que genera `create-next-app` (`app/`, `package.json`, `next.config.js`, `tsconfig.json`, etc.) y lo de shadcn (`components/ui/`, `components.json`).

Después del Sprint 0, en Sprint 1 ya creamos `app/(public)/m/[restaurantSlug]/[tableId]/`, los componentes de menú y el `stores/cart-store.ts`.
