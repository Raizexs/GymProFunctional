# 🏋️ Gym Pro Funcional

> **Proyecto Académico - Ingeniería en Software I**
> Sistema de gestión integral para gimnasio funcional desarrollado con fines educativos.

## 🎓 Información Académica

**Asignatura:** Ingeniería en Software I
**Objetivo:** Desarrollo de un sistema full-stack aplicando principios de ingeniería de software, arquitectura por capas, y buenas prácticas de programación.
**Alcance:** Sistema completo de gestión de gimnasio con autenticación, pagos, notificaciones y estadísticas.

## 📋 Descripción

Aplicación full-stack para administrar un gimnasio funcional que permite:

### 👤 Para Usuarios (Clientes)

- ✅ Registro e inicio de sesión con autenticación JWT
- ✅ Visualización de entrenadores y sus especialidades
- ✅ Catálogo de clases con filtros y capacidad en tiempo real
- ✅ Sistema de reservas con validación inteligente de fechas
- ✅ Procesamiento de pagos con Stripe (clases de pago)
- ✅ Gestión de reservas (cancelar, ver historial)
- ✅ Notificaciones por email y en la aplicación
- ✅ Dashboard personal con estadísticas
- ✅ Sistema de feedback y calificaciones

### 👨‍🏫 Para Entrenadores

- ✅ Ver clases asignadas y estadísticas de rendimiento
- ✅ Marcar asistencia de alumnos
- ✅ Dashboard con métricas personalizadas
- ✅ Historial de ganancias

### 🛡️ Para Administradores

- ✅ Gestión completa de usuarios, clases y entrenadores
- ✅ Dashboard con métricas del gimnasio
- ✅ Reportes de ingresos con gráficos
- ✅ Gestión de pagos y reembolsos
- ✅ Envío de notificaciones masivas

## 🛠️ Tecnologías y Dependencias

### Backend

#### Core

- **Node.js** v18+ - Runtime de JavaScript
- **Express** v4.19+ - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** v8.19+ - ODM para MongoDB

#### Autenticación y Seguridad

- **jsonwebtoken** v9.0+ - Generación y verificación de JWT tokens
- **bcryptjs** v2.4+ - Hash de contraseñas (10 salt rounds)
- **cors** v2.8+ - Configuración de Cross-Origin Resource Sharing
- **dotenv** v16.4+ - Gestión de variables de entorno

#### Pagos

- **stripe** v14.25+ - Integración de pagos (Payment Intents, Webhooks, Refunds)

#### Notificaciones

- **nodemailer** v6.10+ - Envío de emails (Gmail SMTP)
- **node-cron** v4.2+ - Programación de tareas (recordatorios automáticos)

#### Desarrollo

- **nodemon** v3.0+ - Auto-reload en desarrollo

### Frontend

#### Core

- **Vue.js 3** v3.4+ - Framework progresivo de JavaScript
- **Vite** v5.4+ - Build tool y servidor de desarrollo
- **Vue Router** v4+ - Sistema de navegación SPA
- **Pinia** v2+ - State management oficial de Vue

#### HTTP y APIs

- **Axios** v1+ - Cliente HTTP para llamadas a la API

#### UI y Estilos

- **Tailwind CSS** v3+ - Framework CSS utility-first
- **PostCSS** - Transformación de CSS
- **Autoprefixer** - Prefijos CSS automáticos

#### Pagos (Frontend)

- **@stripe/stripe-js** v4+ - Librería oficial de Stripe para frontend

#### Desarrollo

- **@vitejs/plugin-vue** - Plugin de Vite para Vue 3

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- MongoDB Atlas (gratis) o MongoDB local
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd gym-pro-funcional
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu connection string de MongoDB Atlas
```

**Archivo `.env`:**

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional?retryWrites=true&w=majority

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# JWT Secret
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion

# Stripe Configuration (Obtén tus claves en https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# SMTP Configuration (Gmail)
# Para obtener contraseña de aplicación:
# 1. Ve a https://myaccount.google.com/security
# 2. Activa "Verificación en dos pasos"
# 3. En "Contraseñas de aplicaciones", genera una para "Correo"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_16_caracteres
SMTP_FROM=Gimnasio Pro <noreply@gympro.com>

# Optional
USE_TRANSACTIONS=false
```

### 3. Configurar Stripe (Opcional para Pagos)

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Ve a Developers → API Keys
3. Copia las claves de prueba (test mode)
4. Agrégalas al archivo `.env`

