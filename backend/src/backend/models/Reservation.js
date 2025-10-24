import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING_PAYMENT",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    attended: {
      type: Boolean,
      default: false,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
reservationSchema.index({ userId: 1, classId: 1, date: 1 });
reservationSchema.index({ classId: 1, date: 1, status: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
