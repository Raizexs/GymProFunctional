import { Router } from "express";
import Class from "../models/Class.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Trainer from "../models/Trainer.js";

const router = Router();

console.log("📚 Trainer Classes Router cargado");

// GET /api/trainer/my-classes - Obtener clases del entrenador con sus reservas
router.get("/my-classes", async (req, res) => {
  console.log("🎯 Endpoint /my-classes llamado");
  console.log("👤 Usuario:", req.user);
  try {
    const userId = req.user.id; // Cambiado de userId a id
    const userRole = req.user.role;

    // Verificar que el usuario sea TRAINER o ADMIN
    if (userRole !== "TRAINER" && userRole !== "ADMIN") {
      return res.status(403).json({
        error:
          "Acceso denegado. Solo los entrenadores y administradores pueden acceder a esta información.",
      });
    }

    // Buscar el usuario para obtener su email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Buscar el entrenador por email
    const trainer = await Trainer.findOne({ email: user.email });

    // Si es ADMIN y no tiene perfil de trainer, obtener todas las clases
    let classes;
    if (userRole === "ADMIN" && !trainer) {
      // Admin sin perfil de trainer: obtener TODAS las clases
      classes = await Class.find()
        .populate("coachId", "name bio rating avatarUrl specialties")
        .lean();
    } else if (!trainer) {
      return res.status(404).json({
        error: "No se encontró un perfil de entrenador asociado",
      });
    } else {
      // Obtener todas las clases del entrenador específico
      classes = await Class.find({ coachId: trainer._id })
        .populate("coachId", "name bio rating avatarUrl specialties")
        .lean();
    }

    // Para cada clase, obtener todas sus reservas activas con información del usuario
    const classesWithReservations = await Promise.all(
      classes.map(async (cls) => {
        // Obtener reservas activas (CONFIRMED y PENDING_PAYMENT) ordenadas por fecha
        const reservations = await Reservation.find({
          classId: cls._id,
          status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
        })
          .populate("userId", "name email phone avatar")
          .sort({ date: 1, createdAt: 1 })
          .lean();

        // Formatear las reservas
        const formattedReservations = reservations.map((res) => ({
          id: res._id.toString(),
          date: res.date,
          status: res.status,
          attended: res.attended,
          createdAt: res.createdAt,
          user: {
            id: res.userId._id.toString(),
            name: res.userId.name,
            email: res.userId.email,
            phone: res.userId.phone || "No registrado",
            avatar: res.userId.avatar,
          },
        }));

        return {
          id: cls._id.toString(),
          title: cls.title,
          description: cls.description,
          days: cls.days,
          time: cls.time,
          durationMin: cls.durationMin,
          capacity: cls.capacity,
          price: cls.price,
          category: cls.category,
          difficulty: cls.difficulty,
          reservations: formattedReservations,
          totalReservations: formattedReservations.length,
          confirmedReservations: formattedReservations.filter(
            (r) => r.status === "CONFIRMED"
          ).length,
          pendingPaymentReservations: formattedReservations.filter(
            (r) => r.status === "PENDING_PAYMENT"
          ).length,
        };
      })
    );

    res.json({
      trainer: trainer
        ? {
            id: trainer._id.toString(),
            name: trainer.name,
            email: trainer.email,
            bio: trainer.bio,
            rating: trainer.rating,
            avatarUrl: trainer.avatarUrl,
            specialties: trainer.specialties,
          }
        : {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            bio: "Administrador del sistema",
            rating: 5,
            avatarUrl: null,
            specialties: ["Administración", "Gestión"],
          },
      classes: classesWithReservations,
    });
  } catch (error) {
    console.error("Error al obtener clases del entrenador:", error);
    res.status(500).json({
      error: "Error al obtener clases del entrenador",
      details: error.message,
    });
  }
});

export default router;
