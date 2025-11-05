# 🔧 Documentación del Backend

Guía completa para entender, configurar y ejecutar el backend del sistema.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación-paso-a-paso)
- [Configuración](#-configuración)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Modelos de Datos](#-modelos-de-datos)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación-y-autorización)
- [Servicios](#-servicios)
- [Cron Jobs](#-cron-jobs--tareas-programadas)
- [Testing](#-testing)

---

## 🏗 Arquitectura

El backend sigue una **arquitectura por capas**:

```
┌─────────────────────────────────────┐
│         Cliente (Frontend)          │
└──────────────┬──────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────┐
│      Routes (Endpoints REST)        │  ← Definición de rutas
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Middlewares (Auth, CORS)       │  ← Validación y seguridad
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Services (Lógica de Negocio)   │  ← Reglas de negocio
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Models (Mongoose/MongoDB)      │  ← Persistencia de datos
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         MongoDB Atlas/Local         │  ← Base de datos
└─────────────────────────────────────┘
```

---

## 💻 Tecnologías

| Tecnología | Versión  | Propósito                     |
| ---------- | -------- | ----------------------------- |
| Node.js    | 18+      | Runtime JavaScript            |
| Express    | ^4.19.2  | Framework web                 |
| MongoDB    | ^6.20.0  | Base de datos NoSQL           |
| Mongoose   | ^8.19.2  | ODM para MongoDB              |
| JWT        | ^9.0.2   | Autenticación                 |
| bcryptjs   | ^2.4.3   | Hash de contraseñas           |
| Stripe     | ^14.25.0 | Procesamiento de pagos        |
| Nodemailer | ^6.10.1  | Envío de emails               |
| node-cron  | ^4.2.1   | Tareas programadas            |
| dotenv     | ^16.4.5  | Variables de entorno          |
| cors       | ^2.8.5   | Cross-Origin Resource Sharing |

---

## 🛠 Instalación Paso a Paso

### 1. Requisitos Previos

Verifica que tengas instalado:

```bash
# Node.js (versión 18 o superior)
node --version
# Debe mostrar: v18.x.x o superior

# npm (viene con Node.js)
npm --version
# Debe mostrar: 9.x.x o superior
```

Si no los tienes, descarga Node.js desde [nodejs.org](https://nodejs.org/)

### 2. Navegar al Backend

```bash
cd backend
```

### 3. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`.

**Tiempo estimado:** 2-3 minutos (dependiendo de tu conexión)

### 4. Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
# En Windows PowerShell
copy .env.example .env

# En macOS/Linux
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales (ver sección siguiente).

### 5. Poblar la Base de Datos

```bash
npm run seed
```

Esto creará:

- ✅ 3 usuarios de prueba (admin, entrenador, usuario)
- ✅ 2 entrenadores
- ✅ 10+ clases con diferentes categorías
- ✅ 5 planes de membresía

### 6. Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm start
```

**Salida esperada:**

```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en http://localhost:3000
⏰ Cron jobs iniciados
```

---

## ⚙️ Configuración

### Archivo `.env`

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# ============================================
# 🗄️ MONGODB CONNECTION
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gym-pro-funcional?retryWrites=true&w=majority

# ============================================
# 🌐 SERVER CONFIGURATION
# ============================================
PORT=3000
CORS_ORIGIN=http://localhost:5173

# ============================================
# 🔐 JWT CONFIGURATION
# ============================================
# Generar con: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=tu_jwt_secret_super_seguro_de_al_menos_32_caracteres

# ============================================
# ⚙️ MONGODB TRANSACTIONS
# ============================================
# false = sin transacciones (MongoDB local sin replica set)
# true = con transacciones (requiere replica set o MongoDB Atlas)
USE_TRANSACTIONS=false

# ============================================
# 💳 STRIPE CONFIGURATION
# ============================================
# Obtén tus claves de: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# 📧 EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=Gimnasio Pro <noreply@gimnasiopro.com>
```

### Obtener Credenciales

#### 1. MongoDB Atlas (Base de Datos)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. Ve a **Database Access** → Crea un usuario
4. Ve a **Network Access** → Agrega tu IP (o 0.0.0.0/0 para desarrollo)
5. Ve a **Connect** → **Connect your application** → Copia la URI
6. Reemplaza `<password>` con tu contraseña

#### 2. Stripe (Pagos)

1. Crea una cuenta en [Stripe](https://stripe.com/)
2. Ve a [Dashboard > API Keys](https://dashboard.stripe.com/test/apikeys)
3. Copia tu **Secret key** y **Publishable key** (modo test)
4. Para webhooks:
   - Ve a **Developers > Webhooks**
   - Agrega endpoint: `http://localhost:3000/api/payments/webhook`
   - Selecciona eventos: `payment_intent.succeeded`
   - Copia el **Signing secret**

#### 3. Gmail SMTP (Emails)

1. Activa la **verificación en dos pasos** en tu cuenta de Google
2. Ve a [Contraseñas de aplicaciones](https://myaccount.google.com/apppasswords)
3. Genera una contraseña para "Correo"
4. Usa esa contraseña de 16 caracteres en `SMTP_PASS`

#### 4. JWT Secret

Genera una clave segura con:

```bash
# Con Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Con PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   └── backend/
│       ├── config/              # Configuraciones
│       │   ├── database.js      # Conexión a MongoDB
│       │   ├── env.js           # Variables de entorno
│       │   └── cron.js          # Tareas programadas
│       │
│       ├── middlewares/         # Middlewares
│       │   └── auth.middleware.js  # Autenticación JWT
│       │
│       ├── models/              # Modelos de Mongoose
│       │   ├── User.js          # Usuarios
│       │   ├── Trainer.js       # Entrenadores
│       │   ├── Class.js         # Clases
│       │   ├── Plan.js          # Planes de membresía
│       │   ├── UserPlan.js      # Planes de usuarios
│       │   ├── Reservation.js   # Reservas
│       │   ├── Payment.js       # Pagos
│       │   └── Notification.js  # Notificaciones
│       │
│       ├── routes/              # Rutas de la API
│       │   ├── auth.routes.js   # Autenticación
│       │   ├── classes.routes.js  # Clases
│       │   ├── reservations.routes.js  # Reservas
│       │   ├── payments.routes.js  # Pagos
│       │   ├── plans.routes.js  # Planes
│       │   ├── trainers.routes.js  # Entrenadores
│       │   ├── trainer-classes.routes.js  # Clases de entrenadores
│       │   ├── notifications.routes.js  # Notificaciones
│       │   ├── stats.routes.js  # Estadísticas
│       │   └── me.routes.js     # Perfil del usuario
│       │
│       ├── services/            # Lógica de negocio
│       │   ├── payment.service.js  # Servicio de pagos
│       │   ├── notification.service.js  # Servicio de notificaciones
│       │   ├── reservation.service.js  # Servicio de reservas
│       │   └── stats.service.js  # Servicio de estadísticas
│       │
│       ├── server.js            # Punto de entrada
│       └── seed.js              # Script de población de datos
│
├── .env                         # Variables de entorno (no subir a Git)
├── .env.example                 # Ejemplo de variables
├── package.json                 # Dependencias
└── docker-compose.yml           # Docker (opcional)
```

---

## 📊 Modelos de Datos

### User (Usuario)

```javascript
{
  name: String,          // Nombre completo
  email: String,         // Email único
  password: String,      // Contraseña hasheada
  role: String,          // "user", "trainer", "admin"
  createdAt: Date,       // Fecha de registro
  updatedAt: Date        // Última modificación
}
```

### Trainer (Entrenador)

```javascript
{
  name: String,          // Nombre del entrenador
  email: String,         // Email único
  specialty: String,     // Especialidad (ej: "CrossFit")
  bio: String,           // Biografía
  experience: Number,    // Años de experiencia
  image: String,         // URL de la imagen
  createdAt: Date,
  updatedAt: Date
}
```

### Class (Clase)

```javascript
{
  name: String,          // Nombre de la clase
  description: String,   // Descripción detallada
  category: String,      // "strength", "cardio", "flexibility", etc.
  difficulty: String,    // "beginner", "intermediate", "advanced"
  duration: Number,      // Duración en minutos
  capacity: Number,      // Capacidad máxima
  price: Number,         // Precio (0 = gratis)
  trainer: ObjectId,     // Referencia a Trainer
  schedule: [{           // Horarios disponibles
    dayOfWeek: String,   // "Monday", "Tuesday", etc.
    startTime: String    // "09:00"
  }],
  image: String,         // URL de la imagen
  isActive: Boolean,     // Clase activa/inactiva
  createdAt: Date,
  updatedAt: Date
}
```

### Reservation (Reserva)

```javascript
{
  user: ObjectId,        // Referencia a User
  class: ObjectId,       // Referencia a Class
  date: Date,            // Fecha de la clase
  status: String,        // "PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"
  payment: ObjectId,     // Referencia a Payment (si aplica)
  cancelledAt: Date,     // Fecha de cancelación (si aplica)
  feedback: {            // Feedback del usuario
    rating: Number,      // 1-5 estrellas
    comment: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Payment (Pago)

```javascript
{
  user: ObjectId,        // Referencia a User
  reservation: ObjectId, // Referencia a Reservation
  amount: Number,        // Monto en centavos
  currency: String,      // "usd", "clp", etc.
  status: String,        // "pending", "completed", "failed", "refunded"
  stripePaymentIntentId: String,  // ID de Stripe
  stripeClientSecret: String,     // Secret de Stripe
  metadata: Object,      // Datos adicionales
  createdAt: Date,
  updatedAt: Date
}
```

### Notification (Notificación)

```javascript
{
  user: ObjectId,        // Referencia a User
  type: String,          // "info", "warning", "success", "error"
  title: String,         // Título
  message: String,       // Mensaje
  isRead: Boolean,       // Leída/No leída
  relatedReservation: ObjectId,  // Referencia a Reservation
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 API Endpoints

### 🔓 Autenticación (Public)

#### POST `/api/auth/register`

Registrar nuevo usuario.

**Body:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "648a9b7c...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

#### POST `/api/auth/login`

Iniciar sesión.

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:** (igual que register)

---

### 📚 Clases (Public)

#### GET `/api/classes`

Listar todas las clases activas.

**Query Params:**

- `category` (opcional): Filtrar por categoría
- `difficulty` (opcional): Filtrar por dificultad

**Response:**

```json
[
  {
    "_id": "648a...",
    "name": "CrossFit Fundamentals",
    "category": "strength",
    "difficulty": "beginner",
    "duration": 60,
    "capacity": 15,
    "price": 0,
    "trainer": {
      "_id": "648b...",
      "name": "Carlos Ramírez",
      "specialty": "CrossFit"
    },
    "schedule": [
      { "dayOfWeek": "Monday", "startTime": "09:00" },
      { "dayOfWeek": "Wednesday", "startTime": "09:00" }
    ]
  }
]
```

#### GET `/api/classes/:id`

Obtener detalles de una clase.

---

### 🎫 Reservas (Protected)

> ⚠️ **Requiere autenticación:** Header `Authorization: Bearer {token}`

#### POST `/api/reservations`

Crear una nueva reserva.

**Body:**

```json
{
  "classId": "648a9b7c...",
  "date": "2025-11-10T09:00:00.000Z"
}
```

**Response:**

```json
{
  "reservation": {
    "_id": "648c...",
    "user": "648a...",
    "class": "648b...",
    "date": "2025-11-10T09:00:00.000Z",
    "status": "PENDING_PAYMENT" // o "CONFIRMED" si es gratis
  },
  "payment": {
    // Solo si la clase tiene precio
    "id": "648d...",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 5000
  }
}
```

#### GET `/api/reservations/me`

Obtener mis reservas.

**Response:**

```json
[
  {
    "_id": "648c...",
    "class": {
      "name": "CrossFit Fundamentals",
      "trainer": { "name": "Carlos Ramírez" }
    },
    "date": "2025-11-10T09:00:00.000Z",
    "status": "CONFIRMED"
  }
]
```

#### PATCH `/api/reservations/:id/cancel`

Cancelar una reserva.

**Response:**

```json
{
  "message": "Reserva cancelada exitosamente",
  "reservation": {
    "status": "CANCELLED",
    "cancelledAt": "2025-11-05T10:30:00.000Z"
  }
}
```

---

### 💳 Pagos (Protected)

#### POST `/api/payments/create-intent`

Crear intento de pago con Stripe.

**Body:**

```json
{
  "reservationId": "648c..."
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 5000,
  "currency": "usd"
}
```

#### POST `/api/payments/webhook`

Webhook de Stripe (no llamar directamente).

---

### 📊 Estadísticas (Protected)

#### GET `/api/stats/dashboard`

Obtener estadísticas según el rol del usuario.

**Response para Usuario:**

```json
{
  "totalReservations": 15,
  "completedClasses": 12,
  "upcomingClasses": 3,
  "favoriteCategory": "strength"
}
```

**Response para Entrenador:**

```json
{
  "totalStudents": 45,
  "totalClasses": 20,
  "averageRating": 4.7,
  "upcomingClasses": 5,
  "monthlyEarnings": 50000
}
```

**Response para Admin:**

```json
{
  "totalUsers": 150,
  "totalReservations": 500,
  "totalRevenue": 250000,
  "activeClasses": 25,
  "monthlyGrowth": {
    "users": 15,
    "revenue": 30000
  }
}
```

---

## 🔐 Autenticación y Autorización

### JWT (JSON Web Token)

El sistema usa JWT para autenticación stateless.

#### Flujo de Autenticación

1. Usuario hace login con email/password
2. Backend valida credenciales
3. Si son válidas, genera un JWT con:
   ```javascript
   {
     userId: "648a...",
     role: "user",
     iat: 1635724800,  // Fecha de emisión
     exp: 1636329600   // Expiración (7 días)
   }
   ```
4. Frontend guarda el token (localStorage/sessionStorage)
5. En cada request, envía el token en el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Middleware de Autenticación

```javascript
// backend/src/backend/middlewares/auth.middleware.js
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};
```

### Middleware de Autorización

```javascript
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción",
      });
    }
    next();
  };
};
```

**Uso:**

```javascript
router.get(
  "/admin-only",
  authenticateToken,
  authorizeRoles("admin"),
  getAdminData
);
```

---

## 🛠 Servicios

### Payment Service

Maneja la integración con Stripe.

**Funciones principales:**

- `createPaymentIntent(amount, metadata)` - Crear intento de pago
- `confirmPayment(paymentIntentId)` - Confirmar pago
- `refundPayment(paymentIntentId)` - Reembolsar pago

### Notification Service

Maneja el envío de notificaciones.

**Funciones principales:**

- `sendEmail(to, subject, html)` - Enviar email
- `createNotification(userId, data)` - Crear notificación in-app
- `sendReservationConfirmation(reservation)` - Confirmar reserva
- `sendReminder(reservation, hoursBeforeClass)` - Enviar recordatorio

### Reservation Service

Lógica de negocio para reservas.

**Funciones principales:**

- `createReservation(userId, classId, date)` - Crear reserva
- `cancelReservation(reservationId)` - Cancelar reserva
- `checkAvailability(classId, date)` - Verificar disponibilidad
- `completeReservation(reservationId)` - Marcar como completada

---

## ⏰ Cron Jobs / Tareas Programadas

El sistema ejecuta tareas automáticas cada hora.

### Recordatorios de Clases

**Archivo:** `backend/src/backend/config/cron.js`

```javascript
// Se ejecuta cada hora (00:00, 01:00, 02:00, etc.)
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Buscar reservas que necesitan recordatorio
  const reservationsFor24h = await Reservation.find({
    date: { $gte: now, $lte: in24Hours },
    status: 'CONFIRMED',
    'reminders.24h': false
  });

  // Enviar emails
  for (const reservation of reservationsFor24h) {
    await sendReminder(reservation, 24);
    reservation.reminders.24h = true;
    await reservation.save();
  }
});
```

### Otras Tareas Programadas

- **Marcar clases como completadas:** Reservas pasadas cambian a `COMPLETED`
- **Limpiar notificaciones antiguas:** Eliminar notificaciones leídas de más de 30 días
- **Estadísticas diarias:** Calcular métricas del día anterior

---

## 🧪 Testing

### Ejecutar Tests (cuando estén implementados)

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests de integración
npm run test:integration
```

### Testing Manual con Postman/Thunder Client

1. Importa la colección de Postman (si existe)
2. Configura el entorno:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (obtenlo haciendo login)

#### Ejemplo de Request

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "admin123"
}
```

---

## 🔍 Debugging

### Logs del Servidor

El servidor muestra logs útiles:

```
✅ MongoDB conectado exitosamente
🚀 Servidor corriendo en http://localhost:3000
📧 Configuración SMTP: smtp.gmail.com:587
💳 Stripe inicializado correctamente
⏰ Cron jobs iniciados

[09:30:15] POST /api/auth/login 200 45ms
[09:30:20] GET /api/classes 200 12ms
[09:30:25] POST /api/reservations 201 234ms
```

### Variables de Debug

Puedes agregar `DEBUG=true` en `.env` para logs más detallados.

---

## 🚨 Errores Comunes

### Error: Cannot connect to MongoDB

**Causa:** Credenciales incorrectas o IP no autorizada.

**Solución:**

1. Verifica `MONGODB_URI` en `.env`
2. En MongoDB Atlas: **Network Access** → Agrega tu IP
3. Verifica que el usuario tenga permisos

### Error: Stripe is not configured properly

**Causa:** Variables de Stripe no configuradas.

**Solución:**

```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

### Error: SMTP authentication failed

**Causa:** Contraseña de aplicación incorrecta.

**Solución:**

1. Ve a [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Genera una nueva contraseña
3. Actualiza `SMTP_PASS` en `.env`

---

## 📚 Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [JWT.io](https://jwt.io/)
- [Node-Cron](https://github.com/node-cron/node-cron)

---

## 🤝 Contribuir

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

<div align="center">

**¿Preguntas o problemas?** Abre un [issue en GitHub](https://github.com/Raizexs/GymProFunctional/issues)

[⬅️ Volver a Quick Start](./QUICKSTART.md) | [🏠 README Principal](../README.md)

</div>
