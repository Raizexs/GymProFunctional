import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "TRAINER"],
      default: "USER",
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },
    // DEPRECATED: membershipType ya no se usa, ahora se usa UserPlan
    // membershipType: {
    //   type: String,
    //   enum: ["BASIC", "PREMIUM", "VIP"],
    //   default: "BASIC",
    // },
    // membershipExpiresAt: {
    //   type: Date,
    // },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      language: {
        type: String,
        default: "es",
      },
    },
    stats: {
      totalClasses: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      favoriteClass: { type: String },
    },
    refreshToken: {
      type: String,
      select: false, // No incluir en queries por defecto
    },
    refreshTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
