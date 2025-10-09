const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['client', 'trainer', 'admin', 'system'],
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    default: null
  },
  parentReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
reservationSchema.index({ client: 1 });
reservationSchema.index({ class: 1 });
reservationSchema.index({ trainer: 1 });
reservationSchema.index({ scheduledDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ paymentStatus: 1 });
reservationSchema.index({ scheduledDate: 1, startTime: 1 });

// Compound index for unique reservations
reservationSchema.index(
  { client: 1, scheduledDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Virtual for duration
reservationSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  
  return (end - start) / (1000 * 60); // Duration in minutes
});

// Virtual for isPast
reservationSchema.virtual('isPast').get(function() {
  const now = new Date();
  const reservationDateTime = new Date(`${this.scheduledDate.toISOString().split('T')[0]}T${this.endTime}:00`);
  return reservationDateTime < now;
});

// Virtual for canCancel
reservationSchema.virtual('canCancel').get(function() {
  if (this.status === 'cancelled' || this.status === 'completed') return false;
  
  const now = new Date();
  const reservationDateTime = new Date(`${this.scheduledDate.toISOString().split('T')[0]}T${this.startTime}:00`);
  const hoursUntilClass = (reservationDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilClass > 2; // Can cancel up to 2 hours before class
});

// Ensure virtual fields are serialized
reservationSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware to validate time conflicts
reservationSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified(['scheduledDate', 'startTime', 'endTime', 'trainer'])) {
    // Check for trainer conflicts
    const conflictingReservation = await this.constructor.findOne({
      _id: { $ne: this._id },
      trainer: this.trainer,
      scheduledDate: this.scheduledDate,
      status: { $nin: ['cancelled'] },
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ]
    });

    if (conflictingReservation) {
      return next(new Error('Trainer has a conflicting reservation at this time'));
    }
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
