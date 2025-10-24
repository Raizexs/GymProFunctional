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

/**
 * Obtener KPIs de ocupación y no-show
 */
export async function getOccupancyAndNoShowKPIs({ startDate, endDate }) {
  try {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // KPI 1: Tasa de ocupación por clase
    const occupancyByClass = await Class.aggregate([
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
              $group: {
                _id: null,
                total: { $sum: 1 },
                attended: {
                  $sum: { $cond: [{ $eq: ["$attended", true] }, 1, 0] },
                },
              },
            },
          ],
          as: "stats",
        },
      },
      {
        $lookup: {
          from: "trainers",
          localField: "coachId",
          foreignField: "_id",
          as: "coach",
        },
      },
      {
        $unwind: { path: "$coach", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          capacity: 1,
          coach: { name: "$coach.name" },
          reservations: {
            $ifNull: [{ $arrayElemAt: ["$stats.total", 0] }, 0],
          },
          attended: { $ifNull: [{ $arrayElemAt: ["$stats.attended", 0] }, 0] },
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  { $ifNull: [{ $arrayElemAt: ["$stats.total", 0] }, 0] },
                  "$capacity",
                ],
              },
              100,
            ],
          },
          noShowRate: {
            $multiply: [
              {
                $cond: [
                  { $eq: [{ $arrayElemAt: ["$stats.total", 0] }, 0] },
                  0,
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $arrayElemAt: ["$stats.total", 0] },
                          { $arrayElemAt: ["$stats.attended", 0] },
                        ],
                      },
                      { $arrayElemAt: ["$stats.total", 0] },
                    ],
                  },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $sort: { occupancyRate: -1 },
      },
    ]);

    // KPI 2: Tasa promedio de ocupación global
    const avgOccupancy =
      occupancyByClass.length > 0
        ? occupancyByClass.reduce((sum, c) => sum + c.occupancyRate, 0) /
          occupancyByClass.length
        : 0;

    // KPI 3: Tasa promedio de no-show global
    const avgNoShow =
      occupancyByClass.length > 0
        ? occupancyByClass.reduce((sum, c) => sum + c.noShowRate, 0) /
          occupancyByClass.length
        : 0;

    // KPI 4: Total de reservas vs asistencias
    const totalStats = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: { $in: ["CONFIRMED", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          totalAttended: {
            $sum: { $cond: [{ $eq: ["$attended", true] }, 1, 0] },
          },
          totalNoShow: {
            $sum: { $cond: [{ $eq: ["$attended", false] }, 1, 0] },
          },
        },
      },
    ]);

    // KPI 5: Tendencia de ocupación diaria
    const dailyOccupancy = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: { $in: ["CONFIRMED", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          reservations: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$attended", true] }, 1, 0] },
          },
          noShow: {
            $sum: { $cond: [{ $eq: ["$attended", false] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          reservations: 1,
          attended: 1,
          noShow: 1,
          attendanceRate: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$reservations", 0] },
                  0,
                  { $divide: ["$attended", "$reservations"] },
                ],
              },
              100,
            ],
          },
          noShowRate: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$reservations", 0] },
                  0,
                  { $divide: ["$noShow", "$reservations"] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // KPI 6: Usuarios con más no-shows
    const usersWithMostNoShows = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: { $in: ["CONFIRMED", "COMPLETED"] },
          attended: false,
        },
      },
      {
        $group: {
          _id: "$userId",
          noShowCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userName: "$user.name",
          userEmail: "$user.email",
          noShowCount: 1,
        },
      },
      {
        $sort: { noShowCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // KPI 7: Clases con mejor tasa de asistencia
    const bestAttendanceClasses = occupancyByClass
      .filter((c) => c.reservations > 0)
      .sort((a, b) => 100 - b.noShowRate - (100 - a.noShowRate))
      .slice(0, 5);

    return {
      overview: {
        avgOccupancyRate: parseFloat(avgOccupancy.toFixed(2)),
        avgNoShowRate: parseFloat(avgNoShow.toFixed(2)),
        totalReservations: totalStats[0]?.totalReservations || 0,
        totalAttended: totalStats[0]?.totalAttended || 0,
        totalNoShow: totalStats[0]?.totalNoShow || 0,
        attendanceRate:
          totalStats[0]?.totalReservations > 0
            ? parseFloat(
                (
                  (totalStats[0].totalAttended /
                    totalStats[0].totalReservations) *
                  100
                ).toFixed(2)
              )
            : 0,
      },
      occupancyByClass: occupancyByClass.map((c) => ({
        ...c,
        occupancyRate: parseFloat(c.occupancyRate.toFixed(2)),
        noShowRate: parseFloat(c.noShowRate.toFixed(2)),
      })),
      dailyTrend: dailyOccupancy.map((d) => ({
        date: d.date,
        reservations: d.reservations,
        attended: d.attended,
        noShow: d.noShow,
        attendanceRate: parseFloat(d.attendanceRate.toFixed(2)),
        noShowRate: parseFloat(d.noShowRate.toFixed(2)),
      })),
      usersWithMostNoShows,
      bestAttendanceClasses: bestAttendanceClasses.map((c) => ({
        ...c,
        attendanceRate: parseFloat((100 - c.noShowRate).toFixed(2)),
      })),
    };
  } catch (error) {
    console.error("Error getting occupancy and no-show KPIs:", error);
    throw error;
  }
}
