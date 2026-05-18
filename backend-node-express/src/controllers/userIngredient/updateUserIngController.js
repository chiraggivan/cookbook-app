const db = require("../../config/database");
const { normaliseIngredientData, validateIngredients } = require("../../utils/userIngUtils");

exports.update_user_ing = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    console.log("req body :", req?.body);
    const ogData = req?.body;
    ogData.quantity = Number(ogData.quantity);
    ogData.price = Number(ogData.price);
    if (ogData.cup_weight === "null") {
      ogData.cup_weight = null;
    }
    ogData.cup_weight = ogData.cup_weight ? Number(ogData.cup_weight) : null;
    ogData.user_ing_id = Number(ogData.user_ing_id);
    ogData.user_id = Number(ogData.user_id);
    ogData.notes = ogData.notes ?? "";

    if (!ogData) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // ----------------- normalise and validate the data --------------------
    const data = normaliseIngredientData(ogData);
    console.log("data after normalised :", data);
    const error = validateIngredients(data);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Error while validating user ingredient details : ${error} .`,
      });
    }
    //  -------------------- validating data with db ----------------------------

    // Validate user_id exists & user has the privilege to  edit this ingredient
    const [userRow] = await db.query(
      `SELECT 1 
      FROM users u
      JOIN user_ingredients ui ON ui.submitted_by = u.user_id AND u.is_active = 1 
      WHERE u.user_id = ? AND ui.user_ingredient_id = ?`,
      [user.id, data.user_ing_id],
    );
    if (userRow.length === 0) {
      return res.status(403).json({
        success: false,
        message: `User not authorised to edit this ingredient`,
        data,
      });
    }

    // validate if ingredient NAME already present in USER ingredients table by same user
    const [row] = await db.query(
      `SELECT 1 FROM user_ingredients WHERE name = ? and submitted_by = ? AND user_ingredient_id != ? AND is_active = 1`,
      [data.name, user.id, data.user_ing_id],
    );
    if (row.length !== 0) {
      return res.status(409).json({
        success: false,
        message: `You already have this ingredient (${data.name}).`,
      });
    }

    // JUST FOR TEST WITHOUT ACTUAL UPDATION
    // return res.json({
    //   success: true,
    //   message: `user ingredient about to call procedure update_user_ingredient_plus_units.`,
    // });
    console.log("data for procedure is : ", data);
    // create a conn to handle rollback DML operation if any DML
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      console.log("before procedure");
      const [result] = await conn.query(
        `CALL update_user_ingredient_plus_units (?,?,?,?,?,?,?,?,?)`,
        [
          data.user_ing_id,
          data.name,
          data.quantity,
          data.unit,
          data.price,
          data.cup_weight,
          data.cup_unit,
          data.notes,
          user.id,
        ],
      );
      await conn.commit();
      console.log("result from procedure", result);
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();

      console.error("Error in updateUserIngController- (update_user_ing):", err);
      return res.status(500).json({
        success: false,
        message: "Error while updating user ingredient in db",
      });
    } finally {
      conn.release();
    }

    //  FINAL response
    res.json({
      success: true,
      message: `user ingredient updated successfully.`,
    });
  } catch (err) {
    console.error("Error in updateUserIngController - update_user_ing is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
