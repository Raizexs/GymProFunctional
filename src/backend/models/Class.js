const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    maxlength: [100, 'Class name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Class description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Class category is required'],
    enum: [
      'strength_training',
      'cardio',
      'yoga',
      'pilates',
      'crossfit',
      'boxing',
      'dance',
      'swimming',
      'functional_training',
      'hiit',
      'spinning',
      'zumba',
      'body_pump',
      'other'
    ]
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'all_levels'
  },
  duration: {
    type: Number,
    required: [true, 'Class duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  capacity: {
    type: Number,
    required: [true, 'Class capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  price: {
    type: Number,
    required: [true, 'Class price is required'],
    min: [0, 'Price cannot be negative']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer is required']
  },
  equipment: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
classSchema.index({ category: 1 });
classSchema.index({ difficulty: 1 });
classSchema.index({ trainer: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ name: 'text', description: 'text' });

// Virtual for available spots
classSchema.virtual('availableSpots').get(function() {
  // This will be calculated based on current reservations
  return this.capacity;
});

// Ensure virtual fields are serialized
classSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Class', classSchema);
