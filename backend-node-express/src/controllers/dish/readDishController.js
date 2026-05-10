const db = require("../../config/database");

// Get dishes prepared by user
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

// Get dish details for selected dish
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

    // get dish details
    const [dishResult] = await db.query(
      `SELECT d.dish_id, d.recipe_id, d.recipe_name, d.portion_size, d.preparation_date, 
              d.total_cost, d.comment, d.time_prepared, d.meal, d.recipe_by, d.created_at, u.username AS recipe_by_name
      FROM dishes d JOIN users u ON d.recipe_by = u.user_id
      WHERE d.dish_id = ? AND d.is_active = 1`,
      [dishId],
    );
    if (dishResult.length === 0) {
      return res.status(500).json({
        success: "false",
        message: "Couldnt get details of the dish.",
      });
    }
    const dish = dishResult[0];
    dish.preparation_date = new Date(dish.preparation_date).toISOString().split("T")[0];
    dish.created_at = new Date(dish.created_at).toISOString();
    dish.total_cost = parseFloat(dish.total_cost);

    // get dish ingredients
    const [ingResult] = await db.query(
      `SELECT component_display_order, component_text, ingredient_display_order, ingredient_id, ingredient_name, quantity,
            unit_id, unit_name, cost, base_price, base_unit, ingredient_source
        FROM dish_ingredients
        WHERE dish_id = ? AND is_active = 1`,
      [dishId],
    );

    // convert string values(quantity, cost, base_price) to float before sending
    for (const ing of ingResult) {
      ing.quantity = Number(ing.quantity);
      ing.cost = Number(ing.cost);
      ing.base_price = Number(ing.base_price);
      if (!ing.quantity || !ing.cost || !ing.base_price) {
        return res.status(500).json({
          success: "false",
          message: "Could not convert quantity, cost, base_price into float.",
        });
      }
    }

    // FINAL response
    res.json({
      success: true,
      message: `Dishes found`,
      data: { dish: dish, ingredients: ingResult },
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
