# Backend API - Gym Pro Funcional

API REST para sistema de gestión de reservas de gimnasio funcional.

## 🛠️ Stack Tecnológico

- **Node.js** + **Express** - Servidor HTTP
- **MongoDB** + **Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación y autorización
- **bcryptjs** - Hash de contraseñas

## 📋 Requisitos

- Node.js >= 18
- MongoDB Atlas (gratis) o MongoDB local >= 6.0

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# MongoDB Atlas (recomendado)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional

# O MongoDB Local
MONGODB_URI=mongodb://localhost:27017/gym-pro-funcional

# Servidor
PORT=3000
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=cambiar_por_secreto_seguro_en_produccion
```

### 3. Poblar Base de Datos

```bash
npm run seed
```

Esto creará:
- 2 usuarios (admin y user)
- 4 entrenadores
- 6 clases
- 3 reservas de ejemplo

### 4. Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

Servidor disponible en: `http://localhost:3000`

## 🔑 Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Usuario | user@gym.com | user123 |
| Admin | admin@gym.com | admin123 |

## 📁 Estructura

```
src/backend/
├── config/
│   └── database.js          # Conexión MongoDB
├── models/                  # Modelos Mongoose
│   ├── User.js
│   ├── Trainer.js
│   ├── Class.js
│   └── Reservation.js
├── routes/                  # Endpoints API
│   ├── auth.routes.js
│   ├── trainers.routes.js
│   ├── classes.routes.js
│   ├── reservations.routes.js
│   └── me.routes.js
├── services/                # Lógica de negocio
│   └── reservation.service.js
├── middlewares/
│   └── auth.middleware.js   # Autenticación JWT
├── server.js                # Punto de entrada
└── seed.js                  # Script de seed
```

## 🌐 API Endpoints

### Públicos

```http
GET    /api/health                 # Health check
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Iniciar sesión
GET    /api/trainers               # Listar entrenadores
GET    /api/classes                # Listar clases
```

### Privados (Requieren JWT)

```http
GET    /api/me/summary             # Resumen del usuario
GET    /api/reservations/me        # Mis reservas
POST   /api/reservations           # Crear reserva
DELETE /api/reservations/:id       # Cancelar reserva
```

**Autenticación:**
```
Authorization: Bearer {token}
```

## 💾 Modelos

### User
```javascript
{
  name: String,
  email: String (único),
  passwordHash: String,
  role: 'USER' | 'ADMIN'
}
```

### Trainer
```javascript
{
  name: String,
  bio: String,
  rating: Number,
  avatarUrl: String,
  specialties: [String]
}
```

### Class
```javascript
{
  title: String,
  description: String,
  days: [String],
  time: String,
  durationMin: Number,
  capacity: Number,
  coachId: ObjectId (ref: Trainer)
}
```

### Reservation
```javascript
{
  userId: ObjectId (ref: User),
  classId: ObjectId (ref: Class),
  date: Date,
  status: 'CONFIRMED' | 'CANCELLED'
}
```

## 🗄️ MongoDB Setup

### Opción 1: MongoDB Atlas (Recomendado)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster M0 (gratis)
3. Crear usuario de base de datos
4. Whitelist: Permitir acceso desde cualquier IP (0.0.0.0/0)
5. Obtener connection string
6. Actualizar `MONGODB_URI` en `.env`

**Connection string format:**
```
mongodb+srv://usuario:password@cluster.mongodb.net/gym-pro-funcional?retryWrites=true&w=majority
```

### Opción 2: MongoDB con Docker

```bash
docker-compose -f docker-compose.simple.yml up -d
```

## 🧪 Testing

### Usando curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gym.com","password":"user123"}'

# Ver entrenadores
curl http://localhost:3000/api/trainers
```

### Usando PowerShell (test-backend.ps1):

```powershell
.\test-backend.ps1
```

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Verifica que MongoDB esté corriendo
- Revisa el connection string en `.env`
- Si usas Atlas, verifica la whitelist de IPs

**"Port 3000 already in use"**
- Cambia `PORT` en `.env` o mata el proceso:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <pid> /F
  ```

**"MongoServerError: bad auth"**
- Password incorrecto en connection string
- Verifica credenciales en MongoDB Atlas

## 🚀 Deploy

Para producción:

1. ✅ Usar MongoDB Atlas
2. ✅ Cambiar `JWT_SECRET` por uno fuerte
3. ✅ Configurar `CORS_ORIGIN` apropiadamente
4. ✅ Usar HTTPS
5. ✅ Variables de entorno seguras

## 📚 Recursos

- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Express Docs](https://expressjs.com/)
