# 📱 Plan de Desarrollo — Menú Digital QR (SaaS)

> Documento maestro del proyecto. Guárdalo en la raíz de tu repo y referéncialo desde Claude Code.

---

## 🎯 Visión del Producto

**Qué es:** SaaS multi-tenant que permite a restaurantes ofrecer menú digital, ordenar desde la mesa vía QR, gestionar cocina y cobrar.

**Cliente final:** Restaurantes en México (inicia en Monterrey).

**Modelo de venta:** Setup + mensualidad ($5,000 MXN setup + $800-1,500/mes según tier).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | **Next.js 14** (App Router) + TypeScript | SSR, rutas dinámicas, API routes integradas |
| UI | **Tailwind CSS** + **shadcn/ui** | Velocidad + componentes accesibles |
| Backend + DB | **Supabase** (PostgreSQL) | Auth, Realtime, Storage en uno solo |
| Estado cliente | **Zustand** | Carrito ligero, simple |
| Forms | **React Hook Form** + **Zod** | Validación tipada |
| Pagos | **Stripe** + **MercadoPago** | Cobertura MX + internacional |
| QR | librería `qrcode` | Generación server-side |
| Hosting | **Vercel** (frontend) + Supabase (backend) | Deploy automático con git |
| Facturación | **Facturapi** o **SW Sapien** | CFDI 4.0 |

---

## 📁 Estructura de Carpetas

```
menu-digital/
├── app/
│   ├── (public)/                        # Rutas públicas (cliente del restaurante)
│   │   ├── m/[restaurantSlug]/[tableId]/
│   │   │   ├── page.tsx                 # Menú principal
│   │   │   ├── carrito/page.tsx         # Carrito
│   │   │   ├── pago/page.tsx            # Selección método de pago
│   │   │   └── estado/page.tsx          # Estado del pedido
│   │   └── page.tsx                     # Landing comercial
│   │
│   ├── (admin)/                         # Panel del restaurante
│   │   ├── login/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Overview
│   │   │   ├── menu/                    # CRUD platillos y categorías
│   │   │   ├── mesas/                   # Generar QRs
│   │   │   ├── cocina/                  # KDS (Kitchen Display)
│   │   │   ├── caja/                    # Cobros
│   │   │   ├── reportes/                # Ventas, top platillos
│   │   │   └── ajustes/                 # Datos del restaurante
│   │   └── layout.tsx
│   │
│   └── api/
│       ├── orders/route.ts
│       ├── orders/[id]/status/route.ts
│       ├── payments/stripe/route.ts
│       ├── payments/mercadopago/route.ts
│       ├── webhooks/stripe/route.ts
│       └── webhooks/mercadopago/route.ts
│
├── components/
│   ├── ui/                              # shadcn components
│   ├── menu/                            # MenuCategory, ItemCard, ItemDetail
│   ├── cart/                            # CartDrawer, CartItem, ModifierPicker
│   └── admin/                           # MenuEditor, OrderCard, KDS
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Cliente browser
│   │   ├── server.ts                    # Cliente server
│   │   └── middleware.ts                # Refresh tokens
│   ├── stripe/
│   ├── mercadopago/
│   ├── qr.ts                            # Generación QR
│   └── utils.ts
│
├── stores/
│   └── cart-store.ts                    # Zustand
│
├── hooks/
│   ├── use-realtime-orders.ts
│   └── use-table-session.ts
│
├── types/
│   └── database.types.ts                # Generado con Supabase CLI
│
├── public/
└── middleware.ts                        # Auth + multi-tenant routing
```

---

## 🗄️ Schema de Base de Datos (PostgreSQL / Supabase)

