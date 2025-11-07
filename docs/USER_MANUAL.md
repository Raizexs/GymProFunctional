# 📙 Manual de Usuario – GymProFunctional

Bienvenido/a a la plataforma del Gimnasio Funcional. Aquí encontrarás cómo usar las funciones principales sin necesidad de conocimientos técnicos.

> Última actualización: 2025-11-06

## 1. Acceso y Roles

- Usuario: puede reservar clases, comprar planes y ver su historial.
- Entrenador: puede ver sus clases y marcar asistencia de alumnos.
- Administrador: configura planes y revisa estadísticas e ingresos.

Credenciales de ejemplo (solo desarrollo):

- Usuario: user@gym.com / user123
- Entrenador: trainer@gym.com / trainer123
- Admin: admin@gym.com / admin123

## 2. Inicio de Sesión / Registro

1. Abre la app en tu navegador (por defecto: http://localhost:5173).
2. Ve a “Ingresar” para iniciar sesión.
3. ¿No tienes cuenta? Pulsa “Registrarse”, completa nombre, correo y contraseña.

## 3. Comprar un Plan

Para reservar clases necesitas un plan activo con créditos.

1. En el menú, ve a “Planes”.
2. Elige el plan que prefieras (muestra precio, duración y créditos incluidos).
3. Pulsa “Comprar”.
4. Completa el pago simulado (modo prueba) y confirma.
5. Recibirás una notificación y verás tu plan activo con los créditos disponibles.

## 4. Ver Clases Disponibles

1. Entra en “Clases”.
2. Puedes filtrar por categoría o dificultad.
3. Cada tarjeta muestra: nombre, entrenador, capacidad, horario y precio (gratis o de pago).

## 5. Reservar una Clase

1. En la clase elegida, pulsa “Reservar”.
2. Selecciona una fecha válida (el sistema permite reservar solo en los días configurados para esa clase).
3. Confirma.
4. Si la clase es gratuita: la reserva queda confirmada de inmediato y se descuenta 1 crédito de tu plan.
5. Si la clase es de pago: se crea una reserva “pendiente de pago”; luego completa el pago para confirmarla.

## 6. Mis Reservas

- Ve a “Mis Clases” o “Reservas”.
- Verás próximas y pasadas, con su estado: PENDING_PAYMENT, CONFIRMED, CANCELLED o COMPLETED.
- Puedes dejar feedback (rating y comentario) en las clases completadas.

## 7. Cancelar o Reagendar

- Puedes cancelar una reserva con al menos 2 horas de anticipación.
- Si estaba confirmada, el sistema te devuelve 1 crédito al plan.
- Si faltan menos de 2 horas, no es posible cancelar.

## 8. Asistencia y No‑Show (Entrenadores)

- En la vista de “Asistencia”, selecciona la clase y fecha.
- Marca a cada alumno como “asistió” o “no asistió”.
- Si un usuario acumula 3 no‑shows en 30 días, se aplica una penalización (se descuenta 1 crédito extra) y se notifica.

## 9. Notificaciones

- Recibirás alertas dentro de la app y por email:
  - Reserva confirmada / cancelada.
  - Pago confirmado.
  - Recordatorios de clase (24h y 2h antes).
  - Penalización por no‑show (si aplica).
- Puedes marcarlas como leídas o eliminarlas desde el centro de notificaciones.

## 10. Tableros y Estadísticas

- Usuarios: resumen de reservas, asistencia y clase favorita.
- Entrenadores: reservas en sus clases, alumnos únicos, distribución por días.
- Admin: ingresos, ocupación promedio, clases populares y crecimiento.

## 11. Consejos y Ayuda

- Si no puedes reservar, verifica que tengas un plan activo con créditos.
- Si no llegan correos, puede que el servidor de email de pruebas no esté configurado; igual verás notificaciones dentro de la app.
- Si no puedes cancelar, revisa el tiempo restante (mínimo 2 horas).

¿Dudas o sugerencias? Contacta al administrador del sistema o abre un Issue en GitHub.