### 4. Poblar Base de Datos

```bash
npm run seed
```

Esto creará:

- 1 administrador (admin@gym.com / admin123)
- 1 usuario regular (user@gym.com / user123)
- 4 entrenadores con especialidades
- 6 clases de diferentes categorías
- Reservas y pagos de ejemplo

### 5. Iniciar Backend

```bash
node src/backend/server.js
npm run dev
# O para producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

**Verificación:**

- Backend: http://localhost:3000/api/health (debe retornar `{"ok":true}`)
- SMTP: Verifica que aparezca "✅ Servidor SMTP configurado correctamente" en consola

### 6. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 🔐 Credenciales de Prueba

Después de ejecutar el seed:

| Rol                  | Email         | Password | Permisos                                        |
| -------------------- | ------------- | -------- | ----------------------------------------------- |
| **👤 Usuario** | user@gym.com  | user123  | Reservar clases, ver estadísticas personales   |
| **🛡️ Admin** | admin@gym.com | admin123 | Acceso completo, reportes, gestión de usuarios |

**Nota:** Estas credenciales son solo para desarrollo. En producción, usa credenciales seguras.

## 📁 Estructura del Proyecto

```
gym-pro-funcional/
├── backend/
│   ├── src/backend/
│   │   ├── config/
│   │   │   └── database.js         # Conexión MongoDB
│   │   ├── models/                 # Modelos Mongoose
│   │   │   ├── User.js
│   │   │   ├── Trainer.js
│   │   │   ├── Class.js
│   │   │   ├── Reservation.js
│   │   │   ├── Payment.js
│   │   │   └── Notification.js
│   │   ├── routes/                 # Endpoints API
│   │   │   ├── auth.routes.js
│   │   │   ├── trainers.routes.js
│   │   │   ├── classes.routes.js
│   │   │   ├── reservations.routes.js
│   │   │   ├── payments.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   ├── stats.routes.js
│   │   │   └── me.routes.js
│   │   ├── services/               # Lógica de negocio
│   │   │   ├── reservation.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── notification.service.js
│   │   │   └── stats.service.js
│   │   ├── middlewares/            # Middlewares
│   │   │   └── auth.middleware.js
│   │   ├── config/                 # Configuraciones
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── cron.js
│   │   ├── server.js               # Servidor Express
│   │   └── seed.js                 # Script de seed
│   ├── .env                        # Variables de entorno (NO subir a git)
│   ├── .env.example                # Template de variables
│   ├── package.json
│   └── README.md                   # Documentación del backend
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/             # Componentes Vue
│   │   │   ├── ConfirmModal.vue
│   │   │   ├── ReserveModal.vue
│   │   │   ├── PaymentModal.vue
│   │   │   ├── NotificationBell.vue
│   │   │   ├── Toast.vue
│   │   │   └── GymLogo.vue
│   │   ├── pages/                  # Páginas/Vistas
│   │   │   ├── Auth.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── Clases.vue
│   │   │   ├── Entrenadores.vue
│   │   │   ├── Reservas.vue
│   │   │   └── Stats.vue           # Solo Admin
│   │   ├── router/                 # Configuración de rutas
│   │   │   └── index.js
│   │   ├── services/               # Servicios API
│   │   │   ├── http.js
│   │   │   ├── classes.js
│   │   │   ├── trainers.js
│   │   │   ├── reservations.js
│   │   │   ├── payments.js
│   │   │   ├── notifications.js
│   │   │   ├── stats.js
│   │   │   └── summary.js
│   │   ├── stores/                 # Estado global (Pinia)
│   │   │   ├── auth.js
│   │   │   ├── notifications.js
│   │   │   └── stats.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md                       # Este archivo
```

## 🌐 API Endpoints

### 🌍 Públicos

| Método | Endpoint               | Descripción        |
| ------- | ---------------------- | ------------------- |
| GET     | `/api/health`        | Health check        |
| POST    | `/api/auth/register` | Registrar usuario   |
| POST    | `/api/auth/login`    | Iniciar sesión     |
| GET     | `/api/trainers`      | Listar entrenadores |
| GET     | `/api/classes`       | Listar clases       |

### 🔒 Privados (Requieren JWT)

#### Usuario y Perfil

| Método | Endpoint            | Descripción        |
| ------- | ------------------- | ------------------- |
| GET     | `/api/me/summary` | Resumen del usuario |

#### Reservas

| Método | Endpoint                             | Descripción                      |
| ------- | ------------------------------------ | --------------------------------- |
| GET     | `/api/reservations/me`             | Mis reservas                      |
| POST    | `/api/reservations`                | Crear reserva                     |
| DELETE  | `/api/reservations/:id`            | Cancelar reserva                  |
| POST    | `/api/reservations/:id/feedback`   | Enviar feedback                   |
| PATCH   | `/api/reservations/:id/attendance` | Marcar asistencia (Admin/Trainer) |

#### Pagos

| Método | Endpoint                        | Descripción            |
| ------- | ------------------------------- | ----------------------- |
| POST    | `/api/payments/create-intent` | Crear Payment Intent    |
| POST    | `/api/payments/confirm`       | Confirmar pago          |
| POST    | `/api/payments/:id/refund`    | Reembolsar pago (Admin) |
| GET     | `/api/payments/history`       | Historial de pagos      |
| POST    | `/api/payments/webhook`       | Webhook de Stripe       |

#### Notificaciones

| Método | Endpoint                              | Descripción                   |
| ------- | ------------------------------------- | ------------------------------ |
| GET     | `/api/notifications`                | Listar notificaciones          |
| PUT     | `/api/notifications/:id/read`       | Marcar como leída             |
| PUT     | `/api/notifications/read-all`       | Marcar todas como leídas      |
| DELETE  | `/api/notifications/:id`            | Eliminar notificación         |
| POST    | `/api/notifications/test`           | Enviar notificación de prueba |
| POST    | `/api/notifications/send-reminders` | Enviar recordatorios (manual)  |

#### Estadísticas

| Método | Endpoint                 | Descripción                |
| ------- | ------------------------ | --------------------------- |
| GET     | `/api/stats/dashboard` | Dashboard según rol        |
| GET     | `/api/stats/revenue`   | Reporte de ingresos (Admin) |

### 🔑 Autenticación

Los endpoints privados requieren el header:

```http
Authorization: Bearer {token}
```

El token se obtiene al hacer login o registro y debe incluirse en todas las peticiones protegidas.

## 💾 Modelos de Datos

### User (Cliente)

```javascript
{
  name: String,
  email: String (único),
  passwordHash: String,
  role: 'USER' | 'ADMIN' | 'TRAINER',
  phone: String,
  avatar: String,
  membershipType: 'BASIC' | 'PREMIUM' | 'VIP',
  membershipExpiresAt: Date,
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    language: String
  },
  stats: {
    totalClasses: Number,
    totalSpent: Number,
    favoriteClass: String
  },
  timestamps: true
}
```

### Trainer (Entrenador)

```javascript
{
  name: String,
  email: String (único),
  bio: String,
  rating: Number,
  avatarUrl: String,
  specialties: [String],
  certifications: [{
    name: String,
    institution: String,
    year: Number
  }],
  availability: Map<String, Array>,
  hourlyRate: Number,
  stats: {
    totalClasses: Number,
    totalStudents: Number,
    avgRating: Number,
    totalEarnings: Number
  },
  timestamps: true
}
```

### Class (Clase)

```javascript
{
  title: String,
  description: String,
  days: [String],
  time: String,
  durationMin: Number,
  capacity: Number,
  price: Number,
  category: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'YOGA' | 'PILATES' | 'DANCE' | 'MARTIAL_ARTS' | 'CROSSFIT' | 'OTHER',
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  coachId: ObjectId (ref: Trainer),
  imageUrl: String,
  active: Boolean,
  tags: [String],
  timestamps: true
}
```

### Reservation (Reserva)

```javascript
{
  userId: ObjectId (ref: User),
  classId: ObjectId (ref: Class),
  date: Date,
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  paymentId: ObjectId (ref: Payment),
  attended: Boolean,
  feedback: {
    rating: Number (1-5),
    comment: String,
    submittedAt: Date
  },
  cancellationReason: String,
  cancelledAt: Date,
  timestamps: true
}
```

### Payment (Pago)

```javascript
{
  userId: ObjectId (ref: User),
  reservationId: ObjectId (ref: Reservation),
  amount: Number,
  currency: String,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
  stripePaymentIntentId: String,
  stripeClientSecret: String,
  paymentMethod: String,
  receipt: String,
  refundId: String,
  refundedAt: Date,
  metadata: Mixed,
  timestamps: true
}
```

### Notification (Notificación)

```javascript
{
  userId: ObjectId (ref: User),
  type: 'CLASS_REMINDER_24H' | 'CLASS_REMINDER_2H' | 'PAYMENT_CONFIRMATION' | 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED' | 'PROMOTION' | 'GENERAL',
  title: String,
  message: String,
  read: Boolean,
  sentVia: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
  relatedId: ObjectId,
  relatedModel: String,
  metadata: Mixed,
  timestamps: true
}
```

## 🗄️ MongoDB Atlas Setup

### Opción 1: MongoDB Atlas (Recomendado)

1. Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster M0 (gratis)
3. Crea un usuario de base de datos
4. Agrega tu IP a la whitelist (o permite acceso desde cualquier lugar)
5. Obtén el connection string
6. Actualiza `MONGODB_URI` en `.env`

**Formato del connection string:**

```
mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional?retryWrites=true&w=majority
```

### Opción 2: MongoDB Local con Docker

```bash
# En la carpeta backend
docker-compose -f docker-compose.simple.yml up -d
```

## 🧪 Testing

### Backend

Ejecutar el script de pruebas (Windows PowerShell):

```powershell
cd backend
.\test-backend.ps1
```

Esto probará:

- Health check
- Login
- Endpoints de entrenadores
- Endpoints de clases
- Endpoints autenticados

### Manual

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gym.com","password":"user123"}'
```

