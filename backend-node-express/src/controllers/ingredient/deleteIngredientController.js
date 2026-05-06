const db = require("../../config/database");

exports.delete_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ingId = req.params.ingId;
    const role = user.role;
    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    // check with db if user is still admin and active as token might be old and not updated
    const [userResult] = await db.query(
      `SELECT role FROM users WHERE user_id = ? AND is_active =1`,
      [user.id],
    );
    if (userResult[0].role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Not Authorised to delete.",
      });
    }

    // Check if ingredient ID exists
    const [ingResult] = await db.query(
      `SELECT notes FROM ingredients WHERE ingredient_id = ? AND is_active = 1`,
      [ingId],
    );
    if (ingResult.length === 0) {
      return res.status(500).json({
        success: false,
        message: `No active ingredient found for ingredientId : ${ingId}`,
      });
    }
    const notes = ingResult[0].notes;

    // UPDATE the table by soft deleting ingredient
    const [result] = await db.query(
      `UPDATE ingredients
        SET is_active = 0, end_date = CURRENT_TIMESTAMP, notes = CONCAT(?,'\n Soft deleted by user : ', ?)
        WHERE ingredient_id = ?`,
      [notes, user.id, ingId],
    );

    // FINAL response
    res.json({
      success: true,
      message: `ingredient deleted.`,
    });
  } catch (err) {
    console.error("Error in deleteIngredientController -(delete_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

exports.activate_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ingId = req.params.ingId;
    const role = user.role;
    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    // check with db if user is still admin and active as token might be old and not updated
    const [userResult] = await db.query(
      `SELECT role FROM users WHERE user_id = ? AND is_active =1`,
      [user.id],
    );
    if (userResult[0].role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Not Authorised to delete.",
      });
    }

    // Check if ingredient ID exists
    const [ingResult] = await db.query(
      `SELECT notes FROM ingredients WHERE ingredient_id = ? AND is_active = 0`,
      [ingId],
    );
    if (ingResult.length === 0) {
      return res.status(500).json({
        success: false,
        message: `No inactive ingredient found for ingredientId : ${ingId}`,
      });
    }
    const notes = ingResult[0].notes;

    // UPDATE the table by reactivating ingredient
    const [result] = await db.query(
      `UPDATE ingredients 
        SET is_active = 1, end_date = NULL, notes = CONCAT(?,'\n Reactivated by admin id:', ?)
        WHERE ingredient_id = ?`,
      [notes, user.id, ingId],
    );

    // FINAL response
    res.json({
      success: true,
      message: `ingredient activated.`,
    });
  } catch (err) {
    console.error("Error in deleteIngredientController - (reactivate_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
