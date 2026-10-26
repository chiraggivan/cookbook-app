const db = require("../../config/database");

exports.remove_bookmark = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipe_id = req.params.recipeId;

    if (!recipe_id) {
      return res.status(400).json({
        success: false,
        message: "Recipe id missing.",
      });
    }

    // As only one value(recipe_id) is coming in body, not need for separate normalisation and validation

    // BREAK POINT
    // return res.json({
    //   success: true,
    //   message: "Breakpoint reached",
    // });

    // ----------------------------- start deleting in database -------------------------------------------
    const insertQuery = `DELETE FROM user_saved_recipes WHERE user_id = ? AND recipe_id = ?`;
    try {
      await db.query(insertQuery, [user.id, recipe_id]);
      // FINAL response
      res.json({
        success: true,
        message: "Bookmarked removed successfully.",
      });
    } catch (err) {
      console.log("Error in delete user saved recipe while deleting :", err);
      res.status(500).json({
        success: false,
        message: "Server Error. Please try later.",
      });
    }
  } catch (err) {
    console.log("Error in deleteUsrSvdRcpCntrllr - during  :", err);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try later.",
    });
  }
};
