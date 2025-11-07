import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import Reservation from "../models/Reservation.js";
import {
  createReservation,
  cancelReservationHard,
} from "../services/reservation.service.js";

const router = Router();

router.use(requireAuth);

// Obtener reservas de una clase en una fecha específica (solo admin/trainer)
router.get("/class/:classId/date/:date", async (req, res) => {
  try {
    // Verificar que el usuario sea admin o trainer
    if (req.user.role !== "ADMIN" && req.user.role !== "TRAINER") {
      return res
        .status(403)
        .json({ error: "No tienes permisos para ver estas reservas" });
    }

    const { classId, date } = req.params;

    // Parsear la fecha (formato YYYY-MM-DD)
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const reservations = await Reservation.find({
      classId,
      date: {
        $gte: targetDate,
        $lt: nextDay,
      },
      status: { $in: ["CONFIRMED", "COMPLETED"] },
    })
      .populate("userId", "name email")
      .sort({ createdAt: 1 })
      .lean();

    res.json(reservations);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/me", async (req, res) => {
  const items = await Reservation.find({ userId: req.user.id })
    .populate({
      path: "classId",
      populate: {
        path: "coachId",
        model: "Trainer",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transformar para mantener compatibilidad con el frontend
  const reservations = items.map((item) => ({
    id: item._id.toString(),
    userId: item.userId.toString(),
    classId: item.classId._id.toString(),
    date: item.date,
    status: item.status,
    createdAt: item.createdAt,
    klass: {
      id: item.classId._id.toString(),
      title: item.classId.title,
      description: item.classId.description,
      days: item.classId.days,
      time: item.classId.time,
      durationMin: item.classId.durationMin,
      capacity: item.classId.capacity,
      price: item.classId.price,
      category: item.classId.category,
      difficulty: item.classId.difficulty,
      coachId: item.classId.coachId._id.toString(),
      coach: {
        id: item.classId.coachId._id.toString(),
        name: item.classId.coachId.name,
        bio: item.classId.coachId.bio,
        rating: item.classId.coachId.rating,
        avatarUrl: item.classId.coachId.avatarUrl,
        specialties: item.classId.coachId.specialties,
      },
    },
  }));

  res.json(reservations);
});

router.post("/", async (req, res) => {
  try {
    const { classId, dateISO } = req.body;

    const r = await createReservation({
      userId: req.user.id,
      classId,
      dateISO,
    });

    res.json(r);
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await cancelReservationHard({
      userId: req.user.id,
      reservationId: req.params.id,
    });

    res.json({
      ok: true,
      creditRefunded: result.creditRefunded,
      message: result.creditRefunded
        ? "Reserva cancelada exitosamente. Se ha devuelto 1 crédito a tu plan."
        : "Reserva cancelada exitosamente.",
    });
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
  }
});

// Enviar feedback de una clase completada
router.post("/:id/feedback", async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "El rating debe estar entre 1 y 5" });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation || reservation.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reservation.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ error: "Solo puedes calificar clases completadas" });
    }

    reservation.feedback = {
      rating,
      comment: comment || "",
      submittedAt: new Date(),
    };

    await reservation.save();

    res.json({ ok: true, reservation });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Marcar asistencia (solo admin/trainer)
router.patch("/:id/attendance", async (req, res) => {
  try {
    const { attended } = req.body;

    // Verificar que el usuario sea admin o trainer
    if (req.user.role !== "ADMIN" && req.user.role !== "TRAINER") {
      return res
        .status(403)
        .json({ error: "No tienes permisos para marcar asistencia" });
    }

    const reservation = await Reservation.findById(req.params.id).populate(
      "userId"
    );

    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const wasAttended = reservation.attended;
    reservation.attended = attended;

    // Si se marca como asistido, cambiar el estado a COMPLETED
    if (attended && reservation.status === "CONFIRMED") {
      reservation.status = "COMPLETED";
    }

    // Si se marca como NO asistido (no-show), aplicar penalización
    if (
      !attended &&
      attended !== wasAttended &&
      reservation.status === "CONFIRMED"
    ) {
      // Contar cuántos no-shows tiene el usuario en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const noShowCount = await Reservation.countDocuments({
        userId: reservation.userId._id,
        attended: false,
        status: "COMPLETED",
        date: { $gte: thirtyDaysAgo },
      });

      // Si tiene 3 o más no-shows, descontar crédito adicional como penalización
      if (noShowCount >= 2) {
        const UserPlan = (await import("../models/UserPlan.js")).default;
        const activePlan = await UserPlan.findOne({
          userId: reservation.userId._id,
          status: "ACTIVE",
          expiryDate: { $gt: new Date() },
        });

        if (activePlan && activePlan.creditsRemaining > 0) {
          activePlan.creditsRemaining -= 1;
          await activePlan.save();

          // Crear notificación de penalización
          const { createNotification } = await import(
            "../services/notification.service.js"
          );
          await createNotification({
            userId: reservation.userId._id,
            type: "GENERAL",
            title: "⚠️ Penalización por No-Show",
            message: `Has acumulado ${
              noShowCount + 1
            } ausencias en el último mes. Se ha descontado 1 crédito adicional de tu plan como penalización.`,
            sentVia: ["EMAIL", "IN_APP"],
            metadata: {
              noShowCount: noShowCount + 1,
              creditsRemaining: activePlan.creditsRemaining,
            },
          });

          console.log(
            `⚠️ Penalización aplicada al usuario ${
              reservation.userId._id
            }. No-shows: ${noShowCount + 1}`
          );
        }
      }

      reservation.status = "COMPLETED";
    }

    await reservation.save();

    res.json({ ok: true, reservation });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
