const Food = require("../models/Food");
const Category = require("../models/Category");
const Feedback = require("../models/Feedback");
const Order = require("../models/Order");

// CREATE FOOD

const createFood = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      image,
      isAvailable,
      preparationTime,
    } = req.body;

    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, description and price are required",
      });
    }

    // Check category
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate food name
    const existingFood = await Food.findOne({
      name: name.trim(),
    });

    if (existingFood) {
      return res.status(400).json({
        success: false,
        message: "Food item already exists",
      });
    }

    const food = await Food.create({
      name: name.trim(),
      category,
      description: description.trim(),
      price,
      image,
      isAvailable,
      preparationTime,
    });

    const populatedFood = await Food.findById(food._id).populate(
      "category",
      "name",
    );

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      food: populatedFood,
    });
  } catch (error) {
    console.error("Create Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL FOOD

const getFoods = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, available } = req.query;

    const filter = {};

    // Search by food name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter availability
    if (available !== undefined) {
      filter.isAvailable = available === "true";
    }

    const [foods, foodRatings] = await Promise.all([
      Food.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 }),
      Feedback.aggregate([
        {
          $lookup: {
            from: Order.collection.name,
            localField: "order",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        { $unwind: "$order.items" },
        {
          $group: {
            _id: "$order.items.food",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const ratingsByFoodId = new Map(
      foodRatings.map((rating) => [String(rating._id), rating]),
    );
    const foodsWithRatings = foods.map((food) => {
      const rating = ratingsByFoodId.get(String(food._id));

      return {
        ...food.toObject(),
        averageRating: rating?.averageRating ?? null,
        reviewCount: rating?.reviewCount ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      count: foodsWithRatings.length,
      foods: foodsWithRatings,
    });
  } catch (error) {
    console.error("Get Foods Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE FOOD

const getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate(
      "category",
      "name description",
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Get Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// UPDATE FOOD


const updateFood = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      image,
      isAvailable,
      preparationTime,
    } = req.body;

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Check category if changed
    if (category && category !== food.category.toString()) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "New category not found",
        });
      }

      food.category = category;
    }

    // Check duplicate name
    if (name && name.trim() !== food.name) {
      const existingFood = await Food.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingFood) {
        return res.status(400).json({
          success: false,
          message: "Another food item with this name already exists",
        });
      }

      food.name = name.trim();
    }

    if (description !== undefined) {
      food.description = description.trim();
    }

    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      food.price = price;
    }

    if (image !== undefined) {
      food.image = image;
    }

    if (isAvailable !== undefined) {
      food.isAvailable = isAvailable;
    }

    if (preparationTime !== undefined) {
      food.preparationTime = preparationTime;
    }

    await food.save();

    const updatedFood = await Food.findById(food._id).populate(
      "category",
      "name",
    );

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      food: updatedFood,
    });
  } catch (error) {
    console.error("Update Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE FOOD


const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
};
