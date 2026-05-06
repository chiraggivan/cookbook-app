const db = require("../config/database");

// Function to fill missing days (1–7)
function fillMissingDays(data, start = 1, end = 7) {
  // Create a map: day_no to object
  const dayMap = {};
  data.forEach((d) => {
    dayMap[d.day_no] = d;
  });

  const result = [];

  for (let day = start; day <= end; day++) {
    // If day exists → use it, else insert default
    result.push(dayMap[day] || { day_no: day, day_cost: 0 });
  }
  return result;
}

// Function to structure weekly data with meals
function fillMissingMeals(data) {
  // Deep copy to avoid mutation
  const food_plan = JSON.parse(JSON.stringify(data));

  const days = [1, 2, 3, 4, 5, 6, 7];
  const meals = ["breakfast", "lunch", "dinner"];

  const weeklyData = [];

  for (const d of days) {
    const day = {
      name: dayIs(d),
      meals: [],
    };

    // Filter data for this day
    const day_data = food_plan.filter((row) => row.day_no === d);

    // Calculate total day cost
    let day_cost = 0;
    for (const row of day_data) {
      day_cost += (row.quantity || 0) * (row.base_price || 0);
    }

    day.cost = day_cost;

    // Loop meals
    for (const m of meals) {
      const meal = {
        name: m,
        recipes: [],
      };

      const meal_data = day_data.filter((y) => y.meal_type === m);

      // Calculate meal cost
      let meal_cost = 0;
      for (const row of meal_data) {
        meal_cost += (row.quantity || 0) * (row.base_price || 0);
      }

      meal.cost = meal_cost;

      // Get unique recipes
      const recipes = [];
      for (const r of meal_data) {
        const recipe_name = r.recipe_name;
        if (recipe_name && !recipes.includes(recipe_name)) {
          recipes.push(recipe_name);
        }
      }

      meal.recipes = recipes;
      day.meals.push(meal);
    }

    weeklyData.push(day);
  }

  return weeklyData;
}

// Convert day number to name
function dayIs(no) {
  switch (no) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 7:
      return "Sunday";
    default:
      return "Day";
  }
}

// Main function to rebuild weekly dashboard data(currently not used)
async function setWeeklyDashboard(fp_id, fpw_id) {
  const food_plan_id = fp_id;
  const food_plan_week_id = fpw_id;

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
}

// get easy text quantity
function getEasyQuantityText(data) {
  const baseUnit = data.base_unit;
  const quantity = data.quantity;

  // KG CASE
  if (baseUnit === "kg") {
    if (data.cup_unit === "g" && data.cup_weight) {
      const easyNumber = (quantity * 1000) / data.cup_weight;
      const wholeNo = Math.floor(easyNumber);
      const deciNo = easyNumber - wholeNo;

      if (quantity > 1) {
        return `${Math.ceil(quantity * 100) / 100} kilograms`;
      }

      if (deciNo === 0) {
        return wholeNo === 1 ? `${wholeNo} cup` : `${wholeNo} cups`;
      }

      // Example condition conversion
      if (deciNo > 0.75) {
        return `~ ${wholeNo + 1} cups`;
      }

      if (deciNo === 0.5) {
        return wholeNo === 0 ? "1/2 cup" : `${wholeNo} 1/2 cups`;
      }

      // (rest of your conditions stay same pattern)
    } else {
      if (quantity >= 1) {
        return `${Math.ceil(quantity * 100) / 100} kilograms`;
      } else {
        return `${Math.ceil(quantity * 1000)} grams`;
      }
    }
  }

  // LITRE CASE
  else if (baseUnit === "l") {
    if (quantity > 1) {
      return `${Math.ceil(quantity * 100) / 100} Litres`;
    }

    // similar conversion logic...
  }

  // PIECE / BUNCH
  else if (baseUnit === "pc" || baseUnit === "bunch") {
    const wholeNo = Math.floor(quantity);
    const deciNo = quantity - wholeNo;

    if (deciNo === 0) {
      if (baseUnit === "pc") {
        return wholeNo === 1 ? `${wholeNo} ${data.name}` : `${wholeNo} ${data.name}s`;
      } else {
        return wholeNo === 1 ? `${wholeNo} bunch` : `${wholeNo} bunches`;
      }
    }

    // rest same logic pattern...
  }

  return "nothing";
}

exports.modules = { fillMissingDays, fillMissingMeals, getEasyQuantityText };
