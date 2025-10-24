import Payment from "../models/Payment.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import Trainer from "../models/Trainer.js";
import mongoose from "mongoose";

/**
 * Obtener estadísticas generales del dashboard
 */
export async function getDashboardStats({ startDate, endDate, userId, role }) {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Estadísticas según el rol
    if (role === "ADMIN") {
      return await getAdminStats({ start, end });
    } else if (role === "TRAINER") {
      return await getTrainerStats({ start, end, userId });
    } else {
      return await getUserStats({ start, end, userId });
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
}

/**
 * Estadísticas para administrador
 */
async function getAdminStats({ start, end }) {
  // Ingresos totales
  const revenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avg: { $avg: "$amount" },
      },
    },
  ]);

  // Reservas por estado
  const reservationStats = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Usuarios nuevos
  const newUsers = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
    role: "USER",
  });

  // Clases más populares
  const popularClasses = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ["CONFIRMED", "COMPLETED"] },
      },
    },
    {
      $group: {
        _id: "$classId",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "classes",
        localField: "_id",
        foreignField: "_id",
        as: "class",
      },
    },
    {
      $unwind: "$class",
    },
  ]);

  // Tasa de ocupación promedio
  const occupancyRate = await Class.aggregate([
    {
      $lookup: {
        from: "reservations",
        let: { classId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$classId", "$$classId"] },
              date: { $gte: start, $lte: end },
              status: { $in: ["CONFIRMED", "COMPLETED"] },
            },
          },
          {
            $count: "reservations",
          },
        ],
        as: "stats",
      },
    },
    {
      $project: {
        capacity: 1,
        reservations: {
          $ifNull: [{ $arrayElemAt: ["$stats.reservations", 0] }, 0],
        },
        occupancy: {
          $multiply: [
            {
              $divide: [
                { $ifNull: [{ $arrayElemAt: ["$stats.reservations", 0] }, 0] },
                "$capacity",
              ],
            },
            100,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgOccupancy: { $avg: "$occupancy" },
      },
    },
  ]);

  // Ingresos diarios para gráfica
  const dailyRevenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return {
    revenue: {
      total: revenue[0]?.total || 0,
      count: revenue[0]?.count || 0,
      average: revenue[0]?.avg || 0,
      daily: dailyRevenue,
    },
    reservations: {
      byStatus: reservationStats,
      total: reservationStats.reduce((sum, r) => sum + r.count, 0),
    },
    users: {
      new: newUsers,
      total: await User.countDocuments({ role: "USER" }),
    },
    classes: {
      popular: popularClasses,
      occupancyRate: occupancyRate[0]?.avgOccupancy || 0,
    },
  };
}

/**
 * Estadísticas para entrenador
 */
async function getTrainerStats({ start, end, userId }) {
  // Obtener el entrenador
  const trainer = await Trainer.findOne({ email: userId });

  if (!trainer) {
    throw new Error("Entrenador no encontrado");
  }

  // Clases del entrenador
  const trainerClasses = await Class.find({ coachId: trainer._id });
  const classIds = trainerClasses.map((c) => c._id);

  // Reservas de las clases del entrenador
  const reservations = await Reservation.countDocuments({
    classId: { $in: classIds },
    createdAt: { $gte: start, $lte: end },
    status: { $in: ["CONFIRMED", "COMPLETED"] },
  });

  // Estudiantes únicos
  const uniqueStudents = await Reservation.distinct("userId", {
    classId: { $in: classIds },
    createdAt: { $gte: start, $lte: end },
    status: { $in: ["CONFIRMED", "COMPLETED"] },
  });

  // Ingresos generados (si el entrenador recibe comisión)
  const earnings = await Payment.aggregate([
    {
      $lookup: {
        from: "reservations",
        localField: "reservationId",
        foreignField: "_id",
        as: "reservation",
      },
    },
    {
      $unwind: "$reservation",
    },
    {
      $match: {
        "reservation.classId": { $in: classIds },
        createdAt: { $gte: start, $lte: end },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Clases por día de la semana
  const classesByDay = await Reservation.aggregate([
    {
      $match: {
        classId: { $in: classIds },
        createdAt: { $gte: start, $lte: end },
        status: { $in: ["CONFIRMED", "COMPLETED"] },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$date" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return {
    classes: {
      total: trainerClasses.length,
      reservations,
    },
    students: {
      unique: uniqueStudents.length,
    },
    earnings: {
      total: earnings[0]?.total || 0,
    },
    schedule: {
      byDay: classesByDay,
    },
  };
}

/**
 * Estadísticas para usuario/cliente
 */
async function getUserStats({ start, end, userId }) {
  // Reservas del usuario
  const reservations = await Reservation.find({
    userId,
    createdAt: { $gte: start, $lte: end },
  }).populate("classId");

  // Total gastado
  const spent = await Payment.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: start, $lte: end },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Clase favorita (más reservada)
  const favoriteClass = await Reservation.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ["CONFIRMED", "COMPLETED"] },
      },
    },
    {
      $group: {
        _id: "$classId",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: "classes",
        localField: "_id",
        foreignField: "_id",
        as: "class",
      },
    },
  ]);

  // Asistencia
  const attendance = await Reservation.countDocuments({
    userId,
    attended: true,
  });

  return {
    reservations: {
      total: reservations.length,
      byStatus: reservations.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
    },
    spending: {
      total: spent[0]?.total || 0,
    },
    favorite: {
      class: favoriteClass[0]?.class[0] || null,
      count: favoriteClass[0]?.count || 0,
    },
    attendance: {
      total: attendance,
      rate:
        reservations.length > 0 ? (attendance / reservations.length) * 100 : 0,
    },
  };
}

/**
 * Obtener reporte de ingresos
 */
export async function getRevenueReport({
  startDate,
  endDate,
  groupBy = "day",
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let dateFormat;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-W%V";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const report = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
        avgTransaction: { $avg: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const total = report.reduce((sum, r) => sum + r.revenue, 0);

  return {
    report,
    summary: {
      total,
      transactions: report.reduce((sum, r) => sum + r.transactions, 0),
      average: report.length > 0 ? total / report.length : 0,
    },
  };
}
