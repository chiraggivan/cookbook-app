const db = require("../../config/database");

// search user ingredients
exports.search_user_ings = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const q = (req.query.q || "").trim().toLowerCase();

    const [rows] = await db.query(
      `SELECT  user_ingredient_id as id, name, display_price as price, display_unit as base_unit, display_quantity
        FROM user_ingredients 
        WHERE LOWER(name) LIKE ? AND submitted_by = ? AND is_active = 1
        LIMIT 20`,
      [`%${q}%`, user.id],
    );
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: `No such (${q}) ingredients found`,
      });
    }
    // FINAL response
    res.json({
      success: true,
      message: `user ingredients found`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in readUserIngController - (search__user_ings)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// search user ingredients
exports.search_user_and_mmain_ings_names = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const q = (req.query.q || "").trim().toLowerCase();

    const [rows] = await db.query(
      `SELECT  name
      FROM user_ingredients 
      WHERE LOWER(name) LIKE ? AND submitted_by = ? AND is_active = 1
      UNION
      SELECT name
      FROM ingredients
      WHERE LOWER(name) LIKE ? AND is_active = 1
      ORDER BY name
      LIMIT 20
        `,
      [`%${q}%`, user.id, `%${q}%`],
    );

    // if (rows.length === 0) {
    //   return res.json({
    //     success: true,
    //     message: `No such (${q}) ingredients found`,
    //   });
    // }
    // FINAL response
    res.json({
      success: true,
      message: `user ingredients found`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in readUserIngController - (search__user_ings)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// read user ingredients
exports.read_user_ings = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // Query all the ingredients of the user in user_ingredients table
    const [rows] = await db.query(
      `SELECT user_ingredient_id, name, display_unit, display_price, display_quantity, cup_weight, cup_unit, notes
        FROM user_ingredients
        WHERE submitted_by = ? AND is_active = 1
        ORDER BY created_at DESC`,
      [user.id],
    );
    if (rows.length > 0) {
      for (const row of rows) {
        row.display_price = Number(row.display_price);
        row.display_quantity = Number(row.display_quantity);
        if (Number(row.cup_weight)) {
          row.cup_weight = Number(row.cup_weight);
        }
      }
    }

    // FINAL response
    res.json({
      success: true,
      message: `user ingredients found`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in readUserIngController - (search__user_ings)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
//  ------------------------------------------- different api for fetching data for infinite scroll ------------------------------------------------------

//  single api for loading and search ingredient with infinite scroll
exports.list_user_ings = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const q = (req.query.q || "").trim().toLowerCase();

    const limit = Math.min(parseInt(req.query.limit) || 10, 20); // cap for safety
    const offset = parseInt(req.query.offset) || 0;

    //  base condition
    let condition = `submitted_by = ? AND is_active = 1`;
    let params = [user.id];

    // add search text in condition
    if (q) {
      condition += ` AND name = ?`;
      params.append(`%${q}%`);
    }

    // main query
    const [rows] = await db.query(
      `SELECT
            user_ingredient_id AS id,
            name,
            display_unit AS unit,
            display_price AS price,
            display_quantity AS quantity,
            cup_weight,
            cup_unit,
            notes
        FROM user_ingredients
        WHERE ${condition}
        ORDER BY name ASC, user_ingredient_id ASC
        LIMIT ? OFFSET ?`,
      [params, limit, offset],
    );

    // FINAL response
    res.json({
      success: true,
      message: `user ingredients found`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in readUserIngController - (list_user_ings)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
