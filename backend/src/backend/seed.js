import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import Trainer from "./models/Trainer.js";
import Class from "./models/Class.js";
import Reservation from "./models/Reservation.js";
import Plan from "./models/Plan.js";
import connectDB from "./config/database.js";

const trainersData = [
  {
    name: "Carlos Martínez",
    email: "trainer@gym.com", // Mismo email que el usuario TRAINER
    bio: "Entrenador certificado con 10 años de experiencia en fitness funcional",
    rating: 4.8,
    avatarUrl:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop",
    specialties: ["CrossFit", "HIIT", "Fuerza"],
    certifications: [
      { name: "CrossFit Level 2", institution: "CrossFit Inc", year: 2020 },
      { name: "Personal Trainer", institution: "NSCA", year: 2015 },
    ],
    hourlyRate: 50,
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      avgRating: 4.8,
      totalEarnings: 0,
    },
  },
  {
    name: "Ana López",
    email: "ana@gym.com",
    bio: "Especialista en yoga y movilidad con certificación internacional",
    rating: 4.9,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    specialties: ["Yoga", "Pilates", "Flexibilidad"],
    certifications: [
      { name: "RYT 500", institution: "Yoga Alliance", year: 2018 },
      { name: "Pilates Mat", institution: "STOTT Pilates", year: 2019 },
    ],
    hourlyRate: 45,
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      avgRating: 4.9,
      totalEarnings: 0,
    },
  },
  {
    name: "Miguel Torres",
    email: "miguel@gym.com",
    bio: "Experto en entrenamiento de resistencia y acondicionamiento físico",
    rating: 4.7,
    avatarUrl:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
    specialties: ["Cardio", "Resistencia", "Running"],
    certifications: [
      { name: "Running Coach", institution: "RRCA", year: 2017 },
      { name: "Strength & Conditioning", institution: "NSCA", year: 2016 },
    ],
    hourlyRate: 40,
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      avgRating: 4.7,
      totalEarnings: 0,
    },
  },
  {
    name: "Laura Sánchez",
    email: "laura@gym.com",
    bio: "Entrenadora personal especializada en rehabilitación y prevención",
    rating: 5.0,
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    specialties: ["Rehabilitación", "Funcional", "Core"],
    certifications: [
      { name: "Corrective Exercise", institution: "NASM", year: 2019 },
      { name: "Functional Training", institution: "ACE", year: 2018 },
    ],
    hourlyRate: 55,
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      avgRating: 5.0,
      totalEarnings: 0,
    },
  },
];

