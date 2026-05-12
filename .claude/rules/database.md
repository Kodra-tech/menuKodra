---
paths:
  - "lib/supabase/**"
  - "app/api/**"
---

- SIEMPRE filtrar por restaurant_id en todas las queries
- NUNCA usar service_role_key en el cliente browser
- Usar supabase/server.ts en Server Components
- Usar supabase/client.ts en Client Components
- Verificar RLS en tablas nuevas