const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const trainerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  position: {
    type: String,
    enum: ['trainer', 'senior_trainer', 'head_trainer', 'manager'],
    default: 'trainer'
  },
  specialties: [{
    type: String,
    enum: [
      'strength_training',
      'cardio',
      'yoga',
      'pilates',
      'crossfit',
      'boxing',
      'dance',
      'swimming',
      'nutrition',
      'rehabilitation',
      'senior_fitness',
      'youth_fitness'
    ]
  }],
  certifications: [{
    name: String,
    issuer: String,
    dateObtained: Date,
    expirationDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  experience: {
    years: {
      type: Number,
      min: 0,
      default: 0
    },
    description: String
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  availability: {
    monday: [{
      start: String, // Format: "09:00"
      end: String    // Format: "17:00"
    }],
    tuesday: [{
      start: String,
      end: String
    }],
    wednesday: [{
      start: String,
      end: String
    }],
    thursday: [{
      start: String,
      end: String
    }],
    friday: [{
      start: String,
      end: String
    }],
    saturday: [{
      start: String,
      end: String
    }],
    sunday: [{
      start: String,
      end: String
    }]
  },
  maxClientsPerClass: {
    type: Number,
    default: 15,
    min: 1,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
trainerSchema.index({ email: 1 });
trainerSchema.index({ employeeId: 1 });
trainerSchema.index({ isActive: 1 });
trainerSchema.index({ position: 1 });

// Hash password before saving
trainerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
trainerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
trainerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate total earnings
trainerSchema.virtual('totalEarnings').get(function() {
  return this.totalHours * this.hourlyRate;
});

// Ensure virtual fields are serialized
trainerSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('Trainer', trainerSchema);
