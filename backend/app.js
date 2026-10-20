const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customerRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// GLOBAL MIDDLEWARE

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// HEALTH CHECK

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Ordering System API is running",
  });
});

// API ROUTES

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/foods", foodRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/receipts", receiptRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/favorites", favoriteRoutes);

// 404 HANDLER

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ERROR HANDLER

app.use(errorMiddleware);

module.exports = app;
