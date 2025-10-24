import mongoose from "mongoose";
import Class from "../models/Class.js";
import Reservation from "../models/Reservation.js";
import { createNotification } from "./notification.service.js";

const dayMap = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Sabado: 6,
};

export async function createReservation({ userId, classId, dateISO }) {
  // Si dateISO ya es un string ISO completo, usarlo directamente
  // Si es solo una fecha (YYYY-MM-DD), agregar la hora
  let date;
  if (dateISO.includes("T")) {
    date = new Date(dateISO);
  } else {
    date = new Date(`${dateISO}T00:00:00.000Z`);
  }

  if (isNaN(date)) throw new Error("Fecha inválida");

  // Intentar usar transacciones si están disponibles (replica set)
  // Si no, hacer operación sin transacción (menos seguro pero funciona en dev)
  const useTransactions = process.env.USE_TRANSACTIONS !== "false";

  if (useTransactions) {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const klass = await Class.findById(classId).session(session);

        if (!klass) throw new Error("Clase no existe");

        const allowed = (klass.days ?? []).some(
          (d) => dayMap[d] === date.getUTCDay()
        );

        if (!allowed) {
          throw new Error(
            `La clase solo se dicta: ${(klass.days ?? []).join(", ")}`
          );
        }

        // Verificar si el usuario ya tiene una reserva para esta clase EN ESTA FECHA ESPECÍFICA
        const existingReservation = await Reservation.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          classId: new mongoose.Types.ObjectId(classId),
          date,
        }).session(session);

        if (existingReservation) {
          // Si existe pero está cancelada, no permitir reservar de nuevo ese día
          if (existingReservation.status === "CANCELLED") {
            const e = new Error(
              "Ya cancelaste una reserva para este día. Por favor selecciona otra fecha."
            );
            e.status = 409;
            throw e;
          }
          // Si existe y está activa (CONFIRMED o PENDING_PAYMENT)
          const e = new Error("Ya tienes una reserva activa para este día");
          e.status = 409;
          throw e;
        }

        const confirmed = await Reservation.countDocuments({
          classId: new mongoose.Types.ObjectId(classId),
          date,
          status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
        }).session(session);

        if (confirmed >= klass.capacity) {
          const e = new Error("No hay cupos disponibles");
          e.status = 409;
          throw e;
        }

        // Determinar el estado inicial según si la clase tiene costo
        const initialStatus = klass.price > 0 ? "PENDING_PAYMENT" : "CONFIRMED";

        const reservation = await Reservation.create(
          [
            {
              userId: new mongoose.Types.ObjectId(userId),
              classId: new mongoose.Types.ObjectId(classId),
              date,
              status: initialStatus,
            },
          ],
          { session }
        );

        await session.commitTransaction();

        // Populate antes de retornar para incluir información de la clase
        const populatedReservation = await Reservation.findById(
          reservation[0]._id
        )
          .populate("classId")
          .populate("userId", "name email");

        // Enviar notificación de confirmación
        await sendReservationNotification(populatedReservation);

        return populatedReservation;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (transactionError) {
      // Si falla la transacción (ej: no hay replica set), intentar sin ella
      console.warn(
        "⚠️  Transacciones no disponibles, usando operación sin transacción"
      );
      return await createReservationWithoutTransaction({
        userId,
        classId,
        date,
      });
    }
  } else {
    return await createReservationWithoutTransaction({ userId, classId, date });
  }
}

async function createReservationWithoutTransaction({ userId, classId, date }) {
  const klass = await Class.findById(classId);

  if (!klass) throw new Error("Clase no existe");

  const allowed = (klass.days ?? []).some(
    (d) => dayMap[d] === date.getUTCDay()
  );

  if (!allowed) {
    throw new Error(`La clase solo se dicta: ${(klass.days ?? []).join(", ")}`);
  }

  // Verificar si el usuario ya tiene una reserva para esta clase EN ESTA FECHA ESPECÍFICA
  const existingReservation = await Reservation.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    classId: new mongoose.Types.ObjectId(classId),
    date,
  });

  if (existingReservation) {
    // Si existe pero está cancelada, no permitir reservar de nuevo ese día
    if (existingReservation.status === "CANCELLED") {
      const e = new Error(
        "Ya cancelaste una reserva para este día. Por favor selecciona otra fecha."
      );
      e.status = 409;
      throw e;
    }
    // Si existe y está activa (CONFIRMED o PENDING_PAYMENT)
    const e = new Error("Ya tienes una reserva activa para este día");
    e.status = 409;
    throw e;
  }

  const confirmed = await Reservation.countDocuments({
    classId: new mongoose.Types.ObjectId(classId),
    date,
    status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
  });

  if (confirmed >= klass.capacity) {
    const e = new Error("No hay cupos disponibles");
    e.status = 409;
    throw e;
  }

  // Determinar el estado inicial según si la clase tiene costo
  const initialStatus = klass.price > 0 ? "PENDING_PAYMENT" : "CONFIRMED";

  const reservation = await Reservation.create({
    userId: new mongoose.Types.ObjectId(userId),
    classId: new mongoose.Types.ObjectId(classId),
    date,
    status: initialStatus,
  });

  // Populate antes de retornar para incluir información de la clase
  await reservation.populate("classId");
  await reservation.populate("userId", "name email");

  // Enviar notificación de confirmación
  await sendReservationNotification(reservation);

  return reservation;
}

