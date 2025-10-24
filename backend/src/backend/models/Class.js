import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    days: {
      type: [String],
      default: [],
    },
    time: {
      type: String,
      required: true,
    },
    durationMin: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      enum: [
        "CARDIO",
        "STRENGTH",
        "FLEXIBILITY",
        "YOGA",
        "PILATES",
        "DANCE",
        "MARTIAL_ARTS",
        "CROSSFIT",
        "OTHER",
      ],
      default: "OTHER",
    },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "INTERMEDIATE",
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    imageUrl: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Índices
classSchema.index({ coachId: 1 });

const Class = mongoose.model("Class", classSchema);

export default Class;