```sql
-- =============================================
-- MULTI-TENANT
-- =============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,              -- ej: "tacos-don-pepe"
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  currency TEXT DEFAULT 'MXN',
  timezone TEXT DEFAULT 'America/Monterrey',
  rfc TEXT,                                -- Para facturación
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'basic',               -- basic | pro | enterprise
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usuarios del restaurante (admin, mesero, cocina, caja)
CREATE TABLE staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kitchen', 'waiter', 'cashier')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MESAS Y QR
-- =============================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  number INT NOT NULL,                     -- Mesa #
  label TEXT,                               -- "Terraza 1", "Barra"
  qr_code_url TEXT,                         -- URL completa del QR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, number)
);

-- =============================================
-- MENÚ
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- "Desayunos"
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  available_from TIME,                      -- ej: 07:00 (solo desayunos por la mañana)
  available_until TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  tags TEXT[],                              -- ['vegetariano', 'picante', 'sin_gluten']
  allergens TEXT[],                         -- ['gluten', 'lactosa', 'nueces']
  is_available BOOLEAN DEFAULT true,        -- Toggle "agotado"
  prep_time_minutes INT DEFAULT 15,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modificadores (Tamaño, Temperatura, Extras)
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- "Tamaño", "Quitar ingredientes"
  type TEXT CHECK (type IN ('single', 'multiple')),
  is_required BOOLEAN DEFAULT false,
  min_select INT DEFAULT 0,
  max_select INT
);

CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- "Grande", "Sin cebolla"
  price_delta DECIMAL(10,2) DEFAULT 0,      -- +20 o 0
  display_order INT DEFAULT 0
);

CREATE TABLE item_modifier_groups (
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, group_id)
);

-- =============================================
-- SESIONES Y ÓRDENES
-- =============================================
-- Una sesión = una mesa abierta hasta que se paga
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paying', 'closed')),
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  total DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  name_snapshot TEXT NOT NULL,              -- Por si cambia el nombre después
  price_snapshot DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  special_instructions TEXT,
  modifiers JSONB,                          -- [{group, option, price_delta}]
  subtotal DECIMAL(10,2) NOT NULL
);

-- =============================================
-- PAGOS
-- =============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id),
  restaurant_id UUID REFERENCES restaurants(id),
  amount DECIMAL(10,2) NOT NULL,
  tip DECIMAL(10,2) DEFAULT 0,
  method TEXT CHECK (method IN ('cash', 'card_terminal', 'stripe', 'mercadopago')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  external_id TEXT,                         -- ID de Stripe/MP
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ÍNDICES Y RLS
-- =============================================
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_sessions_table_active ON table_sessions(table_id) WHERE status = 'active';
CREATE INDEX idx_menu_items_category ON menu_items(category_id) WHERE is_available = true;

-- Row Level Security: cada restaurante solo ve sus datos
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- (políticas detalladas en Sprint 0)
```

---

## 🚀 Roadmap por Sprints

### Sprint 0 — Setup (1-2 días)
- [ ] `npx create-next-app@latest menu-digital --typescript --tailwind --app`
- [ ] Crear proyecto en Supabase
- [ ] Configurar `.env.local`
- [ ] Instalar dependencias base
- [ ] Configurar shadcn/ui (`npx shadcn@latest init`)
- [ ] Setup ESLint + Prettier
- [ ] Subir a GitHub + conectar Vercel
- [ ] Correr migraciones SQL (schema completo arriba)
- [ ] Configurar RLS básico

**Entregable:** Proyecto deployado mostrando "Hello World" en Vercel.

---

### Sprint 1 — MVP Cliente (5-7 días)
**Objetivo:** Un cliente puede escanear QR, ver menú, agregar platillos al carrito, y enviar orden a cocina.

- [ ] Ruta `/m/[slug]/[tableId]` que valida que mesa exista
- [ ] Crear/recuperar `table_session` activa
- [ ] Componente `MenuCategory` con tabs/scroll
- [ ] Componente `ItemCard` con imagen, nombre, precio
- [ ] Modal `ItemDetail` con modificadores e instrucciones
- [ ] Carrito flotante con Zustand
- [ ] Botón "Ordenar" → crea `order` + `order_items` en DB
- [ ] Vista de cocina simple: lista de órdenes en estado `received`/`preparing`
- [ ] Realtime: la cocina ve nuevas órdenes sin refresh
- [ ] Botón en cocina: "Marcar listo" → notifica al cliente

