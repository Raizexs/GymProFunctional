import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import Plan from "../models/Plan.js";
import UserPlan from "../models/UserPlan.js";
import Payment from "../models/Payment.js";

const router = Router();

router.use(requireAuth);

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
      status: { $in: ["ACTIVE", "EXPIRED"] },
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
 * Comprar un plan
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

    // Crear el pago
    const payment = new Payment({
      userId: req.user.id,
      amount: plan.price,
      status: "COMPLETED", // En producción esto sería PENDING hasta procesar con Stripe
      method: "CARD",
      description: `Plan ${plan.name}`,
    });

    await payment.save();

    // Crear la suscripción
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + plan.validityDays);

    const userPlan = new UserPlan({
      userId: req.user.id,
      planId: plan._id,
      status: "ACTIVE",
      creditsRemaining: plan.credits,
      creditsTotal: plan.credits,
      startDate,
      expiryDate,
      purchasePrice: plan.price,
      paymentId: payment._id,
    });

    await userPlan.save();

    const populatedUserPlan = await UserPlan.findById(userPlan._id).populate(
      "planId"
    );

    res.json({
      ok: true,
      userPlan: populatedUserPlan,
      payment,
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
