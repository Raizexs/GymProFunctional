# 📘 Documentación Técnica del Sistema – GymProFunctional

> Fecha de actualización: 2025-11-06
> Versión: 1.0

## Índice

1. Introducción
2. Alcance y Objetivos
3. Arquitectura (C4 Nivel 1 y 2)
4. Modelo de Datos (Esquemas y Relaciones)
5. Flujos Principales
6. Diagramas UML
7. Diferencias: Planificado vs Implementado
8. Seguridad y Consideraciones Técnicas
9. Estrategia de Notificaciones y Background Jobs
10. KPIs y Métricas
11. Próximas Mejoras Recomendadas

---

## 1. Introducción

GymProFunctional es una plataforma full‑stack para la gestión operativa de un gimnasio funcional: reservas de clases, compra y consumo de planes (créditos), pagos, notificaciones transaccionales y paneles de estadísticas para distintos roles (Usuario, Entrenador, Admin).


---



## 2. Alcance y Objetivos

- Gestión de usuarios con roles diferenciados.
- Reservas con validación de capacidad, calendario y reglas de cancelación.
- Sistema de planes con créditos y fechas de expiración.
- Pagos integrados (Stripe / modo test) y lógica de confirmación.
- Penalización por no‑show y devolución de créditos bajo condiciones.
- Notificaciones multicanal (IN_APP / EMAIL) y recordatorios programados.
- KPIs: ocupación, no‑show, ingresos, comportamiento por rol.

---



## 3. Arquitectura (C4)

### 3.1 Diagrama de Contexto (Nivel 1)

```mermaid
C4Context
title GymProFunctional - System Context
Person(user, "Usuario", "Reserva clases y gestiona su perfil")
Person(trainer, "Entrenador", "Gestiona clases y asistencia")
Person(admin, "Administrador", "Configura planes y revisa reportes")
System(system, "GymProFunctional", "Plataforma web para gestión de gimnasio funcional")
System_Ext(stripe, "Stripe", "Procesa pagos con tarjeta")
System_Ext(smtp, "SMTP Email Provider", "Envía correos transaccionales")
SystemDb_Ext(mongodb, "MongoDB Atlas", "Base de datos NoSQL")
Rel(user, system, "Usa vía navegador")
Rel(trainer, system, "Gestiona clases y asistencia")
Rel(admin, system, "Administra catálogo y reportes")
Rel(system, stripe, "Crea payment intents / escucha webhooks", "HTTPS/JSON")
Rel(system, smtp, "Envía correos", "SMTP")
Rel(system, mongodb, "CRUD datos", "MongoDB Driver")
```

### 3.2 Diagrama de Contenedores (Nivel 2)

```mermaid
C4Container
title GymProFunctional - Container Diagram
Person(user, "Usuario")
Person(trainer, "Entrenador")
Person(admin, "Administrador")
System_Boundary(gym, "GymProFunctional") {
  Container(frontend, "SPA Frontend", "Vue 3 + Vite + Pinia", "Interfaz y experiencia de usuario")
  Container(api, "API Backend", "Node.js + Express", "Endpoints REST & lógica de negocio")
  Container(background, "Cron/Workers", "node-cron", "Recordatorios y tareas programadas")
  ContainerDb(db, "MongoDB", "Atlas", "Persistencia de datos: usuarios, clases, reservas, planes, pagos, notificaciones")
}
System_Ext(stripe, "Stripe", "Procesamiento de pagos")
System_Ext(smtp, "SMTP Email Provider", "Correos transaccionales")
Rel(user, frontend, "Interacción")
Rel(trainer, frontend, "Gestión clases/asistencia")
Rel(admin, frontend, "Administración")
Rel(frontend, api, "HTTP/JSON")
Rel(api, db, "CRUD", "MongoDB Driver")
Rel(api, stripe, "Intents/Webhooks", "HTTPS")
Rel(api, smtp, "Envía emails", "SMTP")
Rel(background, db, "Consulta reservas próximas")
Rel(background, api, "Genera notificaciones")
Rel(api, background, "Configura cron")
```

