const db = require("../../config/database");

// get the complete food plan of a user
exports.get_food_plan = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = {};
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

    // get the food_plan_id for the user
    const [fpRow] = await db.query(
      `SELECT food_plan_id FROM food_plans WHERE user_id = ? AND is_active = 1`,
      [user.id],
    );
    if (fpRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Food plan not found for the user`,
      });
    }

    data.food_plan_id = fpRow[0].food_plan_id;
    const food_plan_id = data.food_plan_id;

    // get the food_plan_week_ids of the food_plan_id
    const [weekRows] = await db.query(
      `SELECT food_plan_week_id, week_no 
   FROM food_plan_weeks 
   WHERE food_plan_id = ? AND is_active = 1 
   ORDER BY week_no`,
      [food_plan_id],
    );

    let food_plan_week_rows = weekRows || [];
    if (!food_plan_week_rows.length) {
      food_plan_week_rows = [];
      // return res.status(404).json({ error: 'Food plan week not found for the food plan of the user' });
    }

    const food_plan = [];

    for (const week of food_plan_week_rows) {
      const each_food_week_plan = {};
      each_food_week_plan["food_plan_week_id"] = week.food_plan_week_id;
      each_food_week_plan["week_no"] = week.week_no;

      const [dayRows] = await db.query(
        `SELECT food_plan_day_id, day_no 
     FROM food_plan_days 
     WHERE food_plan_week_id = ? AND is_active = 1 
     ORDER BY day_no`,
        [week.food_plan_week_id],
      );

      let food_plan_day_rows = dayRows || [];
      if (!food_plan_day_rows.length) {
        food_plan_day_rows = [];
        // return res.status(404).json({ error: 'Food plan day not found for the food plan week of the user' });
      }

      const weekly_meals = [];

      for (const day of food_plan_day_rows) {
        const each_food_day_plan = {};
        each_food_day_plan["food_plan_day_id"] = day.food_plan_day_id;
        each_food_day_plan["day_no"] = day.day_no;

        // Below query makes sure that if the recipe is deleted after it was put in to the food plan. then it this will take care of
        // making sure not to show meal_id or meal_type if that recipe was the only recipe in the meal and has been deleted
        const [mealRows] = await db.query(
          `
      SELECT fpm.food_plan_meal_id, fpm.meal_type, count(fpr.recipe_id)
      FROM food_plan_meals fpm 
        JOIN food_plan_recipes fpr ON fpr.food_plan_meal_id = fpm.food_plan_meal_id and fpr.is_active = 1
        JOIN recipes r ON r.recipe_id = fpr.recipe_id AND r.is_active = 1
      WHERE fpm.food_plan_day_id = ? AND fpm.is_active = 1
      GROUP BY fpm.food_plan_meal_id, fpm.meal_type
      `,
          [day.food_plan_day_id],
        );

        const food_plan_meal_rows = mealRows || [];

        const daily_meals = [];

        for (const meal of food_plan_meal_rows) {
          const each_food_meal_plan = {};
          each_food_meal_plan["food_plan_meal_id"] = meal.food_plan_meal_id;
          each_food_meal_plan["meal_type"] = meal.meal_type;

          const [recipeRows] = await db.query(
            `
        SELECT fpr.food_plan_recipe_id, fpr.recipe_id, fpr.display_order 
        FROM food_plan_recipes fpr
          JOIN recipes r ON fpr.recipe_id = r.recipe_id AND r.is_active = 1
        WHERE fpr.food_plan_meal_id = ? AND fpr.is_active = 1 
        ORDER BY fpr.display_order
        `,
            [meal.food_plan_meal_id],
          );

          const food_plan_recipe_rows = recipeRows || [];

          const recipes = [];

          for (const recipe of food_plan_recipe_rows) {
            // Check is recipe exist, calculate price of recipe and is active. if NOT active then continue
            const [priceRows] = await db.query(
              `SELECT r.name as recipe_name,
                  COALESCE(SUM(ri.quantity * COALESCE(ui.base_price, COALESCE(up.custom_price, i.default_price)) *  u.conversion_factor),0) AS price
              FROM recipes r 
                JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
                JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
                LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
                LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
                JOIN units u ON ri.unit_id = u.unit_id
                LEFT JOIN user_prices up ON up.user_id = 2 AND up.ingredient_id = i.ingredient_id AND up.is_active = TRUE
              WHERE ri.recipe_id = 36 AND ri.is_active = 1
              GROUP BY r.name;`,
              [(user.id, recipe.recipe_id)],
            );

            const row = priceRows[0];
            if (!row) continue;

            const recipe_name = row.recipe_name;
            const cost = Math.round(Number(row.price) * 100) / 100;

            const each_food_recipe_plan = {
              food_plan_recipe_id: recipe.food_plan_recipe_id,
              recipe_id: recipe.recipe_id,
              recipe_name,
              cost,
              display_order: recipe.display_order,
            };

            recipes.push(each_food_recipe_plan);
          }

          each_food_meal_plan["recipes"] = recipes;
          daily_meals.push(each_food_meal_plan);
        }

        each_food_day_plan["daily_meals"] = daily_meals;
        weekly_meals.push(each_food_day_plan);
      }

      each_food_week_plan["weekly_meals"] = weekly_meals;
      food_plan.push(each_food_week_plan);
    }

    data["food_plan"] = food_plan;

    // FINAL response
    res.json({
      success: true,
      message: `ingredients found`,
      data,
    });
  } catch (err) {
    console.error("Error in readFoodPlanController - get_food_plan is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