export async function cancelReservationHard({ userId, reservationId }) {
  const r = await Reservation.findById(reservationId)
    .populate("classId")
    .populate("userId", "name email");

  if (!r || r.userId.toString() !== userId) {
    throw new Error("Reserva no encontrada");
  }

  if (r.status === "CANCELLED") {
    throw new Error("Esta reserva ya fue cancelada");
  }

  // Cambiar estado a CANCELLED en lugar de eliminar
  r.status = "CANCELLED";
  r.cancelledAt = new Date();
  await r.save();

  // Enviar notificación de cancelación
  await sendCancellationNotification(r);

  return { ok: true };
}

/**
 * Enviar notificación cuando se crea una reserva
 */
async function sendReservationNotification(reservation) {
  try {
    const isPaid = reservation.status === "CONFIRMED";
    const isPending = reservation.status === "PENDING_PAYMENT";

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    if (isPaid) {
      // Clase gratuita confirmada inmediatamente
      await createNotification({
        userId: reservation.userId._id,
        type: "RESERVATION_CONFIRMED",
        title: "✅ Reserva Confirmada",
        message: `Tu reserva para ${reservation.classId.title} el ${formatDate(
          reservation.date
        )} ha sido confirmada. ¡Nos vemos en el gimnasio!`,
        relatedId: reservation._id,
        relatedModel: "Reservation",
        sentVia: ["EMAIL", "IN_APP"],
        metadata: {
          className: reservation.classId.title,
          date: reservation.date,
          actionUrl: "http://localhost:5173/reservas",
          actionText: "Ver Mis Reservas",
        },
      });
    } else if (isPending) {
      // Clase de pago - pendiente de pago
      await createNotification({
        userId: reservation.userId._id,
        type: "GENERAL",
        title: "⏳ Reserva Pendiente de Pago",
        message: `Tu reserva para ${reservation.classId.title} el ${formatDate(
          reservation.date
        )} está pendiente. Completa el pago para confirmarla.`,
        relatedId: reservation._id,
        relatedModel: "Reservation",
        sentVia: ["IN_APP"],
        metadata: {
          className: reservation.classId.title,
          date: reservation.date,
          price: reservation.classId.price,
        },
      });
    }

    console.log(
      `✅ Notificación de reserva enviada al usuario ${reservation.userId._id}`
    );
  } catch (error) {
    console.error("❌ Error enviando notificación de reserva:", error.message);
    // No lanzar error para no bloquear la creación de la reserva
  }
}

/**
 * Enviar notificación cuando se cancela una reserva
 */
async function sendCancellationNotification(reservation) {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    await createNotification({
      userId: reservation.userId._id,
      type: "RESERVATION_CANCELLED",
      title: "❌ Reserva Cancelada",
      message: `Tu reserva para ${reservation.classId.title} el ${formatDate(
        reservation.date
      )} ha sido cancelada.`,
      relatedId: reservation._id,
      relatedModel: "Reservation",
      sentVia: ["EMAIL", "IN_APP"],
      metadata: {
        className: reservation.classId.title,
        date: reservation.date,
        actionUrl: "http://localhost:5173/clases",
        actionText: "Ver Clases Disponibles",
      },
    });

    console.log(
      `✅ Notificación de cancelación enviada al usuario ${reservation.userId._id}`
    );
  } catch (error) {
    console.error(
      "❌ Error enviando notificación de cancelación:",
      error.message
    );
    // No lanzar error para no bloquear la cancelación
  }
}
