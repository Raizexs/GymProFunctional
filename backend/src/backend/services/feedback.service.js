import Feedback from "../models/Feedback.js";
import Class from "../models/Class.js";
import Trainer from "../models/Trainer.js";
import Reservation from "../models/Reservation.js";
import { createNotification } from "./notification.service.js";
import logger from "../config/logger.js";

/**
 * Crear un nuevo feedback
 */
export async function createFeedback({
  userId,
  classId,
  reservationId,
  rating,
  comment,
  categories,
  isAnonymous = false,
}) {
  try {
    // Verificar que la clase existe
    const classItem = await Class.findById(classId).populate("coachId");
    if (!classItem) {
      throw new Error("Clase no encontrada");
    }

    // Verificar que el usuario haya asistido a la clase (si se proporciona reservationId)
    if (reservationId) {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        userId,
        classId,
        status: "COMPLETED",
        attended: true,
      });

      if (!reservation) {
        throw new Error(
          "Solo puedes dejar feedback de clases a las que hayas asistido"
        );
      }
    }

    // Verificar si ya existe feedback de este usuario para esta clase
    const existingFeedback = await Feedback.findOne({ userId, classId });
    if (existingFeedback) {
      throw new Error("Ya has dejado feedback para esta clase");
    }

    // Crear feedback
    const feedback = await Feedback.create({
      userId,
      classId,
      reservationId,
      rating,
      comment: comment || "",
      categories,
      isAnonymous,
      status: "PUBLISHED",
    });

    // Actualizar rating del entrenador
    await updateTrainerRating(classItem.coachId._id);

    // Notificar al entrenador
    if (!isAnonymous && classItem.coachId.email) {
      await createNotification({
        userId: classItem.coachId._id,
        type: "NEW_FEEDBACK",
        title: "🌟 Nuevo Feedback Recibido",
        message: `Has recibido un feedback de ${rating} estrellas para tu clase "${classItem.title}"`,
        relatedId: feedback._id,
        relatedModel: "Feedback",
        sentVia: ["EMAIL", "IN_APP"],
        metadata: {
          rating,
          className: classItem.title,
        },
      });
    }

    logger.info(`Feedback creado para clase ${classId}`, {
      feedbackId: feedback._id,
      rating,
    });

    return await Feedback.findById(feedback._id)
      .populate("userId", "name avatar")
      .populate("classId", "title description");
  } catch (error) {
    logger.error("Error creando feedback:", error);
    throw error;
  }
}

/**
 * Obtener feedbacks con filtros (para admin/trainer)
 */
export async function getAllFeedbacks({
  page = 1,
  limit = 20,
  classId,
  trainerId,
  status,
  minRating,
  maxRating,
}) {
  try {
    const query = {};

    if (classId) {
      query.classId = classId;
    }

    if (trainerId) {
      const classes = await Class.find({ coachId: trainerId }).select("_id");
      const classIds = classes.map((c) => c._id);
      query.classId = { $in: classIds };
    }

    if (status) {
      query.status = status;
    }

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = minRating;
      if (maxRating) query.rating.$lte = maxRating;
    }

    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .populate("userId", "name avatar email")
        .populate("classId", "title description")
        .populate("response.respondedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Feedback.countDocuments(query),
    ]);

    // Ocultar datos del usuario si es anónimo
    const sanitizedFeedbacks = feedbacks.map((fb) => {
      if (fb.isAnonymous) {
        return {
          ...fb,
          userId: {
            name: "Usuario Anónimo",
            avatar: null,
          },
        };
      }
      return fb;
    });

    return {
      feedbacks: sanitizedFeedbacks,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + feedbacks.length < total,
    };
  } catch (error) {
    logger.error("Error obteniendo feedbacks:", error);
    throw error;
  }
}

/**
 * Obtener feedbacks de un usuario
 */
export async function getUserFeedbacks({ userId, page = 1, limit = 10 }) {
  try {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find({ userId })
        .populate("classId", "title description")
        .populate("response.respondedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Feedback.countDocuments({ userId }),
    ]);

    return {
      feedbacks,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Error obteniendo feedbacks del usuario:", error);
    throw error;
  }
}

/**
 * Obtener feedbacks de una clase
 */
