# 🧪 Guía de Pruebas - GymProFunctional

## Mejoras Implementadas - 5 de Noviembre 2025

Esta guía proporciona casos de prueba detallados para validar todas las mejoras implementadas en el sistema.

---

## 🔧 Configuración Previa

### Prerrequisitos

1. **Backend corriendo**: `cd backend && npm run dev`
2. **Frontend corriendo**: `cd frontend && npm run dev`
3. **Base de datos**: MongoDB activo
4. **Usuarios de prueba**:
   - Admin: Para gestionar planes y ver KPIs
   - Trainer: Para marcar asistencias
   - Cliente: Para reservar y cancelar

### Datos de Prueba Necesarios

- ✅ Al menos 1 plan activo en el sistema
- ✅ Al menos 2 clases configuradas
- ✅ Al menos 1 entrenador asignado

---

## 🧪 Suite de Pruebas

### Test Suite 1: Validación de Plan Activo (HU01)

#### ✅ TC1.1: Reservar SIN plan activo

**Objetivo**: Verificar que el sistema bloquea reservas sin plan

**Pasos**:

1. Iniciar sesión como cliente nuevo (sin plan)
2. Ir a "Clases Disponibles"
3. Intentar reservar cualquier clase
4. Seleccionar una fecha válida
5. Hacer clic en "Confirmar"

**Resultado Esperado**:

- ❌ Reserva rechazada
- 🚫 Error: "No tienes un plan activo con créditos disponibles"
- 💡 Alerta amarilla sugiere adquirir un plan

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC1.2: Reservar CON plan pero SIN créditos

**Objetivo**: Verificar validación de créditos disponibles

**Pasos**:

1. Crear un plan con 0 créditos o usar todos los créditos
2. Intentar reservar una clase

**Resultado Esperado**:

- ❌ Reserva rechazada
- 🚫 Error: "No tienes un plan activo con créditos disponibles"

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC1.3: Reservar CON plan válido

**Objetivo**: Verificar que reserva funciona correctamente

**Pasos**:

1. Tener plan activo con créditos > 0
2. Ver modal de reserva → debe mostrar plan activo
3. Reservar una clase

**Resultado Esperado**:

- ✅ Reserva creada exitosamente
- 📊 Modal muestra "Plan Activo: X créditos disponibles"
- 🎉 Mensaje de confirmación

**Estado**: [ ] Pass [ ] Fail

---

### Test Suite 2: Descuento de Créditos (HU02)

#### ✅ TC2.1: Clase gratuita - Descuento inmediato

**Objetivo**: Verificar descuento automático en clases gratis

**Setup**:

- Plan inicial: 5 créditos

**Pasos**:

1. Reservar clase GRATUITA (price = 0)
2. Verificar estado de reserva: CONFIRMED
3. Ir a "Planes" → verificar créditos

**Resultado Esperado**:

- ✅ Estado: CONFIRMED
- 📉 Créditos: 5 → 4
- 🔔 Notificación recibida

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC2.2: Clase de pago - Descuento al pagar

**Objetivo**: Verificar descuento tras confirmar pago

**Setup**:

- Plan inicial: 5 créditos

**Pasos**:

1. Reservar clase DE PAGO (price > 0)
2. Estado inicial: PENDING_PAYMENT
3. Completar pago (usar modal de simulación)
4. Verificar créditos en "Planes"

**Resultado Esperado**:

- ⏳ Estado inicial: PENDING_PAYMENT (créditos: 5)
- ✅ Estado final: CONFIRMED (créditos: 4)
- 💳 Pago registrado
- 🔔 2 notificaciones: pago confirmado + reserva confirmada

**Estado**: [ ] Pass [ ] Fail

---

### Test Suite 3: Ventana de Cancelación (HU03)

#### ✅ TC3.1: Cancelar con MENOS de 2 horas

**Objetivo**: Verificar que no se puede cancelar tarde