**Entregable:** Demo funcional end-to-end con datos seed.

---

### Sprint 2 — Panel Admin (5-7 días)
**Objetivo:** El restaurante puede gestionar su menú sin desarrollador.

- [ ] Auth con Supabase (login/logout, magic link)
- [ ] Layout dashboard con sidebar
- [ ] CRUD de categorías
- [ ] CRUD de platillos con upload de imagen (Supabase Storage)
- [ ] CRUD de modificadores
- [ ] Toggle "agotado" rápido por platillo
- [ ] CRUD de mesas + generación de QR descargable (PNG/PDF)
- [ ] Configuración del restaurante (nombre, logo, colores)

**Entregable:** Restaurante puede dar de alta su menú completo sin tocar código.

---

### Sprint 3 — Caja y Cierre de Mesa (4-5 días)
- [ ] Vista caja: ver mesas activas con totales
- [ ] Detalle de cuenta por mesa
- [ ] Cobro en efectivo/terminal (manual)
- [ ] Marcar `table_session` como `closed`
- [ ] Reset automático: nueva sesión al escanear QR de mesa cerrada
- [ ] Vista cliente "Solicitar cuenta" (pasa la sesión a `paying`)
- [ ] Botón "Llamar al mesero" → notificación en panel

**Entregable:** Ciclo completo: cliente ordena → cocina prepara → caja cobra → mesa lista para siguiente cliente.

---

### Sprint 4 — Pago en Línea (5-7 días)
- [ ] Integración Stripe Checkout
- [ ] Integración MercadoPago Checkout Pro
- [ ] Webhook handlers (con verificación de firma)
- [ ] Selector de método de pago en cliente
- [ ] Cálculo y selector de propina (10/15/20% / custom)
- [ ] Pantalla de confirmación post-pago
- [ ] Email/SMS de recibo (Resend)

**Entregable:** Cliente puede pagar sin pasar a caja.

---

### Sprint 5 — Refinamiento UX (4-5 días)
- [ ] Estado del pedido visible al cliente (recibido → preparando → listo)
- [ ] Multi-idioma (next-intl): español/inglés
- [ ] Tags y alérgenos visibles en cards
- [ ] Filtros: vegetariano, sin gluten, etc.
- [ ] Skeletons / loading states
- [ ] PWA (manifest + service worker básico)
- [ ] Optimización de imágenes (next/image + Supabase transform)
- [ ] Modo oscuro (opcional según marca del restaurante)

---

### Sprint 6 — Multi-tenant + Comercialización (5-7 días)
- [ ] Onboarding de restaurante nuevo (wizard)
- [ ] Dashboard de reportes: ventas/día, top platillos, ticket promedio
- [ ] Exportar reportes a CSV/PDF
- [ ] Landing comercial (`/`)
- [ ] Página de pricing
- [ ] Demo en vivo con restaurante ficticio
- [ ] Documentación para clientes (FAQ)

---

### Sprint 7 — Facturación CFDI (cuando llegue el primer cliente que la pida)
- [ ] Integración con Facturapi
- [ ] Botón "Solicitar factura" post-pago
- [ ] Form de RFC + datos fiscales
- [ ] Envío de XML + PDF por email

---

## 🔑 Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚙️ Comandos Iniciales

```bash
# 1. Crear proyecto
npx create-next-app@latest menu-digital --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd menu-digital

# 2. Dependencias core
npm install @supabase/supabase-js @supabase/ssr
npm install zustand react-hook-form zod @hookform/resolvers
npm install qrcode
npm install -D @types/qrcode

# 3. UI
npx shadcn@latest init
npx shadcn@latest add button card dialog input form sheet sonner badge

# 4. Pagos (cuando llegues a Sprint 4)
npm install stripe @stripe/stripe-js
npm install mercadopago

# 5. Tipos de Supabase
npx supabase gen types typescript --project-id TU_PROJECT_ID > types/database.types.ts
```


