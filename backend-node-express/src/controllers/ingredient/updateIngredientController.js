const db = require("../../config/database");
const {
  normaliseIngredientData,
  validateIngredient,
  normaliseIngredientBaseValueData,
  validateIngredientBaseValueData,
} = require("../../utils/ingredientsUtils");

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
      `SELECT  i.name, i.form
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
    const error = validateIngredient(data, "update");

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Error while validating ingredient details : ${error} .`,
      });
    }

    // // ------------------------------ Now insert the data thru procedure ------------------------------------------
    // console.log("data that is sent to procedure :", data);

    const conn = await db.getConnection();
    let isSameData = "";
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `CALL update_ingredient_plus_units(?,?,?,?,?,?,?,?,?,?,?)`,
        [
          ingId,
          data?.name,
          data?.form,
          data?.cup_equivalent_weight,
          data?.cup_equivalent_unit,
          data?.notes,
          user.id,
          user.role,
          data?.display_quantity,
          data?.display_unit,
          data?.display_price,
        ],
      );
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

exports.udpate_ing_base_values = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ingId = Number(req.params.ingId);

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
    // console.log(`ing id : ${ingId} `);
    // console.log("user is: ", user);
    // console.log("body is: ", req.body);
    // ----------------- normalise and validate the data --------------------
    const data = normaliseIngredientBaseValueData(req.body);
    const error = validateIngredientBaseValueData(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Error while validating ingredient details : ${error} .`,
      });
    }

    const display_quantity = Number(data.display_quantity);
    const display_unit = data.display_unit;
    const display_price = Number(data.display_price);
    const ing_source = data.ingredient_source;
    const unit_id = Number(data.ing_used_unitId);
    const ingQuantity = Number(data.ing_used_qty);

    // console.log("data is ", data);
    const unitQuery = `
      SELECT un.unit_id, un.code, uc.conversion_factor
      FROM unit_names un 
        JOIN ingredients i ON i.base_unit = un.code AND i.is_active = 1
        JOIN unit_names un2 ON un2.code = ? AND un2.is_active = 1
        JOIN unit_conversions uc ON uc.base_unit_id = un.unit_id AND uc.unit_id = un2.unit_id AND uc.is_active = 1
      WHERE un.is_active = 1 AND i.ingredient_id = ?`;

    try {
      const [unitResult] = await db.query(unitQuery, [display_unit, ingId]);
      // found base unit and save in base_unit. calculate custom_price with the help of conversion factor
      const base_unit = unitResult[0].code;
      const con_fact = unitResult[0].conversion_factor;
      const custom_price = display_price / (display_quantity * con_fact);

      const [convResult] = await db.query(
        `SELECT conversion_factor FROM units WHERE unit_id = ? AND is_active = 1 `,
        [unit_id],
      );

      console.log("convResult :", convResult);
      const new_price = custom_price * ingQuantity * convResult[0].conversion_factor;
      console.log("new price is:", new_price);

      // BREAK POINT
      return res.json({
        success: true,
        message: "Break point test",
        new_price,
      });
      // ----------------------------------------------
      const conn = db.getConnection();
      const [result] = await conn.beginTransaction();

      const deleteQuery = `UPDATE user_prices SET is_active = 0 
                          WHERE user_id = ? AND ingredient_id =? AND country_id = ? AND ingredient_source = ? AND is_active = 1 `;

      try {
        const [deleteResult] = await conn.query(deleteQuery, [
          user.id,
          ingId,
          user.country_id,
          ing_source,
        ]);

        // Once old data in user_price soft deleted(if present) Now add new data in user_price
        const insertQuery = `INSERT INTO user_prices(user_id, ingredient_id, country_id, custom_price, quantity, base_unit, ingredient_source, display_quantity, display_unit, display_price)
                              VALUES(?,?,?,?,1,?,?,?,?,?)`;

        const [insertResult] = (await conn).query(insertQuery, [
          user.id,
          ingId,
          user.country_id,
          custom_price,
          base_unit,
          ing_source,
          display_quantity,
          display_unit,
          display_price,
        ]);
      } catch (error) {
        await conn.rollback();
        console.log(
          "Error in updt ing cntrllr -updt ing base price- during deleting old user price ",
          error,
        );
        res.status(500).json({
          success: false,
          message: "Server error",
        });
      } finally {
        await conn.release();
      }

      // ----------------------------------------------
    } catch (error) {
      console.log("Error in updateIngCtrllr in updt ing base value- during db query:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  } catch (error) {
    console.log("Error in updateIngCtrllr in updt ing base value :", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
