const express = require("express");
const router = express.Router();

const authToken = require("../middleware/authenticateToken");
const readIngredientController = require("../controllers/ingredient/readIngredientController");
const deleteIngredientController = require("../controllers/ingredient/deleteIngredientController");
const createIngredientController = require("../controllers/ingredient/createIngredientController");
const updateIngredientController = require("../controllers/ingredient/updateIngredientController");

// create api for ingredients
router.get("/search/ingredients", authToken, createIngredientController.search_ingredients);
router.post("/new", authToken, createIngredientController.create_ingredient);

// Read api for ingredients
router.get("/all", authToken, readIngredientController.get_all_ingredients);
router.get("/:ingId", authToken, readIngredientController.get_ingredient_details);
router.get("/deleted_ingredients", authToken, readIngredientController.get_all_deleted_ing);

// Update api for ingredients
router.get("/search/editIngredients", authToken, updateIngredientController.search_ingredients);
router.put("/edit/:ingId", authToken, updateIngredientController.update_ingredient);

// Delete api for ingredients
router.delete("/delete/:ingId", authToken, deleteIngredientController.delete_ingredient);
router.put("/activate/:ingId", authToken, deleteIngredientController.activate_ingredient);

module.exports = router;
