const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const { verifyToken, isClient, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients (admin only)
// @access  Private (Admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      membershipType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (membershipType) filter.membershipType = membershipType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const clients = await Client.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(filter);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client profile
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if user has access to this profile
    if (req.userType === 'client' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client profile
// @access  Private
router.put('/:id', verifyToken, isOwnerOrAdmin, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please provide a valid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('membershipType').optional().isIn(['basic', 'premium', 'unlimited']).withMessage('Invalid membership type'),
  body('fitnessGoals').optional().isArray().withMessage('Fitness goals must be an array'),
  body('medicalInfo').optional().isObject().withMessage('Medical info must be an object')
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

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Update client
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client: updatedClient }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/:id/reservations
// @desc    Get client's reservation history
// @access  Private
router.get('/:id/reservations', verifyToken, async (req, res) => {
  try {
    // Check if user has access
    if (req.userType === 'client' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    const filter = { client: req.params.id };
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    const reservations = await Reservation.find(filter)
      .populate('class', 'name category duration')
      .populate('trainer', 'firstName lastName')
      .sort({ scheduledDate: -1, startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get client reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/:id/payments
// @desc    Get client's payment history
// @access  Private
router.get('/:id/payments', verifyToken, async (req, res) => {
  try {
    // Check if user has access
    if (req.userType === 'client' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const filter = { client: req.params.id };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('reservation', 'scheduledDate startTime')
      .populate({
        path: 'reservation',
        populate: {
          path: 'class',
          select: 'name category'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get client payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/:id/stats
// @desc    Get client's statistics
// @access  Private
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    // Check if user has access
    if (req.userType === 'client' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const clientId = req.params.id;

    // Get basic stats
    const totalReservations = await Reservation.countDocuments({ client: clientId });
    const completedReservations = await Reservation.countDocuments({ 
      client: clientId, 
      status: 'completed' 
    });
    const cancelledReservations = await Reservation.countDocuments({ 
      client: clientId, 
      status: 'cancelled' 
    });

    // Get total amount spent
    const totalSpent = await Payment.aggregate([
      { $match: { client: clientId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get favorite categories
    const favoriteCategories = await Reservation.aggregate([
      { $match: { client: clientId, status: 'completed' } },
      { $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'classData' } },
      { $unwind: '$classData' },
      { $group: { _id: '$classData.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get monthly activity
    const monthlyActivity = await Reservation.aggregate([
      { $match: { client: clientId, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalReservations,
          completedReservations,
          cancelledReservations,
          totalSpent: totalSpent[0]?.total || 0,
          favoriteCategories,
          monthlyActivity
        }
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/clients/:id/deactivate
// @desc    Deactivate client account
// @access  Private (Admin)
router.put('/:id/deactivate', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    client.isActive = false;
    await client.save();

    res.json({
      success: true,
      message: 'Client account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
