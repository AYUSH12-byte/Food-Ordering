const mongoose = require("mongoose");
const Food = require("../models/Food");
const User = require("../models/User");

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "favoriteFoods",
        select: "name description price image isAvailable preparationTime category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .select("favoriteFoods");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favoriteFoods,
    });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load favorites",
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.isValidObjectId(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const foodExists = await Food.exists({ _id: foodId });

    if (!foodExists) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favoriteFoods: foodId } },
      { new: true },
    )
      .populate({
        path: "favoriteFoods",
        select: "name description price image isAvailable preparationTime category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .select("favoriteFoods");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favoriteFoods,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save favorite",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!mongoose.isValidObjectId(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favoriteFoods: foodId } },
      { new: true },
    )
      .populate({
        path: "favoriteFoods",
        select: "name description price image isAvailable preparationTime category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .select("favoriteFoods");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favoriteFoods,
    });
  } catch (error) {
    console.error("Remove Favorite Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
