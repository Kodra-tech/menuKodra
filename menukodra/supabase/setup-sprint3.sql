-- =============================================
-- SETUP Sprint 3 — Caja, Cierre de Mesa, Llamadas al Mesero
-- Ejecuta en Supabase → SQL Editor
-- =============================================

-- =============================================
-- 1. TABLA waiter_calls
-- =============================================
CREATE TABLE IF NOT EXISTS waiter_calls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  table_id uuid REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES table_sessions(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waiter_calls ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede llamar al mesero
CREATE POLICY "waiter_calls_public_insert" ON waiter_calls
  FOR INSERT WITH CHECK (true);

-- Solo staff puede leer llamadas de su restaurante
CREATE POLICY "waiter_calls_staff_read" ON waiter_calls
  FOR SELECT USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- Solo staff puede reconocer/actualizar llamadas
CREATE POLICY "waiter_calls_staff_update" ON waiter_calls
  FOR UPDATE USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 2. RLS EN payments (si no está activo)
-- =============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_staff_insert" ON payments
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

CREATE POLICY "payments_staff_read" ON payments
  FOR SELECT USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 3. POLICY DE table_sessions PARA EL STAFF (cerrar mesa)
-- =============================================
CREATE POLICY "table_sessions_staff_update" ON table_sessions
  FOR UPDATE USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  ) WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE id = auth.uid())
  );

-- =============================================
-- 4. POLICY PÚBLICA: cliente solicita la cuenta (active → paying)
-- =============================================
CREATE POLICY "table_sessions_public_request_bill" ON table_sessions
  FOR UPDATE USING (status = 'active')
  WITH CHECK (status = 'paying');

-- =============================================
-- 5. REALTIME — agregar tablas nuevas a la publicación
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;

-- =============================================
-- VERIFICACIÓN
-- =============================================
-- Confirma que la tabla existe:
-- SELECT * FROM waiter_calls LIMIT 1;
--
-- Confirma políticas:
-- SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('waiter_calls', 'table_sessions', 'payments');
