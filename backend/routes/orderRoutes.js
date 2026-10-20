const express = require("express");

const {
  createOrder,
  getMyOrders,
  reorderOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// CUSTOMER

router.post("/", createOrder);

router.get("/my-orders", getMyOrders);

router.post("/:id/reorder", authorize("customer"), reorderOrder);

// ADMIN

router.get("/", authorize("admin"), getAllOrders);

router.put("/:id/status", authorize("admin"), updateOrderStatus);

// SINGLE ORDER

router.get("/:id", getOrderById);

module.exports = router;
