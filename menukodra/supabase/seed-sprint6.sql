-- ============================================================
-- SEED: Datos de ejemplo — 1 mes de ventas
-- Sprint 6 — MenuKodra
--
-- Genera automáticamente datos para el primer restaurante encontrado.
-- Requiere: restaurante y mesas creados desde el dashboard admin.
--
-- Si el restaurante tiene menos de 5 platillos en el menú,
-- este script crea platillos de demo para rellenar las órdenes.
--
-- Ejecutar en: Supabase → SQL Editor → Run
-- ============================================================

DO $$
DECLARE
  v_rid         UUID;
  v_cat_id      UUID;
  v_table_ids   UUID[];
  v_item_ids    UUID[];
  v_item_prices NUMERIC[];
  v_item_names  TEXT[];
  v_session_id  UUID;
  v_order_id    UUID;
  v_day         DATE;
  v_opened_at   TIMESTAMPTZ;
  v_closed_at   TIMESTAMPTZ;
  v_table_id    UUID;
  v_num_orders  INT;
  v_num_items   INT;
  v_sessions_n  INT;
  v_order_total NUMERIC;
  v_session_total NUMERIC;
  v_tip         NUMERIC;
  v_method      TEXT;
  v_rand_item   INT;
  v_item_id     UUID;
  v_item_price  NUMERIC;
  v_item_name   TEXT;
  v_qty         INT;
  v_day_dow     INT;
  v_hour        INT;
  v_minute      INT;
  v_methods     TEXT[] := ARRAY['cash','cash','cash','card_terminal','card_terminal','mercadopago'];
  i             INT;
