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

// ==========================================
// INITIATE ESEWA PAYMENT FOR AN EXISTING ORDER
// ==========================================

const {
  createEsewaPaymentPayload,
  verifyEsewaCallback,
} = require("../utils/esewa");

const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role === "customer" &&
      order.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled order",
      });
    }

    // Update payment method to eSewa
    order.paymentMethod = "eSewa";
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      { paymentMethod: "eSewa" }
    );

    await Receipt.findOneAndUpdate(
      { order: order._id },
      { paymentMethod: "eSewa" }
    );

    const esewaPayload = createEsewaPaymentPayload(
      order._id,
      order.totalAmount,
    );

    res.status(200).json({
      success: true,
      message: "eSewa payment initiated",
      esewa: esewaPayload,
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error("Initiate eSewa Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate eSewa payment",
    });
  }
};

// ==========================================
// VERIFY ESEWA PAYMENT CALLBACK
// ==========================================

const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Payment response data is required",
      });
    }

    const verification = await verifyEsewaCallback(data);

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: verification.message || "Payment verification failed",
      });
    }

    const { orderId, transactionCode } = verification;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Could not identify order from transaction reference",
      });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("items.food", "name image category")
      .populate("receipt", "receiptNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order associated with payment was not found",
      });
    }

    // If order was already marked as paid
    if (order.paymentStatus === "Paid") {
      const existingPayment = await Payment.findOne({ order: order._id });
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
        payment: existingPayment,
        alreadyPaid: true,
      });
    }

    // Mark Order as Paid
    order.paymentStatus = "Paid";
    order.paymentMethod = "eSewa";
    await order.save();

    // Mark Payment as Paid
    const payment = await Payment.findOneAndUpdate(
      { order: order._id },
      {
        paymentStatus: "Paid",
        paymentMethod: "eSewa",
        transactionId: transactionCode || "",
        paymentDate: new Date(),
      },
      { new: true }
    );

    // Update Receipt
    const receipt = await Receipt.findOneAndUpdate(
      { order: order._id },
      {
        paymentStatus: "Paid",
        paymentMethod: "eSewa",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "eSewa payment verified successfully",
      order,
      payment,
      receipt,
      transactionCode,
    });
  } catch (error) {
    console.error("Verify eSewa Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while verifying eSewa payment",
    });
  }
};

module.exports = {
  markPaymentAsPaid,
  markPaymentAsFailed,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  initiateEsewaPayment,
  verifyEsewaPayment,
};

