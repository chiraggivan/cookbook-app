const express = require("express");
const router = express.Router();

const createRecipeController = require("../controllers/recipe/createRecipeController");
const readRecipeController = require("../controllers/recipe/readRecipeController");
const updateRecipeController = require("../controllers/recipe/updateRecipeController");
const deleteRecipeController = require("../controllers/recipe/deleteRecipeController");
const authenticateToken = require("../middleware/authenticateToken");

// api for create recipe
router.get("/search/ingredient/:q", authenticateToken, createRecipeController.search_ingredients);
router.get("/search/units/:ing_id/:source", createRecipeController.get_ingredient_units);
router.post("/new", authenticateToken, createRecipeController.create_recipe);

// api for read recipe
router.get("/all", authenticateToken, readRecipeController.get_recipes);
router.get("/user/:q", authenticateToken, readRecipeController.get_user_recipes);
router.get("/my", authenticateToken, readRecipeController.get_my_recipes);
router.get("/:q", authenticateToken, readRecipeController.get_recipe_details);
router.get("/last-record/:recipeId", authenticateToken, readRecipeController.get_last_record);

// api for update recipe
router.get(
  "/edit/:recipeId",
  authenticateToken,
  updateRecipeController.get_recipe_details_for_update,
);
router.get("/units/:ingId/:ingSrc", authenticateToken, updateRecipeController.get_units);
router.put("/update-privacy/:recipeId", authenticateToken, updateRecipeController.update_privacy);
router.patch("/update/:recipeId", authenticateToken, updateRecipeController.update_recipe);
// api for delete recipe
router.delete("/delete/:recipeId", authenticateToken, deleteRecipeController.delete_recipe);

module.exports = router;
