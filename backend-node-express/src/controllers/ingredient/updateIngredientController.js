const db = require("../../config/database");
const { normaliseIngredientData, validateIngredient } = require("../../utils/ingredientsUtils");

exports.search_ingredients = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;
    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    const q = (req.query.q || "").trim().toLowerCase();
    const ingId = Number(req.query.ingId);
    //  check if ingId is + whole number
    if (!ingId || ingId < 1 || !Number.isInteger(ingId)) {
      return res.status(500).json({
        success: false,
        message: "Ingredient id should be a positive whole Number.",
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
        message: "Not Authorised to search.",
      });
    }

    // if q (query is empty or "") dont run SQL
    if (!q) {
      res.json({
        success: true,
        message: `ingredients list found.`,
        data: [],
      });
    }

    // get the list of all the ingredients having the searched text and ingId
    const [rows] = await db.query(
      `SELECT  i.name
        FROM ingredients i 
        WHERE LOWER(i.name) LIKE ? AND i.ingredient_id != ?
        LIMIT 20`,
      [`%${q}%`, ingId],
    );

    // FINAL response
    res.json({
      success: true,
      message: `ingredients list found.`,
      data: rows,
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

exports.update_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;
    const ingId = Number(req.params.ingId);

    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    //  check if ingId is +ve whole number
    if (!ingId || ingId < 1 || !Number.isInteger(ingId)) {
      return res.status(400).json({
        success: false,
        message: "Ingredient id should be a positive whole Number.",
      });
    }

    // check data is available
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // ----------------- normalise and validate the data --------------------
    const data = normaliseIngredientData(req.body);
    const error = validateIngredient(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Error while validating ingredient details : ${error} .`,
      });
    }

    // // ------------------------------ Now insert the data thru procedure ------------------------------------------
    console.log("data that is sent to procedure :", data);

    const conn = await db.getConnection();
    let isSameData = "";
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(`CALL update_ingredient_plus_units(?,?,?,?,?,?,?,?,?,?)`, [
        ingId,
        data?.name,
        data?.cup_equivalent_weight,
        data?.cup_equivalent_unit,
        data?.notes,
        user.id,
        user.role,
        data?.display_quantity,
        data?.display_unit,
        data?.display_price,
      ]);
      isSameData = result[0][0].message;
      await conn.commit();
      if (isSameData === "No changes detected") {
        res.json({
          success: true,
          message: isSameData,
          // data: rows,
        });
      }
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in updateIngredientController- (update_ingredient):", err);

      return res.status(500).json({
        success: false,
        message: err.sqlMessage,
      });
    } finally {
      conn.release();
    }

    // FINAL response
    res.json({
      success: true,
      message: `ingredient (${ingId}) Updated.`,
      // data: rows,
    });
  } catch (err) {
    console.error("Error in updateIngredientController -(update_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
