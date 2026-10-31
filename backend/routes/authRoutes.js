const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC

router.post("/register", register);

router.post("/login", login);

// AUTHENTICATED USER

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

router.get("/addresses", protect, listAddresses);

router.post("/addresses", protect, addAddress);

router.put("/addresses/:addressId", protect, updateAddress);

router.put("/addresses/:addressId/default", protect, setDefaultAddress);

router.delete("/addresses/:addressId", protect, deleteAddress);

router.put("/change-password", protect, changePassword);

module.exports = router;
