import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUAL", "CREDITS_PACK"],
      required: true,
    },
    price: {
      type: Number, // En centavos
      required: true,
      min: 0,
    },
    credits: {
      type: Number, // Número de clases incluidas
      required: true,
      min: 0,
    },
    validityDays: {
      type: Number, // Días de validez del plan
      required: true,
      min: 1,
    },
    features: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    discountPercentage: {
      type: Number, // % de descuento sobre precio normal
      default: 0,
      min: 0,
      max: 100,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
planSchema.index({ isActive: 1, type: 1 });

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
