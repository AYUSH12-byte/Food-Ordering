const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[A-Z0-9_-]+$/,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Coupon", couponSchema);
