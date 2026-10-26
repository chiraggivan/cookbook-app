const express = require("express");
const router = express.Router();

const createUsrSvdRcpController = require("../controllers/userSavedRecipe/createUserSavedRecipeController");
const deleteUsrSvdRcpController = require("../controllers/userSavedRecipe/deleteUserSavedRecipeController");
const readUsrSvdRcpController = require("../controllers/userSavedRecipe/readUserSavedRecipeController");
const authenticateToken = require("../middleware/authenticateToken");

// api to read user's saved recipes
router.get(
  "/bookmarkedlist",
  authenticateToken,
  readUsrSvdRcpController.get_user_bookmarked_recipes,
);

// api to create user's saved recipes
router.post("/bookmarkRecipe", authenticateToken, createUsrSvdRcpController.bookmark_a_recipe);

// api to delete user's saved recipes
router.delete("/delete/:recipeId", authenticateToken, deleteUsrSvdRcpController.remove_bookmark);

module.exports = router;