---



## 4. Modelo de Datos Relacional Normalizado

### 4.1 Diagrama Entidad-Relación (Notación Chen Extendida)

```mermaid
erDiagram
    USER ||--o{ RESERVATION : "realiza"
    USER ||--o{ USER_PLAN : "adquiere"
    USER ||--o{ PAYMENT : "efectua"
    USER ||--o{ NOTIFICATION : "recibe"

    TRAINER ||--o{ GYM_CLASS : "dicta"

    GYM_CLASS ||--o{ RESERVATION : "es_reservada"

    PLAN ||--o{ USER_PLAN : "instancia"

    USER_PLAN ||--o| PAYMENT : "genera_pago_plan"
    RESERVATION ||--o| PAYMENT : "requiere_pago_clase"
    RESERVATION }o..o{ USER_PLAN : "valida_creditos"

    USER {
        ObjectId _id PK
        String name "NOT NULL"
        String email UK "NOT NULL, UNIQUE"
        String passwordHash "NOT NULL"
        Enum role "USER|ADMIN|TRAINER"
        String phone
        String avatar
        Enum membershipType "DEPRECATED"
        Date membershipExpiresAt "DEPRECATED"
        Object preferences
        Object stats
        DateTime createdAt
        DateTime updatedAt
    }

    TRAINER {
        ObjectId _id PK
        String name "NOT NULL"
        String email UK "NOT NULL, UNIQUE"
        String bio "NOT NULL"
        Number rating "DEFAULT 5"
        String avatarUrl
        Array specialties
        Array certifications
        Map availability
        Number hourlyRate
        Object stats
        DateTime createdAt
        DateTime updatedAt
    }

    GYM_CLASS {
        ObjectId _id PK
        String title "NOT NULL"
        String description "NOT NULL"
        Array days "NOT NULL"
        String time "NOT NULL"
        Number durationMin "NOT NULL"
        Number capacity "NOT NULL"
        Number price "NOT NULL, >=0"
        Enum category "NOT NULL"
        Enum difficulty "NOT NULL"
        ObjectId coachId FK "NOT NULL"
        String imageUrl
        Boolean active "DEFAULT true"
        Array tags
        DateTime createdAt
        DateTime updatedAt
    }

    RESERVATION {
        ObjectId _id PK
        ObjectId userId FK "NOT NULL"
        ObjectId classId FK "NOT NULL"
        Date date "NOT NULL"
        Enum status "NOT NULL"
        ObjectId paymentId FK
        Boolean attended "DEFAULT false"
        Object feedback
        String cancellationReason
        DateTime cancelledAt
        DateTime createdAt
        DateTime updatedAt
    }

    PLAN {
        ObjectId _id PK
        String name "NOT NULL"
        String description "NOT NULL"
        Enum type "NOT NULL"
        Number price "NOT NULL"
        Number credits "NOT NULL"
        Number validityDays "NOT NULL"
        Array features
        Boolean isActive "DEFAULT true"
        Number discountPercentage
        Boolean isFeatured
        DateTime createdAt
        DateTime updatedAt
    }

    USER_PLAN {
        ObjectId _id PK
        ObjectId userId FK "NOT NULL"
        ObjectId planId FK "NOT NULL"
        Enum status "NOT NULL"
        Number creditsRemaining "NOT NULL"
        Number creditsTotal "NOT NULL"
        Date startDate "NOT NULL"
        Date expiryDate "NOT NULL"
        Number purchasePrice "NOT NULL"
        ObjectId paymentId FK
        Boolean autoRenew
        DateTime cancelledAt
        String cancellationReason
        DateTime createdAt
        DateTime updatedAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId userId FK "NOT NULL"
        ObjectId reservationId FK
        ObjectId userPlanId FK
        Number amount "NOT NULL"
        String currency "DEFAULT usd"
        Enum status "NOT NULL"
        String stripePaymentIntentId UK
        String stripeClientSecret
        Enum method "DEFAULT CARD"
        String paymentMethod
        String description
        String receipt
        String refundId
        DateTime refundedAt
        Object metadata
        DateTime createdAt
        DateTime updatedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK "NOT NULL"
        Enum type "NOT NULL"
        String title "NOT NULL"
        String message "NOT NULL"
        Boolean read "DEFAULT false"
        Array sentVia
        ObjectId relatedId FK
        String relatedModel
        Object metadata
        DateTime createdAt
        DateTime updatedAt
    }
```

