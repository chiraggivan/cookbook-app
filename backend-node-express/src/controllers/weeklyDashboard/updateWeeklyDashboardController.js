const db = require("../../config/database");

const {
  fillMissingDays,
  fillMissingMeals,
  getEasyQuantityText,
} = require("../../utils/weeklyDashboardUtils");

// save food plan week's record in food_plan_ingredient_records table for dashboard
exports.set_daily_dashboard = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;

    if (!data) {
      return res.status(500).json({
        success: false,
        message: `data missing. cant proceed further`,
      });
    }

    const foodPlanId = data?.food_plan_id;
    const foodPlanWeekId = data?.food_plan_week_id;
    const foodPlanDayId = data?.food_plan_day_id;
    const meals = data?.daily_meals;

    if (!foodPlanId || !foodPlanWeekId || !foodPlanDayId || !meals) {
      res.json({
        success: false,
        message: `data missing. need these data : foodPlanId, foodPlanWeekId, foodPlanDayId, meals`,
      });
    }
    // ----------------------------------------------- connect to db and verify data -----------------------------------

    //  check user is valid
    const [userRow] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);
    if (userRow.length === 0) {
      return res.status(404).json({ success: false, message: "User not found or not active" });
    }

    // check if food_plan_id, food_plan_week_id, food_plan_day_id belong to the same user
    const [checkRow] = await db.query(
      `SELECT 1 
        FROM users u JOIN food_plans fp ON u.user_id = fp.user_id AND u.user_id = ? AND u.is_active = 1
            JOIN food_plan_weeks fpw ON fp.food_plan_id = fpw.food_plan_id AND fp.food_plan_id = ? AND fp.is_active = 1
            JOIN food_plan_days fpd ON fpw.food_plan_week_id = fpd.food_plan_week_id AND fpw.food_plan_week_id = ? AND fpw.is_active = 1
                AND fpd.food_plan_day_id = ? AND fpd.is_active = 1`,
      [user.id, foodPlanDayId, foodPlanWeekId, foodPlanDayId],
    );
    if (checkRow.length === 0) {
      return res.status(404).json({ success: false, message: "No such data found for the user." });
    }

    // -------------------------------------------------- Insert, update, delete  in db --------------------------------

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // delete the records of that day
      const [deleteResult] = await conn.query(
        `DELETE FROM food_plan_ingredient_records
            WHERE food_plan_day_id = ?`,
        [foodPlanId],
      );

      // insert record in food_plan_ingredient_records table
      for (const meal of meals) {
        const foodPlanMealId = meal.food_plan_meal_id;
        const recipes = meal.recipes;

        for (const recipe of recipes) {
          const foodPlanRecipeId = recipe.food_plan_recipe_id;
          const recipeId = recipe.recipe_id;
          const displayOrder = recipe.display_order;

          const [ingRows] = await conn.query(
            `SELECT ingredient_id, quantity, unit_id 
                FROM recipe_ingredients 
                WHERE recipe_id = ? AND is_active = 1`,
            [recipeId],
          );

          for (const ingRow of ingRows) {
            const ingredientId = ingRow.ingredient_id;
            const quantity = ingRow.quantity;
            const unitId = ingRow.unit_id;

            const [unitRows] = await conn.query(
              `SELECT unit_id, unit_name, conversion_factor 
                FROM units 
                WHERE ingredient_id = ? AND is_active = 1`,
              [ingredientId],
            );
            const baseUnitRow = unitRows.find((r) => r.conversion_factor === 1) || null;
            const baseUnit = baseUnitRow ? baseUnitRow.unit_name : null;

            const conversionFactorRow = unitRows.find((r) => r.unit_id === unit_id) || null;
            const conversionFactor = conversionFactorRow
              ? conversionFactorRow.conversion_factor
              : null;

            const totalQuantity = conversionFactor * quantity;

            // insert into food_plan_ingredient_record
            const [result] = await conn.query(
              `INSERT INTO food_plan_ingredient_records(food_plan_id, food_plan_week_id, food_plan_day_id, food_plan_meal_id, food_plan_recipe_id,
                        recipe_id, ingredient_id, quantity, base_unit, display_order, is_active)
                VALUES(?,?,?,?,?,?,?,?,?,?,1)`,
              [
                foodPlanId,
                foodPlanWeekId,
                foodPlanDayId,
                foodPlanMealId,
                foodPlanRecipeId,
                recipeId,
                ingredientId,
                totalQuantity,
                baseUnit,
                displayOrder,
              ],
            );
          }
        }
      }
      await conn.commit();
    } catch (err) {
      // rollback if there is any error in insert so delete query will also rollback
      return res.status(500).json({
        success: false,
        message: `errror while deleting and then inserting in food_plan_ingredient_records`,
      });
    } finally {
      conn.release();
    }

    // FINAL response
    res.json({
      success: true,
      message: `Updated day successfully`,
      data,
    });
  } catch (err) {
    console.log("Error in updateWeeklyDashboardController - (set_daily_dashboard) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  data for dashboard
exports.get_weekly_dashboard = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;

    const finalData = {};

    if (!data) {
      return res.status(500).json({
        success: false,
        message: `data missing. cant proceed further`,
      });
    }

    const weekNo = data?.week_no;
    const foodPlanId = data?.food_plan_id;

    if (!foodPlanId || !weekNo) {
      return res.status(500).json({
        success: false,
        message: `data missing. need these data : foodPlanId, weekNo`,
      });
    }

    if (weekNo < 1 || weekNo > 6) {
      return res.status(500).json({
        success: false,
        message: `Invalid weekNo`,
      });
    }
    // ----------------------------------------------- connect to db and verify data -----------------------------------

    //  check user is valid
    const [userRow] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);
    if (userRow.length === 0) {
      return res.status(404).json({ success: false, message: "User not found or not active" });
    }

    // get food_plan_week_id for user with week no and food plan id in food_plan_weeks table
    const [FPWresult] = await db.query(
      `SELECT fpw.food_plan_week_id 
            FROM food_plan_weeks fpw 
                JOIN food_plans fp ON fp.food_plan_id = fpw.food_plan_id AND fp.user_id = ? AND fp.is_active = 1
            WHERE fpw.week_no = ? AND fpw.food_plan_id = ? AND fpw.is_active = 1  `,
      [user.id, weekNo, foodPlanId],
    );
    if (FPWresult.length === 0) {
      return res.status(500).json({
        success: false,
        message: `No data found for the week of this user.`,
      });
    }
    const foodPlanWeekId = FPWresult.food_plan_week_id;

    // NEED to undeerstand PROPERLY. ALSO write the description about it

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // delete the records of that day
      const [FPIRdelete] = await conn.query(
        `DELETE FROM food_plan_ingredient_records
            WHERE food_plan_week_id = ?`,
        [foodPlanWeekId],
      );

      // start to get data for food_plan_ingredient_records table
      const [FPDrows] = await conn.query(
        `SELECT food_plan_day_id 
        FROM food_plan_days 
        WHERE food_plan_week_id = ? AND is_active = 1`,
        [foodPlanWeekId],
      );
      const days = FPDrows;

      for (const day of days) {
        const foodPlanDayId = day.food_plan_day_id;
        const [FPMrows] = await conn.query(
          `SELECT food_plan_meal_id 
            FROM food_plan_meals 
            WHERE food_plan_day_id = ? AND is_active = 1`,
          [foodPlanDayId],
        );
        const meals = FPMrows;

        for (const meal of meals) {
          const foodPlanMealId = meal.food_plan_meal_id;
          const [FPRrows] = await conn.query(
            `SELECT food_plan_recipe_id, recipe_id, display_order 
                FROM food_plan_recipes 
                WHERE food_plan_meal_id = ? AND is_active = 1`,
            [foodPlanMealId],
          );
          const recipes = FPRrows;

          for (const recipe of recipes) {
            const foodPlanRecipeId = recipe.food_plan_recipe_id;
            const recipeId = recipe.recipe_id;
            const displayOrder = recipe.display_order;
            const [RIrows] = await conn.query(
              `SELECT ingredient_id, quantity, unit_id 
                    FROM recipe_ingredients 
                    WHERE recipe_id = ? AND is_active = 1`,
              [recipeId],
            );
            const ingredients = RIrows;

            for (const ing of ingredients) {
              const ingredientId = ing.ingredient_id;
              const quantity = ing.quantity;
              const unitId = ing.unit_id;

              const [unitRows] = await conn.query(
                `SELECT unit_id, unit_name, conversion_factor 
                FROM units 
                WHERE ingredient_id = ? AND is_active = 1`,
                [ingredientId],
              );
              const baseUnitRow = unitRows.find((r) => r.conversion_factor === 1) || null;
              const baseUnit = baseUnitRow ? baseUnitRow.unit_name : null;

              const conversionFactorRow = unitRows.find((r) => r.unit_id === unit_id) || null;
              const conversionFactor = conversionFactorRow
                ? conversionFactorRow.conversion_factor
                : null;

              const totalQuantity = conversionFactor * quantity;

              // insert into food_plan_ingredient_record
              const [result] = await conn.query(
                `INSERT INTO food_plan_ingredient_records(food_plan_id, food_plan_week_id, food_plan_day_id, food_plan_meal_id, food_plan_recipe_id,
                        recipe_id, ingredient_id, quantity, base_unit, display_order, is_active)
                VALUES(?,?,?,?,?,?,?,?,?,?,1)`,
                [
                  foodPlanId,
                  foodPlanWeekId,
                  foodPlanDayId,
                  foodPlanMealId,
                  foodPlanRecipeId,
                  recipeId,
                  ingredientId,
                  totalQuantity,
                  baseUnit,
                  displayOrder,
                ],
              );
            }
          }
        }
      }
      await conn.commit();
    } catch (err) {
    } finally {
    }

    // retrive data from food plan ingredient records table along with its referenced table
    const [dashData] = await db.query(
      `SELECT fpir.food_plan_week_id, fpw.week_no, fpir.food_plan_day_id, fpd.day_no, fpir.food_plan_meal_id, fpm.meal_type, fpir.food_plan_recipe_id,
            fpir.recipe_id, r.name as recipe_name, fpir.ingredient_id, i.name as ingredient_name, fpir.quantity, fpir.base_unit, 
            COALESCE(up.custom_price, i.default_price) as base_price, i.cup_weight, i.cup_unit
        FROM food_plan_ingredient_records fpir
            JOIN food_plan_weeks fpw ON fpw.food_plan_week_id = fpir.food_plan_week_id AND fpw.is_active = 1
            JOIN food_plan_days fpd ON fpd.food_plan_day_id = fpir.food_plan_day_id AND fpd.is_active = 1
            JOIN food_plan_meals fpm ON fpm.food_plan_meal_id = fpir.food_plan_meal_id AND fpm.is_active = 1
            JOIN recipes r ON r.recipe_id = fpir.recipe_id AND r.is_active = 1
            JOIN ingredients i ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1 
            LEFT JOIN user_prices up ON up.ingredient_id = i.ingredient_id AND up.user_id = ? AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ? `,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    if (dashData.length === 0) {
      return res.status(500).json({
        success: false,
        message: "no data found for dashboard",
      });
    }

    for (data of dashData[0]) {
      data.base_price = Number(parseFloat(data.base_price).toFixed(2));
      data.quantity = Number(parseFloat(data.quantity).toFixed(8));
    }

    finalData.dashData = dashData;

    // get all aggregate values
    const [aggResult] = await db.query(
      `SELECT COUNT(DISTINCT fpir.food_plan_meal_id)  AS total_meals, 
            COUNT(DISTINCT fpir.food_plan_recipe_id)  AS total_items,
            COUNT(DISTINCT fpir.recipe_id) AS total_recipes, 
            COUNT(DISTINCT fpir.ingredient_id) AS total_ingredients,
            ROUND(SUM(fpir.quantity * COALESCE(up.custom_price, i.default_price)), 2) AS cost
        FROM food_plan_ingredient_records fpir
            JOIN ingredients i ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1 
            LEFT JOIN user_prices up ON up.ingredient_id = i.ingredient_id AND up.user_id = ? AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ?`,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    if (aggResult.length === 0) {
      return res.status(500).json({
        success: false,
        message: "error while finding aggregate data.",
      });
    }
    const aggData = aggResult[0];
    if (aggData.cost) {
      aggData.cost = Number(parseFloat(aggData.cost));
    }
    finalData.aggData = aggData;

    // ingredients and its cost
    const [ingList] = await db.query(
      `SELECT  i.name,  SUM(fpir.quantity) AS quantity, COALESCE(up.custom_price, i.default_price) as ingredient_cost, fpir.base_unit, 
            ROUND(SUM(fpir.quantity * COALESCE(up.custom_price, i.default_price)), 2) AS cost,  
            COUNT(DISTINCT fpir.food_plan_recipe_id) AS total_dishes, 
            COUNT(DISTINCT fpir.recipe_id) AS total_recipes, i.cup_weight, i.cup_unit  
        FROM food_plan_ingredient_records fpir
            JOIN ingredients i  ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1
            JOIN food_plans fp  ON fp.food_plan_id = fpir.food_plan_id AND fp.is_active = 1
            LEFT JOIN user_prices up  ON up.user_id = ?
                AND up.ingredient_id = fpir.ingredient_id
                AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ? AND fpir.is_active = 1
        GROUP BY  i.ingredient_id, i.name, fpir.base_unit, ingredient_cost, i.cup_weight, i.cup_unit 
        ORDER BY quantity DESC`,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    const ingredientCostList = ingList[0];
    if (ingredientCostList.length === 0) {
      return res.status(500).json({
        success: false,
        message: `error while finding ingredient cost list data.`,
      });
    }
    for (const ing of ingredientCostList) {
      ing.cost = Number(ing.cost);
      ing.quantity = Number(ing.quantity);
      ing.ingredient_cost = Number(ing.ingredient_cost);
      if (ing?.cup_weight) {
        ing.cup_weight = Number(ing.cup_weight);
      }
      ing.easy_quantity = getEasyQuantityText(ing);
    }
    finalData.ingredientCostList = ingredientCostList;

    // recipes and its cost
    const [recpList] = await db.query(
      `SELECT distinct(fpir.recipe_id) , r.name, ROUND(SUM(fpir.quantity * COALESCE(up.custom_price, i.default_price)), 2) as recipe_cost
        FROM food_plan_ingredient_records fpir
            JOIN recipes r ON fpir.recipe_id = r.recipe_id AND r.is_active =1
            JOIN ingredients i  ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1
            LEFT JOIN user_prices up  ON up.user_id = ? AND up.ingredient_id = fpir.ingredient_id AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ? AND fpir.is_active = 1
        GROUP BY fpir.food_plan_recipe_id, fpir.recipe_id
        ORDER BY recipe_cost DESC`,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    const recipeCostList = recpList[0];
    if (recipeCostList.length === 0) {
      return res.status(500).json({
        success: false,
        message: `error while finding recipe cost list data.`,
      });
    }
    for (const recipe of recipeCostList) {
      recipe.recipe_cost = Number(recipe.recipe_cost);
    }
    finalData.recipeCostList = recipeCostList;

    // meals and its cost
    const [mealList] = await db.query(
      `SELECT fpm.meal_type , ROUND(SUM(fpir.quantity * COALESCE(up.custom_price, i.default_price)), 2) as meal_cost
        FROM food_plan_ingredient_records fpir
            JOIN food_plan_meals fpm ON fpir.food_plan_meal_id = fpm.food_plan_meal_id AND fpm.is_active =1
            JOIN ingredients i  ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1
            LEFT JOIN user_prices up  ON up.user_id = ? AND up.ingredient_id = fpir.ingredient_id AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ? AND fpir.is_active = 1
        GROUP BY fpm.meal_type
        ORDER BY meal_cost DESC`,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    const mealCostList = mealList[0];
    if (mealCostList.length === 0) {
      return res.status(500).json({
        success: false,
        message: `error while finding meal cost list data.`,
      });
    }
    for (const meal of mealCostList) {
      meal.meal_cost = Number(meal.meal_cost);
    }
    finalData.mealCostList = mealCostList;

    // day and its cost
    const [dayList] = await db.query(
      `SELECT fpd.day_no, ROUND(SUM(fpir.quantity * COALESCE(up.custom_price, i.default_price)), 2) as day_cost
        FROM food_plan_ingredient_records fpir
            JOIN food_plan_days fpd ON fpir.food_plan_day_id = fpd.food_plan_day_id AND fpd.is_active =1
            JOIN ingredients i  ON i.ingredient_id = fpir.ingredient_id AND i.is_active = 1
            LEFT JOIN user_prices up  ON up.user_id = ? AND up.ingredient_id = fpir.ingredient_id AND up.is_active = 1
        WHERE fpir.food_plan_id = ? AND fpir.food_plan_week_id = ? AND fpir.is_active = 1
        GROUP BY fpd.day_no
        ORDER BY fpd.day_no`,
      [user.id, foodPlanId, foodPlanWeekId],
    );
    const dayCostList = dayList[0];
    if (dayCostList.length === 0) {
      return res.status(500).json({
        success: false,
        message: `error while finding day cost list data.`,
      });
    }
    for (const day of dayCostList) {
      day.day_cost = Number(day.day_cost);
    }
    dayCostList = fillMissingDays(dayCostList);
    finalData.dayCostList = dayCostList;

    // create dictonary to show food plan of whole even empty days or meals
    const weeklyData = fillMissingMeals(dashData);
    finalData.weeklyDaya = weeklyData;
    // FINAL response
    res.json({
      success: true,
      message: `fetched data`,
      data: finalData,
    });
  } catch (err) {
    console.log("Error in updateWeeklyDashboardController - (set_daily_dashboard) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