## 🔧 Scripts Disponibles

### Backend

```bash
npm run dev      # Inicia con nodemon (desarrollo)
npm start        # Inicia con node (producción)
npm run seed     # Poblar base de datos
```

### Frontend

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

- Verifica que MongoDB esté corriendo
- Verifica el connection string en `.env`
- Si usas Atlas, verifica la whitelist de IPs

### "Port already in use"

- Cambia el puerto en `.env` o mata el proceso:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <pid> /F
  ```

### "MongoServerError: bad auth"

- Password incorrecto en el connection string
- Verifica las credenciales en MongoDB Atlas

### Frontend no se conecta al backend

- Verifica que el backend esté corriendo en el puerto 3000
- Verifica `CORS_ORIGIN` en `.env` del backend

## 📊 Características Principales

### 👤 Funcionalidades de Usuario

#### Autenticación y Perfil

- ✅ Registro con validación de email único
- ✅ Inicio de sesión con JWT (7 días de expiración)
- ✅ Dashboard personalizado con estadísticas
- ✅ Gestión de preferencias de notificaciones

#### Gestión de Reservas

- ✅ Ver catálogo de clases con filtros
- ✅ Sistema de reservas con validación inteligente:
  - Validación de días de la semana
  - Validación de capacidad en tiempo real
  - **Límite de 1 reserva activa por día de clase**
  - **Sistema de bloqueo: días cancelados quedan bloqueados permanentemente**
- ✅ Ver historial completo de reservas (activas, completadas, canceladas)
- ✅ Cancelar reservas (cambian a estado CANCELLED sin eliminarse)
- ✅ Enviar feedback y calificaciones (1-5 estrellas)

#### Pagos

- ✅ Integración completa con Stripe
- ✅ Pago seguro con tarjeta (clases de pago)
- ✅ Clases gratuitas confirmadas automáticamente
- ✅ Historial de pagos y recibos digitales
- ✅ Webhooks para confirmación automática

#### Notificaciones

- ✅ Recordatorios automáticos:
  - 📧 Email 24 horas antes de la clase
  - 📧 Email 2 horas antes de la clase
- ✅ Notificaciones in-app con badge
- ✅ Polling automático cada 30 segundos
- ✅ Gestión de notificaciones (marcar leída, eliminar)

### 👨‍🏫 Funcionalidades de Entrenador

- ✅ Ver clases asignadas
- ✅ Dashboard con estadísticas de rendimiento
- ✅ Marcar asistencia de alumnos
- ✅ Ver listado de estudiantes
- ✅ Historial de ganancias

### 🛡️ Funcionalidades de Administrador

#### Gestión

- ✅ Acceso completo a usuarios, clases y entrenadores
- ✅ Gestión de pagos y reembolsos
- ✅ Envío de notificaciones masivas

#### Reportes y Estadísticas

- ✅ Dashboard con métricas del gimnasio:
  - Total de usuarios (activos, nuevos)
  - Ingresos totales y mensuales
  - Tasa de ocupación promedio
  - Top 3 clases más populares
- ✅ Reporte de ingresos con:
  - Filtros por fecha
  - Agrupación (día/semana/mes)
  - Gráficos de barras interactivos
  - Export a CSV (preparado)

### ⚙️ Sistema

#### Seguridad

- ✅ Autenticación con JWT
- ✅ Hash de contraseñas con bcrypt (10 salt rounds)
- ✅ Middleware de autorización por roles
- ✅ Variables sensibles en `.env`
- ✅ CORS configurado correctamente
- ✅ Validación de datos en frontend y backend

#### Base de Datos

- ✅ MongoDB Atlas (NoSQL)
- ✅ Mongoose ODM con schemas estrictos
- ✅ Relaciones entre colecciones con populate
- ✅ Índices optimizados para queries frecuentes
- ✅ Preparado para transacciones (replica set)

#### Automatización

- ✅ Cron jobs para recordatorios (cada hora: `0 * * * *`)
- ✅ Webhooks de Stripe para confirmación automática
- ✅ Emails transaccionales con templates HTML profesionales

#### Arquitectura

- ✅ Arquitectura por capas (Routes → Services → Models)
- ✅ Código modular y reutilizable
- ✅ Manejo centralizado de errores
- ✅ Logging de operaciones críticas

## 🎯 Casos de Uso Destacados

### 1. Usuario Reserva Clase Gratuita

1. Usuario se registra o inicia sesión
2. Navega al catálogo de clases
3. Selecciona una clase gratuita (precio = 0)
4. Elige fecha validando día de la semana
5. Sistema verifica capacidad y disponibilidad
6. Reserva se crea con estado `CONFIRMED`
7. Usuario recibe email de confirmación
8. Aparece notificación in-app
9. 24h antes: Email recordatorio automático
10. 2h antes: Email recordatorio automático

### 2. Usuario Reserva Clase de Pago

1. Usuario selecciona clase con precio
2. Sistema crea reserva con estado `PENDING_PAYMENT`
3. Abre modal de pago con Stripe
4. Usuario ingresa datos de tarjeta
5. Stripe procesa el pago de forma segura
6. Webhook confirma el pago
7. Reserva cambia a `CONFIRMED`
8. Usuario recibe email con recibo
9. Sistema envía recordatorios automáticos

### 3. Usuario Cancela y Vuelve a Reservar

1. Usuario cancela una reserva del Lunes
2. Sistema cambia estado a `CANCELLED` (no elimina)
3. Ese día Lunes queda bloqueado para ese usuario
4. Usuario intenta reservar el mismo Lunes
5. Sistema muestra error: "Día bloqueado por cancelación"
6. Usuario puede reservar otro día (Miércoles, Viernes, etc.)
7. **Límite: 1 reserva activa por día**

### 4. Admin Genera Reporte de Ingresos

1. Admin accede a `/stats`
2. Selecciona rango de fechas (ej: mes actual)
3. Elige agrupación (por mes)
4. Sistema consulta pagos completados
5. Genera tabla con totales y promedios
6. Muestra gráfico de barras con colores por rango
7. Puede exportar a CSV (preparado)

## 🔒 Seguridad

### Autenticación

- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ JWT con expiración de 7 días
- ✅ Tokens almacenados en localStorage (frontend)
- ✅ Header `Authorization: Bearer {token}` en requests

### Autorización

- ✅ Middleware de verificación de roles
- ✅ Rutas protegidas por rol (USER, TRAINER, ADMIN)
- ✅ Validación de permisos en cada endpoint

### Datos Sensibles

- ✅ Variables de entorno en `.env` (no subido a git)
- ✅ `.env.example` como template
- ✅ Claves de Stripe en modo test
- ✅ SMTP password como contraseña de aplicación

### Comunicación

- ✅ CORS configurado para origen específico
- ✅ HTTPS recomendado en producción
- ✅ Stripe Webhooks con verificación de firma

## 🚀 Deploy

### Backend

1. Configura las variables de entorno en tu servidor
2. Usa MongoDB Atlas para producción
3. Ejecuta `npm install --production`
4. Ejecuta `npm start`

### Frontend

1. Actualiza la URL del backend en el código
2. Ejecuta `npm run build`
3. Deploy la carpeta `dist` a tu hosting (Vercel, Netlify, etc.)

## 🎨 Tecnologías de UI/UX

### Estilos y Animaciones

- ✅ Tailwind CSS utility-first
- ✅ Gradientes personalizados (indigo → purple)
- ✅ Efectos de hover y transformaciones
- ✅ Animaciones de entrada/salida
- ✅ Backdrop blur para modales
- ✅ Responsive design (mobile-first)

### Componentes Interactivos

- ✅ Modales con overlay
- ✅ Toast notifications
- ✅ Dropdown de notificaciones
- ✅ Formularios con validación en tiempo real
- ✅ Loading states
- ✅ Empty states

### Experiencia de Usuario

- ✅ Feedback visual inmediato
- ✅ Mensajes de error descriptivos
- ✅ Confirmaciones antes de acciones destructivas
- ✅ Timestamps relativos ("hace 2 horas")
- ✅ Iconos dinámicos por tipo de contenido
- ✅ Estados de carga y progreso

## 📝 Variables de Entorno

### Backend `.env`

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gym-pro-funcional?retryWrites=true&w=majority

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# JWT Secret (cambiar en producción)
JWT_SECRET=cambiar_en_produccion_por_algo_muy_seguro_y_aleatorio

# Stripe Keys (obtener en https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gmail SMTP (para notificaciones por email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Contraseña de aplicación (16 caracteres)
SMTP_FROM=Gimnasio Pro <noreply@gympro.com>

# Optional
USE_TRANSACTIONS=false
```

