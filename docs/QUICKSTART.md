# 🚀 Quick Start Guide

Esta guía te permitirá ejecutar el proyecto en **menos de 5 minutos**.

## ⚡ Inicio Rápido

### 1️⃣ Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Git** ([Descargar](https://git-scm.com/))
- Cuenta en **MongoDB Atlas** (gratis) o MongoDB local

### 2️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Raizexs/GymProFunctional.git
cd GymProFunctional
```

### 3️⃣ Configurar Backend

```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env
```

**Edita el archivo `.env`** con tus credenciales:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gym-pro-funcional
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=tu_jwt_secret_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

> 💡 **Tip:** Genera un JWT_SECRET seguro con:
>
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(32))"
> ```

**Poblar la base de datos** con datos de prueba:

```bash
npm run seed
```

**Iniciar el servidor** en modo desarrollo:

```bash
npm run dev
```

✅ Backend corriendo en `http://localhost:3000`

### 4️⃣ Configurar Frontend

Abre una **nueva terminal**:

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

✅ Frontend corriendo en `http://localhost:5173`

---

## 🎯 Acceso al Sistema

Abre tu navegador en `http://localhost:5173` y usa estas credenciales:

| Rol           | Email           | Password   |
| ------------- | --------------- | ---------- |
| 👤 Usuario    | user@gym.com    | user123    |
| 👨‍🏫 Entrenador | trainer@gym.com | trainer123 |
| 🛡️ Admin      | admin@gym.com   | admin123   |

---

## 📋 Checklist de Verificación

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos poblada con `npm run seed`
- [ ] Archivo `.env` configurado correctamente
- [ ] Puedes iniciar sesión con las credenciales de prueba

---

## 🆘 Problemas Comunes

### ❌ Error de conexión a MongoDB

**Síntoma:** `MongoServerError: Authentication failed`

**Solución:**

1. Verifica que tu IP esté en la lista blanca de MongoDB Atlas
2. Revisa que las credenciales en `MONGODB_URI` sean correctas
3. Asegúrate que el usuario tenga permisos de lectura/escritura

### ❌ Puerto ya en uso

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solución:**

```bash
# En Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# O cambia el puerto en el archivo .env
PORT=3001
```

### ❌ Módulos no encontrados

**Síntoma:** `Error: Cannot find module 'express'`

**Solución:**

```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Próximos Pasos

¿Todo funcionando? ¡Perfecto! Ahora puedes:

1. 📖 Lee la [Documentación del Backend](./BACKEND.md)
2. 🎨 Explora la estructura del Frontend
3. 🔍 Revisa el código en `/backend/src/backend/`
4. 🧪 Prueba las funcionalidades del sistema

---

## 💡 Comandos Útiles

### Backend

```bash
npm run dev      # Desarrollo con hot-reload
npm start        # Producción
npm run seed     # Poblar base de datos
```

### Frontend

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Build para producción
npm run preview  # Preview del build
```

---

## 🔗 Enlaces Útiles

- [Documentación Completa del Backend](./BACKEND.md)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- [Configurar Gmail SMTP](https://support.google.com/accounts/answer/185833)

---

<div align="center">

**¿Necesitas ayuda?** Abre un issue en [GitHub](https://github.com/Raizexs/GymProFunctional/issues)

[⬅️ Volver al README principal](../README.md)

</div>
