const express = require('express');
const Reservation = require('../models/Reservation');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Payment = require('../models/Payment');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/statistics/overview
// @desc    Get overview statistics
// @access  Private (Admin)
router.get('/overview', verifyToken, async (req, res) => {
  try {
    // Basic counts
    const totalClients = await Client.countDocuments({ isActive: true });
    const totalTrainers = await Trainer.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });
    const totalReservations = await Reservation.countDocuments();

    // Revenue statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Popular classes
    const popularClasses = await Reservation.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classData' } },
      { $unwind: '$classData' },
      { $project: { name: '$classData.name', category: '$classData.category', bookings: '$count' } },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // Top trainers
    const topTrainers = await Reservation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$trainer', classes: { $sum: 1 } } },
      { $lookup: { from: 'trainers', localField: '_id', foreignField: '_id', as: 'trainerData' } },
      { $unwind: '$trainerData' },
      { $project: { 
        name: { $concat: ['$trainerData.firstName', ' ', '$trainerData.lastName'] },
        classes: '$classes',
        rating: '$trainerData.rating.average'
      } },
      { $sort: { classes: -1 } },
      { $limit: 10 }
    ]);

    // Class occupancy rates
    const classOccupancy = await Reservation.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: '$class', bookings: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classData' } },
      { $unwind: '$classData' },
      { $project: { 
        name: '$classData.name',
        capacity: '$classData.capacity',
        bookings: '$bookings',
        occupancyRate: { $multiply: [{ $divide: ['$bookings', '$classData.capacity'] }, 100] }
      } },
      { $sort: { occupancyRate: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalClients,
          totalTrainers,
          totalClasses,
          totalReservations,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        monthlyRevenue,
        popularClasses,
        topTrainers,
        classOccupancy
      }
    });
  } catch (error) {
    console.error('Get overview statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/statistics/revenue
// @desc    Get revenue statistics
// @access  Private (Admin)
router.get('/revenue', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const matchStage = { status: 'completed' };
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupStage;
    switch (groupBy) {
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          }
        };
        break;
      case 'year':
        groupStage = {
          _id: { year: { $year: '$createdAt' } }
        };
        break;
      default: // month
        groupStage = {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }
        };
    }

    const revenueData = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1, '_id.week': -1 } }
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Refund statistics
    const refundStats = await Payment.aggregate([
      { $match: { status: 'refunded' } },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: 1 },
          totalRefundAmount: { $sum: '$refundAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueData,
        revenueByMethod,
        refundStats: refundStats[0] || { totalRefunds: 0, totalRefundAmount: 0 }
      }
    });
  } catch (error) {
    console.error('Get revenue statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/statistics/attendance
// @desc    Get attendance statistics
// @access  Private (Admin)
router.get('/attendance', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Attendance by status
    const attendanceByStatus = await Reservation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily attendance
    const dailyAttendance = await Reservation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' },
            day: { $dayOfMonth: '$scheduledDate' }
          },
          attendance: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);

    // Peak hours
    const peakHours = await Reservation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: '$startTime',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Attendance by day of week
    const attendanceByDay = await Reservation.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: { $dayOfWeek: '$scheduledDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Class capacity utilization
    const capacityUtilization = await Reservation.aggregate([
      { $match: { ...matchStage, status: { $nin: ['cancelled'] } } },
      { $group: { _id: '$class', bookings: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classData' } },
      { $unwind: '$classData' },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$classData.capacity' },
          totalBookings: { $sum: '$bookings' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        attendanceByStatus,
        dailyAttendance,
        peakHours,
        attendanceByDay,
        capacityUtilization: capacityUtilization[0] || { totalCapacity: 0, totalBookings: 0 }
      }
    });
  } catch (error) {
    console.error('Get attendance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/statistics/clients
// @desc    Get client statistics
// @access  Private (Admin)
router.get('/clients', verifyToken, async (req, res) => {
  try {
    // Client demographics
    const clientDemographics = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Membership distribution
    const membershipDistribution = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Client activity levels
    const clientActivity = await Reservation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$client',
          totalClasses: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$totalClasses', 5] }, then: 'Low (1-5 classes)' },
                { case: { $lte: ['$totalClasses', 15] }, then: 'Medium (6-15 classes)' },
                { case: { $lte: ['$totalClasses', 30] }, then: 'High (16-30 classes)' },
                { case: { $gt: ['$totalClasses', 30] }, then: 'Very High (30+ classes)' }
              ],
              default: 'Low (1-5 classes)'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // New vs returning clients
    const newVsReturning = await Client.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { 
                  case: { 
                    $gte: [
                      { $dateDiff: { startDate: '$createdAt', endDate: '$$NOW', unit: 'day' } },
                      30
                    ]
                  }, 
                  then: 'Returning (30+ days)' 
                }
              ],
              default: 'New (0-30 days)'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Client retention rate
    const totalClients = await Client.countDocuments({ isActive: true });
    const activeClients = await Reservation.distinct('client', {
      scheduledDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: { $nin: ['cancelled'] }
    });

    res.json({
      success: true,
      data: {
        clientDemographics,
        membershipDistribution,
        clientActivity,
        newVsReturning,
        retentionRate: totalClients > 0 ? (activeClients.length / totalClients) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get client statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
