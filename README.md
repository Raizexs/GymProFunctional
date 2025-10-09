# Gym Pro Funcional - Sistema de Gestión Digital

Un sistema completo de gestión digital para gimnasios que permite reservas en línea, procesamiento de pagos, administración de entrenadores y análisis de estadísticas.

## 🚀 Características Principales

### Para Clientes
- **Registro y Autenticación**: Sistema seguro de registro y login
- **Reservas en Línea**: Reserva clases con disponibilidad en tiempo real
- **Gestión de Pagos**: Integración con Stripe para pagos seguros
- **Perfil Personal**: Historial de entrenamientos y progreso
- **Notificaciones**: Recordatorios automáticos de clases

### Para Entrenadores
- **Dashboard Personalizado**: Vista de clases y horarios
- **Gestión de Clases**: Crear y administrar clases
- **Horarios**: Configurar disponibilidad
- **Estadísticas**: Métricas de rendimiento y asistencia

### Para Administradores
- **Dashboard Ejecutivo**: Métricas en tiempo real
- **Gestión de Usuarios**: Administrar clientes y entrenadores
- **Reportes**: Análisis de ingresos, asistencia y rendimiento
- **Configuración**: Administrar clases y horarios

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Stripe** para procesamiento de pagos
- **Nodemailer** para notificaciones por email
- **Jest** para testing

### Frontend
- **React 18** con Hooks
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **React Query** para manejo de estado del servidor
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **Heroicons** para iconos

## 📁 Estructura del Proyecto

```
gym-pro-funcional/
├── src/
│   ├── backend/
│   │   ├── controllers/         # Lógica de controladores
│   │   ├── models/              # Modelos de base de datos
│   │   ├── routes/              # Rutas API
│   │   ├── services/            # Servicios de negocio
│   │   ├── utils/               # Funciones auxiliares
│   │   ├── config/              # Configuraciones
│   │   ├── middleware/          # Middleware personalizado
│   │   └── server.js            # Servidor principal
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/      # Componentes reutilizables
│   │   │   ├── pages/           # Páginas principales
│   │   │   ├── contexts/        # Contextos de React
│   │   │   ├── hooks/           # Hooks personalizados
│   │   │   ├── services/        # Servicios de API
│   │   │   └── assets/          # Recursos estáticos
│   │   └── public/              # Archivos públicos
│   │
│   └── tests/                   # Pruebas
│       ├── unit/                # Pruebas unitarias
│       ├── integration/         # Pruebas de integración
│       └── e2e/                 # Pruebas end-to-end
│
├── .env.example                 # Variables de entorno de ejemplo
├── package.json                 # Dependencias principales
└── README.md                    # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd gym-pro-funcional
```

### 2. Instalar Dependencias
```bash
# Instalar dependencias principales
npm install

# Instalar dependencias del backend
cd src/backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
nano .env
```

Configurar las siguientes variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/gym-pro-funcional

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar MongoDB
```bash
# Iniciar MongoDB
mongod

# Crear base de datos (opcional, se crea automáticamente)
mongo
use gym-pro-funcional
```

### 5. Ejecutar la Aplicación

#### Desarrollo (Backend y Frontend simultáneamente)
```bash
# Desde la raíz del proyecto
npm run dev
```

#### Solo Backend
```bash
cd src/backend
npm run dev
```