### 4.2 Relaciones Clave y Normalización

#### **Relaciones Físicas (Foreign Keys)**

- `USER 1→N RESERVATION`: Un usuario realiza múltiples reservas (`Reservation.userId → User._id`)
- `USER 1→N USER_PLAN`: Un usuario adquiere múltiples planes (`UserPlan.userId → User._id`)
- `USER 1→N PAYMENT`: Un usuario efectúa múltiples pagos (`Payment.userId → User._id`)
- `USER 1→N NOTIFICATION`: Un usuario recibe múltiples notificaciones (`Notification.userId → User._id`)
- `TRAINER 1→N GYM_CLASS`: Un entrenador dicta múltiples clases (`Class.coachId → Trainer._id`)
- `GYM_CLASS 1→N RESERVATION`: Una clase recibe múltiples reservas (`Reservation.classId → Class._id`)
- `PLAN 1→N USER_PLAN`: Un plan se instancia en múltiples compras (`UserPlan.planId → Plan._id`)
- `USER_PLAN 1→0..1 PAYMENT`: Un plan genera opcionalmente un pago (`UserPlan.paymentId → Payment._id`)
- `RESERVATION 1→0..1 PAYMENT`: Una reserva puede requerir un pago (`Reservation.paymentId → Payment._id`)

#### **Relaciones Lógicas (Sin Foreign Key)**

- `RESERVATION N→N USER_PLAN` _(línea punteada)_: Una reserva valida créditos del plan activo del usuario en tiempo de ejecución. **No existe FK `userPlanId` en Reservation**. La lógica de negocio busca el plan activo mediante: `UserPlan.findOne({ userId, status: 'ACTIVE', creditsRemaining: { $gt: 0 } })`

#### **Análisis de Normalización (3NF/BCNF)**

**Primera Forma Normal (1NF)** ✅

- Todos los atributos contienen valores atómicos
- Arrays modelados como tipos nativos BSON (MongoDB)

**Segunda Forma Normal (2NF)** ✅

- Cumple 1NF
- Todos los atributos no clave dependen completamente de la clave primaria

**Tercera Forma Normal (3NF)** ✅

- Cumple 2NF
- No hay dependencias transitivas
- Ejemplo: `Class.coachId` referencia `Trainer._id`, evitando redundancia

**Forma Normal de Boyce-Codd (BCNF)** ⚠️ Parcial

- `User.membershipType` y `User.membershipExpiresAt` son **redundantes** con `UserPlan` (campos deprecados)

### 4.3 Reglas de Integridad Referencial

| Tabla        | Campo FK      | Referencia       | On Delete | On Update |
| ------------ | ------------- | ---------------- | --------- | --------- |
| GYM_CLASS    | coachId       | TRAINER.\_id     | RESTRICT  | CASCADE   |
| RESERVATION  | userId        | USER.\_id        | CASCADE   | CASCADE   |
| RESERVATION  | classId       | GYM_CLASS.\_id   | RESTRICT  | CASCADE   |
| RESERVATION  | paymentId     | PAYMENT.\_id     | SET NULL  | CASCADE   |
| USER_PLAN    | userId        | USER.\_id        | CASCADE   | CASCADE   |
| USER_PLAN    | planId        | PLAN.\_id        | RESTRICT  | CASCADE   |
| USER_PLAN    | paymentId     | PAYMENT.\_id     | SET NULL  | CASCADE   |
| PAYMENT      | userId        | USER.\_id        | CASCADE   | CASCADE   |
| PAYMENT      | reservationId | RESERVATION.\_id | SET NULL  | CASCADE   |
| PAYMENT      | userPlanId    | USER_PLAN.\_id   | SET NULL  | CASCADE   |
| NOTIFICATION | userId        | USER.\_id        | CASCADE   | CASCADE   |

