const express = require("express");
const app = express();

const cors = require("cors");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const dishRoutes = require("./routes/dishRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const userIngRoutes = require("./routes/userIngRoutes");
const foodPlanRoutes = require("./routes/foodPlanRoutes");
const weeklyDashboardRoutes = require("./routes/weeklyDashboardRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", testRoutes);
app.use("/auth/api", authRoutes);
app.use("/recipe/api", recipeRoutes);
app.use("/dish/api", dishRoutes);
app.use("/ingredient/api", ingredientRoutes);
app.use("/useringredient/api", userIngRoutes);
// app.use("/foodplan/api", foodPlanRoutes);
app.use("/weeklydashboard/api", weeklyDashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Backend is working!",
    status: "success",
  });
});

// 404 Handler - Must be the LAST route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
