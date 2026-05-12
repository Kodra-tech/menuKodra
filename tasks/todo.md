# Sprint 0 — Setup Inicial

> Checklist ejecutable. Marca cada ítem solo cuando hayas verificado que funciona.

---

## A. Prerequisitos (tú los haces antes de llamar a Claude)

- [ ] Node.js 18+ instalado — verifica con `node -v`
- [ ] Cuenta en https://supabase.com creada
- [ ] Proyecto Supabase creado (región `us-east-1` o la más cercana)
  - [ ] Copiaste `Project URL` → lista para .env.local
  - [ ] Copiaste `anon public` key → lista para .env.local
  - [ ] Copiaste `service_role` key → lista para .env.local
- [ ] (Recomendado) Repo vacío creado en GitHub
- [ ] (Recomendado) Cuenta en https://vercel.com conectada a GitHub

---

## B. Scaffold Next.js

- [ ] Correr en la raíz del proyecto:
  ```powershell
  npx create-next-app@latest . --typescript --tailwind --app --eslint --import-alias "@/*" --no-src-dir
  ```
  > Si pregunta si la carpeta no está vacía → confirmar con **Yes**
  > Si pregunta por Turbopack → **No** (más estable)

- [ ] Instalar dependencias core:
  ```powershell
  npm install @supabase/supabase-js @supabase/ssr
  npm install zustand react-hook-form zod @hookform/resolvers
  npm install qrcode
  npm install -D @types/qrcode
  ```

- [ ] Inicializar shadcn/ui:
  ```powershell
  npx shadcn@latest init
  ```
  > Style: **Default** | Base color: **Neutral** | CSS variables: **Yes**
  > Si pregunta por sobrescribir `lib/utils.ts` → **No** (ya está creado)

- [ ] Agregar componentes base de shadcn:
  ```powershell
  npx shadcn@latest add button card dialog input form sheet sonner badge
  ```

- [ ] Verificar que `lib/utils.ts` sigue igual (no fue sobrescrito)

---

## C. Variables de entorno

- [ ] Crear `.env.local.example` con template de todas las variables
- [ ] Copiar a `.env.local`:
  ```powershell
  Copy-Item .env.local.example .env.local
  ```
- [ ] Llenar `.env.local` con los valores reales de Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

---

## D. Base de datos Supabase

- [ ] En Supabase → SQL Editor → pegar el schema completo de `PLAN_DESARROLLO.md` (sección "Schema de Base de Datos")
- [ ] Ejecutar el script → sin errores → todas las tablas creadas:
  - `restaurants`, `staff`, `tables`, `categories`, `menu_items`
  - `modifier_groups`, `modifier_options`, `item_modifier_groups`
  - `table_sessions`, `orders`, `order_items`, `payments`
  - Índices creados
- [ ] Configurar RLS en todas las tablas de negocio:
  ```sql
  ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
  ALTER TABLE item_modifier_groups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  ```
- [ ] Políticas RLS básicas para `staff` (se detallan en Sprint 1)
- [ ] Regenerar `types/database.types.ts` con el schema real:
  ```powershell
  npx supabase gen types typescript --project-id TU_PROJECT_ID > types/database.types.ts
  ```

---

## E. Verificación local

- [ ] `npm run dev` → http://localhost:3000 muestra página de Next.js ✓
- [ ] `npm run build` → termina sin errores ✓
- [ ] `npm run lint` → sin warnings ✓

---

## F. Git + Deploy (cierre del Sprint 0)

- [ ] Primer commit:
  ```powershell
  git init
  git add .
  git commit -m "chore: sprint 0 — setup inicial"
  git branch -M main
  ```
- [ ] Push a GitHub:
  ```powershell
  git remote add origin <tu-repo-url>
  git push -u origin main
  ```
- [ ] Importar repo en Vercel → configurar las mismas env vars del `.env.local`
- [ ] Verificar deploy en producción → URL pública muestra la página de Next.js ✓

---

## ✅ Entregable del Sprint 0

Proyecto deployado en Vercel mostrando la página por defecto de Next.js, con:
- Schema completo corrido en Supabase
- RLS activado en todas las tablas
- Build limpio sin errores ni warnings
- `lib/supabase/`, `lib/utils.ts` y `types/database.types.ts` (real) en su lugar
