const express = require("express");

const {
  markPaymentAsPaid,
  markPaymentAsFailed,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  initiateEsewaPayment,
  verifyEsewaPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public callback verification for eSewa
router.post("/esewa/verify", verifyEsewaPayment);

router.use(protect);

// Customer eSewa initiation
router.post("/esewa/initiate/:orderId", initiateEsewaPayment);

// Customer
router.get("/my-payments", getMyPayments);

// Admin
router.get("/", authorize("admin"), getAllPayments);

router.put("/:id/paid", authorize("admin"), markPaymentAsPaid);

router.put("/:id/failed", authorize("admin"), markPaymentAsFailed);

// Single payment
router.get("/:id", getPaymentById);

module.exports = router;
