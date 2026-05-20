-- Sprint 5: Habilitar Realtime en la tabla orders
-- Ejecutar en Supabase SQL Editor

-- Permite que el cliente reciba cambios en tiempo real del estado de los pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
