const mongoose = require("mongoose");

const savedAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    savedAddresses: {
      type: [savedAddressSchema],
      default: [],
    },

    favoriteFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
