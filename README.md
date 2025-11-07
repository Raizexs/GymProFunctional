<div align="center">

# 🏋️ Sistema de Gestión para Gimnasio Funcional

### Plataforma Full-Stack para Administración de Gimnasios

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)
[![Academic](https://img.shields.io/badge/Project-Academic-blue?style=for-the-badge)](https://github.com/Raizexs/GymProFunctional)

---

</div>

## 📚 Sobre el Proyecto

Este proyecto fue desarrollado como parte de la asignatura **Ingeniería en Software I**, correspondiente a la carrera de **Ingeniería en Computación e Informática**.

El objetivo es construir un sistema **full-stack** que permita gestionar las operaciones de un gimnasio funcional, incluyendo reservas, pagos, notificaciones y estadísticas. Está orientado tanto al control administrativo como a la experiencia del usuario final.

## 🎯 Objetivos del Proyecto

✅ Implementar autenticación segura con roles diferenciados (Usuario, Entrenador, Admin)

✅ Desarrollar sistema de reservas con validación inteligente de capacidad y fechas

✅ Integrar procesamiento de pagos en línea con Stripe

✅ Automatizar notificaciones por email con recordatorios programados

✅ Generar reportes y estadísticas en tiempo real para toma de decisiones

✅ Aplicar arquitectura por capas y buenas prácticas de desarrollo

---

## 💻 Tecnologías Utilizadas

### 🔧 Backend

| Tecnología                                                                                                  | Versión | Propósito              |
| ----------------------------------------------------------------------------------------------------------- | ------- | ---------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)  | 18+     | Runtime JavaScript     |
| ![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white) | 4.19    | Framework web          |
| ![MongoDB](https://img.shields.io/badge/MongoDB-6.20-47A248?style=flat-square&logo=mongodb&logoColor=white) | 6.20    | Base de datos NoSQL    |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.19-880000?style=flat-square)                            | 8.19    | ODM para MongoDB       |
| ![JWT](https://img.shields.io/badge/JWT-9.0-000000?style=flat-square&logo=json-web-tokens&logoColor=white)  | 9.0     | Autenticación          |
| ![Stripe](https://img.shields.io/badge/Stripe-14.25-008CDD?style=flat-square&logo=stripe&logoColor=white)   | 14.25   | Procesamiento de pagos |
| ![Nodemailer](https://img.shields.io/badge/Nodemailer-6.10-22B573?style=flat-square)                        | 6.10    | Envío de emails        |
| ![Node-Cron](https://img.shields.io/badge/Node--Cron-4.2-orange?style=flat-square)                          | 4.2     | Tareas programadas     |

### 🎨 Frontend

| Tecnología                                                                                                            | Versión | Propósito            |
| --------------------------------------------------------------------------------------------------------------------- | ------- | -------------------- |
| ![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=flat-square&logo=vue.js&logoColor=white)               | 3.4     | Framework progresivo |
| ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)                     | 5.4     | Build tool           |
| ![Pinia](https://img.shields.io/badge/Pinia-2.0-FFD859?style=flat-square)                                             | 2.0     | State management     |
| ![Vue Router](https://img.shields.io/badge/Vue_Router-4.0-4FC08D?style=flat-square)                                   | 4.0     | Navegación SPA       |
| ![Axios](https://img.shields.io/badge/Axios-1.0-5A29E4?style=flat-square)                                             | 1.0     | Cliente HTTP         |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 3.4     | Framework CSS        |

---

## ✨ Funcionalidades

### 👤 Para Usuarios

- ✅ Registro e inicio de sesión seguro
- 📚 Catálogo de clases con filtros por categoría y dificultad
- 🎫 Sistema de reservas con validación de capacidad en tiempo real
- 💰 Procesamiento de pagos con Stripe (clases gratuitas y de pago)
- 🔔 Recordatorios automáticos por email (24h y 2h antes de clase)
- 📈 Dashboard personal con estadísticas y historial
- ⭐ Sistema de feedback y calificaciones

### 👨‍🏫 Para Entrenadores

- 📊 Dashboard con clases asignadas y estadísticas
- ✅ Control de asistencia de alumnos
- 👥 Visualización de estudiantes inscritos
- 💵 Historial de ganancias

### 🛡️ Para Administradores

- 🎛️ Panel completo de gestión de usuarios, clases y entrenadores
- 📊 Reportes de ingresos con gráficos interactivos
- 💳 Gestión de pagos y reembolsos
- 📢 Envío de notificaciones masivas

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
- 🔧 **Stripe** (modo test) → [Obtener API keys](https://dashboard.stripe.com/test/apikeys)_(Opcional para pagos)_
- 📧 **SMTP/Gmail** → [App passwords](https://myaccount.google.com/apppasswords)_(Opcional para emails)_

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
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=tu_secreto_super_seguro
USE_TRANSACTIONS=false
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
STRIPE_WEBHOOK_SECRET=whsec_xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="Gimnasio Pro <noreply@gympro.com>"
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

- 📘 [**Documentación Técnica**](./docs/TECHNICAL_DOCUMENTATION.md) - Arquitectura C4, diagramas UML, modelo de datos normalizado
- 📙 [**Manual de Usuario**](./docs/USER_MANUAL.md) - Guía no técnica para usuarios finales
- 🔧 [**Backend**](./docs/BACKEND.md) - Detalles de implementación del servidor
- ⚡ [**Quick Start**](./docs/QUICKSTART.md) - Inicio rápido para desarrolladores
- 🧪 [**Guía de Testing**](./docs/TESTING_GUIDE.md) - Casos de prueba y validación

---

## 📁 Estructura del Proyecto

```
gym-pro-funcional/
┃
┣━━  backend/
┃   ┣━━  src/backend/
┃   ┃   ┣━━  models/          # Modelos de datos (User, Class, Reservation, etc.)
┃   ┃   ┣━━  routes/          # Endpoints de la API
┃   ┃   ┣━━  services/        # Lógica de negocio
┃   ┃   ┣━━  middlewares/     # Autenticación y validación
┃   ┃   ┣━━  config/          # Configuración de DB y cron jobs
┃   ┃   ┗━━  server.js        # Servidor Express
┃   ┗━━  package.json
┃
┣━━  frontend/
┃   ┣━━  src/
┃   ┃   ┣━━  components/      # Componentes Vue reutilizables
┃   ┃   ┣━━  pages/           # Vistas principales
┃   ┃   ┣━━  services/        # Servicios de comunicación con API
┃   ┃   ┣━━  stores/          # Estado global con Pinia
┃   ┃   ┗━━  router/          # Configuración de rutas
┃   ┗━━  package.json
┃
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

| Método | Endpoint                      | Descripción                |
| ------ | ----------------------------- | -------------------------- |
| `GET`  | `/api/reservations/me`        | Mis reservas               |
| `POST` | `/api/reservations`           | Crear reserva              |
| `POST` | `/api/payments/create-intent` | Procesar pago              |
| `GET`  | `/api/stats/dashboard`        | Estadísticas según rol     |
| `GET`  | `/api/notifications`          | Notificaciones del usuario |

---

## 🎯 Casos de Uso Destacados

### Seguridad

- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Autenticación con JWT (7 días de expiración)
- Middleware de autorización por roles
- Variables sensibles en archivo `.env`
- CORS configurado correctamente

### Sistema de Reservas Inteligente

- Validación de días de la semana
- Control de capacidad en tiempo real
- Límite de 1 reserva activa por día
- Bloqueo permanente de días cancelados
- Estados: PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED

### Automatización

- Recordatorios por email 24h y 2h antes de clase
- Cron jobs ejecutados cada hora
- Webhooks de Stripe para confirmación automática de pagos
- Templates HTML profesionales para emails

### Experiencia de Usuario

- Diseño responsive con Tailwind CSS
- Notificaciones in-app con polling automático
- Feedback visual inmediato
- Gráficos interactivos de estadísticas
- Modales y componentes reutilizables

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
- Autenticación y autorización con JWT
- Integración de servicios externos (Stripe, Gmail SMTP)
- Procesamiento asíncrono con cron jobs
- State management con Pinia
- Diseño responsive con Tailwind CSS
- Validación de datos en frontend y backend
- Manejo centralizado de errores
- Control de versiones con Git

---

## 🔐 Características de Seguridad

| Característica            | Implementación                        |
| ------------------------- | ------------------------------------- |
| 🔑**Autenticación**       | JWT con expiración de 30 minutos      |
| 🔒**Contraseñas**         | Bcrypt con 10 salt rounds             |
| 👮**Autorización**        | Middleware basado en roles            |
| 🌐**CORS**                | Configurado para orígenes específicos |
| 🔐**Variables sensibles** | Almacenadas en `.env`                 |
| 💳**Pagos**               | PCI compliant con Stripe              |

---

## 📝 Observaciones Finales

Este sistema fue diseñado con un enfoque educativo y profesional. Se priorizó la aplicación de buenas prácticas de desarrollo, arquitectura escalable y experiencia de usuario. Puede ser extendido con testing automatizado, CI/CD, logging avanzado y optimizaciones de rendimiento.

---

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
