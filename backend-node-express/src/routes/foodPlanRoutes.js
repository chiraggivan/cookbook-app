const express = require("express");
const router = express.Router();

const authToken = require("../middleware/authenticateToken");
const readFoodPlanController = require("../controllers/foodPlans/readFoodPlanController");
const createFoodPlanController = require("../controllers/foodPlans/createFoodPlanController");
const updateFoodPlanController = require("../controllers/foodPlans/updateFoodPlanController");

// create api for Food plan
router.post("/create", authToken, createFoodPlanController.create_food_plan); // NOT REQUIRE NOW. Everything will be done with PUT(update)
router.get("/check-user", authToken, createFoodPlanController.check_user_has_plan);
router.get("/createfoodplanid", authToken, createFoodPlanController.create_food_plan_id);

// Read api for Food plan
router.get("/", authToken, readFoodPlanController.get_food_plan);

// Update api for Food plan
router.put("/update", authToken, updateFoodPlanController.update_day_food_plan);
router.get("/searchrecipes", authToken, updateFoodPlanController.search_recipes);

module.exports = router;
