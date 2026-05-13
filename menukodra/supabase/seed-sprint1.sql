-- =============================================
-- SEED DATA — Sprint 1
-- Restaurante de prueba para desarrollo local
-- Ejecuta en Supabase → SQL Editor
-- =============================================

-- Restaurante demo
INSERT INTO restaurants (id, name, slug, primary_color, currency, timezone, is_active, plan)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Tacos Don Pepe',
  'tacos-don-pepe',
  '#E53E3E',
  'MXN',
  'America/Monterrey',
  true,
  'basic'
) ON CONFLICT (id) DO NOTHING;

-- Mesas
INSERT INTO tables (id, restaurant_id, number, label, is_active)
VALUES
  ('b1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 1, 'Mesa 1', true),
  ('b1b2c3d4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 2, 'Mesa 2', true),
  ('b1b2c3d4-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 3, 'Terraza 1', true)
ON CONFLICT (restaurant_id, number) DO NOTHING;

-- Categorías
INSERT INTO categories (id, restaurant_id, name, display_order, is_active)
VALUES
  ('c1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Tacos', 1, true),
  ('c1b2c3d4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'Bebidas', 2, true),
  ('c1b2c3d4-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'Postres', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Platillos
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, tags, prep_time_minutes, is_available, display_order)
VALUES
  -- Tacos
  ('d1000001-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000001',
   'Taco de Bistec', 'Bistec asado con cebolla y cilantro', 35, '{}', 10, true, 1),
  ('d1000001-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000001',
   'Taco de Pastor', 'Carne al pastor con piña y cebolla', 32, '{picante}', 10, true, 2),
  ('d1000001-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000001',
   'Taco de Pollo', 'Pollo a la plancha con guacamole', 30, '{vegetariano}', 8, true, 3),
  -- Bebidas
  ('d1000002-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000002',
   'Agua Fresca', 'Jamaica, horchata o tamarindo', 25, '{}', 2, true, 1),
  ('d1000002-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000002',
   'Refresco', 'Coca, Sprite o Fanta', 30, '{}', 1, true, 2),
  -- Postres
  ('d1000003-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000003',
   'Churros', '3 churros con cajeta y chocolate', 55, '{}', 8, true, 1)
ON CONFLICT (id) DO NOTHING;

-- Grupo de modificador: Tortilla
INSERT INTO modifier_groups (id, restaurant_id, name, type, is_required, min_select, max_select)
VALUES (
  'e1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Tipo de tortilla', 'single', true, 1, 1
) ON CONFLICT (id) DO NOTHING;

-- Opciones de tortilla
INSERT INTO modifier_options (id, group_id, name, price_delta, display_order)
VALUES
  ('f1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', 'Maíz', 0, 1),
  ('f1000001-0000-0000-0000-000000000002', 'e1000001-0000-0000-0000-000000000001', 'Harina', 0, 2),
  ('f1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000001', 'Costra de queso', 15, 3)
ON CONFLICT (id) DO NOTHING;

-- Grupo de modificador: Sabor agua fresca
INSERT INTO modifier_groups (id, restaurant_id, name, type, is_required, min_select, max_select)
VALUES (
  'e1000002-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Sabor', 'single', true, 1, 1
) ON CONFLICT (id) DO NOTHING;

-- Opciones de sabor
INSERT INTO modifier_options (id, group_id, name, price_delta, display_order)
VALUES
  ('f1000002-0000-0000-0000-000000000001', 'e1000002-0000-0000-0000-000000000001', 'Jamaica', 0, 1),
  ('f1000002-0000-0000-0000-000000000002', 'e1000002-0000-0000-0000-000000000001', 'Horchata', 0, 2),
  ('f1000002-0000-0000-0000-000000000003', 'e1000002-0000-0000-0000-000000000001', 'Tamarindo', 0, 3)
ON CONFLICT (id) DO NOTHING;

-- Asociar modificador de tortilla a los tacos
INSERT INTO item_modifier_groups (item_id, group_id)
VALUES
  ('d1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001'),
  ('d1000001-0000-0000-0000-000000000002', 'e1000001-0000-0000-0000-000000000001'),
  ('d1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000001')
ON CONFLICT (item_id, group_id) DO NOTHING;

-- Asociar modificador de sabor al agua fresca
INSERT INTO item_modifier_groups (item_id, group_id)
VALUES (
  'd1000002-0000-0000-0000-000000000001',
  'e1000002-0000-0000-0000-000000000001'
) ON CONFLICT (item_id, group_id) DO NOTHING;

-- =============================================
-- URLs de prueba después de correr el seed:
--
-- Menú Mesa 1:
-- http://localhost:3000/m/tacos-don-pepe/b1b2c3d4-0000-0000-0000-000000000001
--
-- Vista de cocina:
-- http://localhost:3000/cocina/a1b2c3d4-0000-0000-0000-000000000001
-- =============================================
