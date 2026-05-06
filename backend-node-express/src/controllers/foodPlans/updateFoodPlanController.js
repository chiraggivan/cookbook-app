const db = require("../../config/database");

const { meals, normalisePlan, validateFoodPlan } = require("../../utils/foodPlanUtils");

// update food plan per day selected(only one day can be selected and updated at time)
exports.update_day_food_plan_old = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;

    const foodPlanId = data?.food_plan_id;
    if (!foodPlanId) {
      res.json({
        success: false,
        message: `food plan id missing. cant proceed further`,
        foodPlan,
      });
    }
    // ----------------------------- normalize and validate data ---------------------------

    const foodPlan = normalisePlan(data);
    const { error, recipeIds } = validateFoodPlan(data, meals);
    if (error) {
      res.json({
        success: false,
        message: `found errors in validation of create food plan -- ${error}`,
        foodPlan,
      });
    }

    // check if the supplied day , meal, recipe ids for update are genuine and valid and exist in db
    const food_plan_week_rows = new Set();
    const food_plan_day_rows = new Set();
    const food_plan_meal_rows = new Set();
    const food_plan_recipe_rows = new Set();

    for (const week of data.food_plan) {
      const week_no = week.week_no;

      if (week.food_plan_week_id) {
        food_plan_week_rows.add(JSON.stringify([week.food_plan_week_id, food_plan_id, week_no]));
      }

      for (const day of week.weekly_meals) {
        const day_no = day.day_no;

        if (day.food_plan_day_id) {
          food_plan_day_rows.add(
            JSON.stringify([day.food_plan_day_id, week.food_plan_week_id, day_no]),
          );
        }

        for (const meal of day.daily_meals) {
          const meal_type = meal.meal_type;

          if (meal.food_plan_meal_id) {
            food_plan_meal_rows.add(
              JSON.stringify([meal.food_plan_meal_id, day.food_plan_day_id, meal_type]),
            );
          }

          for (const recipe of meal.recipes) {
            const recipeId = recipe.recipe_id;

            if (recipe.food_plan_recipe_id) {
              food_plan_recipe_rows.add(
                JSON.stringify([recipe.food_plan_recipe_id, meal.food_plan_meal_id]),
              );
            }
          }
        }
      }
    }

    // console.log("Food plan id :", food_plan_id);
    // console.log("Food plan week ids :", food_plan_week_rows);
    // console.log("Food plan day ids :", food_plan_day_rows);
    // console.log("Food plan meal ids :", food_plan_meal_rows);
    // console.log("Food plan recipe ids :", food_plan_recipe_rows);
    // --------------------------- connect db and verify data --------------------------

    // check user is valid and active
    const [userRows] = await db.query("SELECT 1 FROM users WHERE user_id = ? AND is_active = 1", [
      user.id,
    ]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // check recipe_id is valid, is_active and owned by user
    for (const recipe_id of recipeIds) {
      const [rows] = await db.query(
        `SELECT 1 FROM recipes WHERE recipe_id = ? AND user_id = ? AND is_active = 1`,
        [recipe_id, user.id],
      );
      if (!rows.length) {
        return res.status(409).json({
          error: `Recipe id ${recipe_id} missing or not active or not owned`,
          submitted_data: data,
        });
      }
    }

    // check food_plan_id valid for user
    const [planRows] = await db.query(
      "SELECT 1 FROM food_plans WHERE user_id = ? AND food_plan_id = ? AND is_active = 1",
      [user.id, foodPlanId],
    );
    if (!planRows.length) {
      return res.status(404).json({ error: "Food plan not found." });
    }

    // check if food_plan_id, food_plan_week_id, week_no match in table
    for (const item of food_plan_week_rows) {
      const [week_id, plan_id, week_no] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_weeks 
     WHERE food_plan_week_id = ? AND food_plan_id = ? AND week_no = ?`,
        [week_id, plan_id, week_no],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan id AND - food plan week id, week no - not found.",
        });
      }
    }

    // check if food_plan_week_id, food_plan_day_id, day_no match in table
    for (const item of food_plan_day_rows) {
      const [day_id, week_id, day_no] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_days 
     WHERE food_plan_day_id = ? AND food_plan_week_id = ? AND day_no = ?`,
        [day_id, week_id, day_no],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan week id AND - food plan day id, day no - not found.",
        });
      }
    }

    // check if food_plan_day_id and food_plan_meal_id match in table
    for (const item of food_plan_meal_rows) {
      const [meal_id, day_id, meal_type] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_meals 
     WHERE food_plan_meal_id = ? AND food_plan_day_id = ? AND meal_type = ?`,
        [meal_id, day_id, meal_type],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan day id AND food plan meal id not found.",
        });
      }
    }

    // check if food_plan_meal_id and food_plan_recipe_id match in table
    for (const item of food_plan_recipe_rows) {
      const [recipes_id, meal_id] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_recipes 
     WHERE food_plan_recipe_id = ? AND food_plan_meal_id = ?`,
        [recipes_id, meal_id],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan meal id AND food plan recipe id not found.",
        });
      }
    }

    return res.json({
      success: true,
      message: `about to update food plan.`,
      data,
    });
    // ---------------------------------------------    Updating data in db      -------------------------------------------------------

    //  make all the data wrt this food_plan inactive for the selected day

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // -- find food_week_plan_id and weekNo FROM foodPlanId
      const weeks = data.food_plan;
      if (weeks.length !== 0) {
        for (const week of weeks) {
          const weekNo = week.week_no;
          const [weekRows] = await conn.query(
            `SELECT food_plan_week_id 
            FROM food_plan_weeks 
            WHERE food_plan_id = ? AND week_no = ?`,
            [foodPlanId, weekNo],
          );

          //  --
          if (weekRows.length !== 0) {
            if (week.weekly_meals.length !== 0) {
              for (const day of week.weekly_meals) {
                const dayNo = day.day_no;
                const [dayRows] = await conn.query(
                  `SELECT food_plan_day_id 
                  FROM food_plan_days 
                  WHERE food_plan_week_id = ? AND day_no = ?`,
                  [weekRows[0].food_plan_week_id, dayNo],
                );
                // ----------------------
                const [updtFPD] = await conn.query(
                  `UPDATE food_plan_days 
                  SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                  WHERE food_plan_day_id = ?`,
                  [dayRows[0].food_plan_day_id],
                );

                const [mealRows] = await conn.query(
                  `SELECT food_plan_meal_id 
                  FROM food_plan_meals 
                  WHERE food_plan_day_id = ? AND is_active = 1`,
                  [dayRows[0].food_plan_day_id],
                );

                if (mealRows.length !== 0) {
                  for (const meal of mealRows) {
                    const [updtFPM] = await conn.query(
                      `UPDATE food_plan_meals
                      SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
                      WHERE food_plan_meal_id = ?`,
                      [meal.food_plan_meal_id],
                    );

                    const [recipeRows] = await conn.query(
                      `SELECT food_plan_recipe_id 
                      FROM food_plan_recipes 
                      WHERE food_plan_meal_id = ? AND is_active = 1`,
                      [meal.food_plan_meal_id],
                    );

                    if (recipeRows.length !== 0) {
                      for (const recipe of recipeRows) {
                        const [updtFPR] = await conn.query(
                          `UPDATE food_plan_recipes
                          SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
                          WHERE food_plan_recipe_id = ?`,
                          [recipe.food_plan_recipe_id],
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // ------------------------- update or insert the data depending on the data ------------------
      const recordForDashboard = {}; // record to send it to a table from which many things can be found quickly like total ingredient cost,  quantity, etc..
      recordForDashboard.food_plan_id = foodPlanId;

      // -- check if food_plan_week_id is not supplied( wil be missing for 1st time food plan creator)
      for (const week in weeks) {
        const weekNo = week.week_no;

        // -- Starting food_plan_week table (for update/insert)
        if (week.food_plan_week_id) {
          const foodPlanWeekId = week.food_plan_week_id;
          recordForDashboard.food_plan_week_id = week.food_plan_week_id;
        } else {
          const [weekRow] = await conn.query(
            `SELECT food_plan_week_id 
            FROM food_plan_weeks 
            WHERE food_plan_id = ? AND week_no = ?`,
            [foodPlanId, week.week_no],
          );
          if (weekRow.length !== 0) {
            const [FPWresult] = await conn.query(
              `UPDATE food_plan_weeks 
              SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
              WHERE food_plan_week_id = ?`,
              [weekRow[0].food_plan_week_id],
            );
            const foodPlanWeekId = weekRow[0].food_plan_week_id;
            recordForDashboard.food_plan_week_id = foodPlanWeekId;
          } else {
            const [FPWresult] = await conn.query(
              `INSERT INTO food_plan_weeks(food_plan_id, week_no)
              VALUES (?,?)`,
              [foodPlanId, weekNo],
            );
            const foodPlanWeekId = FPWresult.insertId;
            recordForDashboard.food_plan_week_id = foodPlanWeekId;
          }
        }

        // -- Starting food_plan_day table (for update/insert)
        for (const day of week.weekly_meals) {
          const dayNo = day.day_no;

          if (day.food_plan_day_id) {
            const foodPlanDayId = day.food_plan_day_id;

            const [FPDresult] = await conn.query(
              `UPDATE food_plan_days 
              SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
              WHERE food_plan_day_id = ?`,
              [foodPlanDayId],
            );
            recordForDashboard.food_plan_day_id = foodPlanDayId;
          } else {
            const [dayRow] = await conn.query(
              `SELECT food_plan_day_id 
              FROM food_plan_days 
              WHERE food_plan_week_id = ? AND day_no = ?`,
              [foodPlanWeekId, dayNo],
            );
            if (dayRow.length !== 0) {
              const foodPlanDayId = dayRow.food_plan_day_id;
              const [FPDresult] = await conn.query(
                `UPDATE food_plan_days 
                SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                WHERE food_plan_day_id = ?`,
                [foodPlanDayId],
              );
              recordForDashboard.food_plan_day_id = foodPlanDayId;
            } else {
              const [FPDresult] = await conn.query(
                `INSERT INTO food_plan_days(food_plan_week_id, day_no)
                VALUES (?,?)`,
                [foodPlanWeekId, dayNo],
              );
              const foodplanDayId = FPDresult.insertId();
            }
          }

          // -- starting food_plan_meal table (for update/insert)
          const mealRecords = []; // -- mostly used for recordForDashboard

          for (const meal of day.daily_meals) {
            const mealType = meal.meal_type;
            const mealRecord = {};

            if (meal.food_plan_meal_id) {
              const foodPlanMealId = meal.food_plan_meal_id;
              const [FPMresult] = await conn.query(
                `UPDATE food_plan_meals 
                SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                WHERE food_plan_meal_id =?`,
                [foodPlanMealId],
              );
              mealRecord.food_plan_meal_id = foodPlanMealId;
            } else {
              const [mealRows] = await conn.query(
                `SELECT food_plan_meal_id 
                FROM food_plan_meals
                WHERE food_plan_day_id = ? AND meal_type = ?`,
                [foodPlanDayId, mealType],
              );
              if (mealRows.length !== 0) {
                const foodPlanMealId = mealRows.food_plan_meal_id;
                const [FPMresult] = await conn.query(
                  `UPDATE food_plan_meals 
                  SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                  WHERE food_plan_meal_id =`,
                  [foodPlanMealId],
                );
                mealRecord.food_plan_meal_id = foodPlanMealId;
              } else {
                const [FPMresult] = await conn.query(
                  `INSERT INTO food_plan_meals(food_plan_day_id, meal_type)
                  VALUES (?,?)`,
                  [foodPlanDayId, mealType],
                );
                const foodPlanMealId = FPMresult.insertId;
                mealRecord.food_plan_meal_id - foodPlanMealId;
              }
            }

            // -- staring with food_plan_recipe table (for update/insert)
            const recipeRecords = []; // -- mostly used for recordForDashboard
            for (const recipe of meal.recipes) {
              const recipeId = recipe.recipe_id;
              const displayOrder = recipe.display_order;
              const recipeRecord = {}; // -- mostly user for recordForDashboard
              recipeRecord.recipe_id = recipeId;
              recipeRecord.display_order = displayOrder;

              if (recipe.food_plan_recipe_id) {
                const foodPlanRecipeId = recipe.food_plan_recipe_id;
                const [FPRresult] = await conn.query(
                  `UPDATE food_plan_recipes 
                  SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                  WHERE food_plan_recipe_id =?`,
                  [foodPlanRecipeId],
                );
                recipeRecord.food_plan_recipe_id = foodPlanRecipeId;
              } else {
                // insert new rows everytime for update. old rows will help in future to track old food plan by reverse engineering
                const [FPRresult] = await conn.query(
                  `INSERT INTO food_plan_recipes(food_plan_meal_id, recipe_id, display_order)
                  VALUES (?,?,?)`,
                  [foodPlanMealId, recipeId, displayOrder],
                );
                const foodPlanRecipeId = FPRresult.insertId;
                recipeRecord.food_plan_recipe_id = foodPlanRecipeId;
              }
              recipeRecords.push({ ...recipeRecord });
            }
            mealRecord.recipes = recipeRecords;
            mealRecords.push({ ...mealRecord });
          }

          recordForDashboard.daily_meals = mealRecords;
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.log(
        "Error in updateFoodPlanController (update_day_food_plan) - While updating in db : ",
        err,
      );
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    } finally {
      conn.release();
    }

    // FINAL response
    res.json({
      success: true,
      message: `food plan for the day updated`,
    });
  } catch (err) {
    console.log("Error in updateFoodPlanController - (update_day_food_plan) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// improved version as no need to check all the weeks and all the days of the week
// update food plan per day selected(only one day can be selected and updated at time)
exports.update_day_food_plan = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;

    const foodPlanId = data?.food_plan_id;
    if (!foodPlanId) {
      res.json({
        success: false,
        message: `food plan data missing. cant proceed further`,
      });
    }
    // ----------------------------- normalize and validate data ---------------------------

    const foodPlan = normalisePlan(data);
    const { error, recipeIds } = validateFoodPlan(data, meals);
    if (error) {
      res.json({
        success: false,
        message: `found errors in validation of create food plan -- ${error}`,
        foodPlan,
      });
    }

    // check if the supplied day , meal, recipe ids for update are genuine and valid and exist in db
    const food_plan_week_rows = new Set();
    const food_plan_day_rows = new Set();
    const food_plan_meal_rows = new Set();
    const food_plan_recipe_rows = new Set();

    for (const week of data.food_plan) {
      const week_no = week.week_no;

      if (week.food_plan_week_id) {
        food_plan_week_rows.add(JSON.stringify([week.food_plan_week_id, food_plan_id, week_no]));
      }

      for (const day of week.weekly_meals) {
        const day_no = day.day_no;

        if (day.food_plan_day_id) {
          food_plan_day_rows.add(
            JSON.stringify([day.food_plan_day_id, week.food_plan_week_id, day_no]),
          );
        }

        for (const meal of day.daily_meals) {
          const meal_type = meal.meal_type;

          if (meal.food_plan_meal_id) {
            food_plan_meal_rows.add(
              JSON.stringify([meal.food_plan_meal_id, day.food_plan_day_id, meal_type]),
            );
          }

          for (const recipe of meal.recipes) {
            const recipeId = recipe.recipe_id;

            if (recipe.food_plan_recipe_id) {
              food_plan_recipe_rows.add(
                JSON.stringify([recipe.food_plan_recipe_id, meal.food_plan_meal_id]),
              );
            }
          }
        }
      }
    }

    // console.log("Food plan id :", food_plan_id);
    // console.log("Food plan week ids :", food_plan_week_rows);
    // console.log("Food plan day ids :", food_plan_day_rows);
    // console.log("Food plan meal ids :", food_plan_meal_rows);
    // console.log("Food plan recipe ids :", food_plan_recipe_rows);
    // --------------------------- connect db and verify data --------------------------

    // check user is valid and active
    const [userRows] = await db.query("SELECT 1 FROM users WHERE user_id = ? AND is_active = 1", [
      user.id,
    ]);
    if (!userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // check recipe_id is valid, is_active and owned by user
    for (const recipe_id of recipeIds) {
      const [rows] = await db.query(
        `SELECT 1 FROM recipes WHERE recipe_id = ? AND user_id = ? AND is_active = 1`,
        [recipe_id, user.id],
      );
      if (!rows.length) {
        return res.status(409).json({
          error: `Recipe id ${recipe_id} missing or not active or not owned`,
          submitted_data: data,
        });
      }
    }

    // check food_plan_id valid for user
    const [planRows] = await db.query(
      "SELECT 1 FROM food_plans WHERE user_id = ? AND food_plan_id = ? AND is_active = 1",
      [user.id, foodPlanId],
    );
    if (!planRows.length) {
      return res.status(404).json({ error: "Food plan not found." });
    }

    // check if food_plan_id, food_plan_week_id, week_no match in table
    for (const item of food_plan_week_rows) {
      const [week_id, plan_id, week_no] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_weeks 
     WHERE food_plan_week_id = ? AND food_plan_id = ? AND week_no = ?`,
        [week_id, plan_id, week_no],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan id AND - food plan week id, week no - not found.",
        });
      }
    }

    // check if food_plan_week_id, food_plan_day_id, day_no match in table
    for (const item of food_plan_day_rows) {
      const [day_id, week_id, day_no] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_days 
     WHERE food_plan_day_id = ? AND food_plan_week_id = ? AND day_no = ?`,
        [day_id, week_id, day_no],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan week id AND - food plan day id, day no - not found.",
        });
      }
    }

    // check if food_plan_day_id and food_plan_meal_id match in table
    for (const item of food_plan_meal_rows) {
      const [meal_id, day_id, meal_type] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_meals 
     WHERE food_plan_meal_id = ? AND food_plan_day_id = ? AND meal_type = ?`,
        [meal_id, day_id, meal_type],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan day id AND food plan meal id not found.",
        });
      }
    }

    // check if food_plan_meal_id and food_plan_recipe_id match in table
    for (const item of food_plan_recipe_rows) {
      const [recipes_id, meal_id] = JSON.parse(item);
      const [rows] = await db.query(
        `SELECT 1 FROM food_plan_recipes 
     WHERE food_plan_recipe_id = ? AND food_plan_meal_id = ?`,
        [recipes_id, meal_id],
      );
      if (!rows.length) {
        return res.status(404).json({
          error: "Combined Food plan meal id AND food plan recipe id not found.",
        });
      }
    }

    return res.json({
      success: true,
      message: `about to update food plan.`,
      data,
    });
    // ---------------------------------------------    Updating data in db      -------------------------------------------------------

    //  make all the data wrt this food_plan inactive for the ---->   SELECTED DAY
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // -- find food_week_plan_id and weekNo FROM foodPlanId
      const weeks = data.food_plan;
      if (weeks.length !== 0) {
        for (const week of weeks) {
          const weekNo = week.week_no;
          const foodPlanWeekId = week.food_plan_week_id;
          const weeklyMeals = week.weekly_meals;

          // -------- update food_plan_days table to make it in-active for that day
          if (weeklyMeals.length !== 0) {
            for (const day of weeklyMeals) {
              const dayNo = day.day_no;
              const foodPlanDayId = day.food_plan_day_id;
              const dailyMeals = day.daily_meals;
              const [updtFPD] = await conn.query(
                `UPDATE food_plan_days 
                  SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                  WHERE food_plan_day_id = ?`,
                [foodPlanDayId],
              );

              //  -------- find all the meals corresponding to the above foodPlanDayId
              const [mealRows] = await conn.query(
                `SELECT food_plan_meal_id 
                  FROM food_plan_meals 
                  WHERE food_plan_day_id = ? AND is_active = 1`,
                [foodPlanDayId],
              );

              //  --------- there can be multiple meals for that day. get all of them and make them inactive
              if (mealRows.length !== 0) {
                for (const meal of mealRows) {
                  const foodPlanMealId = meal.food_plan_meal_id;
                  const [updtFPM] = await conn.query(
                    `UPDATE food_plan_meals
                      SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
                      WHERE food_plan_meal_id = ?`,
                    [foodPlanMealId],
                  );

                  // -------- find all the recipes corresponding to the above meal
                  const [recipeRows] = await conn.query(
                    `SELECT food_plan_recipe_id 
                      FROM food_plan_recipes 
                      WHERE food_plan_meal_id = ? AND is_active = 1`,
                    [foodPlanMealId],
                  );

                  //  --------- there can be multiple recipes for that day. get all of them and make them inactive
                  if (recipeRows.length !== 0) {
                    for (const recipe of recipeRows) {
                      const foodPlanRecipeId = recipe.food_plan_recipe_id;
                      const [updtFPR] = await conn.query(
                        `UPDATE food_plan_recipes
                          SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
                          WHERE food_plan_recipe_id = ?`,
                        [foodPlanRecipeId],
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
      // --------------------- completed the task of making all data inactive for ---> SELECTED DAY.

      // update or insert the data depending on the data
      const recordForDashboard = {}; // record to send it to a table from which many things can be found quickly like total ingredient cost,  quantity, etc..
      recordForDashboard.food_plan_id = foodPlanId;

      // -- check if food_plan_week_id is not supplied( wil be missing for 1st time food plan creator)
      for (const week in weeks) {
        const weekNo = week.week_no;

        // -- Starting food_plan_week table (for update/insert)
        if (week.food_plan_week_id) {
          const foodPlanWeekId = week.food_plan_week_id;
          recordForDashboard.food_plan_week_id = week.food_plan_week_id;
        } else {
          const [weekRow] = await conn.query(
            `SELECT food_plan_week_id 
            FROM food_plan_weeks 
            WHERE food_plan_id = ? AND week_no = ?`,
            [foodPlanId, week.week_no],
          );
          if (weekRow.length !== 0) {
            const [FPWresult] = await conn.query(
              `UPDATE food_plan_weeks 
              SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
              WHERE food_plan_week_id = ?`,
              [weekRow[0].food_plan_week_id],
            );
            const foodPlanWeekId = weekRow[0].food_plan_week_id;
            recordForDashboard.food_plan_week_id = foodPlanWeekId;
          } else {
            const [FPWresult] = await conn.query(
              `INSERT INTO food_plan_weeks(food_plan_id, week_no)
              VALUES (?,?)`,
              [foodPlanId, weekNo],
            );
            const foodPlanWeekId = FPWresult.insertId;
            recordForDashboard.food_plan_week_id = foodPlanWeekId;
          }
        }

        // -- Starting food_plan_day table (for update/insert)
        for (const day of week.weekly_meals) {
          const dayNo = day.day_no;

          if (day.food_plan_day_id) {
            const foodPlanDayId = day.food_plan_day_id;

            const [FPDresult] = await conn.query(
              `UPDATE food_plan_days 
              SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
              WHERE food_plan_day_id = ?`,
              [foodPlanDayId],
            );
            recordForDashboard.food_plan_day_id = foodPlanDayId;
          } else {
            const [dayRow] = await conn.query(
              `SELECT food_plan_day_id 
              FROM food_plan_days 
              WHERE food_plan_week_id = ? AND day_no = ?`,
              [foodPlanWeekId, dayNo],
            );
            if (dayRow.length !== 0) {
              const foodPlanDayId = dayRow.food_plan_day_id;
              const [FPDresult] = await conn.query(
                `UPDATE food_plan_days 
                SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                WHERE food_plan_day_id = ?`,
                [foodPlanDayId],
              );
              recordForDashboard.food_plan_day_id = foodPlanDayId;
            } else {
              const [FPDresult] = await conn.query(
                `INSERT INTO food_plan_days(food_plan_week_id, day_no)
                VALUES (?,?)`,
                [foodPlanWeekId, dayNo],
              );
              const foodplanDayId = FPDresult.insertId();
            }
          }

          // -- starting food_plan_meal table (for update/insert)
          const mealRecords = []; // -- mostly used for recordForDashboard

          for (const meal of day.daily_meals) {
            const mealType = meal.meal_type;
            const mealRecord = {};

            if (meal.food_plan_meal_id) {
              const foodPlanMealId = meal.food_plan_meal_id;
              const [FPMresult] = await conn.query(
                `UPDATE food_plan_meals 
                SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                WHERE food_plan_meal_id =?`,
                [foodPlanMealId],
              );
              mealRecord.food_plan_meal_id = foodPlanMealId;
            } else {
              const [mealRows] = await conn.query(
                `SELECT food_plan_meal_id 
                FROM food_plan_meals
                WHERE food_plan_day_id = ? AND meal_type = ?`,
                [foodPlanDayId, mealType],
              );
              if (mealRows.length !== 0) {
                const foodPlanMealId = mealRows.food_plan_meal_id;
                const [FPMresult] = await conn.query(
                  `UPDATE food_plan_meals 
                  SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                  WHERE food_plan_meal_id =`,
                  [foodPlanMealId],
                );
                mealRecord.food_plan_meal_id = foodPlanMealId;
              } else {
                const [FPMresult] = await conn.query(
                  `INSERT INTO food_plan_meals(food_plan_day_id, meal_type)
                  VALUES (?,?)`,
                  [foodPlanDayId, mealType],
                );
                const foodPlanMealId = FPMresult.insertId;
                mealRecord.food_plan_meal_id - foodPlanMealId;
              }
            }

            // -- staring with food_plan_recipe table (for update/insert)
            const recipeRecords = []; // -- mostly used for recordForDashboard
            for (const recipe of meal.recipes) {
              const recipeId = recipe.recipe_id;
              const displayOrder = recipe.display_order;
              const recipeRecord = {}; // -- mostly user for recordForDashboard
              recipeRecord.recipe_id = recipeId;
              recipeRecord.display_order = displayOrder;

              if (recipe.food_plan_recipe_id) {
                const foodPlanRecipeId = recipe.food_plan_recipe_id;
                const [FPRresult] = await conn.query(
                  `UPDATE food_plan_recipes 
                  SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
                  WHERE food_plan_recipe_id =?`,
                  [foodPlanRecipeId],
                );
                recipeRecord.food_plan_recipe_id = foodPlanRecipeId;
              } else {
                // insert new rows everytime for update. old rows will help in future to track old food plan by reverse engineering
                const [FPRresult] = await conn.query(
                  `INSERT INTO food_plan_recipes(food_plan_meal_id, recipe_id, display_order)
                  VALUES (?,?,?)`,
                  [foodPlanMealId, recipeId, displayOrder],
                );
                const foodPlanRecipeId = FPRresult.insertId;
                recipeRecord.food_plan_recipe_id = foodPlanRecipeId;
              }
              recipeRecords.push({ ...recipeRecord });
            }
            mealRecord.recipes = recipeRecords;
            mealRecords.push({ ...mealRecord });
          }
          recordForDashboard.daily_meals = mealRecords;
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.log(
        "Error in updateFoodPlanController (update_day_food_plan) - While updating in db : ",
        err,
      );
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    } finally {
      conn.release();
    }

    // FINAL response
    res.json({
      success: true,
      message: `food plan for the day updated`,
    });
  } catch (err) {
    console.log("Error in updateFoodPlanController - (update_day_food_plan) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Search recipes in search bar to select in food plan
exports.search_recipes = async (req, res) => {
  const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
  const q = req.query.q;
  try {
    if (!q) {
      return res.json({
        success: true,
        message: `nothing to search`,
      });
    }

    //
    const [rows] = await db.query(
      `SELECT r.recipe_id, r.name AS recipe_name, r.portion_size, COALESCE(SUM(ri.quantity * COALESCE(up.custom_price, i.default_price) * u.conversion_factor),0) AS price    
      FROM recipes r 
          JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id 
          JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
          JOIN units u ON ri.unit_id = u.unit_id
          LEFT JOIN user_prices up ON up.user_id = ?
              AND up.ingredient_id = i.ingredient_id 
              AND up.is_active = 1
      WHERE LOWER(r.name) like LOWER(?) AND ri.is_active = 1 AND r.is_active = 1 AND r.user_id = ?
      GROUP BY r.recipe_id, r.name
      LIMIT 20`,
      [user.id, `%${q}%`, user.id],
    );

    // FINAL response
    res.json({
      success: true,
      message: `list of all the recipes found with text typed in search placeholder`,
      rows,
    });
  } catch (err) {
    console.log("Error in updateFoodPlanController - (search_ingredients) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
