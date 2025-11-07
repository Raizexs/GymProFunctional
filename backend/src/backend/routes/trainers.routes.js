import { Router } from "express";
import Trainer from "../models/Trainer.js";
import User from "../models/User.js";
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

// Middleware para verificar rol admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Acceso denegado. Solo administradores." });
  }
  next();
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

// POST /api/trainers - Crear nuevo entrenador (solo ADMIN)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, email, bio, avatarUrl, specialties, certifications } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    // Verificar que el email no exista
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res
        .status(409)
        .json({ error: "Ya existe un entrenador con ese email" });
    }

    // Crear usuario TRAINER si no existe
    let trainerUser = await User.findOne({ email });
    if (!trainerUser) {
      const bcrypt = await import("bcryptjs");
      const tempPassword = Math.random().toString(36).slice(-8);

      trainerUser = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(tempPassword, 10),
        role: "TRAINER",
      });

      console.log(
        `✅ Usuario TRAINER creado. Password temporal: ${tempPassword}`
      );
    } else if (trainerUser.role !== "TRAINER") {
      trainerUser.role = "TRAINER";
      await trainerUser.save();
    }

    const trainer = await Trainer.create({
      name,
      email,
      bio: bio || "",
      avatarUrl: avatarUrl || "",
      specialties: normalize(specialties) || [],
      certifications: normalize(certifications) || [],
      rating: 0,
    });

    res.status(201).json({
      trainer: {
        id: trainer._id.toString(),
        name: trainer.name,
        email: trainer.email,
        bio: trainer.bio,
        avatarUrl: trainer.avatarUrl,
        specialties: trainer.specialties,
        certifications: trainer.certifications,
        rating: trainer.rating,
      },
      message: "Entrenador creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating trainer:", error);
    res.status(500).json({ error: "No se pudo crear el entrenador" });
  }
});

// PUT /api/trainers/:id - Actualizar entrenador (solo ADMIN)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, avatarUrl, specialties, certifications, rating } =
      req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    // Si cambia el email, verificar que no exista
    if (email && email !== trainer.email) {
      const existingTrainer = await Trainer.findOne({ email });
      if (existingTrainer) {
        return res
          .status(409)
          .json({ error: "Ya existe un entrenador con ese email" });
      }
    }

    // Actualizar campos
    if (name) trainer.name = name;
    if (email) trainer.email = email;
    if (bio !== undefined) trainer.bio = bio;
    if (avatarUrl !== undefined) trainer.avatarUrl = avatarUrl;
    if (specialties !== undefined) trainer.specialties = normalize(specialties);
    if (certifications !== undefined)
      trainer.certifications = normalize(certifications);
    if (rating !== undefined) trainer.rating = rating;

    await trainer.save();

    // Actualizar usuario asociado si cambió el nombre o email
    if (name || email) {
      await User.findOneAndUpdate(
        { email: trainer.email },
        { $set: { name: trainer.name, email: trainer.email } }
      );
    }

    res.json({
      trainer: {
        id: trainer._id.toString(),
        name: trainer.name,
        email: trainer.email,
        bio: trainer.bio,
        avatarUrl: trainer.avatarUrl,
        specialties: trainer.specialties,
        certifications: trainer.certifications,
        rating: trainer.rating,
      },
      message: "Entrenador actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating trainer:", error);
    res.status(500).json({ error: "No se pudo actualizar el entrenador" });
  }
});

// DELETE /api/trainers/:id - Eliminar entrenador (solo ADMIN)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    // Verificar si tiene clases activas
    const activeClasses = await Class.countDocuments({
      coachId: id,
      date: { $gte: new Date() },
    });

    if (activeClasses > 0) {
      return res.status(400).json({
        error: `No se puede eliminar. El entrenador tiene ${activeClasses} clase(s) activa(s).`,
      });
    }

    await Trainer.findByIdAndDelete(id);

    res.json({
      message: "Entrenador eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ error: "No se pudo eliminar el entrenador" });
  }
});

export default router;
