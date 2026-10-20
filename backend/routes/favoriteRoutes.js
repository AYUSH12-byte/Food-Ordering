const express = require("express");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("customer"));

router.get("/", getFavorites);
router.put("/:foodId", addFavorite);
router.delete("/:foodId", removeFavorite);

module.exports = router;
