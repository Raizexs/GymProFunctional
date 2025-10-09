const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'Reservation is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    enum: ['USD', 'EUR', 'MXN', 'COP']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'bank_transfer', 'cash', 'stripe', 'paypal']
  },
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripeChargeId: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Payment description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  metadata: {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer'
    },
    scheduledDate: Date,
    clientEmail: String,
    clientName: String
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    maxlength: [200, 'Refund reason cannot exceed 200 characters']
  },
  refundedAt: {
    type: Date,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  receiptUrl: {
    type: String,
    default: null
  },
  invoiceNumber: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ client: 1 });
paymentSchema.index({ reservation: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for isRefunded
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded' || this.refundAmount > 0;
});

// Virtual for netAmount
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.refundAmount;
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware to generate invoice number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.invoiceNumber = `INV-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
