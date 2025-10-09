const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get current date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Basic counts
    const totalClients = await Client.countDocuments({ isActive: true });
    const totalTrainers = await Trainer.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });
    const totalReservations = await Reservation.countDocuments();

    // Recent activity
    const recentReservations = await Reservation.find()
      .populate('client', 'firstName lastName')
      .populate('class', 'name')
      .populate('trainer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue for last 30 days
    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Daily revenue for chart
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Class occupancy rates
    const classOccupancy = await Reservation.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelled'] }
        }
      },
      { $group: { _id: '$class', bookings: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classData' } },
      { $unwind: '$classData' },
      {
        $project: {
          name: '$classData.name',
          capacity: '$classData.capacity',
          bookings: '$bookings',
          occupancyRate: { $multiply: [{ $divide: ['$bookings', '$classData.capacity'] }, 100] }
        }
      },
      { $sort: { occupancyRate: -1 } },
      { $limit: 10 }
    ]);

    // Top performing trainers
    const topTrainers = await Reservation.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      { $group: { _id: '$trainer', classes: { $sum: 1 } } },
      { $lookup: { from: 'trainers', localField: '_id', foreignField: '_id', as: 'trainerData' } },
      { $unwind: '$trainerData' },
      {
        $project: {
          name: { $concat: ['$trainerData.firstName', ' ', '$trainerData.lastName'] },
          classes: '$classes',
          rating: '$trainerData.rating.average'
        }
      },
      { $sort: { classes: -1 } },
      { $limit: 5 }
    ]);

    // Pending payments
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('client', 'firstName lastName email')
      .populate('reservation', 'scheduledDate startTime')
      .populate({
        path: 'reservation',
        populate: {
          path: 'class',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalClients,
          totalTrainers,
          totalClasses,
          totalReservations,
          recentRevenue: recentRevenue[0]?.total || 0
        },
        recentReservations,
        dailyRevenue,
        classOccupancy,
        topTrainers,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (clients and trainers)
// @access  Private (Admin)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const { type, page = 1, limit = 10, search, isActive } = req.query;

    let users = [];
    let total = 0;

    if (type === 'clients' || !type) {
      const clientFilter = {};
      if (isActive !== undefined) clientFilter.isActive = isActive === 'true';
      if (search) {
        clientFilter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const clients = await Client.find(clientFilter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Client.countDocuments(clientFilter);
      users = clients.map(client => ({ ...client.toObject(), userType: 'client' }));
    }

    if (type === 'trainers' || !type) {
      const trainerFilter = {};
      if (isActive !== undefined) trainerFilter.isActive = isActive === 'true';
      if (search) {
        trainerFilter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const trainers = await Trainer.find(trainerFilter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      if (type === 'trainers') {
        total = await Trainer.countDocuments(trainerFilter);
        users = trainers.map(trainer => ({ ...trainer.toObject(), userType: 'trainer' }));
      } else {
        // Combine clients and trainers
        const trainerUsers = trainers.map(trainer => ({ ...trainer.toObject(), userType: 'trainer' }));
        users = [...users, ...trainerUsers];
        total += await Trainer.countDocuments(trainerFilter);
      }
    }

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin)
router.put('/users/:id/status', verifyToken, isAdmin, [
  body('userType').isIn(['client', 'trainer']).withMessage('User type must be client or trainer'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userType, isActive } = req.body;
    const userId = req.params.id;

    let user;
    if (userType === 'client') {
      user = await Client.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      ).select('-password');
    } else if (userType === 'trainer') {
      user = await Trainer.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Generate various reports
// @access  Private (Admin)
router.get('/reports', verifyToken, isAdmin, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reportData = {};

    switch (type) {
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter);
        break;
      case 'attendance':
        reportData = await generateAttendanceReport(dateFilter);
        break;
      case 'classes':
        reportData = await generateClassReport(dateFilter);
        break;
      case 'trainers':
        reportData = await generateTrainerReport(dateFilter);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper functions for report generation
async function generateRevenueReport(dateFilter) {
  const revenueData = await Payment.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);

  const paymentMethodBreakdown = await Payment.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    type: 'revenue',
    data: {
      revenueData,
      paymentMethodBreakdown
    }
  };
}

async function generateAttendanceReport(dateFilter) {
  const attendanceData = await Reservation.aggregate([
    { $match: { ...dateFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const dailyAttendance = await Reservation.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
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
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
  ]);

  return {
    type: 'attendance',
    data: {
      attendanceData,
      dailyAttendance
    }
  };
}

async function generateClassReport(dateFilter) {
  const classData = await Reservation.aggregate([
    { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
    { $group: { _id: '$class', bookings: { $sum: 1 } } },
    { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classData' } },
    { $unwind: '$classData' },
    {
      $project: {
        name: '$classData.name',
        category: '$classData.category',
        capacity: '$classData.capacity',
        bookings: '$bookings',
        occupancyRate: { $multiply: [{ $divide: ['$bookings', '$classData.capacity'] }, 100] }
      }
    },
    { $sort: { bookings: -1 } }
  ]);

  return {
    type: 'classes',
    data: { classData }
  };
}

async function generateTrainerReport(dateFilter) {
  const trainerData = await Reservation.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    { $group: { _id: '$trainer', classes: { $sum: 1 } } },
    { $lookup: { from: 'trainers', localField: '_id', foreignField: '_id', as: 'trainerData' } },
    { $unwind: '$trainerData' },
    {
      $project: {
        name: { $concat: ['$trainerData.firstName', ' ', '$trainerData.lastName'] },
        position: '$trainerData.position',
        classes: '$classes',
        rating: '$trainerData.rating.average'
      }
    },
    { $sort: { classes: -1 } }
  ]);

  return {
    type: 'trainers',
    data: { trainerData }
  };
}

module.exports = router;
