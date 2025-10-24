import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    specialties: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [
        {
          name: String,
          institution: String,
          year: Number,
        },
      ],
      default: [],
    },
    availability: {
      type: Map,
      of: [
        {
          start: String, // "09:00"
          end: String, // "17:00"
        },
      ],
    },
    hourlyRate: {
      type: Number,
    },
    stats: {
      totalClasses: { type: Number, default: 0 },
      totalStudents: { type: Number, default: 0 },
      avgRating: { type: Number, default: 5 },
      totalEarnings: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Trainer = mongoose.model("Trainer", trainerSchema);

export default Trainer;
