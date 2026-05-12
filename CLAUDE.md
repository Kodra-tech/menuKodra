# Menu Digital QR — Proyecto Brain

## Contexto
SaaS multi-tenant para restaurantes en México. Menú digital via QR, 
gestión de cocina, pagos integrados. Iniciando Sprint 1.

## Stack
- Next.js 14 App Router + TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL + Realtime + Storage)
- Zustand (carrito)
- React Hook Form + Zod
- Stripe + MercadoPago
- Vercel (deploy)

## Comandos
npm run dev | npm run build | npm run lint | npm test

## Convenciones
- TypeScript strict, NUNCA usar `any`
- Functional components + hooks only
- shadcn/ui para todos los primitivos UI
- Zustand para estado global (carrito)
- cn() para clases condicionales de Tailwind
- next/image para todas las imágenes
- Todos los textos en español (es-MX)

## Arquitectura
- /app/(public)/m/[restaurantSlug]/[tableId]/ → vista cliente
- /app/(admin)/dashboard/ → panel del restaurante
- /lib/supabase/ → cliente browser y server separados
- /types/database.types.ts → generado con Supabase CLI

## Multi-tenant
Cada restaurante tiene su restaurant_id. SIEMPRE filtrar queries por restaurant_id.
Row Level Security activo en Supabase.

## Plan de desarrollo
Ver PLAN_DESARROLLO.md en raíz del proyecto.
Ver DIAGRAMAS_FLUJO.md para los flujos de negocio.

## Workflow
1. Para cualquier tarea no trivial: plan primero en tasks/todo.md
2. Nunca marcar tarea completa sin probar que funciona
3. Después de cada corrección: actualizar tasks/lessons.md