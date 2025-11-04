import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: false, // No requerido para compra de planes
    },
    userPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlan",
      required: false, // Solo para pagos de planes
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    stripePaymentIntentId: {
      type: String,
      required: false, // No requerido para pagos mock o compra de planes
    },
    stripeClientSecret: {
      type: String,
    },
    method: {
      type: String,
      enum: ["CARD", "CASH", "TRANSFER", "PLAN", "FREE"],
      default: "CARD",
    },
    paymentMethod: {
      type: String,
    },
    description: {
      type: String,
    },
    receipt: {
      type: String,
    },
    refundId: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ reservationId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
