<div align="center">

# 🏋️ Sistema de Gestión para Gimnasio Funcional

### Plataforma Full-Stack para Administración de Gimnasios

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional/releases)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)
[![Academic](https://img.shields.io/badge/Project-Academic-blue?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)

---

</div>

## 📚 Sobre el Proyecto

Este proyecto fue desarrollado como parte de la asignatura **Ingeniería en Software I**, correspondiente a la carrera de **Ingeniería en Computación e Informática**.

El objetivo es construir un sistema **full-stack** que permita gestionar las operaciones de un gimnasio funcional, incluyendo reservas, pagos, notificaciones y estadísticas. Está orientado tanto al control administrativo como a la experiencia del usuario final.

## 🎯 Objetivos del Proyecto

✅ Implementar autenticación segura con JWT y refresh tokens

✅ Desarrollar sistema de reservas con validación inteligente de capacidad y fechas

✅ Integrar procesamiento de pagos en línea con Stripe y webhooks verificados

✅ Sistema de notificaciones multicanal (Email, In-App, Push)

✅ Generar reportes y estadísticas en tiempo real para toma de decisiones

✅ Sistema de feedback y calificaciones con respuestas

✅ Logging centralizado con Winston y rotación de archivos

✅ Testing automatizado con Jest + Supertest

✅ CI/CD con GitHub Actions

✅ Aplicar arquitectura por capas y buenas prácticas de desarrollo

---

## 💻 Tecnologías Utilizadas

### 🔧 Backend

| Tecnología                                                                                                  | Versión | Propósito               |
| ----------------------------------------------------------------------------------------------------------- | ------- | ----------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)  | 18+     | Runtime JavaScript      |
| ![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white) | 4.19    | Framework web           |
| ![MongoDB](https://img.shields.io/badge/MongoDB-8.19-47A248?style=flat-square&logo=mongodb&logoColor=white) | 8.19    | Base de datos NoSQL     |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.19-880000?style=flat-square)                            | 8.19    | ODM para MongoDB        |
| ![JWT](https://img.shields.io/badge/JWT-9.0-000000?style=flat-square&logo=json-web-tokens&logoColor=white)  | 9.0     | Autenticación + Refresh |
| ![Stripe](https://img.shields.io/badge/Stripe-14.25-008CDD?style=flat-square&logo=stripe&logoColor=white)   | 14.25   | Procesamiento de pagos  |
| ![Nodemailer](https://img.shields.io/badge/Nodemailer-6.10-22B573?style=flat-square)                        | 6.10    | Envío de emails         |
| ![Node-Cron](https://img.shields.io/badge/Node--Cron-3.0-orange?style=flat-square)                          | 3.0     | Tareas programadas      |
| ![Winston](https://img.shields.io/badge/Winston-3.18-FF6C37?style=flat-square)                              | 3.18    | Logging centralizado    |
| ![Firebase Admin](https://img.shields.io/badge/Firebase_Admin-12.0-FFCA28?style=flat-square&logo=firebase)  | 12.0    | Push Notifications      |
| ![Jest](https://img.shields.io/badge/Jest-29.7-C21325?style=flat-square&logo=jest&logoColor=white)          | 29.7    | Testing framework       |
| ![Supertest](https://img.shields.io/badge/Supertest-6.3-00D9FF?style=flat-square)                           | 6.3     | API Testing             |
| ![ESLint](https://img.shields.io/badge/ESLint-8.57-4B32C3?style=flat-square&logo=eslint&logoColor=white)    | 8.57    | Code linting            |

### 🎨 Frontend

| Tecnología                                                                                                            | Versión | Propósito            |
| --------------------------------------------------------------------------------------------------------------------- | ------- | -------------------- |
| ![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=flat-square&logo=vue.js&logoColor=white)               | 3.4     | Framework progresivo |
| ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)                     | 5.4     | Build tool           |
| ![Pinia](https://img.shields.io/badge/Pinia-2.0-FFD859?style=flat-square)                                             | 2.0     | State management     |
| ![Vue Router](https://img.shields.io/badge/Vue_Router-4.0-4FC08D?style=flat-square)                                   | 4.0     | Navegación SPA       |
| ![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=flat-square)                                             | 1.6     | Cliente HTTP         |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 3.4     | Framework CSS        |
| ![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?style=flat-square&logo=firebase&logoColor=black)        | 10.7    | Push Notifications   |

---

## ✨ Funcionalidades

### 👤 Para Usuarios

- ✅ Registro e inicio de sesión seguro con refresh tokens
- 📚 Catálogo de clases con filtros por categoría y dificultad
- 🎫 Sistema de reservas con validación de capacidad en tiempo real
- 💰 Procesamiento de pagos con Stripe (clases gratuitas y de pago)
- � Política de reembolsos dentro de 24h antes de la clase
- 🔔 Notificaciones multicanal:
  - 📧 Email con reintentos automáticos
  - 🔵 In-App con actualización en tiempo real
  - 📱 Push Notifications con Firebase Cloud Messaging
- 📈 Dashboard personal con estadísticas y historial
- ⭐ Sistema de feedback y calificaciones para clases
- 💬 Visualización de reviews y respuestas de entrenadores

### 👨‍🏫 Para Entrenadores

- 📊 Dashboard con clases asignadas y estadísticas
- ✅ Control de asistencia de alumnos filtrado por entrenador
- 👥 Visualización de estudiantes inscritos
- 💵 Historial de ganancias
- ⭐ Sistema de calificaciones con promedio automático
- 💬 Responder a feedback de estudiantes
- 📈 Estadísticas de rendimiento y popularidad

### 🛡️ Para Administradores

- 🎛️ Panel completo de gestión de usuarios, clases y entrenadores
- 👨‍🏫 CRUD completo de entrenadores
- 📊 Reportes de ingresos con gráficos interactivos
- 💳 Gestión de pagos y reembolsos automáticos
- 📢 Envío de notificaciones masivas
- 🔍 Moderación de feedback (aprobar/rechazar)
- 📝 Logs centralizados con Winston

---

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

Requisitos mínimos:

```powershell
# Windows PowerShell
node --version   # >= 18
npm --version    # >= 9
```

**Servicios externos necesarios:**

- ✅ **MongoDB Atlas** (gratis) → [Crear cuenta](https://www.mongodb.com/cloud/atlas/register)
- 🔧 **Stripe** (modo test) → [Obtener API keys](https://dashboard.stripe.com/test/apikeys) _(Opcional para pagos)_
- 📧 **SMTP/Gmail** → [App passwords](https://myaccount.google.com/apppasswords) _(Opcional para emails)_
- 🔔 **Firebase** (gratis) → [Console](https://console.firebase.google.com/) _(Opcional para push notifications)_

> **💡 Tip:** Para obtener las credenciales:

> - **MongoDB URI**: Ve a Atlas → Connect → Drivers y copia la cadena de conexión

> - **JWT_SECRET**: Genera uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> - **Stripe Keys**: Dashboard → Developers → API Keys (usa modo test)

> - **SMTP Gmail**: Configura verificación en 2 pasos → App passwords

### 1️⃣ Clonar repositorio

```powershell
git clone https://github.com/Raizexs/GymProFunctional
cd gym-pro-funcional
```

### 2️⃣ Configurar Backend

```powershell
cd backend
npm install
```

Crear archivo `.env` con las siguientes variables:

```env
# Database
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional
PORT=3000
CORS_ORIGIN=http://localhost:5173

# JWT Authentication
JWT_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=tu_secreto_refresh_super_seguro
USE_TRANSACTIONS=false

# Stripe Payments (opcional)
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SMTP Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="Gimnasio Pro <noreply@gympro.com>"

# Firebase Push Notifications (opcional)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### 3️⃣ Poblar base de datos

```powershell
npm run seed
```

### 4️⃣ Iniciar Backend

```powershell
npm run dev
```

El servidor estará en `http://localhost:3000`

### 5️⃣ Configurar Frontend (Nueva Terminal)

```powershell
cd frontend
npm install
```

**(Opcional) Crear archivo `.env` para Firebase:**

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
VITE_FIREBASE_VAPID_KEY=tu-vapid-key
```

### 6️⃣ Iniciar Frontend

```powershell
npm run dev
```

La aplicación estará en `http://localhost:5173`

---

## 🔑 Credenciales de Prueba

| Rol              | Email           | Password   | Permisos                          |
| ---------------- | --------------- | ---------- | --------------------------------- |
| 👤**Usuario**    | user@gym.com    | user123    | Reservar clases, ver estadísticas |
| 👨‍🏫**Entrenador** | trainer@gym.com | trainer123 | Gestionar clases y asistencia     |
| 🛡️**Admin**      | admin@gym.com   | admin123   | Acceso completo al sistema        |

> ⚠️ **Nota:** Estas credenciales son solo para desarrollo/pruebas.

---

## 📄 Documentación

<div align="center">

[![Documentación Completa](https://img.shields.io/badge/📚_Ver_Documentación_Completa-4A90E2?style=for-the-badge&logoColor=white)](./docs)

</div>

**Documentos disponibles:**

- 🔧 [**Backend**](./docs/BACKEND.md) - Detalles de implementación del servidor
- ⚡ [**Quick Start**](./docs/QUICKSTART.md) - Inicio rápido para desarrolladores
- 🧪 [**Guía de Testing**](./docs/TESTING_GUIDE.md) - Casos de prueba y validación
- 🔔 [**Firebase Setup**](./docs/FIREBASE_SETUP.md) - Configuración de push notifications

---

## 📁 Estructura del Proyecto

```
gym-pro-funcional/
┃
┣━━  backend/
┃   ┣━━  src/backend/
┃   ┃   ┣━━  config/          # Configuración (DB, Firebase, Logger, Cron)
┃   ┃   ┣━━  models/          # Modelos de datos (User, Class, Reservation, etc.)
┃   ┃   ┣━━  routes/          # Endpoints de la API (35+ endpoints)
┃   ┃   ┣━━  services/        # Lógica de negocio
┃   ┃   ┣━━  middlewares/     # Autenticación y validación
┃   ┃   ┗━━  server.js        # Servidor Express
┃   ┣━━  __tests__/           # Tests con Jest + Supertest
┃   ┣━━  logs/                # Archivos de log (Winston)
┃   ┗━━  package.json
┃
┣━━  frontend/
┃   ┣━━  src/
┃   ┃   ┣━━  components/      # Componentes Vue reutilizables
┃   ┃   ┣━━  composables/     # Composables (usePushNotifications)
┃   ┃   ┣━━  config/          # Configuración (Firebase)
┃   ┃   ┣━━  pages/           # Vistas principales
┃   ┃   ┣━━  services/        # Servicios de comunicación con API
┃   ┃   ┣━━  stores/          # Estado global con Pinia
┃   ┃   ┗━━  router/          # Configuración de rutas
┃   ┣━━  public/              # Service Worker para push notifications
┃   ┗━━  package.json
┃
┣━━  .github/workflows/       # CI/CD con GitHub Actions
┣━━  docs/                    # Documentación completa
┗━━ 📖 README.md
```

---

## 🌐 API Endpoints

### 🌍 Endpoints Públicos

| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `GET` | `/api/classes` | Listar clases disponibles |
| `GET` | `/api/trainers` | Listar entrenadores |

### 🔒 Endpoints Privados (requieren autenticación)

| Método | Endpoint                            | Descripción                |
| ------ | ----------------------------------- | -------------------------- |
| `POST` | `/api/auth/refresh`                 | Renovar access token       |
| `GET`  | `/api/reservations/me`              | Mis reservas               |
| `POST` | `/api/reservations`                 | Crear reserva              |
| `POST` | `/api/payments/create-intent`       | Procesar pago              |
| `POST` | `/api/payments/refund/:id`          | Solicitar reembolso        |
| `GET`  | `/api/stats/dashboard`              | Estadísticas según rol     |
| `GET`  | `/api/notifications`                | Notificaciones del usuario |
| `POST` | `/api/notifications/register-token` | Registrar token FCM        |
| `POST` | `/api/feedback`                     | Crear feedback             |
| `GET`  | `/api/feedback/my`                  | Mis feedbacks              |
| `GET`  | `/api/trainers` (Admin)             | CRUD entrenadores          |

---

## 🎯 Casos de Uso Destacados

### Seguridad

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Autenticación con JWT (30 minutos de expiración)
- Refresh tokens con 7 días de validez
- Rotación automática de refresh tokens
- Middleware de autorización por roles
- Verificación de webhooks de Stripe con firma
- Variables sensibles en archivo `.env`
- CORS configurado correctamente

### Sistema de Reservas Inteligente

- Validación de días de la semana
- Control de capacidad en tiempo real
- Límite de 1 reserva activa por día
- Bloqueo permanente de días cancelados
- Estados: PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED
- Auto-cancelación de planes pendientes al comprar nuevo plan

### Sistema de Notificaciones Multicanal

- **Email**: Reintentos automáticos (3x con exponential backoff)
- **In-App**: Actualización en tiempo real con polling
- **Push**: Firebase Cloud Messaging para web/mobile
- Templates HTML profesionales
- Recordatorios 24h y 2h antes de clase

### Sistema de Feedback y Calificaciones

- Reviews con ratings de 1-5 estrellas
- Categorías: Instructor, Facilities, Content
- Soporte para feedback anónimo
- Respuestas de entrenadores
- Contador de "helpful" para engagement
- Actualización automática de rating de entrenadores
- Estadísticas y distribución de ratings

### Logging y Monitoring

- Winston con rotación diaria de archivos
- Logs de error (30 días de retención)
- Logs combinados (14 días de retención)
- Máximo 20MB por archivo
- Formato JSON estructurado
- Logs en consola para desarrollo

## Casos de Uso

### 💡 Usuario reserva clase gratuita

1. Inicia sesión y navega al catálogo
2. Selecciona clase gratuita (precio = 0)
3. Elige fecha válida
4. Sistema verifica capacidad
5. Reserva confirmada automáticamente
6. Recibe email de confirmación
7. Recordatorios automáticos 24h y 2h antes

### 💳 Usuario reserva clase de pago

1. Selecciona clase con precio
2. Sistema crea reserva PENDING_PAYMENT
3. Ingresa datos de tarjeta (Stripe)
4. Pago procesado de forma segura
5. Webhook confirma pago
6. Reserva cambia a CONFIRMED
7. Email con recibo digital

### 📊 Admin genera reporte

1. Accede a panel de estadísticas
2. Selecciona rango de fechas
3. Elige agrupación (día/semana/mes)
4. Sistema consulta pagos completados
5. Genera gráficos y tablas
6. Opción de exportar a CSV

---

## 🎓 Aprendizajes Aplicados

- Arquitectura por capas (Routes → Services → Models)
- Autenticación y autorización con JWT + Refresh Tokens
- Integración de servicios externos (Stripe, Firebase, Gmail SMTP)
- Procesamiento asíncrono con cron jobs
- State management con Pinia
- Diseño responsive con Tailwind CSS
- Validación de datos en frontend y backend
- Manejo centralizado de errores
- Logging estructurado con Winston
- Testing automatizado con Jest + Supertest
- CI/CD con GitHub Actions
- Webhook verification para pagos seguros
- Push notifications con Firebase Cloud Messaging
- Service Workers para notificaciones en background
- Control de versiones con Git y commits semánticos

---

## 🔐 Características de Seguridad

| Característica            | Implementación                                  |
| ------------------------- | ----------------------------------------------- |
| 🔑**Autenticación**       | JWT + Refresh tokens con rotación               |
| 🔒**Contraseñas**         | Bcrypt con 10 salt rounds                       |
| 👮**Autorización**        | Middleware basado en roles                      |
| 🌐**CORS**                | Configurado para orígenes específicos           |
| 🔐**Variables sensibles** | Almacenadas en `.env`                           |
| 💳**Pagos**               | PCI compliant con Stripe + webhook verification |
| 📝**Logging**             | Winston con rotación y retención                |
| 🧪**Testing**             | Jest + Supertest (7 tests passing)              |
| 🚀**CI/CD**               | GitHub Actions con validación automática        |

---

## 📝 Observaciones Finales

Este sistema fue diseñado con un enfoque educativo y profesional para la asignatura **Ingeniería en Software I**. Se priorizó la aplicación de buenas prácticas de desarrollo, arquitectura escalable, seguridad y experiencia de usuario.

## 📄 Licencia

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Este proyecto es de código abierto con fines **educativos** y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

<div align="center">

**Lukas Flores**

[![GitHub](https://img.shields.io/badge/GitHub-@Raizexs-181717?style=for-the-badge&logo=github)](https://github.com/raizexs)
[![Email](https://img.shields.io/badge/Email-lukasflores071@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:lukasflores071@gmail.com)

</div>

---

<div align="center">

### ⭐ Si te gustó este proyecto, dale una estrella en GitHub

_Proyecto Académico - Ingeniería en Software I - 2025_

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)
[![Vue.js + Node.js](https://img.shields.io/badge/Built%20with-Vue.js%20%2B%20Node.js-blue?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)
[![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)

</div>