**Setup**:

- Crear reserva para "hoy + 1 hora"

**Pasos**:

1. Ir a "Mis Reservas"
2. Intentar cancelar la reserva
3. Hacer clic en "Cancelar"

**Resultado Esperado**:

- ❌ Error: "Debe hacerse con al menos 2 horas de anticipación"
- 🚫 Reserva NO cancelada
- 💰 Créditos NO devueltos

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC3.2: Cancelar con MÁS de 2 horas

**Objetivo**: Verificar cancelación exitosa con devolución

**Setup**:

- Plan actual: 3 créditos
- Reserva para mañana (>24h)

**Pasos**:

1. Ir a "Mis Reservas"
2. Cancelar la reserva
3. Verificar mensaje
4. Verificar créditos en "Planes"

**Resultado Esperado**:

- ✅ Cancelación exitosa
- 💰 Créditos: 3 → 4 (devuelto)
- 📩 Notificación: "Crédito devuelto"
- 🔔 Email enviado

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC3.3: Reagendar con MENOS de 2 horas

**Objetivo**: Verificar bloqueo de reagendamiento tardío

**Pasos**:

1. Abrir modal de reagendamiento para clase próxima (<2h)
2. Ver alerta roja
3. Intentar seleccionar fecha

**Resultado Esperado**:

- 🚫 Alerta: "No puedes reagendar... menos de 2 horas"
- 🔒 Botón "Reagendar" deshabilitado
- ⏰ Muestra tiempo restante

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC3.4: Reagendar con MÁS de 2 horas

**Objetivo**: Verificar reagendamiento exitoso

**Setup**:

- Reserva para la próxima semana

**Pasos**:

1. Abrir modal de reagendamiento
2. Seleccionar nueva fecha (día válido)
3. Confirmar

**Resultado Esperado**:

- ✅ Reserva original cancelada (crédito devuelto)
- ✅ Nueva reserva creada (crédito descontado)
- 📊 Balance de créditos: neto = 0
- 🔄 Lista actualizada

**Estado**: [ ] Pass [ ] Fail

---

### Test Suite 4: Penalización por No-Show (HU05)

#### ✅ TC4.1: Primer y segundo no-show (sin penalización)

**Objetivo**: Verificar que no hay penalización en primeros no-shows

**Setup**:

- Usuario sin no-shows previos
- Plan con 10 créditos

**Pasos**:

1. Crear 2 reservas y marcarlas como no-show
2. Verificar créditos después de cada no-show

**Resultado Esperado**:

- ❌ No-show #1: créditos permanecen igual
- ❌ No-show #2: créditos permanecen igual
- ⚠️ Sin notificación de penalización

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC4.2: Tercer no-show (CON penalización)

**Objetivo**: Verificar descuento adicional al 3er no-show

**Setup**:

- Usuario con 2 no-shows en últimos 30 días
- Plan con 10 créditos

**Pasos**:

1. Como trainer, marcar 3ra asistencia como no-show
2. Verificar créditos del usuario
3. Verificar notificaciones

**Resultado Esperado**:

- ❌ No-show registrado
- 💰 Créditos: 10 → 9 (penalización)
- 🔔 Notificación: "Penalización por No-Show"
- 📧 Email con advertencia
- 📊 Badge "PENALIZADO" en KPIs

**Estado**: [ ] Pass [ ] Fail

---

#### ✅ TC4.3: Visualización en KPIs

**Objetivo**: Verificar indicador visual de penalización

**Pasos**:

1. Como admin, ir a "KPIs"
2. Buscar sección "Usuarios con Más No-Shows"
3. Verificar usuarios con 3+ ausencias

**Resultado Esperado**:

- 📊 Tabla muestra usuarios ordenados por no-shows
- 🚫 Badge rojo "PENALIZADO" en usuarios con 3+
- 📝 Texto informativo sobre política de penalización