### Obtener Contraseña de Aplicación Gmail

1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en dos pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una contraseña para "Correo"
5. Copia los 16 caracteres (sin espacios)
6. Pégala en `SMTP_PASS`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🎓 Aprendizajes del Proyecto

Este proyecto académico permitió aplicar:

### Arquitectura y Diseño

- ✅ Arquitectura por capas (Routes → Services → Models)
- ✅ Separación de responsabilidades
- ✅ Patrón Repository con Mongoose
- ✅ RESTful API design

### Seguridad

- ✅ Autenticación con JWT
- ✅ Hash de contraseñas (bcrypt)
- ✅ Autorización basada en roles
- ✅ Validación de entrada (sanitización)
- ✅ Variables de entorno para secretos

### Integración de Servicios Externos

- ✅ Stripe para procesamiento de pagos
- ✅ Nodemailer + Gmail SMTP para emails
- ✅ MongoDB Atlas (DBaaS)
- ✅ Webhooks para sincronización

### Automatización

- ✅ Cron jobs con node-cron
- ✅ Scripts de seed para datos de prueba
- ✅ Procesamiento asíncrono de notificaciones

### Frontend Moderno

- ✅ Vue 3 Composition API
- ✅ State management con Pinia
- ✅ SPA con Vue Router
- ✅ Comunicación HTTP con Axios
- ✅ Build optimizado con Vite

