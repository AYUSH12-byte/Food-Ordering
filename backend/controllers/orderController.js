const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const Counter = require("../models/Counter");
const Food = require("../models/Food");
const mongoose = require("mongoose");

const DELIVERY_CHARGE = 50;

// ==========================================
// GENERATE RECEIPT NUMBER
// ==========================================

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { name: "receipt" },
    { $inc: { sequence: 1 } },
    {
      returnDocument: "after",
      upsert: true,
    },
  );

  const sequence = String(counter.sequence).padStart(5, "0");

  return `REC-${year}-${sequence}`;
};

// ==========================================
// CREATE ORDER
// ==========================================

const createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      deliveryPhone,
      deliveryNote = "",
      paymentMethod = "Cash on Delivery",
    } = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!deliveryPhone || !deliveryPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery phone is required",
      });
    }

    if (!["Cash on Delivery", "Online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ------------------------------------------
    // FIND CUSTOMER CART
    // ------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate({
      path: "items.food",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // ------------------------------------------
    // VALIDATE FOOD ITEMS
    // ------------------------------------------

    for (const item of cart.items) {
      if (!item.food) {
        return res.status(400).json({
          success: false,
          message: "One of the food items no longer exists",
        });
      }

      if (!item.food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${item.food.name} is currently unavailable`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${item.food.name}`,
        });
      }
    }

    // ------------------------------------------
    // CREATE ORDER ITEMS
    // ------------------------------------------

    const orderItems = cart.items.map((item) => {
      const price = Number(item.price);

      const quantity = Number(item.quantity);

      const itemSubtotal = price * quantity;

      return {
        food: item.food._id,
        name: item.food.name,
        price,
        quantity,
        subtotal: itemSubtotal,
      };
    });

    // ------------------------------------------
    // CALCULATE SUBTOTAL
    // ------------------------------------------

    const subtotal = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    // ------------------------------------------
    // DELIVERY CHARGE
    // ------------------------------------------

    const deliveryCharge = DELIVERY_CHARGE;

    // ------------------------------------------
    // FINAL TOTAL
    // ------------------------------------------

    const totalAmount = subtotal + deliveryCharge;

    // ------------------------------------------
    // CREATE ORDER
    // ------------------------------------------

    const order = await Order.create({
      user: req.user.id,

      items: orderItems,

      subtotal,

      deliveryCharge,

      totalAmount,

      deliveryAddress: deliveryAddress.trim(),

      deliveryPhone: deliveryPhone.trim(),

      deliveryNote: deliveryNote.trim(),

      paymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Pending",

      receipt: null,
    });

    // ------------------------------------------
    // CREATE PAYMENT
    // ------------------------------------------

    const payment = await Payment.create({
      order: order._id,

      user: req.user.id,

      amount: totalAmount,

      paymentMethod,

      paymentStatus: "Pending",

      transactionId: "",
    });

    // ------------------------------------------
    // GENERATE RECEIPT NUMBER
    // ------------------------------------------

    const receiptNumber = await generateReceiptNumber();

    // ------------------------------------------
    // CREATE RECEIPT
    // ------------------------------------------

    const receipt = await Receipt.create({
      receiptNumber,

      order: order._id,

      user: req.user.id,

      amount: totalAmount,

      paymentMethod,

      paymentStatus: "Pending",
    });

    // ------------------------------------------
    // LINK RECEIPT TO ORDER
    // ------------------------------------------

    order.receipt = receipt._id;

    await order.save();

    // ------------------------------------------
    // CLEAR CART
    // ------------------------------------------

    cart.items = [];

    cart.subtotal = 0;

    await cart.save();

    // ------------------------------------------
    // GET COMPLETE ORDER
    // ------------------------------------------

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.food", "name image category")
      .populate("receipt", "receiptNumber");

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order: populatedOrder,

      payment: {
        id: payment._id,

        amount: payment.amount,

        paymentMethod: payment.paymentMethod,

        paymentStatus: payment.paymentStatus,
      },

      receipt: {
        id: receipt._id,

        receiptNumber: receipt.receiptNumber,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    // Handle duplicate errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate record detected. Please try again.",
        error: error.keyPattern,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET MY ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.food", "name image")
      .populate("receipt", "receiptNumber")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REORDER FROM A PREVIOUS ORDER

const reorderOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const foodIds = order.items
      .map((item) => item.food)
      .filter(Boolean);
    const availableFoods = await Food.find({
      _id: { $in: foodIds },
      isAvailable: true,
    });
    const foodsById = new Map(
      availableFoods.map((food) => [food._id.toString(), food]),
    );
    const addedItems = [];
    const skippedItems = [];

    for (const orderItem of order.items) {
      const foodId = orderItem.food?.toString();
      const food = foodId ? foodsById.get(foodId) : null;

      if (!food) {
        skippedItems.push({
          name: orderItem.name,
          reason: "No longer available",
        });
        continue;
      }

      addedItems.push({
        food,
        quantity: orderItem.quantity,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (addedItems.length > 0) {
      if (!cart) {
        cart = new Cart({
          user: req.user.id,
          items: [],
        });
      }

      for (const { food, quantity } of addedItems) {
        const existingItem = cart.items.find(
          (item) => item.food.toString() === food._id.toString(),
        );

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.price = food.price;
        } else {
          cart.items.push({
            food: food._id,
            quantity,
            price: food.price,
          });
        }
      }

      cart.subtotal = cart.items.reduce(
        (subtotal, item) => subtotal + item.price * item.quantity,
        0,
      );
      await cart.save();
    }

    const populatedCart = cart
      ? await Cart.findById(cart._id).populate({
          path: "items.food",
          select: "name description price image isAvailable preparationTime category",
          populate: {
            path: "category",
            select: "name",
          },
        })
      : { items: [], subtotal: 0 };

    res.status(200).json({
      success: true,
      message: addedItems.length
        ? "Available items were added to your cart"
        : "No items from this order are currently available",
      addedItems: addedItems.map(({ food, quantity }) => ({
        name: food.name,
        quantity,
      })),
      skippedItems,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Reorder Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder items",
    });
  }
};

// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.food", "name image")
      .populate("receipt", "receiptNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // CUSTOMER OWNERSHIP CHECK
    // ------------------------------------------

    if (
      req.user.role === "customer" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET ALL ORDERS - ADMIN
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.food", "name image")
      .populate("receipt", "receiptNumber")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    // ------------------------------------------
    // STATUS TRANSITIONS
    // ------------------------------------------

    const allowedTransitions = {
      Pending: ["Preparing", "Cancelled"],

      Preparing: ["Ready", "Cancelled"],

      Ready: ["Delivered"],

      Delivered: [],

      Cancelled: [],
    };

    // ------------------------------------------
    // FIND ORDER
    // ------------------------------------------

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // VALIDATE CURRENT STATUS
    // ------------------------------------------

    if (!Object.keys(allowedTransitions).includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Current order status is invalid",
      });
    }

    // ------------------------------------------
    // VALIDATE NEW STATUS
    // ------------------------------------------

    const possibleStatuses = allowedTransitions[order.orderStatus];

    if (!possibleStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // ------------------------------------------
    // UPDATE STATUS
    // ------------------------------------------

    order.orderStatus = orderStatus;

    await order.save();

    // ------------------------------------------
    // RETURN UPDATED ORDER
    // ------------------------------------------

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("receipt", "receiptNumber");

    res.status(200).json({
      success: true,

      message: "Order status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  reorderOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