export async function getClassFeedbacks({ classId, page = 1, limit = 10 }) {
  try {
    const skip = (page - 1) * limit;

    const [feedbacks, total, stats] = await Promise.all([
      Feedback.find({ classId, status: "PUBLISHED" })
        .populate("userId", "name avatar")
        .populate("response.respondedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Feedback.countDocuments({ classId, status: "PUBLISHED" }),
      Feedback.aggregate([
        { $match: { classId: classId, status: "PUBLISHED" } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
            ratings: {
              $push: "$rating",
            },
          },
        },
      ]),
    ]);

    // Calcular distribución de ratings
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratings) {
      stats[0].ratings.forEach((r) => {
        distribution[r] = (distribution[r] || 0) + 1;
      });
    }

    // Ocultar datos del usuario si es anónimo
    const sanitizedFeedbacks = feedbacks.map((fb) => {
      if (fb.isAnonymous) {
        return {
          ...fb,
          userId: {
            name: "Usuario Anónimo",
            avatar: null,
          },
        };
      }
      return fb;
    });

    return {
      feedbacks: sanitizedFeedbacks,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: {
        avgRating: stats[0]?.avgRating || 0,
        totalReviews: stats[0]?.count || 0,
        distribution,
      },
    };
  } catch (error) {
    logger.error("Error obteniendo feedbacks de clase:", error);
    throw error;
  }
}

/**
 * Responder a un feedback (admin/trainer)
 */
export async function respondToFeedback({
  feedbackId,
  respondedBy,
  responseText,
}) {
  try {
    const feedback = await Feedback.findById(feedbackId).populate("userId");

    if (!feedback) {
      throw new Error("Feedback no encontrado");
    }

    if (feedback.response?.text) {
      throw new Error("Este feedback ya tiene una respuesta");
    }

    feedback.response = {
      text: responseText,
      respondedBy,
      respondedAt: new Date(),
    };

    await feedback.save();

    // Notificar al usuario que dejó el feedback
    if (feedback.userId && !feedback.isAnonymous) {
      await createNotification({
        userId: feedback.userId._id,
        type: "FEEDBACK_RESPONSE",
        title: "💬 Respuesta a tu Feedback",
        message: `Han respondido a tu feedback. Ve la respuesta en los detalles.`,
        relatedId: feedback._id,
        relatedModel: "Feedback",
        sentVia: ["EMAIL", "IN_APP"],
      });
    }

    logger.info(`Respuesta agregada al feedback ${feedbackId}`);

    return await Feedback.findById(feedbackId)
      .populate("userId", "name avatar")
      .populate("classId", "title")
      .populate("response.respondedBy", "name role");
  } catch (error) {
    logger.error("Error respondiendo feedback:", error);
    throw error;
  }
}

/**
 * Actualizar estado de feedback (admin)
 */
export async function updateFeedbackStatus({ feedbackId, status }) {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    )
      .populate("userId", "name avatar")
      .populate("classId", "title");

    if (!feedback) {
      throw new Error("Feedback no encontrado");
    }

    logger.info(`Estado de feedback ${feedbackId} actualizado a ${status}`);

    return feedback;
  } catch (error) {
    logger.error("Error actualizando estado de feedback:", error);
    throw error;
  }
}

/**
 * Eliminar feedback (usuario o admin)
 */
export async function deleteFeedback({ feedbackId, userId, isAdmin = false }) {
  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      throw new Error("Feedback no encontrado");
    }

    // Solo el autor o un admin pueden eliminar
    if (!isAdmin && feedback.userId.toString() !== userId.toString()) {
      throw new Error("No tienes permiso para eliminar este feedback");
    }

    await Feedback.findByIdAndDelete(feedbackId);

    // Actualizar rating del entrenador
    const classItem = await Class.findById(feedback.classId);
    if (classItem) {
      await updateTrainerRating(classItem.coachId);
    }

    logger.info(`Feedback ${feedbackId} eliminado`);

    return { success: true };
  } catch (error) {
    logger.error("Error eliminando feedback:", error);
    throw error;
  }
}

/**
 * Actualizar rating promedio del entrenador
 */
async function updateTrainerRating(trainerId) {
  try {
    // Obtener todas las clases del entrenador
    const classes = await Class.find({ coachId: trainerId }).select("_id");
    const classIds = classes.map((c) => c._id);

    // Calcular rating promedio de todos los feedbacks
    const stats = await Feedback.aggregate([
      {
        $match: {
          classId: { $in: classIds },
          status: "PUBLISHED",
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats[0]) {
      await Trainer.findByIdAndUpdate(trainerId, {
        rating: Math.round(stats[0].avgRating * 10) / 10, // Redondear a 1 decimal
      });

      logger.info(
        `Rating del entrenador ${trainerId} actualizado: ${stats[0].avgRating}`
      );
    }
  } catch (error) {
    logger.error("Error actualizando rating del entrenador:", error);
  }
}

/**
 * Marcar feedback como útil
 */
export async function markFeedbackHelpful({ feedbackId }) {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!feedback) {
      throw new Error("Feedback no encontrado");
    }

    return feedback;
  } catch (error) {
    logger.error("Error marcando feedback como útil:", error);
    throw error;
  }
}
