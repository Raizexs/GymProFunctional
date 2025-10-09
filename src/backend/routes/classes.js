const express = require('express');
const { body, validationResult } = require('express-validator');
const Class = require('../models/Class');
const Trainer = require('../models/Trainer');
const Reservation = require('../models/Reservation');
const { verifyToken, isTrainer } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classes
// @desc    Get all classes with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      trainerId,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (trainerId) filter.trainer = trainerId;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const classes = await Class.find(filter)
      .populate('trainer', 'firstName lastName specialties rating')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate available spots for each class
    const classesWithAvailability = await Promise.all(
      classes.map(async (classItem) => {
        const currentBookings = await Reservation.countDocuments({
          class: classItem._id,
          status: { $nin: ['cancelled'] }
        });
        
        return {
          ...classItem.toObject(),
          availableSpots: classItem.capacity - currentBookings
        };
      })
    );

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classes: classesWithAvailability,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/classes/:id
// @desc    Get single class details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('trainer', 'firstName lastName specialties rating bio experience');

    if (!classData || !classData.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Calculate available spots
    const currentBookings = await Reservation.countDocuments({
      class: req.params.id,
      status: { $nin: ['cancelled'] }
    });

    const classWithAvailability = {
      ...classData.toObject(),
      availableSpots: classData.capacity - currentBookings
    };

    res.json({
      success: true,
      data: { class: classWithAvailability }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Trainer/Admin)
router.post('/', verifyToken, isTrainer, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Class name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn([
    'strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'boxing',
    'dance', 'swimming', 'functional_training', 'hiit', 'spinning', 'zumba',
    'body_pump', 'other'
  ]).withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced', 'all_levels']).withMessage('Invalid difficulty level'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('trainer').isMongoId().withMessage('Valid trainer ID is required')
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

    const {
      name,
      description,
      category,
      difficulty,
      duration,
      capacity,
      price,
      trainer,
      equipment,
      requirements,
      tags
    } = req.body;

    // Verify trainer exists
    const trainerData = await Trainer.findById(trainer);
    if (!trainerData || !trainerData.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found or inactive'
      });
    }

    // Check if trainer has permission to create classes
    if (req.userType !== 'admin' && trainer !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create new class
    const classData = new Class({
      name,
      description,
      category,
      difficulty,
      duration,
      capacity,
      price,
      trainer,
      equipment: equipment || [],
      requirements: requirements || [],
      tags: tags || []
    });

    await classData.save();

    // Populate trainer data
    await classData.populate('trainer', 'firstName lastName specialties');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: classData }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Trainer/Admin)
router.put('/:id', verifyToken, isTrainer, [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Class name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').optional().isIn([
    'strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'boxing',
    'dance', 'swimming', 'functional_training', 'hiit', 'spinning', 'zumba',
    'body_pump', 'other'
  ]).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'all_levels']).withMessage('Invalid difficulty level'),
  body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('capacity').optional().isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
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

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if user has permission to update
    if (req.userType !== 'admin' && classData.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('trainer', 'firstName lastName specialties');

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: { class: updatedClass }
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class (soft delete)
// @access  Private (Trainer/Admin)
router.delete('/:id', verifyToken, isTrainer, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if user has permission to delete
    if (req.userType !== 'admin' && classData.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if class has active reservations
    const activeReservations = await Reservation.countDocuments({
      class: req.params.id,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with active reservations'
      });
    }

    // Soft delete
    await Class.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/classes/:id/schedule
// @desc    Get class schedule for a specific date range
// @access  Public
router.get('/:id/schedule', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const reservations = await Reservation.find({
      class: req.params.id,
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $nin: ['cancelled'] }
    })
    .populate('client', 'firstName lastName')
    .sort({ scheduledDate: 1, startTime: 1 });

    res.json({
      success: true,
      data: { schedule: reservations }
    });
  } catch (error) {
    console.error('Get class schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
