const express = require("express");
const {
  getCoupons,
  getAvailableCoupons,
  createCoupon,
  validateCoupon,
  updateCouponStatus,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/validate", authorize("customer"), validateCoupon);
router.get("/available", authorize("customer"), getAvailableCoupons);
router.get("/", authorize("admin"), getCoupons);
router.post("/", authorize("admin"), createCoupon);
router.patch("/:id/status", authorize("admin"), updateCouponStatus);
router.delete("/:id", authorize("admin"), deleteCoupon);

module.exports = router;
