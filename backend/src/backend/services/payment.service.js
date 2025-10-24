import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Reservation from "../models/Reservation.js";
import Class from "../models/Class.js";
import { createNotification } from "./notification.service.js";

// Inicializar Stripe de manera lazy (solo cuando se necesita)
let stripe = null;

function getStripe() {
  if (!stripe) {
    const stripeKey = (
      process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key"
    ).trim();
    console.log("🔑 Initializing Stripe with key length:", stripeKey.length);
    console.log("🔑 Stripe Key Preview:", stripeKey.substring(0, 20) + "...");
    stripe = new Stripe(stripeKey);
  }
  return stripe;
}

/**
 * Crear un Payment Intent para una reserva
 */
export async function createPaymentIntent({ userId, reservationId, amount }) {
  try {
    // Verificar que la reserva existe y pertenece al usuario
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
    }).populate("classId");

    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    if (reservation.status !== "PENDING_PAYMENT") {
      throw new Error("Esta reserva ya ha sido procesada");
    }

    // Crear el Payment Intent en Stripe
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: "usd",
      metadata: {
        userId: userId.toString(),
        reservationId: reservationId.toString(),
        className: reservation.classId.title,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Crear el registro de pago en la base de datos
    const payment = await Payment.create({
      userId,
      reservationId,
      amount,
      currency: "usd",
      status: "PENDING",
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
    });

    console.log("✅ Payment created:", {
      id: payment._id,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      status: payment.status,
    });

    // Actualizar la reserva con el ID del pago
    reservation.paymentId = payment._id;
    await reservation.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      stripePaymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Confirmar un pago exitoso
 */
export async function confirmPayment({ paymentIntentId }) {
  try {
    console.log("🔍 Looking for payment with intentId:", paymentIntentId);

    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    console.log("🔍 Payment found:", payment ? "YES" : "NO");

    if (!payment) {
      // Intentar buscar todos los pagos para debug
      const allPayments = await Payment.find().limit(5);
      console.log("📊 Total payments in DB:", await Payment.countDocuments());
      console.log(
        "📊 Last 5 payments:",
        allPayments.map((p) => ({
          id: p._id,
          stripeId: p.stripePaymentIntentId,
          status: p.status,
        }))
      );
      throw new Error("Pago no encontrado");
    }

    // Actualizar el estado del pago
    payment.status = "COMPLETED";
    await payment.save();

    // Actualizar la reserva a CONFIRMED
    const reservation = await Reservation.findById(payment.reservationId)
      .populate("classId")
      .populate("userId", "name email");

    if (reservation) {
      reservation.status = "CONFIRMED";
      await reservation.save();

      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      };

      // Crear notificación de pago confirmado
      await createNotification({
        userId: payment.userId,
        type: "PAYMENT_CONFIRMATION",
        title: "💳 Pago Confirmado",
        message: `Tu pago de ${formatCurrency(
          payment.amount
        )} ha sido procesado exitosamente. ¡Gracias por tu compra!`,
        relatedId: payment._id,
        relatedModel: "Payment",
        sentVia: ["EMAIL", "IN_APP"],
        metadata: {
          amount: payment.amount,
          currency: payment.currency,
          className: reservation.classId?.title,
          actionUrl: "http://localhost:5173/reservas",
          actionText: "Ver Mi Reserva",
        },
      });

      // Crear notificación de reserva confirmada
      await createNotification({
        userId: payment.userId,
        type: "RESERVATION_CONFIRMED",
        title: "✅ ¡Reserva Confirmada!",
        message: `Tu reserva para ${reservation.classId?.title} el ${formatDate(
          reservation.date
        )} ha sido confirmada. ¡Te esperamos!`,
        relatedId: reservation._id,
        relatedModel: "Reservation",
        sentVia: ["EMAIL", "IN_APP"],
        metadata: {
          className: reservation.classId?.title,
          date: reservation.date,
          time: reservation.classId?.time,
          actionUrl: "http://localhost:5173/reservas",
          actionText: "Ver Mis Reservas",
        },
      });

      console.log(
        `✅ Notificaciones de pago y reserva enviadas al usuario ${payment.userId}`
      );
    }

    return payment;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
}

/**
 * Procesar un reembolso
 */
export async function refundPayment({ paymentId, reason }) {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error("Pago no encontrado");
    }

    if (payment.status !== "COMPLETED") {
      throw new Error("Solo se pueden reembolsar pagos completados");
    }

    // Crear el reembolso en Stripe
    const refund = await getStripe().refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: "requested_by_customer",
    });

    // Actualizar el pago
    payment.status = "REFUNDED";
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    await payment.save();

    // Actualizar la reserva
    const reservation = await Reservation.findById(payment.reservationId);
    if (reservation) {
      reservation.status = "CANCELLED";
      reservation.cancellationReason = reason;
      reservation.cancelledAt = new Date();
      await reservation.save();
    }

    return payment;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}

/**
 * Obtener el historial de pagos de un usuario
 */
export async function getUserPayments({ userId, limit = 10, offset = 0 }) {
  const payments = await Payment.find({ userId })
    .populate({
      path: "reservationId",
      populate: {
        path: "classId",
        select: "title description time",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);

  const total = await Payment.countDocuments({ userId });

  return {
    payments,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Webhook handler para eventos de Stripe
 */
export async function handleStripeWebhook({ event }) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await confirmPayment({
          paymentIntentId: event.data.object.id,
        });
        break;

      case "payment_intent.payment_failed":
        const failedPayment = await Payment.findOne({
          stripePaymentIntentId: event.data.object.id,
        });
        if (failedPayment) {
          failedPayment.status = "FAILED";
          await failedPayment.save();
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
}
