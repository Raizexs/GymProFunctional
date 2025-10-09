const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID and type
    let user = null;
    if (decoded.userType === 'client') {
      user = await Client.findById(decoded.userId).select('-password');
    } else if (decoded.userType === 'trainer') {
      user = await Trainer.findById(decoded.userId).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Token verification failed.',
      error: error.message
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is trainer
const isTrainer = (req, res, next) => {
  if (req.userType !== 'trainer' && req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Trainer privileges required.'
    });
  }
  next();
};

// Check if user is client
const isClient = (req, res, next) => {
  if (req.userType !== 'client' && req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Client privileges required.'
    });
  }
  next();
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.userType === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = {
  verifyToken,
  isAdmin,
  isTrainer,
  isClient,
  isOwnerOrAdmin,
  generateToken
};