### 4.4 Índices Optimizados

```javascript
// USER
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// TRAINER
db.trainers.createIndex({ email: 1 }, { unique: true });

// CLASS
db.classes.createIndex({ coachId: 1 });
db.classes.createIndex({ active: 1, category: 1, difficulty: 1 });

// RESERVATION
db.reservations.createIndex({ userId: 1, classId: 1, date: 1 });
db.reservations.createIndex({ classId: 1, date: 1, status: 1 });
db.reservations.createIndex({ userId: 1, status: 1 });

// USER_PLAN
db.userPlans.createIndex({ userId: 1, status: 1 });
db.userPlans.createIndex({ expiryDate: 1, status: 1 });

// PAYMENT
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex(
  { stripePaymentIntentId: 1 },
  { unique: true, sparse: true }
);
db.payments.createIndex({ status: 1 });

// NOTIFICATION
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ type: 1, createdAt: -1 });
```

### 4.5 Diagrama de Clases UML (Versión Corregida con Cardinalidades Reales)

```mermaid
classDiagram
  direction LR

  class User {
    +ObjectId _id
    +String name
    +String email UK
    +String passwordHash
    +Enum role
    +String phone
    +String avatar
    +Object preferences
    +Object stats
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Trainer {
    +ObjectId _id
    +String name
    +String email UK
    +String bio
    +Number rating
    +String avatarUrl
    +Array~String~ specialties
    +Array~Object~ certifications
    +Map availability
    +Number hourlyRate
    +Object stats
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Class {
    +ObjectId _id
    +String title
    +String description
    +Array~String~ days
    +String time
    +Number durationMin
    +Number capacity
    +Number price
    +Enum category
    +Enum difficulty
    +ObjectId coachId FK
    +String imageUrl
    +Boolean active
    +Array~String~ tags
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Reservation {
    +ObjectId _id
    +ObjectId userId FK
    +ObjectId classId FK
    +Date date
    +Enum status
    +ObjectId paymentId FK
    +Boolean attended
    +Object feedback
    +String cancellationReason
    +DateTime cancelledAt
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Plan {
    +ObjectId _id
    +String name
    +String description
    +Enum type
    +Number price
    +Number credits
    +Number validityDays
    +Array~String~ features
    +Boolean isActive
    +Number discountPercentage
    +Boolean isFeatured
    +DateTime createdAt
    +DateTime updatedAt
  }

  class UserPlan {
    +ObjectId _id
    +ObjectId userId FK
    +ObjectId planId FK
    +Enum status
    +Number creditsRemaining
    +Number creditsTotal
    +Date startDate
    +Date expiryDate
    +Number purchasePrice
    +ObjectId paymentId FK
    +Boolean autoRenew
    +DateTime cancelledAt
    +String cancellationReason
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Payment {
    +ObjectId _id
    +ObjectId userId FK
    +ObjectId reservationId FK
    +ObjectId userPlanId FK
    +Number amount
    +String currency
    +Enum status
    +String stripePaymentIntentId UK
    +String stripeClientSecret
    +Enum method
    +String paymentMethod
    +String description
    +String receipt
    +String refundId
    +DateTime refundedAt
    +Object metadata
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Notification {
    +ObjectId _id
    +ObjectId userId FK
    +Enum type
    +String title
    +String message
    +Boolean read
    +Array~String~ sentVia
    +ObjectId relatedId FK
    +String relatedModel
    +Object metadata
    +DateTime createdAt
    +DateTime updatedAt
  }

  %% Relaciones Corregidas con Cardinalidades Precisas
  User "1" --> "0..*" Reservation : realiza
  User "1" --> "0..*" UserPlan : adquiere
  User "1" --> "0..*" Payment : efectua
  User "1" --> "0..*" Notification : recibe

  Trainer "1" --> "0..*" Class : dicta

  Class "1" --> "0..*" Reservation : es_reservada

  Plan "1" --> "0..*" UserPlan : instancia

  %% CORRECCIÓN CRÍTICA: UserPlan genera 0 o 1 Payment (no múltiples)
  UserPlan "1" --> "0..1" Payment : genera_pago_plan

  %% CORRECCIÓN CRÍTICA: Reservation genera 0 o 1 Payment (clases gratuitas no generan pago)
  Reservation "1" --> "0..1" Payment : requiere_pago_clase

  %% RELACIÓN LÓGICA (línea punteada): Reservation valida créditos en tiempo de ejecución (sin FK)
  Reservation "0..*" ..> "1" UserPlan : valida_creditos
```

