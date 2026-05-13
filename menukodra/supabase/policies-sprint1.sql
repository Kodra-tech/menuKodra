-- =============================================
-- RLS POLICIES — Sprint 1
-- Ejecuta este script en Supabase → SQL Editor
-- =============================================

-- RESTAURANTS: lectura pública
CREATE POLICY "restaurants_public_read" ON restaurants
  FOR SELECT USING (is_active = true);

-- TABLES: lectura pública
CREATE POLICY "tables_public_read" ON tables
  FOR SELECT USING (is_active = true);

-- CATEGORIES: lectura pública
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (is_active = true);

-- MENU_ITEMS: lectura pública de items disponibles
CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (is_available = true);

-- MODIFIER_GROUPS: lectura pública
CREATE POLICY "modifier_groups_public_read" ON modifier_groups
  FOR SELECT USING (true);

-- MODIFIER_OPTIONS: lectura pública
CREATE POLICY "modifier_options_public_read" ON modifier_options
  FOR SELECT USING (true);

-- ITEM_MODIFIER_GROUPS: lectura pública
CREATE POLICY "item_modifier_groups_public_read" ON item_modifier_groups
  FOR SELECT USING (true);

-- TABLE_SESSIONS: crear, leer y actualizar (cliente anónimo)
CREATE POLICY "table_sessions_public_insert" ON table_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "table_sessions_public_select" ON table_sessions
  FOR SELECT USING (true);

CREATE POLICY "table_sessions_public_update" ON table_sessions
  FOR UPDATE USING (true) WITH CHECK (true);

-- ORDERS: crear y leer (cliente anónimo), actualizar (cocina)
CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_public_select" ON orders
  FOR SELECT USING (true);

CREATE POLICY "orders_public_update" ON orders
  FOR UPDATE USING (true);

-- ORDER_ITEMS: crear y leer (cliente anónimo)
CREATE POLICY "order_items_public_insert" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_public_select" ON order_items
  FOR SELECT USING (true);
