const express = require('express');
const { body, validationResult } = require('express-validator');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Reservation = require('../models/Reservation');
const { verifyToken, isTrainer, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/trainers
// @desc    Get all trainers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      position,
      specialty,
      isActive,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (position) filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trainers = await Trainer.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trainer.countDocuments(filter);

    res.json({
      success: true,
      data: {
        trainers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/trainers/:id
// @desc    Get trainer profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).select('-password');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.json({
      success: true,
      data: { trainer }
    });
  } catch (error) {
    console.error('Get trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/trainers/:id
// @desc    Update trainer profile
// @access  Private
router.put('/:id', verifyToken, isOwnerOrAdmin, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please provide a valid phone number'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('position').optional().isIn(['trainer', 'senior_trainer', 'head_trainer', 'manager']).withMessage('Invalid position')
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

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Update trainer
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: { trainer: updatedTrainer }
    });
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/trainers/:id/classes
// @desc    Get trainer's classes
// @access  Public
router.get('/:id/classes', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      isActive
    } = req.query;

    const filter = { trainer: req.params.id };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classes = await Class.find(filter)
      .populate('trainer', 'firstName lastName')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get trainer classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/trainers/:id/schedule
// @desc    Get trainer's schedule
// @access  Private
router.get('/:id/schedule', verifyToken, async (req, res) => {
  try {
    // Check if user has access
    if (req.userType === 'trainer' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const reservations = await Reservation.find({
      trainer: req.params.id,
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $nin: ['cancelled'] }
    })
    .populate('client', 'firstName lastName email phone')
    .populate('class', 'name category duration')
    .sort({ scheduledDate: 1, startTime: 1 });

    res.json({
      success: true,
      data: { schedule: reservations }
    });
  } catch (error) {
    console.error('Get trainer schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/trainers/:id/stats
// @desc    Get trainer's statistics
// @access  Private
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    // Check if user has access
    if (req.userType === 'trainer' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const trainerId = req.params.id;

    // Get basic stats
    const totalClasses = await Class.countDocuments({ trainer: trainerId, isActive: true });
    const totalReservations = await Reservation.countDocuments({ trainer: trainerId });
    const completedReservations = await Reservation.countDocuments({ 
      trainer: trainerId, 
      status: 'completed' 
    });

    // Get total earnings
    const totalEarnings = await Reservation.aggregate([
      { $match: { trainer: trainerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    // Get monthly performance
    const monthlyPerformance = await Reservation.aggregate([
      { $match: { trainer: trainerId, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          classes: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get client feedback
    const feedback = await Reservation.aggregate([
      { 
        $match: { 
          trainer: trainerId, 
          'feedback.rating': { $exists: true } 
        } 
      },
      {
        $group: {
          _id: '$feedback.rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get popular time slots
    const popularTimeSlots = await Reservation.aggregate([
      { $match: { trainer: trainerId, status: 'completed' } },
      { $group: { _id: '$startTime', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalClasses,
          totalReservations,
          completedReservations,
          totalEarnings: totalEarnings[0]?.total || 0,
          monthlyPerformance,
          feedback,
          popularTimeSlots
        }
      }
    });
  } catch (error) {
    console.error('Get trainer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/trainers/:id/availability
// @desc    Update trainer's availability
// @access  Private (Trainer)
router.put('/:id/availability', verifyToken, isTrainer, [
  body('availability').isObject().withMessage('Availability must be an object')
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

    // Check if user has permission
    if (req.userType !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    trainer.availability = req.body.availability;
    await trainer.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability: trainer.availability }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