**Correcciones Aplicadas:**

1. ✅ **UserPlan → Payment**: Cambiado de `1:*` a `1:0..1` (un plan genera máximo 1 pago)
2. ✅ **Reservation → Payment**: Cambiado a `1:0..1` (clases gratuitas no requieren pago)
3. ✅ **Reservation ..> UserPlan**: Relación lógica con línea punteada `..>` (sin FK físico, validación en runtime)
4. ✅ **Dirección LR**: Layout horizontal profesional

---



## 5. Flujos Principales

### 5.1 Autenticación

1. `POST /api/auth/register` valida unicidad email, hashea contraseña, crea usuario, devuelve JWT (30m exp, código actual: valor corto vs documentación inicial que hablaba de 7 días).
2. `POST /api/auth/login` busca email, compara hash, emite JWT.
3. Middleware `requireAuth` añade `req.user` (id, role) para rutas protegidas.

### 5.2 Reserva de Clase (Gratis)

1. Usuario selecciona clase y fecha válida (día dentro de `days`).
2. Verifica existencia de plan activo con créditos.
3. Crea `Reservation` con estado `CONFIRMED` si `price=0` y descuenta crédito del `UserPlan`.
4. Genera notificación `RESERVATION_CONFIRMED` (EMAIL + IN_APP).

### 5.3 Reserva de Clase (De Pago)

1. Crea `Reservation` en `PENDING_PAYMENT`.
2. Genera notificación de pendiente.
3. `POST /api/payments/create-intent` → crea Payment intent (Stripe) y `Payment` interno.
4. Al confirmar pago (webhook o confirm manual):
   - `Payment.status=COMPLETED`
   - `Reservation.status=CONFIRMED`
   - Descuenta crédito de `UserPlan`.
   - Notificaciones: `PAYMENT_CONFIRMATION` + `RESERVATION_CONFIRMED`.

### 5.4 Cancelación de Reserva

- Permite cancelar si faltan ≥ 2h (devuelve crédito si estaba `CONFIRMED`).
- Actualiza `Reservation.status=CANCELLED`.
- Notificación `RESERVATION_CANCELLED` (mensajes distintos si crédito devuelto).

### 5.5 Penalización por No‑Show

- Admin/Trainer marca asistencia (`PATCH /api/reservations/:id/attendance`).
- Si se marca no asistido y acumula ≥3 no‑shows últimos 30 días: se descuenta crédito adicional y se genera notificación de penalización.

### 5.6 Compra de Plan

- Usuario inicia `POST /api/plans/:id/purchase` → crea `UserPlan` (PENDING_PAYMENT) + `Payment`.
- Confirma pago → `UserPlan.status=ACTIVE`, notificación `PLAN_PURCHASED`.

