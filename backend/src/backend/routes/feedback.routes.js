import { Router } from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getUserFeedbacks,
  getClassFeedbacks,
  respondToFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  markFeedbackHelpful,
} from "../services/feedback.service.js";

const router = Router();

// Middleware para verificar rol admin/trainer
const requireAdminOrTrainer = (req, res, next) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "TRAINER") {
    return res
      .status(403)
      .json({ error: "Acceso denegado. Solo admin o entrenadores." });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado. Solo admin." });
  }
  next();
};

/**
 * POST /api/feedback
 * Crear un nuevo feedback
 */
router.post("/", async (req, res) => {
  try {
    const { classId, reservationId, rating, comment, categories, isAnonymous } =
      req.body;
    const userId = req.user.id;

    if (!classId || !rating) {
      return res.status(400).json({ error: "classId y rating son requeridos" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "El rating debe estar entre 1 y 5" });
    }

    const feedback = await createFeedback({
      userId,
      classId,
      reservationId,
      rating,
      comment,
      categories,
      isAnonymous: isAnonymous || false,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(400).json({ error: error.message || "Error al crear feedback" });
  }
});

/**
 * GET /api/feedback
 * Obtener todos los feedbacks (admin/trainer)
 */
router.get("/", requireAdminOrTrainer, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      classId,
      trainerId,
      status,
      minRating,
      maxRating,
    } = req.query;

    // Si es entrenador, solo puede ver sus propios feedbacks
    let trainerIdFilter = trainerId;
    if (req.user.role === "TRAINER") {
      // Buscar el ID del trainer asociado al usuario
      const Trainer = (await import("../models/Trainer.js")).default;
      const trainer = await Trainer.findOne({ email: req.user.email });
      if (trainer) {
        trainerIdFilter = trainer._id.toString();
      }
    }

    const result = await getAllFeedbacks({
      page: parseInt(page),
      limit: parseInt(limit),
      classId,
      trainerId: trainerIdFilter,
      status,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting feedbacks:", error);
    res.status(500).json({ error: "Error al obtener feedbacks" });
  }
});

/**
 * GET /api/feedback/my
 * Obtener feedbacks del usuario actual
 */
router.get("/my", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const result = await getUserFeedbacks({
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting user feedbacks:", error);
    res.status(500).json({ error: "Error al obtener tus feedbacks" });
  }
});

/**
 * GET /api/feedback/class/:classId
 * Obtener feedbacks de una clase específica
 */
router.get("/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getClassFeedbacks({
      classId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting class feedbacks:", error);
    res.status(500).json({ error: "Error al obtener feedbacks de la clase" });
  }
});

/**
 * POST /api/feedback/:id/respond
 * Responder a un feedback (admin/trainer)
 */
router.post("/:id/respond", requireAdminOrTrainer, async (req, res) => {
  try {
    const { id: feedbackId } = req.params;
    const { responseText } = req.body;
    const respondedBy = req.user.id;

    if (!responseText) {
      return res
        .status(400)
        .json({ error: "El texto de respuesta es requerido" });
    }

    const feedback = await respondToFeedback({
      feedbackId,
      respondedBy,
      responseText,
    });

    res.json(feedback);
  } catch (error) {
    console.error("Error responding to feedback:", error);
    res
      .status(400)
      .json({ error: error.message || "Error al responder feedback" });
  }
});

/**
 * PATCH /api/feedback/:id/status
 * Actualizar estado de feedback (admin)
 */
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id: feedbackId } = req.params;
    const { status } = req.body;

    if (!["PENDING", "REVIEWED", "PUBLISHED", "HIDDEN"].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const feedback = await updateFeedbackStatus({ feedbackId, status });

    res.json(feedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res
      .status(400)
      .json({ error: error.message || "Error al actualizar estado" });
  }
});

/**
 * POST /api/feedback/:id/helpful
 * Marcar feedback como útil
 */
router.post("/:id/helpful", async (req, res) => {
  try {
    const { id: feedbackId } = req.params;

    const feedback = await markFeedbackHelpful({ feedbackId });

    res.json({ helpfulCount: feedback.helpfulCount });
  } catch (error) {
    console.error("Error marking feedback as helpful:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/feedback/:id
 * Eliminar un feedback
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id: feedbackId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    const result = await deleteFeedback({ feedbackId, userId, isAdmin });

    res.json(result);
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res
      .status(400)
      .json({ error: error.message || "Error al eliminar feedback" });
  }
});

export default router;
