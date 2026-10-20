const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");

const normalizeCode = (code) =>
  typeof code === "string" ? code.trim().toUpperCase() : "";

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load coupons",
    });
  }
};

const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [
        { maxUses: null },
        { $expr: { $lt: ["$usedCount", "$maxUses"] } },
      ],
    })
      .select("code amount expiresAt")
      .sort({ expiresAt: 1 });

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Get Available Coupons Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load available coupons",
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code);
    const amount = Number(req.body.amount);
    const expiresAt = new Date(req.body.expiresAt);
    const maxUses =
      req.body.maxUses === "" ||
      req.body.maxUses === null ||
      req.body.maxUses === undefined
        ? null
        : Number(req.body.maxUses);

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Code must be 3–30 characters using letters, numbers, _ or -",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount amount must be greater than zero",
      });
    }

    if (
      !req.body.expiresAt ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future",
      });
    }

    if (
      maxUses !== null &&
      (!Number.isInteger(maxUses) || maxUses < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Usage limit must be a positive whole number",
      });
    }

    const coupon = await Coupon.create({
      code,
      amount,
      expiresAt,
      maxUses,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A coupon with this code already exists",
      });
    }

    console.error("Create Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Enter a coupon code",
      });
    }

    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [
        { maxUses: null },
        { $expr: { $lt: ["$usedCount", "$maxUses"] } },
      ],
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is invalid, expired, or has reached its usage limit",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    const subtotal = cart
      ? cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        )
      : 0;

    if (subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Add items to your cart before applying a coupon",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        amount: coupon.amount,
        discountAmount: Math.min(coupon.amount, subtotal),
      },
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};

const updateCouponStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Coupon status must be active or inactive",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true },
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

module.exports = {
  getCoupons,
  getAvailableCoupons,
  createCoupon,
  validateCoupon,
  updateCouponStatus,
  deleteCoupon,
};