### 5.7 Recordatorios Programados

- `node-cron` dispara cada hora: busca reservas en ventana 24h y 2h → crea notificaciones `CLASS_REMINDER_24H` / `CLASS_REMINDER_2H`.

### 5.8 Estadísticas / KPIs

- `GET /api/stats/dashboard` calcula distintas métricas según rol con agregaciones Mongo.
- KPIs ocupación y no‑show (`/api/stats/occupancy-noshow`) agrupan por clase, día y usuario para ranking.

---



## 6. Diagramas UML

### 6.1 Caso de Uso (Resumen Funcional)

```mermaid
flowchart TB
  subgraph Usuarios
    U[Usuario]
    T[Entrenador]
    A[Admin]
  end
  UC1((Registrarse))
  UC2((Iniciar Sesión))
  UC3((Reservar Clase))
  UC4((Pagar Clase))
  UC5((Cancelar Reserva))
  UC6((Dar Feedback))
  UC7((Comprar Plan))
  UC8((Ver Notificaciones))
  UC9((Ver Dashboard))
  UC10((Marcar Asistencia))
  UC11((Generar Reportes))
  U --> UC1
  U --> UC2
  U --> UC3
  U --> UC4
  U --> UC5
  U --> UC6
  U --> UC7
  U --> UC8
  U --> UC9
  T --> UC10
  A --> UC11
  A --> UC9
```

### 6.2 Secuencia: Reserva de Clase de Pago

```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant API
  participant ReservationService
  participant PaymentService
  participant Stripe
  participant NotificationService
  User->>Frontend: Selecciona clase (precio>0)
  Frontend->>API: POST /api/reservations
  API->>ReservationService: createReservation(userId,classId,fecha)
  ReservationService->>UserPlan: Validar plan activo y créditos
  ReservationService->>Class: Validar día/capacidad
  ReservationService->>Reservation: Crear (PENDING_PAYMENT)
  ReservationService->>NotificationService: Notificación pendiente
  API-->>Frontend: Reserva PENDING_PAYMENT
  Frontend->>API: POST /api/payments/create-intent
  API->>PaymentService: createPaymentIntent
  PaymentService->>Stripe: Crear PaymentIntent
  Stripe-->>PaymentService: clientSecret
  PaymentService->>Payment: Persistir PENDING
  API-->>Frontend: clientSecret
  User->>Stripe: Ingresa datos tarjeta
  Stripe-->>API: (Webhook payment_intent.succeeded)
  API->>PaymentService: confirmPayment(paymentIntentId)
  PaymentService->>Payment: status=COMPLETED
  PaymentService->>Reservation: status=CONFIRMED
  PaymentService->>UserPlan: Decrementar crédito
  PaymentService->>NotificationService: Notificaciones pago+confirmación
  NotificationService-->>User: Email / In-App
```

### 6.3 Secuencia: Cancelación con Devolución + Penalización No‑Show

```mermaid
sequenceDiagram
  participant User
  participant API
  participant ReservationService
  participant UserPlan
  participant NotificationService
  User->>API: DELETE /api/reservations/:id
  API->>ReservationService: cancelReservationHard
  ReservationService->>Reservation: Validar tiempo restante
  alt >=2 horas y status CONFIRMED
    ReservationService->>UserPlan: Incrementar créditos
  else <2 horas
    ReservationService-->>User: Error (No permitido)
  end
  ReservationService->>Reservation: status=CANCELLED
  ReservationService->>NotificationService: Notificación cancelación
  NotificationService-->>User: Email/In-App
  Admin->>API: PATCH /api/reservations/:id/attendance attended=false
  API->>ReservationService: Marcar no-show
  ReservationService->>Reservation: status=COMPLETED
  ReservationService->>Reservation: Contar no-shows previos
  alt >=3 no-shows últimos 30 días
    ReservationService->>UserPlan: Descuento crédito penalización
    ReservationService->>NotificationService: Notificación penalización
  end
  NotificationService-->>User: Email penalización
```

