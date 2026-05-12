# 🔀 Diagramas de Flujo — Menú Digital QR

> Diagramas en formato Mermaid. Se renderizan automáticamente en Claude Code, VS Code (extensión Markdown Preview Mermaid), GitHub y la mayoría de visores de markdown.

---

## 1️⃣ Flujo Principal (Happy Path) — Cliente, Cocina, Caja

```mermaid
sequenceDiagram
    autonumber
    actor C as 👤 Cliente
    participant W as 📱 Web App
    participant DB as 🗄️ Supabase
    actor K as 👨‍🍳 Cocina
    actor M as 🧑‍💼 Mesero
    actor X as 💰 Caja

    C->>W: Escanea QR de Mesa 7
    W->>DB: ¿Existe sesión activa de Mesa 7?
    
    alt No hay sesión activa
        DB->>W: No
        W->>DB: Crear table_session (status=active)
    else Hay sesión activa
        DB->>W: Sí, devuelve sesión
    end
    
    W-->>C: Muestra menú + carrito vacío/actual
    
    C->>W: Navega categorías y agrega platillos
    C->>W: Personaliza (modificadores, instrucciones)
    C->>W: Click "Ordenar"
    
    W->>DB: INSERT order + order_items
    DB-->>K: 📢 Realtime: nueva orden
    K-->>K: Visualiza ticket en KDS
    
    K->>DB: UPDATE status='preparing'
    DB-->>W: 📢 Realtime: estado actualizado
    W-->>C: "Tu orden se está preparando"
    
    K->>DB: UPDATE status='ready'
    DB-->>W: 📢 Realtime: listo
    DB-->>M: 📢 Notifica al mesero
    M->>C: Lleva platillos a Mesa 7
    M->>DB: UPDATE status='delivered'
    
    Note over C,W: Cliente puede seguir<br/>agregando órdenes
    
    C->>W: Click "Solicitar cuenta"
    W->>DB: UPDATE session status='paying'
    
    alt Pago en línea
        C->>W: Selecciona "Pagar en línea"
        W->>C: Muestra Stripe/MercadoPago Checkout
        C->>W: Completa pago
        W->>DB: INSERT payment (status=completed)
    else Pago en caja
        C->>W: Selecciona "Pagar en caja"
        C->>X: Camina a caja
        X->>DB: Cobra y registra payment
    end
    
    DB->>DB: UPDATE session status='closed'
    DB-->>W: 📢 Sesión cerrada
    W-->>C: "Gracias por tu visita"
    
    Note over DB: Mesa 7 lista para<br/>siguiente cliente
```

---

## 2️⃣ Estados de una Orden

```mermaid
stateDiagram-v2
    [*] --> received: Cliente envía orden
    received --> preparing: Cocina acepta
    received --> cancelled: Cliente/staff cancela
    preparing --> ready: Cocina termina
    preparing --> cancelled: Issue en cocina
    ready --> delivered: Mesero entrega
    delivered --> [*]
    cancelled --> [*]
    
    note right of received
        Sonido + notificación
        en pantalla de cocina
    end note
    
    note right of ready
        Notificación al mesero
        + al cliente
    end note
```

---

## 3️⃣ Estados de una Sesión de Mesa

```mermaid
stateDiagram-v2
    [*] --> active: Primer scan del QR
    active --> active: Cliente agrega más órdenes
    active --> paying: Cliente solicita cuenta
    paying --> closed: Pago completado
    paying --> active: Cliente sigue ordenando
    closed --> [*]
    
    note right of active
        Múltiples órdenes
        permitidas
    end note
    
    note right of closed
        Próximo scan del QR
        crea sesión nueva
    end note
```

---

## 4️⃣ Vista del Cliente (Flowchart)

```mermaid
flowchart TD
    Start([📱 Escanea QR]) --> Load[Carga menú del restaurante]
    Load --> Browse{¿Qué quiere hacer?}
    
    Browse -->|Ver categorías| Cat[Selecciona: Desayunos /<br/>Comidas / Cenas /<br/>Postres / Bebidas]
    Cat --> Item[Click en platillo]
    Item --> Detail[Modal de detalle]
    Detail --> Mod{¿Personalizar?}
    Mod -->|Sí| Custom[Modificadores +<br/>Instrucciones +<br/>Cantidad]
    Mod -->|No| Add
    Custom --> Add[➕ Agregar al carrito]
    Add --> Browse
    
    Browse -->|Ver carrito| Cart[🛒 Revisar carrito]
    Cart --> Edit{¿Editar?}
    Edit -->|Sí| Browse
    Edit -->|No| Order[📨 Enviar orden]
    Order --> Status[⏳ Estado: preparando]
    Status --> Done[✅ Estado: listo]
    Done --> More{¿Pedir más?}
    More -->|Sí| Browse
    More -->|No| Pay[💳 Solicitar cuenta]
    
    Pay --> Method{Método de pago}
    Method -->|En línea| Online[Stripe / MercadoPago]
    Method -->|En caja| Cash[Ir a caja]
    Online --> Success
    Cash --> Success([🎉 Gracias])
    
    Browse -->|Llamar mesero| Call[🔔 Notifica al mesero]
    Call --> Browse
    
    style Start fill:#22c55e,color:#fff
    style Success fill:#22c55e,color:#fff
    style Order fill:#3b82f6,color:#fff
    style Pay fill:#f59e0b,color:#fff
```

---

## 5️⃣ Vista de Cocina (KDS)

```mermaid
flowchart LR
    A[📥 Bandeja de entrada<br/>orders.status=received] --> B[👨‍🍳 Aceptar]
    B --> C[🔥 En preparación<br/>orders.status=preparing]
    C --> D[✅ Marcar listo<br/>orders.status=ready]
    D --> E[📢 Notifica mesero]
    
    A -.->|Realtime subscription| A
    
    style A fill:#fef3c7
    style C fill:#fed7aa
    style D fill:#bbf7d0
    style E fill:#a5b4fc
```

---

## 6️⃣ Arquitectura de Datos (Relaciones Clave)

```mermaid
erDiagram
    restaurants ||--o{ tables : tiene
    restaurants ||--o{ categories : tiene
    restaurants ||--o{ menu_items : tiene
    restaurants ||--o{ staff : tiene
    
    categories ||--o{ menu_items : contiene
    menu_items ||--o{ item_modifier_groups : tiene
    modifier_groups ||--o{ modifier_options : tiene
    
    tables ||--o{ table_sessions : "abre"
    table_sessions ||--o{ orders : contiene
    orders ||--o{ order_items : contiene
    table_sessions ||--o{ payments : "se paga con"
    
    menu_items ||--o{ order_items : "se ordena como"
```

---

## 7️⃣ Multi-Tenant Routing

```mermaid
flowchart TD
    URL[/m/tacos-don-pepe/mesa-7]
    URL --> MW{middleware.ts}
    MW --> R[Resuelve restaurant_slug<br/>= tacos-don-pepe]
    MW --> T[Resuelve table_id<br/>= mesa-7]
    
    R --> Q1[(SELECT * FROM restaurants<br/>WHERE slug = ?)]
    T --> Q2[(SELECT * FROM tables<br/>WHERE id = ?)]
    
    Q1 --> V{¿Existe y activo?}
    Q2 --> V
    
    V -->|No| E[404 / Error]
    V -->|Sí| Theme[Aplica branding<br/>colores + logo]
    Theme --> Load[Carga menú filtrado<br/>por restaurant_id]
    Load --> UI[Renderiza app]
```