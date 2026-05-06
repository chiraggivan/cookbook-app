const db = require("../../config/database");

// delete user ingredient
exports.delete_user_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ingId = Number(req.params.ingId);
    // validate ingId
    if (!ingId || ingId < 1 || !Number.isInteger(ingId)) {
      return res.status(404).json({
        success: false,
        message: `ingredientId provided is not defined properly. should be positive integer`,
      });
    }
    //  validate user is valid and active
    const [userRow] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);
    if (userRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User not found or not active`,
      });
    }

    // check if ingredient is owned by user
    const [ingRow] = await db.query(
      `SELECT name FROM user_ingredients WHERE user_ingredient_id = ? AND submitted_by =? AND is_active = 1`,
      [ingId, user.id],
    );
    if (ingRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: `user Ingredient id ${ingId} - No such ingredient exists for the user`,
      });
    }

    // ------------------------------ Now delete the data thru procedure ------------------------------------------

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(`CALL delete_user_ingredient(?,?,?)`, [
        ingId,
        ingRow[0].name,
        user.id,
      ]);

      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in deleteUserIngController- (delete_user_ingredient):", err);

      return res.status(500).json({
        success: false,
        message: "Error while deleting user ingredient in db",
      });
    } finally {
      conn.release();
    }

    // FINAL response
    res.json({
      success: true,
      message: `user ingredients deleted`,
    });
  } catch (err) {
    console.error("Error in deleteUserIngController - (delete_user_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
