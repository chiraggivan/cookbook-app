const db = require("../../config/database");

exports.delete_dish = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const dishId = Number(req.params.dishId);
    if (!dishId || dishId < 1 || !Number.isInteger(dishId)) {
      return res.status(404).json({
        success: false,
        message: `dishId Id provided is not defined properly. should be positive integer`,
      });
    }

    // validate if user/Dish id exists and is_active
    const [checkDish] = await db.query(
      `SELECT 1 
            FROM dishes d JOIN users u ON u.user_id = d.user_id
            WHERE d.user_id = ? AND d.dish_id = ? AND u.is_active = 1 AND d.is_active = 1`,
      [user.id, dishId],
    );
    if (checkDish.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active user/dish found`,
      });
    }

    return res.json({
      success: true,
      message: `From Backend: Dish found and is of the same user but currently not deleting it in deleteDishController`,
    });

    // create a getConnnection() to handle the transactional query when dealing with multiple tables
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [resultMain] = await conn.query(
        `UPDATE dishes
        SET is_active = 0, end_date = CURRENT_TIMESTAMP
        WHERE dish_id = ?`,
        [dishId],
      );

      const [resultDep] = await conn.query(
        `UPDATE dish_ingredients
        SET is_active = 0, end_date = CURRENT_TIMESTAMP
        WHERE dish_id = ?`,
        [dishId],
      );

      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in deleteDishController-delete_dish while soft deleting dish:", err);

      return res.status(500).json({
        success: false,
        message: "Error while soft deleting dish in db",
      });
    } finally {
      conn.release();
    }
    // FINAL response
    res.json({
      success: true,
      message: `Dish deleted`,
    });
  } catch (err) {
    console.error("Error in deleteDishController - delete_dish :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
