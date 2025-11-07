import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web",
    },
    userAgent: {
      type: String,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
deviceTokenSchema.index({ userId: 1, isActive: 1 });

// Método para actualizar último uso
deviceTokenSchema.methods.updateLastUsed = function () {
  this.lastUsed = new Date();
  return this.save();
};

const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);

export default DeviceToken;
