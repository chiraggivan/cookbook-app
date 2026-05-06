const express = require("express");
const router = express.Router();

const authToken = require("../middleware/authenticateToken");
const updtWklyDshbrdController = require("../controllers/weeklyDashboard/updateWeeklyDashboardController");

// create api for Weekly Dashboard

// Read api for Weekly Dashboard

// Update api for Weekly Dashboard
router.put("/setdaily", authToken, updtWklyDshbrdController.set_daily_dashboard);

// Delete api for Weekly Dashboard

module.exports = router;
