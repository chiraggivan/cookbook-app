const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const readDishController = require("../controllers/dish/readDishController");
const deleteDishController = require("../controllers/dish/deleteDishController");
const createDishController = require("../controllers/dish/createDishController");

// Read api for dishes
router.get("/", authenticateToken, readDishController.get_dishes);
router.get("/:dishId", authenticateToken, readDishController.get_dish_details);

// delete api for dishes
router.delete("/delete/:dishId", authenticateToken, deleteDishController.delete_dish);

// create api for dishes
router.get("/last-record/:recipeId", authenticateToken, createDishController.get_last_record);
router.post("/create", authenticateToken, createDishController.create_dish);

module.exports = router;
