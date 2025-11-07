# 🔔 Push Notifications con Firebase Cloud Messaging

Esta guía te ayudará a configurar las notificaciones push en GymProFuncional usando Firebase Cloud Messaging (FCM).

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)
- Node.js 18+ instalado

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" (Agregar proyecto)
3. Nombre del proyecto: `GymProFuncional` (o el nombre que prefieras)
4. Desactiva Google Analytics si no lo necesitas
5. Click en "Create project"

### 2. Registrar una Web App

1. En el dashboard de tu proyecto, click en el ícono web `</>`
2. Nombre de la app: `GymProFuncional Web`
3. **NO** marques "Also set up Firebase Hosting"
4. Click en "Register app"
5. **Guarda** los valores de `firebaseConfig` que aparecen

### 3. Habilitar Cloud Messaging

1. En el menú lateral, ve a **Build** > **Cloud Messaging**
2. Si aparece un mensaje sobre la API, click en "Enable"
3. Esto habilitará automáticamente Cloud Messaging API en Google Cloud

### 4. Generar VAPID Key (Web Push Certificate)

1. En la página de Cloud Messaging, busca la sección **Web configuration**
2. Click en **Web Push certificates** (o **Certificados push web**)
3. Click en **Generate key pair** (Generar par de claves)
4. **Copia** la clave que aparece (empieza con algo como `BK...`)

### 5. Obtener Service Account (para Backend)

1. En el menú lateral, click en el ícono ⚙️ > **Project settings**
2. Ve a la pestaña **Service accounts**
3. Click en **Generate new private key**
4. Confirma y descarga el archivo JSON
5. **IMPORTANTE**: Este archivo contiene credenciales secretas, no lo subas a GitHub

### 6. Configurar Variables de Entorno

#### Backend (`backend/.env`)

```bash
# Convierte el JSON descargado a una sola línea (sin saltos de línea)
# Puedes usar: cat service-account.json | jq -c
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"gymprofuncional",...}
```

#### Frontend (`frontend/.env`)

```bash
# Valores de firebaseConfig del paso 2
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=gymprofuncional.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gymprofuncional
VITE_FIREBASE_STORAGE_BUCKET=gymprofuncional.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# VAPID Key del paso 4
VITE_FIREBASE_VAPID_KEY=BK1234567890abcdefghijklmnopqrstuvwxyz...
```

### 7. Actualizar Service Worker

Edita `frontend/public/firebase-messaging-sw.js` y reemplaza los valores de configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id",
};
```

## 🧪 Probar la Configuración

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver en los logs:

```
✅ Firebase Admin SDK initialized successfully
```

### 2. Iniciar el Frontend

```bash
cd frontend
npm run dev
```

### 3. Activar Notificaciones Push

1. Abre la app en el navegador: http://localhost:5173
2. Inicia sesión con tu cuenta
3. Click en el icono de campana (🔔)
4. Activa el toggle "Notificaciones Push"
5. El navegador pedirá permiso, click en "Permitir"

### 4. Probar Notificación

Desde la consola del navegador:

```javascript
// Esto enviará una notificación de prueba
fetch("http://localhost:5000/api/notifications/test", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json",
  },
});
```

O crea una reserva de clase y espera 2 horas antes de la clase para recibir un recordatorio automático.

## 📱 Tipos de Notificaciones

El sistema envía notificaciones push para:

- ✅ **CLASS_REMINDER_2H**: Recordatorio 2 horas antes de una clase
- 📅 **CLASS_REMINDER_24H**: Recordatorio 24 horas antes (solo in-app + email)
- 💳 **PAYMENT_CONFIRMATION**: Confirmación de pago
- 🎯 **RESERVATION_CONFIRMED**: Reserva confirmada
- ❌ **RESERVATION_CANCELLED**: Reserva cancelada
- ⭐ **FEEDBACK_RECEIVED**: Nuevo feedback recibido
- 💬 **FEEDBACK_RESPONSE**: Respuesta a tu feedback

## 🔒 Seguridad

### Variables Secretas

- `FIREBASE_SERVICE_ACCOUNT`: **NUNCA** la subas a GitHub o la expongas públicamente
- Las variables `VITE_FIREBASE_*` del frontend son públicas y se incluyen en el bundle

### Service Account JSON

El archivo JSON del service account contiene:

- Private key
- Client email
- Project ID

**Mantén este archivo seguro** y usa variables de entorno en producción.

## 🐛 Troubleshooting

### Error: "Firebase messaging not initialized"

**Causa**: Variables de Firebase no configuradas o incorrectas.

**Solución**:

1. Verifica que todas las variables `VITE_FIREBASE_*` estén en `.env`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Limpia el cache: `rm -rf node_modules/.vite`

### Error: "This browser does not support notifications"

**Causa**: El navegador no soporta la API de Notifications.

**Solución**:

- Usa Chrome, Firefox, Edge o Safari (versiones recientes)
- HTTPS es requerido en producción (localhost funciona sin HTTPS)

### Error: "Failed to get FCM token"

**Causa**: VAPID key incorrecta o service worker no registrado.

**Solución**:

1. Verifica `VITE_FIREBASE_VAPID_KEY` en `.env`
2. Verifica que `firebase-messaging-sw.js` esté en `/public/`
3. Abre DevTools > Application > Service Workers y verifica que esté registrado
4. Limpia el cache y recarga: Ctrl+Shift+R

### Notificaciones no llegan

**Causa**: Token no registrado o Firebase Admin mal configurado.

**Solución**:

1. Backend: Verifica que `FIREBASE_SERVICE_ACCOUNT` esté configurado
2. Chequea logs del backend: `✅ Firebase Admin SDK initialized`
3. Verifica que el token se registró: `GET /api/notifications/device-tokens`
4. Prueba con la notificación de test: `POST /api/notifications/test`

## 📚 Recursos

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎉 ¡Listo!

Ahora tu aplicación puede enviar notificaciones push a los usuarios incluso cuando el navegador está en segundo plano.