---



## 7. Diferencias: Planificado vs Implementado

| Aspecto                        | Planificado (según README/visión inicial) | Implementado Actual                                   | Observaciones                                         |
| ------------------------------ | ------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| Expiración JWT                | 7 días                                     | 30 minutos (`JWT_EXPIRES_IN`)                       | Reducido; considerar refresh tokens.                  |
| Webhooks Stripe                | Confirmación automática completa          | Parsing básico sin verificación firma               | Falta `stripe.webhooks.constructEvent` y seguridad. |
| Membresías `membershipType` | Se menciona en `User`                     | No integrada con Planes (`UserPlan`)                | Atributo legacy, potencial refactor.                  |
| Feedback general               | Clases calificables                         | Implementado `reservation.feedback`                 | OK, pendiente endpoints listados globales.            |
| Reembolsos                     | Gestión admin + lógica                    | Método `refundPayment` básico                     | Falta política de créditos y verificación.         |
| Roles Entrenador               | CRUD completo                               | Trainer existe, creación vía seed                   | Falta endpoints creación/edición trainer.           |
| Notificaciones Push            | Multi-canal (incluye PUSH)                  | Campo `sentVia`, pero sin implementación real push | Requiere integración service worker / FCM.           |
| Seguridad SMTP                 | Emails transaccionales                      | SMTP condicional, sin backend queue                   | Podría añadirse reintentos y logs persistentes.     |
| Testing Automatizado           | Suite de tests                              | Solo guía manual (`TESTING_GUIDE.md`)              | Pendiente Jest/Supertest + coverage.                  |
| Auditoría / Logs              | Mencionado como mejora                      | Logs consola simples                                  | Recomendado: Winston + niveles + persistencia.        |
| CI/CD                          | Escalable                                   | No presente                                           | Añadir GitHub Actions (lint, test, build).           |

---



## 8. Seguridad y Consideraciones Técnicas

- Autenticación: JWT corto + recomendación refresh.
- Hash contraseñas: `bcryptjs` salt=10.
- Validación de fecha y capacidad en reservas con índices (`reservationSchema.index`).
- Falta rate limiting (login, reservas) → sugerido `express-rate-limit`.
- Webhook Stripe sin verificación firma: riesgo de spoofing.
- Falta sanitización de entrada avanzada (posible uso `express-validator`).
- SMTP sin cola asíncrona: riesgo de bloqueo si servidor lento.

---



## 9. Estrategia de Notificaciones y Background Jobs

`node-cron` ejecuta tareas por hora:

- Recordatorios 24h y 2h antes → crea notificaciones + email.
- Penalizaciones en asistencia tratadas ad-hoc en endpoint de patch.
  Sugerencias: mover lógica de penalización y expiración de planes a job diario.

---



## 10. KPIs y Métricas

`stats.service.js` implementa agregaciones:

- Admin: ingresos, reservas por estado, usuarios nuevos, ocupación promedio, clases populares.
- Trainer: reservas en sus clases, estudiantes únicos, ingresos asociados, distribución por día.
- User: reservas propias, gasto, clase favorita, tasa de asistencia.
- KPIs especializados: ocupación vs no‑show, ranking de usuarios con más ausencias.

---



## 11. Próximas Mejoras Recomendadas

- Implementar verificación de firma Stripe y manejo de eventos adicionales (failed, canceled).
- Agregar tests automatizados: Jest + Supertest.
- Implementar refresh tokens y lista de revocación.
- Migrar a colas (BullMQ/Redis) para emails y recordatorios.
- Endpoint de administración para métricas en tiempo real.
- Integración PUSH (Service Worker + FCM).
- Normalización de feedback en entidad separada para análisis avanzado.
- Hardening de seguridad (helmet, rate limiting, cors restrictivo por entorno).

---
