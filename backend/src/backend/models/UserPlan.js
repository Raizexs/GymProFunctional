import mongoose from "mongoose";

const userPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "PENDING_PAYMENT",
    },
    creditsRemaining: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    purchasePrice: {
      type: Number, // Precio pagado en centavos
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
userPlanSchema.index({ userId: 1, status: 1 });
userPlanSchema.index({ expiryDate: 1, status: 1 });

const UserPlan = mongoose.model("UserPlan", userPlanSchema);

export default UserPlan;