#### Solo Frontend
```bash
cd src/frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Modelos de Base de Datos

### Cliente (Client)
- Información personal y de contacto
- Tipo de membresía
- Historial de entrenamientos
- Preferencias y configuración

### Entrenador (Trainer)
- Información profesional
- Especialidades y certificaciones
- Horarios de disponibilidad
- Estadísticas de rendimiento

### Clase (Class)
- Información de la clase
- Capacidad y precio
- Entrenador asignado
- Categoría y dificultad

### Reserva (Reservation)
- Cliente y clase
- Fecha y hora
- Estado de la reserva
- Feedback y calificaciones

### Pago (Payment)
- Información de transacción
- Integración con Stripe
- Estado del pago
- Historial de reembolsos

## 🔐 Autenticación y Autorización

### Tipos de Usuario
1. **Cliente**: Puede reservar clases y gestionar su perfil
2. **Entrenador**: Puede crear clases y gestionar horarios
3. **Administrador**: Acceso completo al sistema

### Flujo de Autenticación
1. Registro/Login con email y contraseña
2. Generación de JWT token
3. Almacenamiento seguro en localStorage
4. Verificación en cada request

## 💳 Integración de Pagos

### Stripe Integration
- **Payment Intents**: Para pagos seguros
- **Webhooks**: Para confirmación automática
- **Refunds**: Sistema de reembolsos
- **Receipts**: Comprobantes automáticos

### Flujo de Pago
1. Cliente selecciona clase
2. Creación de Payment Intent
3. Procesamiento con Stripe
4. Confirmación automática
5. Actualización de reserva

## 📧 Sistema de Notificaciones

### Tipos de Notificaciones
- **Recordatorios de Clase**: 24h y 2h antes
- **Confirmaciones de Pago**: Inmediatas
- **Cancelaciones**: Notificación automática
- **Promociones**: Marketing dirigido

### Canales de Notificación
- Email (principal)
- SMS (futuro)
- Push notifications (futuro)

## 📈 Dashboard y Estadísticas

### Métricas Principales
- **Ingresos**: Diarios, semanales, mensuales
- **Asistencia**: Por clase, entrenador, período
- **Ocupación**: Tasa de llenado de clases
- **Clientes**: Nuevos, activos, retención

### Reportes Disponibles
- Reporte de ingresos
- Análisis de asistencia
- Rendimiento de entrenadores
- Estadísticas de clientes

## 🧪 Testing

### Tipos de Pruebas
```bash
# Pruebas unitarias
npm test

# Pruebas de integración
npm run test:integration

# Pruebas end-to-end
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

### Estructura de Testing
- **Unit Tests**: Funciones y componentes individuales
- **Integration Tests**: APIs y flujos completos
- **E2E Tests**: Flujos de usuario completos

## 🚀 Despliegue

### Producción
```bash
# Build del frontend
cd src/frontend
npm run build

# Iniciar servidor de producción
cd ../backend
npm start
```

### Docker (Opcional)
```bash
# Construir imagen
docker build -t gym-pro-funcional .

# Ejecutar contenedor
docker run -p 5000:5000 gym-pro-funcional
```

## 🔧 Configuración de Stripe

### 1. Crear Cuenta en Stripe
- Registrarse en https://stripe.com
- Obtener claves de API (test y live)

### 2. Configurar Webhooks
- Endpoint: `https://tu-dominio.com/api/payments/webhook`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. Configurar Productos
- Crear productos para cada tipo de clase
- Configurar precios y monedas

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Experiencia completa
- **Tablet**: Navegación adaptada
- **Mobile**: Interfaz simplificada

## 🔒 Seguridad

### Medidas Implementadas
- **HTTPS**: Encriptación de datos en tránsito
- **JWT**: Tokens seguros con expiración
- **Rate Limiting**: Protección contra ataques
- **Input Validation**: Sanitización de datos
- **CORS**: Configuración de orígenes permitidos

## 🤝 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **ESLint**: Para JavaScript/React
- **Prettier**: Para formateo de código
- **Conventional Commits**: Para mensajes de commit

## 📞 Soporte

### Documentación
- [API Documentation](./docs/api.md)
- [Frontend Components](./docs/components.md)
- [Database Schema](./docs/database.md)

### Contacto
- **Email**: soporte@gymprofuncional.com
- **Issues**: GitHub Issues
- **Discord**: [Servidor de la Comunidad](https://discord.gg/gymprofuncional)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Stripe** por la integración de pagos
- **MongoDB** por la base de datos
- **React Team** por el framework
- **Tailwind CSS** por el sistema de estilos
- **Comunidad Open Source** por las librerías utilizadas

---

**Gym Pro Funcional** - Transformando la gestión de gimnasios con tecnología moderna 🏋️‍♂️💻