async function seed() {
  try {
    await connectDB();

    console.log("🗑️  Limpiando base de datos...");
    await User.deleteMany({});
    await Trainer.deleteMany({});
    await Class.deleteMany({});
    await Reservation.deleteMany({});
    await Plan.deleteMany({});

    console.log("👤 Creando usuarios...");
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@gym.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      phone: "+1234567890",
      membershipType: "VIP",
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        language: "es",
      },
      stats: {
        totalClasses: 0,
        totalSpent: 0,
      },
    });

    const regularUser = await User.create({
      name: "John Doe",
      email: "user@gym.com",
      passwordHash: await bcrypt.hash("user123", 10),
      role: "USER",
      phone: "+0987654321",
      membershipType: "BASIC",
      membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        language: "es",
      },
      stats: {
        totalClasses: 0,
        totalSpent: 0,
      },
    });

    const trainerUser = await User.create({
      name: "Carlos Martínez",
      email: "trainer@gym.com",
      passwordHash: await bcrypt.hash("trainer123", 10),
      role: "TRAINER",
      phone: "+1122334455",
      membershipType: "VIP",
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        language: "es",
      },
      stats: {
        totalClasses: 0,
        totalSpent: 0,
      },
    });

    console.log("👨‍🏫 Creando entrenadores...");
    const trainers = await Trainer.insertMany(trainersData);

    console.log("📚 Creando clases...");
    const classesData = [
      {
        title: "CrossFit Matutino",
        description: "Entrenamiento de alta intensidad para comenzar el día",
        days: ["Lunes", "Miércoles", "Viernes"],
        time: "07:00",
        durationMin: 60,
        capacity: 15,
        price: 15000,
        category: "CROSSFIT",
        difficulty: "INTERMEDIATE",
        coachId: trainers[0]._id,
        active: true,
        tags: ["crossfit", "hiit", "fuerza"],
      },
      {
        title: "Yoga Flow",
        description:
          "Secuencias fluidas para mejorar flexibilidad y equilibrio",
        days: ["Martes", "Jueves"],
        time: "18:00",
        durationMin: 60,
        capacity: 20,
        price: 12000,
        category: "YOGA",
        difficulty: "BEGINNER",
        coachId: trainers[1]._id,
        active: true,
        tags: ["yoga", "flexibilidad", "relajación"],
      },
      {
        title: "HIIT Intenso",
        description: "Intervalos de alta intensidad para quemar calorías",
        days: ["Lunes", "Miércoles", "Viernes"],
        time: "19:00",
        durationMin: 45,
        capacity: 12,
        price: 18000,
        category: "CARDIO",
        difficulty: "ADVANCED",
        coachId: trainers[0]._id,
        active: true,
        tags: ["hiit", "cardio", "intenso"],
      },
      {
        title: "Cardio Resistance",
        description: "Combinación de cardio y entrenamiento de resistencia",
        days: ["Martes", "Jueves", "Sábado"],
        time: "08:00",
        durationMin: 50,
        capacity: 15,
        price: 14000,
        category: "STRENGTH",
        difficulty: "INTERMEDIATE",
        coachId: trainers[2]._id,
        active: true,
        tags: ["cardio", "resistencia", "fuerza"],
      },
      {
        title: "Pilates Core",
        description: "Fortalecimiento del core y mejora de postura",
        days: ["Miércoles", "Viernes"],
        time: "17:00",
        durationMin: 55,
        capacity: 12,
        price: 13000,
        category: "PILATES",
        difficulty: "BEGINNER",
        coachId: trainers[1]._id,
        active: true,
        tags: ["pilates", "core", "postura"],
      },
      {
        title: "Funcional Pro",
        description: "Movimientos funcionales para el día a día",
        days: ["Lunes", "Jueves"],
        time: "20:00",
        durationMin: 60,
        capacity: 18,
        price: 16000,
        category: "OTHER",
        difficulty: "INTERMEDIATE",
        coachId: trainers[3]._id,
        active: true,
        tags: ["funcional", "movilidad", "fuerza"],
      },
    ];

    const classes = await Class.insertMany(classesData);

    console.log("📅 Creando reservas de ejemplo...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Reservation.insertMany([
      {
        userId: regularUser._id,
        classId: classes[0]._id,
        date: tomorrow,
        status: "CONFIRMED",
        attended: false,
      },
      {
        userId: regularUser._id,
        classId: classes[1]._id,
        date: nextWeek,
        status: "CONFIRMED",
        attended: false,
      },
      {
        userId: adminUser._id,
        classId: classes[2]._id,
        date: tomorrow,
        status: "CONFIRMED",
        attended: false,
      },
    ]);

    console.log("💳 Creando planes...");
    const plans = await Plan.insertMany([
      {
        name: "Básico",
        description: "Perfecto para comenzar tu viaje fitness",
        type: "MONTHLY",
        price: 39000,
        credits: 8,
        validityDays: 30,
        features: [
          "8 clases al mes",
          "Acceso a todas las clases",
          "App móvil",
          "Soporte por email",
        ],
        isActive: true,
        discountPercentage: 0,
        isFeatured: false,
      },
      {
        name: "Premium",
        description: "La mejor opción para entrenar regularmente",
        type: "MONTHLY",
        price: 59000,
        credits: 20,
        validityDays: 30,
        features: [
          "20 clases al mes",
          "Acceso prioritario",
          "Todas las clases incluidas",
          "Asesoría nutricional básica",
          "App móvil",
          "Soporte prioritario",
        ],
        isActive: true,
        discountPercentage: 15,
        isFeatured: true,
      },
      {
        name: "Ilimitado",
        description: "Entrena sin límites",
        type: "MONTHLY",
        price: 99000,
        credits: 999,
        validityDays: 30,
        features: [
          "Clases ilimitadas",
          "Acceso VIP",
          "Todas las clases incluidas",
          "Plan nutricional personalizado",
          "Invita a un amigo 1 vez/mes",
          "App móvil premium",
          "Soporte 24/7",
        ],
        isActive: true,
        discountPercentage: 25,
        isFeatured: true,
      },
      {
        name: "Pack 10 Clases",
        description: "Flexibilidad para entrenar a tu ritmo",
        type: "CREDITS_PACK",
        price: 45000,
        credits: 10,
        validityDays: 60,
        features: [
          "10 clases",
          "Válido por 60 días",
          "Todas las clases",
          "App móvil",
        ],
        isActive: true,
        discountPercentage: 10,
        isFeatured: false,
      },
      {
        name: "Trimestral Premium",
        description: "3 meses de entrenamiento a precio especial",
        type: "QUARTERLY",
        price: 159000,
        credits: 60,
        validityDays: 90,
        features: [
          "60 clases (3 meses)",
          "Ahorra 10%",
          "Todas las clases incluidas",
          "Asesoría nutricional",
          "App móvil",
          "Soporte prioritario",
        ],
        isActive: true,
        discountPercentage: 10,
        isFeatured: false,
      },
      {
        name: "Anual VIP",
        description: "El mejor precio del año",
        type: "ANNUAL",
        price: 599000,
        credits: 300,
        validityDays: 365,
        features: [
          "300 clases (año completo)",
          "Ahorra 50%",
          "Acceso VIP de por vida",
          "Plan nutricional personalizado",
          "2 sesiones de entrenamiento personal",
          "Evaluación física trimestral",
          "App móvil premium",
          "Soporte 24/7",
        ],
        isActive: true,
        discountPercentage: 50,
        isFeatured: true,
      },
    ]);

    console.log("✅ Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`   - ${await User.countDocuments()} usuarios creados`);
    console.log(`   - ${await Trainer.countDocuments()} entrenadores creados`);
    console.log(`   - ${await Class.countDocuments()} clases creadas`);
    console.log(`   - ${await Reservation.countDocuments()} reservas creadas`);
    console.log(`   - ${await Plan.countDocuments()} planes creados`);
    console.log("\n🔑 Credenciales de prueba:");
    console.log("   Admin: admin@gym.com / admin123");
    console.log("   Usuario: user@gym.com / user123");
    console.log("   Entrenador: trainer@gym.com / trainer123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
