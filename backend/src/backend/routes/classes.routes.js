import { Router } from "express";
import Class from "../models/Class.js";
import Reservation from "../models/Reservation.js";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await Class.find()
    .sort({ title: 1 })
    .populate("coachId", "name bio rating avatarUrl specialties")
    .lean();

  // Obtener el conteo de reservas ACTIVAS (CONFIRMED o PENDING_PAYMENT)
  // solo para fechas futuras o de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Inicio del día de hoy

  const reservationCounts = await Reservation.aggregate([
    {
      $match: {
        status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
        date: { $gte: today },
      },
    },
    {
      $group: {
        _id: "$classId",
        count: { $sum: 1 },
      },
    },
  ]);

  // Crear un mapa de classId -> count para acceso rápido
  const countMap = {};
  reservationCounts.forEach((item) => {
    countMap[item._id.toString()] = item.count;
  });

  // Transformar para mantener compatibilidad con el frontend
  const classes = data.map((cls) => ({
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
    reservedCount: countMap[cls._id.toString()] || 0,
    coachId: cls.coachId._id.toString(),
    coach: {
      id: cls.coachId._id.toString(),
      name: cls.coachId.name,
      bio: cls.coachId.bio,
      rating: cls.coachId.rating,
      avatarUrl: cls.coachId.avatarUrl,
      specialties: cls.coachId.specialties,
    },
    createdAt: cls.createdAt,
    updatedAt: cls.updatedAt,
  }));

  res.json(classes);
});

export default router;
