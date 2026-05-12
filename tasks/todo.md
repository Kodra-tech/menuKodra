# Sprint 0 — Setup Inicial

> Checklist ejecutable. Marca cada ítem solo cuando hayas verificado que funciona.
> 
> **Nota:** El proyecto Next.js está en `menukodra/`. Todos los comandos npm se corren desde ahí.

---

## A. Prerequisitos ✅

- [x] Node.js 18+ instalado
- [x] Cuenta en supabase.com creada
- [x] Proyecto Supabase creado con las 3 keys en `.env.local`

---

## B. Scaffold Next.js ✅

- [x] `create-next-app` corrido → proyecto en `menukodra/` (Next.js 16.2.6 + Tailwind v4)
- [x] Dependencias core instaladas en `menukodra/`:
  - `@supabase/supabase-js`, `@supabase/ssr`
  - `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`
  - `qrcode`, `@types/qrcode`
- [x] shadcn/ui inicializado (estilo: radix-nova, color: neutral, CSS vars: yes)
- [x] Componentes shadcn presentes: `button`, `card`, `dialog`, `input`, `sheet`, `sonner`, `badge`
- [x] `lib/utils.ts` con `cn()` en `menukodra/lib/`
- [x] `lib/supabase/client.ts`, `server.ts`, `middleware.ts` en `menukodra/lib/supabase/`
- [x] `types/database.types.ts` (placeholder) en `menukodra/types/`
- [x] `turbopack.root` configurado en `next.config.ts` (sin warnings de build)
- [ ] Agregar componente `form` de shadcn (faltó en la instalación inicial):
  ```powershell
  cd menukodra
  npx shadcn add form
  ```

---

## C. Variables de entorno ✅

- [x] `.env.local` con keys reales de Supabase en `menukodra/`
- [ ] Agregar `NEXT_PUBLIC_APP_URL=http://localhost:3000` al `.env.local` si no está

---

## D. Base de datos Supabase — PENDIENTE (tú lo haces en Supabase)

- [ ] En Supabase → SQL Editor → pegar el schema completo de `PLAN_DESARROLLO.md` (sección "Schema de Base de Datos") y ejecutar
- [ ] Verificar que se crearon todas las tablas:
  - `restaurants`, `staff`, `tables`, `categories`, `menu_items`
  - `modifier_groups`, `modifier_options`, `item_modifier_groups`
  - `table_sessions`, `orders`, `order_items`, `payments`
  - Índices presentes
- [ ] Habilitar RLS en todas las tablas:
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
- [ ] Regenerar tipos reales (reemplaza el placeholder):
  ```powershell
  cd menukodra
  npx supabase gen types typescript --project-id TU_PROJECT_ID > types/database.types.ts
  ```

---

## E. Verificación local ✅

- [x] `npm run build` → limpio sin errores ni warnings
- [x] `npm run lint` → sin warnings
- [ ] `npm run dev` → abrir http://localhost:3000 y confirmar que carga ✓

---

## F. Git + Deploy — PENDIENTE

- [ ] Commit con el estado actual:
  ```powershell
  git add .
  git commit -m "chore: sprint 0 — setup completo"
  ```
- [ ] Push a GitHub (repo ya conectado en el remote `origin`)
- [ ] Importar repo en Vercel → agregar env vars del `.env.local`
- [ ] Confirmar que el deploy en producción carga la página ✓

---

## ⚠️ Limpieza pendiente (opcional pero recomendada)

La raíz `MenuKodra/` tiene un `package.json`, `package-lock.json` y `node_modules/` de una instalación previa que ya no se usa. Para limpiar:
```powershell
Remove-Item -Recurse -Force "C:\Users\targe\OneDrive\Desktop\MenuKodra\node_modules"
Remove-Item -Force "C:\Users\targe\OneDrive\Desktop\MenuKodra\package.json"
Remove-Item -Force "C:\Users\targe\OneDrive\Desktop\MenuKodra\package-lock.json"
```
Confirma antes de correrlo.

---

## ✅ Entregable del Sprint 0

- Build limpio: `npm run build` sin errores ✓
- Supabase: schema corrido + RLS activo
- Proyecto deployado en Vercel con URL pública