### Buenas Prácticas

- ✅ Control de versiones con Git
- ✅ Documentación completa
- ✅ Código modular y mantenible
- ✅ Manejo de errores robusto
- ✅ Testing manual estructurado

## � Recursos y Documentación

### Oficiales

- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)
- [Vue 3 Docs](https://vuejs.org/guide/introduction.html)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Nodemailer Docs](https://nodemailer.com/about/)

### Tutoriales Relevantes

- JWT Authentication in Node.js
- Stripe Payment Integration
- MongoDB Schema Design
- Vue 3 Composition API
- Tailwind CSS Utilities

## 👥 Autor

**Lukas Flores**

- GitHub: [@Raizexs](https://github.com/raizexs)
- Email: lukasflores071@gmail.com

## 🙏 Agradecimientos

- **Docente del ramo:** Por las directrices del proyecto
- **MongoDB Atlas:** Hosting gratuito de base de datos
- **Stripe:** Plataforma de pagos en modo test
- **Vue.js Team:** Framework progresivo excelente
- **Comunidad Open Source:** Por las herramientas increíbles

## 📄 Licencia

Este proyecto es de código abierto con fines **educativos** y está disponible bajo la licencia MIT.

## ⚠️ Disclaimer

Este es un **proyecto académico** desarrollado para el ramo de **Ingeniería en Software I** con fines educativos. No está destinado para uso en producción sin las debidas adaptaciones de seguridad, escalabilidad y testing completo.

Para uso en producción, se recomienda:

- Implementar testing automatizado (unit, integration, e2e)
- Configurar CI/CD pipeline
- Añadir logging y monitoring (ej: Winston, Morgan)
- Implementar rate limiting
- Configurar HTTPS/SSL
- Revisar y actualizar dependencias
- Implementar backups automáticos
- Añadir documentación de API con Swagger/OpenAPI

---

**Desarrollado con ❤️ para aprender Ingeniería de Software**
_Proyecto Académico - 2025_
