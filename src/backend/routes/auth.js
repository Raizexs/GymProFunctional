const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register/client
// @desc    Register a new client
// @access  Public
router.post('/register/client', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please provide a valid phone number'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('emergencyContact.name').trim().isLength({ min: 2 }).withMessage('Emergency contact name is required'),
  body('emergencyContact.phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Emergency contact phone is required'),
  body('emergencyContact.relationship').trim().isLength({ min: 2 }).withMessage('Emergency contact relationship is required')
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
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      emergencyContact,
      fitnessGoals,
      medicalInfo
    } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    // Create new client
    const client = new Client({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      emergencyContact,
      fitnessGoals: fitnessGoals || [],
      medicalInfo: medicalInfo || {}
    });

    await client.save();

    // Generate token
    const token = generateToken(client._id, 'client');

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: {
        client: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          membershipType: client.membershipType,
          isActive: client.isActive
        },
        token
      }
    });
  } catch (error) {
    console.error('Client registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/register/trainer
// @desc    Register a new trainer (admin only)
// @access  Private (Admin)
router.post('/register/trainer', verifyToken, [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please provide a valid phone number'),
  body('employeeId').trim().isLength({ min: 3 }).withMessage('Employee ID is required'),
  body('hireDate').isISO8601().withMessage('Please provide a valid hire date'),
  body('hourlyRate').isNumeric().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    // Check if user is admin (you might want to implement admin check)
    // For now, we'll allow any authenticated user to register trainers
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      employeeId,
      hireDate,
      position,
      specialties,
      hourlyRate,
      bio
    } = req.body;

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer with this email or employee ID already exists'
      });
    }

    // Create new trainer
    const trainer = new Trainer({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      employeeId,
      hireDate,
      position: position || 'trainer',
      specialties: specialties || [],
      hourlyRate,
      bio
    });

    await trainer.save();

    res.status(201).json({
      success: true,
      message: 'Trainer registered successfully',
      data: {
        trainer: {
          id: trainer._id,
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          email: trainer.email,
          employeeId: trainer.employeeId,
          position: trainer.position,
          isActive: trainer.isActive
        }
      }
    });
  } catch (error) {
    console.error('Trainer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (client or trainer)
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['client', 'trainer']).withMessage('User type must be client or trainer')
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

    const { email, password, userType } = req.body;

    // Find user based on type
    let user = null;
    if (userType === 'client') {
      user = await Client.findOne({ email });
    } else if (userType === 'trainer') {
      user = await Trainer.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, userType);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType,
          ...(userType === 'trainer' && {
            employeeId: user.employeeId,
            position: user.position
          })
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
        userType: req.userType
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('userType').isIn(['client', 'trainer']).withMessage('User type must be client or trainer')
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

    const { email, userType } = req.body;

    // Find user
    let user = null;
    if (userType === 'client') {
      user = await Client.findOne({ email });
    } else if (userType === 'trainer') {
      user = await Trainer.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token (you might want to implement a proper reset token system)
    const resetToken = generateToken(user._id, userType);
    
    // TODO: Send email with reset link
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Password reset email sent',
      data: {
        resetToken // In production, don't return this
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
