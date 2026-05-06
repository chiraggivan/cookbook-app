const db = require("../../config/database");

exports.get_dishes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // Get all the dishes for the users
    const [dishesResult] = await db.query(
      `SELECT dish_id, recipe_id, recipe_name, portion_size, preparation_date, total_cost, comment, time_prepared, meal, recipe_by, created_at
        FROM dishes 
        WHERE user_id = ? AND is_active = 1
        ORDER BY preparation_date DESC`,
      [user.id],
    );

    // convert string values(total_cost) to float before sending
    for (const dish of dishesResult) {
      dish.total_cost = Number(dish.total_cost);
      if (!dish.total_cost) {
        return res.status(500).json({
          success: "false",
          message: "Could convert total cost into float.",
        });
      }
    }

    // FINAL response
    res.json({
      success: true,
      message: `Dishes found`,
      data: dishesResult,
    });
  } catch (err) {
    console.error("Error in readDishController - get_dishes :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

exports.get_dish_details = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const dishId = Number(req.params.dishId);
    // const recipeId = Number(req.params.recipeId);
    if (!dishId || dishId < 1 || !Number.isInteger(dishId)) {
      return res.status(404).json({
        success: false,
        message: `dishId Id provided is not defined properly. should be positive integer`,
      });
    }

    // validate if user/Dish id exists, user owes dish and is_active
    const [checkDish] = await db.query(
      `SELECT 1 
        FROM dishes d JOIN users u ON u.user_id = d.user_id
        WHERE u.user_id = ? AND d.dish_id = ? AND u.is_active = 1 AND d.is_active = 1`,
      [user.id, dishId],
    );
    if (checkDish.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active user/dish found`,
      });
    }

    // get dish ingredients
    const [result] = await db.query(
      `SELECT component_display_order, component_text, ingredient_display_order, ingredient_id, ingredient_name, quantity,
            unit_id, unit_name, cost, base_price, base_unit
        FROM dish_ingredients
        WHERE dish_id = ? AND is_active = 1`,
      [dishId],
    );

    // convert string values(quantity, cost, base_price) to float before sending
    for (const ing of result) {
      ing.quantity = Number(ing.quantity);
      ing.cost = Number(ing.cost);
      ing.base_price = Number(ing.base_price);
      if (!ing.quantity || !ing.cost || !ing.base_price) {
        return res.status(500).json({
          success: "false",
          message: "Could convert quantity, cost, base_price into float.",
        });
      }
    }

    // FINAL response
    res.json({
      success: true,
      message: `Dishes found`,
      data: result,
    });
  } catch (err) {
    console.error("Error in readDishController - get_dish_details :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
