-- =============================================
-- Sprint 4: Pagos en línea
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Agregar email del cliente a pagos
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Asegurar que external_id existe (ya debería del schema original)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Política para que el servicio pueda insertar/leer pagos desde webhooks
-- (los webhooks usan service_role_key, que ya bypasa RLS)
-- No se requieren políticas adicionales para service_role.

-- Comentario de uso:
-- STRIPE_WEBHOOK_SECRET: obtener en https://dashboard.stripe.com/webhooks
-- MERCADOPAGO_ACCESS_TOKEN: obtener en https://www.mercadopago.com.mx/developers/panel
-- RESEND_API_KEY: obtener en https://resend.com/api-keys
