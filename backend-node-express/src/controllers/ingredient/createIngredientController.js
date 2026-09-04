const db = require("../../config/database");
const { normaliseIngredientData, validateIngredient } = require("../../utils/ingredientsUtils");

exports.search_ingredients = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const q = (req.query.q || "").trim().toLowerCase();
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

    // get the list of all the ingredients having the searched text
    const [rows] = await db.query(
      `SELECT  i.name
        FROM ingredients i 
        WHERE LOWER(i.name) LIKE ?
        LIMIT 20`,
      [`%${q}%`],
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

exports.create_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    const role = user.role;
    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

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

    // console.log("data to be used in procedure", data);
    // return res.json({
    //   success: true,
    //   message: `ingredient about to be added.`,
    //   data,
    // });

    //  ----------------- send directly to procedure and it checks all the conditions
    // ------------------ thereby making single call to db and then checking,
    // ------------------ validating and finally inserting in db

    // ---------- check, validate and insert via procedure -------------------------

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      const [result] = await conn.query(`CALL insert_ingredient_plus_units(?,?,?,?,?,?,?,?,?,?)`, [
        data.name,
        data.form,
        data.display_quantity,
        data.display_unit,
        data.display_price,
        data.cup_equivalent_weight,
        data.cup_equivalent_unit,
        data.notes,
        user.id,
        user.role,
      ]);

      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in createIngredientController- (create_ingredient): ", err.sqlMessage);

      return res.status(500).json({
        success: false,
        message: err.sqlMessage,
      });
    } finally {
      conn.release();
    }

    // FINAL response
    return res.json({
      success: true,
      message: `ingredient added.`,
    });
  } catch (err) {
    console.error("Error in createIngredientController -(create_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
