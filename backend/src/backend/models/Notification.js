import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "CLASS_REMINDER_24H",
        "CLASS_REMINDER_2H",
        "PAYMENT_CONFIRMATION",
        "RESERVATION_CONFIRMED",
        "RESERVATION_CANCELLED",
        "PLAN_PURCHASED",
        "PROMOTION",
        "GENERAL",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    sentVia: {
      type: [String],
      enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
      default: ["IN_APP"],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Reservation", "Payment", "Class", "UserPlan"],
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
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
