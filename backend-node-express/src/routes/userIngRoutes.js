const express = require("express");
const router = express.Router();

const authToken = require("../middleware/authenticateToken");
const readUserIngController = require("../controllers/userIngredient/readUserIngController");
const deleteUserIngController = require("../controllers/userIngredient/deleteUserIngController");
const createUseringController = require("../controllers/userIngredient/createUserIngController");
const updateUserIngController = require("../controllers/userIngredient/updateUserIngController");
// create api for ingredients
router.post("/create", authToken, createUseringController.create_user_ingredient);

// read api for ingredients
router.get("/search", authToken, readUserIngController.search_user_ings);
router.get("/", authToken, readUserIngController.read_user_ings);
router.get("/list", authToken, readUserIngController.list_user_ings);
router.get(
  "/searchCombinedIngs",
  authToken,
  readUserIngController.search_user_and_mmain_ings_names,
);

// update api for ingredients
router.put("/edit", authToken, updateUserIngController.update_user_ing);

// delete api for ingredients
router.delete("/delete/:ingId", authToken, deleteUserIngController.delete_user_ingredient);

module.exports = router;
