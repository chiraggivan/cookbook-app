const db = require("../../config/database");

// delete recipe - soft deletes
exports.delete_recipe = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    const recipeId = Number(req.params.recipeId);

    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: `recipe Id provided is not defined properly. should be positive integer`,
      });
    }

    // validate is user and recipe is still active and belongs to same user
    const [userResult] = await db.query(
      `SELECT 1
        FROM users u JOIN recipes r ON u.user_id = r.user_id
        WHERE r.recipe_id = ? AND r.user_id = ? AND r.is_active = 1 AND u.is_active = 1`,
      [recipeId, user.id],
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipe/user not active or user not rightful owner",
      });
    }

    // Call the procedure to delete the recipe
    // try {
    //   await db.query(`CALL delete_recipe(?, ?)`, [user.id, recipeId]);
    // } catch (err) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Error while deleting in db.",
    //   });
    // }

    // response the data back
    res.json({
      success: true,
      message: `Recipe deleted`,
    });
  } catch (err) {
    console.error("Error in deleteRecipeController - delete_recipe is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
