import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import Reservation from "../models/Reservation.js";
import Class from "../models/Class.js";
import Trainer from "../models/Trainer.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", async (req, res) => {
  const [reservedCount, classesCount, trainersCount, next] = await Promise.all([
    Reservation.countDocuments({
      userId: req.user.id,
      status: "CONFIRMED",
    }),
    Class.countDocuments(),
    Trainer.countDocuments(),
    Reservation.findOne({
      userId: req.user.id,
      status: "CONFIRMED",
    })
      .sort({ date: 1 })
      .populate({
        path: "classId",
        populate: {
          path: "coachId",
          model: "Trainer",
        },
      })
      .lean(),
  ]);

  let nextReservation = null;
  if (next) {
    nextReservation = {
      id: next._id.toString(),
      userId: next.userId.toString(),
      classId: next.classId._id.toString(),
      date: next.date,
      status: next.status,
      createdAt: next.createdAt,
      klass: {
        id: next.classId._id.toString(),
        title: next.classId.title,
        description: next.classId.description,
        days: next.classId.days,
        time: next.classId.time,
        durationMin: next.classId.durationMin,
        capacity: next.classId.capacity,
        coachId: next.classId.coachId._id.toString(),
        coach: {
          id: next.classId.coachId._id.toString(),
          name: next.classId.coachId.name,
          bio: next.classId.coachId.bio,
          rating: next.classId.coachId.rating,
          avatarUrl: next.classId.coachId.avatarUrl,
          specialties: next.classId.coachId.specialties,
        },
      },
    };
  }

  res.json({
    reservedCount,
    classesCount,
    trainersCount,
    nextReservation,
  });
});

export default router;
