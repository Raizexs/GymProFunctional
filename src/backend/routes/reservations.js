const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Class = require('../models/Class');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const { verifyToken, isClient, isTrainer, isOwnerOrAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/reservations
// @desc    Get all reservations with filters
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      clientId,
      trainerId,
      classId,
      startDate,
      endDate,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (clientId) filter.client = clientId;
    if (trainerId) filter.trainer = trainerId;
    if (classId) filter.class = classId;
    
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    // If user is client, only show their reservations
    if (req.userType === 'client') {
      filter.client = req.user._id;
    }
    
    // If user is trainer, only show their classes
    if (req.userType === 'trainer') {
      filter.trainer = req.user._id;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reservations = await Reservation.find(filter)
      .populate('client', 'firstName lastName email phone')
      .populate('trainer', 'firstName lastName email')
      .populate('class', 'name category duration capacity price')
      .sort(sort)
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
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get single reservation
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('trainer', 'firstName lastName email')
      .populate('class', 'name category duration capacity price');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user has access to this reservation
    if (req.userType === 'client' && reservation.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.userType === 'trainer' && reservation.trainer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { reservation }
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/reservations
// @desc    Create new reservation
// @access  Private (Client)
router.post('/', verifyToken, isClient, [
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required')
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

    const { classId, scheduledDate, startTime, endTime, notes } = req.body;

    // Check if class exists and is active
    const classData = await Class.findById(classId).populate('trainer');
    if (!classData || !classData.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or inactive'
      });
    }

    // Check if scheduled date is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${startTime}:00`);
    if (scheduledDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book classes in the past'
      });
    }

    // Check if client already has a reservation at this time
    const existingReservation = await Reservation.findOne({
      client: req.user._id,
      scheduledDate: new Date(scheduledDate),
      startTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have a reservation at this time'
      });
    }

    // Check class capacity
    const currentBookings = await Reservation.countDocuments({
      class: classId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      status: { $nin: ['cancelled'] }
    });

    if (currentBookings >= classData.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is fully booked'
      });
    }

    // Create reservation
    const reservation = new Reservation({
      client: req.user._id,
      class: classId,
      trainer: classData.trainer._id,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      price: classData.price,
      notes
    });

    await reservation.save();

    // Populate the reservation data
    await reservation.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'trainer', select: 'firstName lastName' },
      { path: 'class', select: 'name category duration' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.put('/:id/cancel', verifyToken, [
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
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

    const { reason } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user has permission to cancel
    const canCancel = req.userType === 'admin' || 
                     (req.userType === 'client' && reservation.client.toString() === req.user._id.toString()) ||
                     (req.userType === 'trainer' && reservation.trainer.toString() === req.user._id.toString());

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if reservation can be cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reservation is already cancelled'
      });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed reservation'
      });
    }

    // Check cancellation policy (2 hours before class)
    const scheduledDateTime = new Date(`${reservation.scheduledDate.toISOString().split('T')[0]}T${reservation.startTime}:00`);
    const hoursUntilClass = (scheduledDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilClass < 2 && req.userType === 'client') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel reservation less than 2 hours before class'
      });
    }

    // Update reservation
    reservation.status = 'cancelled';
    reservation.cancellationReason = reason;
    reservation.cancelledAt = new Date();
    reservation.cancelledBy = req.userType;

    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/reservations/:id/checkin
// @desc    Check in to a class
// @access  Private (Trainer)
router.put('/:id/checkin', verifyToken, isTrainer, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if trainer has permission
    if (reservation.trainer.toString() !== req.user._id.toString() && req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Can only check in confirmed reservations'
      });
    }

    reservation.checkInTime = new Date();
    reservation.status = 'completed';
    await reservation.save();

    // Update client stats
    await Client.findByIdAndUpdate(reservation.client, {
      $inc: { totalWorkouts: 1 }
    });

    // Update trainer stats
    await Trainer.findByIdAndUpdate(reservation.trainer, {
      $inc: { totalClasses: 1 }
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      data: { reservation }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/reservations/:id/feedback
// @desc    Submit feedback for a completed class
// @access  Private (Client)
router.put('/:id/feedback', verifyToken, isClient, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
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

    const { rating, comment } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if client has permission
    if (reservation.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (reservation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit feedback for completed classes'
      });
    }

    if (reservation.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted'
      });
    }

    // Update reservation with feedback
    reservation.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await reservation.save();

    // Update trainer rating
    const trainer = await Trainer.findById(reservation.trainer);
    const newRatingCount = trainer.rating.count + 1;
    const newAverageRating = ((trainer.rating.average * trainer.rating.count) + rating) / newRatingCount;

    await Trainer.findByIdAndUpdate(reservation.trainer, {
      'rating.average': newAverageRating,
      'rating.count': newRatingCount
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { reservation }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
