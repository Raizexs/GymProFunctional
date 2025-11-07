import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getUserPayments,
  handleStripeWebhook,
} from "../services/payment.service.js";

const router = express.Router();

/**
 * POST /api/payments/create-intent
 * Crear un payment intent para una reserva
 */
router.post("/create-intent", async (req, res) => {
  try {
    const { reservationId, amount } = req.body;
    const userId = req.user.id;

    const result = await createPaymentIntent({
      userId,
      reservationId,
      amount,
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/payments/confirm
 * Confirmar un pago exitoso
 */
router.post("/confirm", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await confirmPayment({ paymentIntentId });

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/payments/:id/refund
 * Procesar un reembolso
 */
router.post("/:id/refund", async (req, res) => {
  try {
    const { id: paymentId } = req.params;
    const { reason } = req.body;

    const payment = await refundPayment({ paymentId, reason });

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/payments/history
 * Obtener historial de pagos del usuario
 */
router.get("/history", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const result = await getUserPayments({
      userId,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhook
 * Webhook de Stripe (sin autenticación JWT)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn(
          "⚠️  STRIPE_WEBHOOK_SECRET no configurado - modo desarrollo"
        );
        // En desarrollo, permitir sin verificación
        const event = JSON.parse(req.body.toString());
        await handleStripeWebhook({ event });
        return res.json({ received: true });
      }

      // PRODUCCIÓN: Verificar firma del webhook
      let event;
      try {
        const stripe = await import("stripe").then((m) => m.default);
        const stripeInstance = new stripe.default(
          process.env.STRIPE_SECRET_KEY
        );
        event = stripeInstance.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await handleStripeWebhook({ event });

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
