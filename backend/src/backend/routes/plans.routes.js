import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import Plan from "../models/Plan.js";
import UserPlan from "../models/UserPlan.js";
import Payment from "../models/Payment.js";
import { createNotification } from "../services/notification.service.js";

const router = Router();

// NO usar requireAuth aquí porque ya se aplica en server.js

/**
 * GET /api/plans
 * Obtener todos los planes activos
 */
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/plans/my
 * Obtener planes del usuario actual
 */
router.get("/my", async (req, res) => {
  try {
    const userPlans = await UserPlan.find({
      userId: req.user.id,
      status: { $in: ["PENDING_PAYMENT", "ACTIVE", "EXPIRED"] },
    })
      .populate("planId")
      .sort({ createdAt: -1 });

    res.json(userPlans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/plans/:id/purchase
 * Iniciar compra de un plan (crear pago pendiente)
 */
router.post("/:id/purchase", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    // Verificar si ya tiene un plan activo
    const existingActivePlan = await UserPlan.findOne({
      userId: req.user.id,
      status: "ACTIVE",
      expiryDate: { $gt: new Date() },
    });

    if (existingActivePlan) {
      return res.status(400).json({
        error:
          "Ya tienes un plan activo. Cancela tu plan actual antes de comprar uno nuevo.",
      });
    }

    // Crear el UserPlan en estado PENDING_PAYMENT
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.validityDays);

    const userPlan = new UserPlan({
      userId: req.user.id,
      planId: plan._id,
      status: "PENDING_PAYMENT",
      creditsRemaining: plan.credits,
      creditsTotal: plan.credits,
      startDate,
      expiryDate,
      purchasePrice: plan.price,
    });

    await userPlan.save();

    // Crear el pago en estado PENDING
    const payment = new Payment({
      userId: req.user.id,
      userPlanId: userPlan._id,
      amount: plan.price,
      status: "PENDING",
      method: "CARD",
      description: `Plan ${plan.name}`,
    });

    await payment.save();

    // Actualizar el userPlan con el paymentId
    userPlan.paymentId = payment._id;
    await userPlan.save();

    const populatedUserPlan = await UserPlan.findById(userPlan._id).populate(
      "planId"
    );

    res.json({
      ok: true,
      userPlan: populatedUserPlan,
      payment,
      requiresPayment: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/plans/my/:id/cancel
 * Cancelar plan activo
 */
router.patch("/my/:id/cancel", async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const userPlan = await UserPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!userPlan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    if (userPlan.status === "CANCELLED") {
      return res.status(400).json({ error: "El plan ya está cancelado" });
    }

    userPlan.status = "CANCELLED";
    userPlan.cancelledAt = new Date();
    userPlan.cancellationReason =
      cancellationReason || "Sin motivo especificado";
    userPlan.autoRenew = false;

    await userPlan.save();

    res.json({ ok: true, userPlan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/plans/payments/:paymentId/confirm
 * Confirmar pago de un plan
 */
router.post("/payments/:paymentId/confirm", async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      userId: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }

    if (payment.status === "COMPLETED") {
      return res.status(400).json({ error: "Este pago ya fue procesado" });
    }

    // Actualizar el pago a COMPLETED
    payment.status = "COMPLETED";
    await payment.save();

    // Actualizar el UserPlan a ACTIVE
    const userPlan = await UserPlan.findById(payment.userPlanId).populate(
      "planId"
    );

    if (userPlan) {
      userPlan.status = "ACTIVE";
      await userPlan.save();

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      // Crear notificación de compra confirmada
      await createNotification({
        userId: payment.userId,
        type: "PLAN_PURCHASED",
        title: "🎉 ¡Plan Adquirido Exitosamente!",
        message: `Has adquirido el plan ${
          userPlan.planId.name
        } por ${formatCurrency(payment.amount)}. Tu plan está activo y tienes ${
          userPlan.creditsTotal
        } créditos disponibles.`,
        relatedId: userPlan._id,
        relatedModel: "UserPlan",
        sentVia: ["EMAIL", "IN_APP"],
        metadata: {
          planName: userPlan.planId.name,
          amount: payment.amount,
          credits: userPlan.creditsTotal,
          expiryDate: userPlan.expiryDate,
          actionUrl: "http://localhost:5173/planes",
          actionText: "Ver Mi Plan",
        },
      });

      console.log(
        `✅ Notificación de plan adquirido enviada al usuario ${payment.userId}`
      );
    }

    res.json({
      ok: true,
      payment,
      userPlan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/plans (Admin only)
 * Crear un nuevo plan
 */
router.post("/", async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const plan = new Plan(req.body);
    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/plans/:id (Admin only)
 * Actualizar un plan
 */
router.patch("/:id", async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