BEGIN

  -- ── 1. Obtener el primer restaurante ─────────────────────────────
  SELECT id INTO v_rid FROM restaurants ORDER BY created_at LIMIT 1;
  IF v_rid IS NULL THEN
    RAISE EXCEPTION 'No hay restaurantes en la base de datos. Crea uno primero desde el dashboard.';
  END IF;
  RAISE NOTICE 'Restaurant ID: %', v_rid;

  -- ── 2. Obtener o crear categoría ──────────────────────────────────
  SELECT id INTO v_cat_id
  FROM categories WHERE restaurant_id = v_rid AND is_active = true LIMIT 1;

  IF v_cat_id IS NULL THEN
    INSERT INTO categories (restaurant_id, name, display_order, is_active)
    VALUES (v_rid, 'Platillos', 1, true)
    RETURNING id INTO v_cat_id;
  END IF;

  -- ── 3. Crear platillos de demo si hay menos de 5 ─────────────────
  IF (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = v_rid) < 5 THEN
    RAISE NOTICE 'Creando platillos de demo...';
    INSERT INTO menu_items
      (restaurant_id, category_id, name, description, price, is_available, display_order)
    VALUES
      (v_rid, v_cat_id, 'Tacos de Pastor',     '3 piezas con piña, cilantro y cebolla', 85,  true, 1),
      (v_rid, v_cat_id, 'Tacos de Birria',      '3 piezas con consomé',                  95,  true, 2),
      (v_rid, v_cat_id, 'Quesadillas',          'Con queso Oaxaca y elección de guiso',  95,  true, 3),
      (v_rid, v_cat_id, 'Enchiladas Verdes',    'Con pollo, crema y queso',              120, true, 4),
      (v_rid, v_cat_id, 'Enchiladas Rojas',     'Con pollo, crema y queso',              120, true, 5),
      (v_rid, v_cat_id, 'Pozole Rojo',          'Con guarniciones completas',             160, true, 6),
      (v_rid, v_cat_id, 'Flautas de Pollo',     '4 piezas con guacamole y crema',        110, true, 7),
      (v_rid, v_cat_id, 'Sopa de Lima',         'Receta yucateca tradicional',            90,  true, 8),
      (v_rid, v_cat_id, 'Guacamole',            'Con totopos artesanales',               75,  true, 9),
      (v_rid, v_cat_id, 'Elotes con Crema',     'Con queso y chile piquín',              55,  true, 10),
      (v_rid, v_cat_id, 'Agua de Jamaica',      'Litro natural',                          40,  true, 11),
      (v_rid, v_cat_id, 'Agua de Horchata',     'Litro natural',                          40,  true, 12),
      (v_rid, v_cat_id, 'Cerveza Clara',        'Fría de la casa',                        65,  true, 13),
      (v_rid, v_cat_id, 'Refresco',             'Lata 355ml',                             35,  true, 14),
      (v_rid, v_cat_id, 'Café de Olla',         'Canela y piloncillo',                    45,  true, 15)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 4. Cargar arrays de platillos ────────────────────────────────
  SELECT
    ARRAY_AGG(id     ORDER BY display_order),
    ARRAY_AGG(price  ORDER BY display_order),
    ARRAY_AGG(name   ORDER BY display_order)
  INTO v_item_ids, v_item_prices, v_item_names
  FROM menu_items
  WHERE restaurant_id = v_rid AND is_available = true;

  IF v_item_ids IS NULL THEN
    RAISE EXCEPTION 'No hay platillos disponibles para el restaurante.';
  END IF;

  -- ── 5. Cargar mesas ───────────────────────────────────────────────
  SELECT ARRAY_AGG(id) INTO v_table_ids
  FROM tables WHERE restaurant_id = v_rid AND is_active = true;

  IF v_table_ids IS NULL THEN
    RAISE EXCEPTION 'No hay mesas activas. Crea mesas desde el dashboard primero.';
  END IF;

  -- ── 6. Generar datos de los últimos 30 días ───────────────────────
  FOR v_day IN
    SELECT d::DATE
    FROM generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    ) d
  LOOP
    v_day_dow := EXTRACT(DOW FROM v_day);  -- 0=Dom, 6=Sáb

    -- Sesiones según día de la semana
    CASE
      WHEN v_day_dow IN (0, 6) THEN v_sessions_n := 16 + (RANDOM() * 9)::INT;  -- fin de semana
      WHEN v_day_dow = 5       THEN v_sessions_n := 13 + (RANDOM() * 7)::INT;  -- viernes
      ELSE                          v_sessions_n := 8  + (RANDOM() * 6)::INT;  -- entre semana
    END CASE;

    FOR i IN 1..v_sessions_n LOOP
      -- Hora de apertura entre 12:00 y 21:00
      v_hour   := 12 + (RANDOM() * 9)::INT;
      v_minute := (RANDOM() * 59)::INT;
      v_opened_at := (v_day::TEXT || ' ' ||
                      LPAD(v_hour::TEXT, 2, '0') || ':' ||
                      LPAD(v_minute::TEXT, 2, '0') || ':00 America/Monterrey')::TIMESTAMPTZ;
      -- Duración de la sesión: 30 a 110 minutos
      v_closed_at := v_opened_at + ((30 + (RANDOM() * 80)::INT) || ' minutes')::INTERVAL;

      -- Mesa aleatoria
      v_table_id := v_table_ids[1 + (RANDOM() * (array_length(v_table_ids, 1) - 1))::INT];

      -- Crear sesión
      INSERT INTO table_sessions
        (restaurant_id, table_id, status, opened_at, closed_at, total)
      VALUES
        (v_rid, v_table_id, 'closed', v_opened_at, v_closed_at, 0)
      RETURNING id INTO v_session_id;

      v_session_total := 0;

      -- 1 a 3 órdenes por sesión
      v_num_orders := 1 + (RANDOM() * 2)::INT;

      FOR j IN 1..v_num_orders LOOP
        v_order_total := 0;

        INSERT INTO orders
          (session_id, restaurant_id, table_id, status, subtotal, total, created_at, updated_at)
        VALUES
          (v_session_id, v_rid, v_table_id, 'delivered', 0, 0,
           v_opened_at + ((j * 5) || ' minutes')::INTERVAL,
           v_opened_at + ((j * 5 + 12) || ' minutes')::INTERVAL)
        RETURNING id INTO v_order_id;

        -- 2 a 5 platillos por orden
        v_num_items := 2 + (RANDOM() * 3)::INT;

        FOR k IN 1..v_num_items LOOP
          v_rand_item := 1 + (RANDOM() * (array_length(v_item_ids, 1) - 1))::INT;
          v_item_id    := v_item_ids[v_rand_item];
          v_item_price := v_item_prices[v_rand_item];
          v_item_name  := v_item_names[v_rand_item];
          v_qty        := 1 + (RANDOM() * 2)::INT;

          INSERT INTO order_items
            (order_id, menu_item_id, name_snapshot, price_snapshot, quantity, subtotal)
          VALUES
            (v_order_id, v_item_id, v_item_name, v_item_price, v_qty,
             ROUND(v_item_price * v_qty, 2));

          v_order_total := v_order_total + ROUND(v_item_price * v_qty, 2);
        END LOOP;

        UPDATE orders
        SET subtotal = ROUND(v_order_total, 2), total = ROUND(v_order_total, 2)
        WHERE id = v_order_id;

        v_session_total := v_session_total + v_order_total;
      END LOOP;

      -- Propina (35 % de probabilidad)
      v_tip := 0;
      IF RANDOM() < 0.35 THEN
        v_tip := ROUND(v_session_total *
          (ARRAY[0.1, 0.15, 0.2])[1 + (RANDOM() * 2)::INT], 2);
      END IF;

      -- Método de pago aleatorio
      v_method := v_methods[1 + (RANDOM() * (array_length(v_methods, 1) - 1))::INT];

      -- Actualizar total de sesión
      UPDATE table_sessions
      SET total = ROUND(v_session_total, 2)
      WHERE id = v_session_id;

      -- Crear pago
      INSERT INTO payments
        (session_id, restaurant_id, amount, tip, method, status, paid_at, created_at)
      VALUES
        (v_session_id, v_rid,
         ROUND(v_session_total, 2), v_tip,
         v_method, 'completed',
         v_closed_at, v_closed_at);

    END LOOP;  -- sesiones
  END LOOP;    -- días

  RAISE NOTICE '✓ Seed completado para restaurant_id = %', v_rid;
  RAISE NOTICE '  30 días de datos generados.';

END $$;
