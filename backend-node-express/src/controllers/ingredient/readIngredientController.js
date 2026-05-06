const db = require("../../config/database");

exports.get_all_ingredients = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;

    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 20;
    const offset = (page - 1) * per_page;

    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    // Get total count
    const [totalIng] = await db.query(`SELECT COUNT(*) as total FROM ingredients`, []);
    const totalIngredient = totalIng[0].total;

    // Get all ingredients details
    const [result] = await db.query(
      `SELECT ingredient_id, name, base_unit, default_price, is_active, submitted_by, 
            approved_by, approval_status, approval_date, end_date, created_at, notes
        FROM ingredients LIMIT ? OFFSET ?`,
      [per_page, offset],
    );

    const total_pages = Math.ceil(totalIngredient / per_page);

    res.json({
      success: true,
      message: `ingredients found`,
      data: { ingredients: result, page, per_page, total_pages },
    });
  } catch (err) {
    console.error("Error in readIngredientController - get_all_ingredients is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

exports.get_ingredient_details = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ingredientId = Number(req.params.ingId);
    //  check is user has admin privilege
    if (user.role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }
    // check ingredientId
    if (!ingredientId || ingredientId < 1 || !Number.isInteger(ingredientId)) {
      return res.status(404).json({
        success: false,
        message: `ingredientId provided is not defined properly. should be positive integer`,
      });
    }

    // get ingredient details
    const [result] = await db.query(
      `SELECT ingredient_id, name, base_unit, default_price, is_active, submitted_by, 
            approved_by, approval_status, approval_date, end_date, created_at, notes, cup_weight, cup_unit
        FROM ingredients 
        WHERE ingredient_id = ?`,
      [ingredientId],
    );

    // check if ingredient exists
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ingredientId provided is not found in db.`,
      });
    }

    // FINAL response
    res.json({
      success: true,
      message: `ingredients Details found`,
      data: result,
    });
  } catch (err) {
    console.error("Error in readIngredientController - get_ingredient_details is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

exports.get_all_deleted_ing = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;

    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 20;
    const offset = (page - 1) * per_page;

    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    // Get total count
    const [totalIng] = await db.query(
      `SELECT COUNT(*) as total FROM ingredients WHERE is_active = 0`,
      [],
    );
    const totalIngredient = totalIng[0].total;

    // Get all ingredients details
    const [result] = await db.query(
      `SELECT ingredient_id, name, base_unit, default_price, is_active, submitted_by, 
            approved_by, approval_status, approval_date, end_date, created_at, notes
        FROM ingredients LIMIT ? OFFSET ?
        WHERE is_active = 0`,
      [per_page, offset],
    );

    const total_pages = Math.ceil(totalIngredient / per_page);

    res.json({
      success: true,
      message: `ingredients found`,
      data: { ingredients: result, page, per_page, total_pages },
    });
  } catch (err) {
    console.error("Error in readIngredientController - get_all_deleted_ingredients is : ", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