**Estado**: [ ] Pass [ ] Fail

---

### Test Suite 5: Integración Completa

#### ✅ TC5.1: Flujo completo de cliente

**Objetivo**: Probar el ciclo de vida completo

**Escenario**:

1. Comprar plan (10 créditos) → 10
2. Reservar clase A → 9
3. Cancelar clase A con >2h → 10 (devuelto)
4. Reservar clase B → 9
5. Asistir a clase B → 9 (sin cambio)
6. Reservar clase C → 8
7. No asistir a clase C (1er no-show) → 8 (sin penalización)
8. Reservar clase D → 7
9. No asistir a clase D (2do no-show) → 7 (sin penalización)
10. Reservar clase E → 6
11. No asistir a clase E (3er no-show) → 5 (penalización -1)

**Resultado Esperado**:

- ✅ Balance final: 5 créditos
- 📊 Historial completo visible
- 🔔 Todas las notificaciones recibidas
- 📈 KPIs actualizados correctamente

**Estado**: [ ] Pass [ ] Fail

---

## 📊 Checklist de Validación

### Backend

- [ ] Validación de plan en `createReservation()`
- [ ] Descuento de créditos al confirmar
- [ ] Devolución de créditos al cancelar
- [ ] Ventana de 2 horas implementada
- [ ] Conteo de no-shows funcionando
- [ ] Penalización aplicada al 3er no-show
- [ ] Notificaciones enviadas correctamente
- [ ] Logs informativos en consola

### Frontend

- [ ] Modal muestra plan activo
- [ ] Alerta si no hay plan
- [ ] Modal de reagendamiento valida tiempo
- [ ] Mensaje de crédito devuelto al cancelar
- [ ] Badge de penalización en KPIs
- [ ] Alerta informativa en asistencia
- [ ] Toast messages claros
- [ ] UI/UX fluida

### Notificaciones

- [ ] Email de plan adquirido
- [ ] Email de reserva confirmada
- [ ] Email de cancelación
- [ ] Email de penalización
- [ ] Notificaciones in-app
- [ ] Recordatorios 24h/2h

---

## 🐛 Reporte de Bugs

### Formato de Reporte

```
ID: BUG-001
Fecha: DD/MM/YYYY
Caso de Prueba: TC#.#
Severidad: [CRÍTICA | ALTA | MEDIA | BAJA]
Descripción:
Pasos para Reproducir:
Resultado Esperado:
Resultado Actual:
Logs/Screenshots:
```

---

## ✅ Criterios de Aceptación Global

Para considerar que las mejoras están completamente implementadas:

- [ ] Todos los tests de Suite 1 pasan (Validación Plan)
- [ ] Todos los tests de Suite 2 pasan (Descuento Créditos)
- [ ] Todos los tests de Suite 3 pasan (Cancelación)
- [ ] Todos los tests de Suite 4 pasan (Penalización)
- [ ] Test de integración pasa (Suite 5)
- [ ] Sin errores en consola del backend
- [ ] Sin errores en consola del frontend
- [ ] Todas las notificaciones se envían
- [ ] KPIs reflejan datos correctos

---

## 📝 Notas Adicionales

### Datos de Prueba Sugeridos

**Planes**:

```json
{
  "name": "Plan Básico Test",
  "credits": 10,
  "validityDays": 30,
  "price": 0 // Para pruebas sin pago
}
```

**Clases**:

```json
{
  "title": "Yoga Test",
  "price": 0, // Clase gratuita
  "days": ["Lunes", "Miércoles", "Viernes"],
  "time": "10:00"
}
```

### Comandos Útiles

```bash
# Limpiar base de datos de prueba
mongo gym-pro-funcional --eval "db.reservations.deleteMany({})"

# Ver logs del backend
tail -f backend/logs/app.log

# Reiniciar servicios
npm run dev  # En ambas carpetas
```

---

**Happy Testing! 🎉**
