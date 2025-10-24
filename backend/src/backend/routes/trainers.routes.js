import { Router } from "express";
import Trainer from "../models/Trainer.js";
import Class from "../models/Class.js";
import Reservation from "../models/Reservation.js";

const router = Router();

const normalize = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  return [];
};

router.get("/", async (_req, res) => {
  const trainers = await Trainer.find().sort({ name: 1 }).lean();

  const trainersWithClasses = await Promise.all(
    trainers.map(async (trainer) => {
      const classes = await Class.find({ coachId: trainer._id }).lean();
      const classIds = classes.map((c) => c._id);

      const reservationCounts = await Reservation.aggregate([
        {
          $match: {
            classId: { $in: classIds },
            status: "CONFIRMED",
          },
        },
        {
          $group: {
            _id: "$classId",
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = Object.fromEntries(
        reservationCounts.map((r) => [r._id.toString(), r.count])
      );

      const studentsCount = classIds.reduce(
        (a, classId) => a + (countMap[classId.toString()] || 0),
        0
      );

      return {
        id: trainer._id.toString(),
        name: trainer.name,
        bio: trainer.bio,
        avatarUrl: trainer.avatarUrl,
        rating: trainer.rating,
        specialties: normalize(trainer.specialties) ?? [],
        classesCount: classes.length,
        studentsCount,
      };
    })
  );

  res.json(trainersWithClasses);
});

export default router;
