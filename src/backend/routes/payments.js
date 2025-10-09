const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');
const Client = require('../models/Client');
const { verifyToken, isClient } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private (Client)
router.post('/create-payment-intent', verifyToken, isClient, [
  body('reservationId').isMongoId().withMessage('Valid reservation ID is required'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Valid amount is required')
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

    const { reservationId, amount } = req.body;

    // Verify reservation exists and belongs to client
    const reservation = await Reservation.findById(reservationId)
      .populate('client')
      .populate('class')
      .populate('trainer');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservation.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (reservation.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Reservation is already paid'
      });
    }

    // Create payment record
    const payment = new Payment({
      client: req.user._id,
      reservation: reservationId,
      amount: amount * 100, // Convert to cents for Stripe
      currency: 'usd',
      paymentMethod: 'stripe',
      status: 'pending',
      description: `Payment for ${reservation.class.name} class`,
      metadata: {
        classId: reservation.class._id,
        trainerId: reservation.trainer._id,
        scheduledDate: reservation.scheduledDate,
        clientEmail: reservation.client.email,
        clientName: `${reservation.client.firstName} ${reservation.client.lastName}`
      }
    });

    await payment.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        paymentId: payment._id.toString(),
        reservationId: reservationId,
        clientId: req.user._id.toString()
      },
      description: `Payment for ${reservation.class.name} class`,
      receipt_email: reservation.client.email
    });

    // Update payment with Stripe payment intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    await payment.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        amount: amount
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment after successful Stripe payment
// @access  Private (Client)
router.post('/confirm', verifyToken, isClient, [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
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

    const { paymentId, paymentIntentId } = req.body;

    // Verify payment exists and belongs to client
    const payment = await Payment.findById(paymentId)
      .populate('reservation')
      .populate('client');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.stripeChargeId = paymentIntent.latest_charge;
    payment.processedAt = new Date();
    payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;

    await payment.save();

    // Update reservation payment status
    await Reservation.findByIdAndUpdate(payment.reservation._id, {
      paymentStatus: 'paid',
      paymentId: payment._id,
      status: 'confirmed'
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments
// @desc    Get client's payment history
// @access  Private (Client)
router.get('/', verifyToken, isClient, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { client: req.user._id };
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
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment details
// @access  Private (Client)
router.get('/:id', verifyToken, isClient, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('reservation')
      .populate({
        path: 'reservation',
        populate: [
          { path: 'class', select: 'name category duration' },
          { path: 'trainer', select: 'firstName lastName' }
        ]
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payments/:id/refund
// @desc    Request refund for a payment
// @access  Private (Client)
router.post('/:id/refund', verifyToken, isClient, [
  body('reason').isLength({ min: 10, max: 200 }).withMessage('Refund reason must be between 10 and 200 characters')
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

    const payment = await Payment.findById(req.params.id)
      .populate('reservation');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    if (payment.isRefunded) {
      return res.status(400).json({
        success: false,
        message: 'Payment is already refunded'
      });
    }

    // Check if reservation can be refunded (within 24 hours of class)
    const reservationDate = new Date(payment.reservation.scheduledDate);
    const now = new Date();
    const hoursUntilClass = (reservationDate - now) / (1000 * 60 * 60);

    if (hoursUntilClass < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund payment less than 24 hours before class'
      });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        refundReason: reason,
        paymentId: payment._id.toString()
      }
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();

    await payment.save();

    // Update reservation status
    await Reservation.findByIdAndUpdate(payment.reservation._id, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      cancellationReason: `Refund requested: ${reason}`,
      cancelledAt: new Date(),
      cancelledBy: 'client'
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        payment,
        refundId: refund.id
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions for webhook handling
async function handlePaymentSuccess(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });

  if (payment && payment.status === 'pending') {
    payment.status = 'completed';
    payment.stripeChargeId = paymentIntent.latest_charge;
    payment.processedAt = new Date();
    await payment.save();

    // Update reservation
    await Reservation.findByIdAndUpdate(payment.reservation, {
      paymentStatus: 'paid',
      paymentId: payment._id,
      status: 'confirmed'
    });
  }
}

async function handlePaymentFailure(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });

  if (payment) {
    payment.status = 'failed';
    payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    await payment.save();
  }
}

module.exports = router;
