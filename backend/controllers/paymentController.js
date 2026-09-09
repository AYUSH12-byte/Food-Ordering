const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Receipt = require("../models/Receipt");

// MARK PAYMENT AS PAID

const markPaymentAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is already marked as paid",
      });
    }

    payment.paymentStatus = "Paid";

    payment.paymentDate = new Date();

    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: "Paid",
    });

    res.status(200).json({
      success: true,
      message: "Payment marked as paid",
      payment,
    });
  } catch (error) {
    console.error("Mark Payment Paid Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// MARK PAYMENT AS FAILED

const markPaymentAsFailed = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid payment cannot be marked as failed",
      });
    }

    payment.paymentStatus = "Failed";

    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: "Failed",
    });

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      payment,
    });
  } catch (error) {
    console.error("Payment Failed Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET MY PAYMENTS

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
    })
      .populate(
        "order",
        "items subtotal deliveryCharge totalAmount orderStatus",
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get My Payments Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL PAYMENTS

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email phone")
      .populate(
        "order",
        "subtotal deliveryCharge totalAmount orderStatus receipt",
      )
      .populate("order.receipt", "receiptNumber")
      .sort({
        createdAt: -1,
      });

    const paymentsWithReceipts = await Promise.all(
      payments.map(async (payment) => {
        if (payment.order && !payment.order.receipt) {
          const receipt = await Receipt.findOne({ order: payment.order._id })
            .select("receiptNumber")
            .lean();

          if (receipt) {
            payment.order.receipt = receipt;
          }
        }

        return payment;
      }),
    );

    res.status(200).json({
      success: true,
      count: paymentsWithReceipts.length,
      payments: paymentsWithReceipts,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE PAYMENT

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email phone")
      .populate(
        "order",
        "items subtotal deliveryCharge totalAmount orderStatus",
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (
      req.user.role === "customer" &&
      payment.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  markPaymentAsPaid,
  markPaymentAsFailed,
  getMyPayments,
  getAllPayments,
  getPaymentById,
};
