-- =============================================
-- SETUP Sprint 2 — Auth, RLS admin, Storage
-- Ejecuta en Supabase → SQL Editor
-- =============================================

-- =============================================
-- 1. ENABLE RLS en tablas pendientes
-- =============================================
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

-- =============================================
-- 2. STAFF — Solo puede verse a sí mismo
-- =============================================
CREATE POLICY "staff_read_own" ON staff
  FOR SELECT USING (auth.uid() = id);

-- =============================================
-- 3. RESTAURANTS — Staff puede leer y editar su restaurante
-- =============================================

-- La policy pública de sprint 1 ya existe para lectura anon.
-- Agregamos policy para staff autenticado.
CREATE POLICY "restaurants_staff_read" ON restaurants
  FOR SELECT USING (
    id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

CREATE POLICY "restaurants_staff_update" ON restaurants
  FOR UPDATE USING (
    id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 4. CATEGORIES — Staff CRUD
-- =============================================
CREATE POLICY "categories_staff_all" ON categories
  FOR ALL USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 5. MENU_ITEMS — Staff CRUD
-- =============================================
CREATE POLICY "menu_items_staff_all" ON menu_items
  FOR ALL USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 6. MODIFIER_GROUPS — Staff CRUD
-- =============================================
CREATE POLICY "modifier_groups_staff_all" ON modifier_groups
  FOR ALL USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 7. MODIFIER_OPTIONS — Staff CRUD (via group)
-- =============================================
CREATE POLICY "modifier_options_staff_all" ON modifier_options
  FOR ALL USING (
    group_id IN (
      SELECT id FROM modifier_groups
      WHERE restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
    )
  ) WITH CHECK (
    group_id IN (
      SELECT id FROM modifier_groups
      WHERE restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
    )
  );

-- =============================================
-- 8. ITEM_MODIFIER_GROUPS — Staff CRUD (via item)
-- =============================================
CREATE POLICY "item_modifier_groups_staff_all" ON item_modifier_groups
  FOR ALL USING (
    item_id IN (
      SELECT id FROM menu_items
      WHERE restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
    )
  ) WITH CHECK (
    item_id IN (
      SELECT id FROM menu_items
      WHERE restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
    )
  );

-- =============================================
-- 9. TABLES — Staff CRUD
-- =============================================
CREATE POLICY "tables_staff_all" ON tables
  FOR ALL USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 10. TABLE_SESSIONS — Staff lectura
-- =============================================
CREATE POLICY "table_sessions_staff_read" ON table_sessions
  FOR SELECT USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 11. ORDERS — Staff CRUD
-- =============================================
CREATE POLICY "orders_staff_all" ON orders
  FOR ALL USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 12. ORDER_ITEMS — Staff lectura
-- =============================================
CREATE POLICY "order_items_staff_read" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
    )
  );

-- =============================================
-- 13. STORAGE — Bucket menu-images
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Lectura pública de imágenes
CREATE POLICY "menu_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

-- Solo staff autenticado puede subir/actualizar/borrar
CREATE POLICY "menu_images_staff_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "menu_images_staff_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "menu_images_staff_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
  );

-- =============================================
-- SIGUIENTE PASO — Crear usuario admin
-- =============================================
-- Opción A: LOGIN CON MAGIC LINK (recomendado para testing)
--
-- 1. En Supabase Dashboard → Project Settings → Authentication → Email Provider
--    • Habilita "Auto Confirm" para auto-confirmar usuarios
-- 2. Ahora en la app: ve a /login e ingresa tu email
-- 3. Recibe el OTP en tu email
-- 4. Supabase automáticamente te asigna a Tacos Don Pepe vía el trigger
--    (ejecuta setup-sprint2-trigger.sql después de este archivo)
--
-- Opción B: CREAR USUARIO MANUALMENTE (si prefieres control total)
--
-- 1. Supabase Dashboard → Authentication → Users → Add user
--    Email: admin@tacos-don-pepe.com
--    Password: (cualquiera, o deja vacío para OTP)
-- 2. Supabase envía email de confirmación → confirma desde el email
-- 3. Luego copia el UUID del usuario
-- 4. Corre este INSERT en SQL Editor:

-- INSERT INTO staff (id, restaurant_id, role, name)
-- VALUES (
--   'UUID-DEL-USUARIO-AQUI',
--   'a1b2c3d4-0000-0000-0000-000000000001',
--   'admin',
--   'Admin Don Pepe'
-- ) ON CONFLICT (id) DO NOTHING;

-- =============================================
