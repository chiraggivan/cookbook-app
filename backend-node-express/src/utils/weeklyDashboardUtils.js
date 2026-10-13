const db = require("../config/database");
const { cupVolume } = require("./constantValues");

// Function to fill missing days (1–7)
function fillMissingDays(data, start = 1, end = 7) {
  // Create a map: name to object
  const dayMap = {};
  data.forEach((d) => {
    dayMap[d.day_no] = { name: dayIs(d.day_no).slice(0, 3), cost: d.cost };
  });

  const result = [];

  for (let day = start; day <= end; day++) {
    // If day exists → use it, else insert default
    result.push(dayMap[day] || { name: dayIs(day).slice(0, 3), cost: 0 });
  }
  return result;
}

// Function to structure weekly data with meals
async function fillMissingMeals(data) {
  // Deep copy to avoid mutation
  const food_plan = JSON.parse(JSON.stringify(data));

  const days = [1, 2, 3, 4, 5, 6, 7];

  // get all active meal ids and their names
  const mealId_query = `select meal_id, name, display_order FROM meals WHERE is_active = 1 ORDER BY display_order`;
  const [mealResult] = await db.query(mealId_query, []);
  const mealIds = mealResult.map((i) => {
    return i.meal_id;
  });

  const weeklyData = [];

  for (const d of days) {
    const day = {
      name: d,
      name: dayIs(d),
      meals: [],
    };

    // Filter data for this day
    const day_data = food_plan.filter((row) => row.day_no === d);

    // Calculate total day cost
    let cost = 0;
    for (const row of day_data) {
      cost += (row.quantity || 0) * (row.base_price || 0);
    }

    day.cost = Number(cost.toFixed(2));
    // console.log("day  is: ", day);

    // Loop meals
    for (const m of mealIds) {
      const meal = {
        name: mealResult
          .map((i) => {
            if (i.meal_id === m) {
              return i.name;
            }
          })
          .find((i) => i !== undefined),
        recipes: [],
      };

      const meal_data = day_data.filter((y) => y.meal_id === m);

      // Calculate meal cost
      let meal_cost = 0;
      for (const row of meal_data) {
        meal_cost += (row.quantity || 0) * (row.base_price || 0);
      }

      meal.cost = Number(meal_cost.toFixed(2));

      // Get all recipes of the above meal data. Due to ingredients, this will have
      // multiple rows with same recipe_id and recipe_name
      const recipeIds = [];
      for (const r of meal_data) {
        if (r.recipe_id && !recipeIds.includes(r.recipe_id)) {
          const recipe = {
            recipe_id: r.recipe_id,
            recipe_name: r.recipe_name,
          };
          recipeIds.push(r.recipe_id);
          meal.recipes.push(recipe);
        }
      }
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
  const quantity = Number(data.quantity) || 0;

  // KG CASE
  if (baseUnit === "kg") {
    // anything more than a kg will be shown in 'kilograms' only.
    if (quantity >= 0.5 && quantity < 1) {
      return `${Math.ceil(quantity * 1000)} grams`;
    }
    if (quantity == 1) {
      return `1 kilogram`;
    }

    if (quantity > 1) {
      return `${Math.ceil(quantity * 100) / 100} kilograms`;
    }

    // if quantity less than 0.5 and has cup weight else default display of kg and grams
    if (data.cup_unit === "g" && Number(data.cup_weight)) {
      const easyNumber = (quantity * 1000) / data.cup_weight;
      const wholeNo = Math.floor(easyNumber);
      const deciNo = easyNumber - wholeNo;

      if (deciNo === 0) {
        return wholeNo !== 0
          ? wholeNo === 1
            ? `${wholeNo} cup`
            : `${wholeNo} cups`
          : `nothing to buy`;
      } else if (deciNo < 0.020833) {
        return wholeNo > 0 ? `approx ${wholeNo} cups` : `approx 1 tsp`;
      } else if (deciNo == 0.02083) {
        return wholeNo > 0 ? `${wholeNo} cup and a teaspoon` : `1 tsp`;
      } else if (deciNo < 0.041666) {
        return wholeNo > 0 ? `approx ${wholeNo} cups and 2 teaspoons` : `approx 2 tsps`;
      } else if (deciNo == 0.041666) {
        return wholeNo > 0 ? `${wholeNo} cups and 2 teaspoons` : `2 tsps`;
      } else if (deciNo < 0.0625) {
        return wholeNo > 0 ? `approx ${wholeNo} 1/4 cups` : `approx 1 tbsp or 3 tsps`;
      } else if (deciNo == 0.0625) {
        return wholeNo > 0 ? `${wholeNo} 1/4 cups` : `1 tbsp or 3 tsps`;
      } else if (deciNo < 0.125) {
        return wholeNo > 0 ? `approx ${wholeNo} 1/4 cups` : `approx 2 tbsp or 6 tsps`;
      } else if (deciNo == 0.125) {
        return wholeNo > 0 ? `${wholeNo} 1/4 cups` : `2 tbsp or 6 tsps`;
      } else if (deciNo < 0.1875) {
        return wholeNo > 0 ? `approx ${wholeNo} 1/4 cups` : `approx 3 tbsp or 9 tsps`;
      } else if (deciNo == 0.1875) {
        return wholeNo > 0 ? `${wholeNo} 1/4 cups` : `3 tbsp or 9 tsps`;
      } else if (deciNo < 0.25) {
        return wholeNo > 0 ? `approx ${wholeNo} 1/4 cups` : `approx 1/4 cup`;
      } else if (deciNo == 0.25) {
        return wholeNo > 0 ? `${wholeNo} 1/4 cups` : `4 tbsp or 1/4 cup`;
      } else if (deciNo < 0.5) {
        return wholeNo > 0 ? `approx ${wholeNo} 1/2 cups` : `approx 1/2 cup`;
      } else if (deciNo == 0.5) {
        return wholeNo > 0 ? `${wholeNo} 1/2 cups` : `8 tbsp or 1/2 cup`;
      } else if (deciNo < 0.75) {
        return wholeNo > 0 ? `approx ${wholeNo} 3/4 cups` : `approx 3/4 cup`;
      } else if (deciNo == 0.75) {
        return wholeNo > 0 ? `${wholeNo} 3/4 cups` : `12 tbsp or 3/4 cup`;
      } else if (deciNo <= 0.99) {
        return wholeNo > 0 ? `approx ${wholeNo + 1} cups` : `1 cup`;
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
    if (quantity >= 1) {
      return `${Math.ceil(quantity * 100) / 100} Litres`;
    } else {
      const ingInMl = Math.ceil(quantity * 1000) + "ml";
      const cups = Math.ceil(quantity * 1000) / cupVolume;
      const wholeCups = Math.floor(cups);
      const fraction = quantity - wholeCups;

      let result;

      // easy reading for liquid between 1 cup and 1 litre
      if (wholeCups > 0) {
        if (fraction === 0) {
          return `${ingInMl} or ${wholeCups} ${wholeCups === 1 ? "cup" : "cups"}`;
        } else if (fraction < 0.25) {
          return `${ingInMl} or approx ${wholeCups} and 1/4 cups`;
        } else if (fraction == 0.25) {
          return `${ingInMl} or ${wholeCups} and 1/4 cups`;
        } else if (fraction < 0.5) {
          return `${ingInMl} or approx ${wholeCups} and 1/2 cups`;
        } else if (fraction == 0.5) {
          return `${ingInMl} or ${wholeCups} and 1/2 cups`;
        } else if (fraction <= 0.75) {
          return `${ingInMl} or approx ${wholeCups} and 3/4 cups`;
        } else if (fraction == 0.75) {
          return `${ingInMl} or ${wholeCups} and 3/4 cups`;
        } else {
          return `${ingInMl} or approx ${wholeCups + 1} cups`;
        }
      } else {
        // easy reading for liquid betwen 1ml -250ml(1 cup)
        const ing_qty = Math.ceil(quantity * 1000);
        if (ing_qty < 5) {
          return `${ingInMl} or approx 1 tsp`;
        } else if (ing_qty == 5) {
          return `${ingInMl} or  1 tsp`;
        } else if (ing_qty < 10) {
          return `${ingInMl} or approx 2 tsps`;
        } else if (ing_qty == 10) {
          return `${ingInMl} or  2 tsps`;
        } else if (ing_qty < 15) {
          return `${ingInMl} or approx 3 tsps`;
        } else if (ing_qty == 15) {
          return `${ingInMl} or approx 1 tbsp`;
        } else if (ing_qty < 30) {
          return `${ingInMl} or approx 2 tbsps`;
        } else if (ing_qty == 30) {
          return `${ingInMl} or  2 tbsps`;
        } else if (ing_qty < 45) {
          return `${ingInMl} or approx 3 tsps`;
        } else if (ing_qty == 45) {
          return `${ingInMl} or  3 tsps`;
        } else if (ing_qty < 60) {
          return `${ingInMl} or approx 4 tbsps`;
        } else if (ing_qty == 60) {
          return `${ingInMl} or  1/4 cup`;
        } else if (ing_qty < 90) {
          return `${ingInMl} or more than 1/4 cup`;
        } else if (ing_qty < 120) {
          return `${ingInMl} or approx 1/2 cup`;
        } else if (ing_qty == 120) {
          return `${ingInMl} or  1/2 cup`;
        } else if (ing_qty < 150) {
          return `${ingInMl} or more than 1/2 cup`;
        } else if (ing_qty < 180) {
          return `${ingInMl} or approx 3/4 cup`;
        } else if (ing_qty == 180) {
          return `${ingInMl} or 3/4 cup`;
        } else if (ing_qty < 210) {
          return `${ingInMl} or more than 3/4 cup`;
        } else if (ing_qty < 240) {
          return `${ingInMl} or approx 1 cup`;
        }
      }
    }
  }

  // PIECE / BUNCH
  else if (baseUnit === "pc" || baseUnit === "bunch") {
    const wholeNo = Math.floor(quantity);
    const deciNo = quantity - wholeNo;

    if (deciNo === 0) {
      if (baseUnit === "pc") {
        return wholeNo > 0
          ? wholeNo === 1
            ? `${wholeNo} ${data.name}`
            : `${wholeNo} ${data.name}s`
          : "nothing to buy";
      } else {
        return wholeNo > 0
          ? wholeNo === 1
            ? `${wholeNo} bunch`
            : `${wholeNo} bunches`
          : "nothing to buy";
      }
    } else if (deciNo < 0.25) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `approx ${wholeNo} and 1/4 ${data.name}s` : `approx 1/4 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `approx ${wholeNo} and 1/4 bunches` : `approx 1/4 bunch`;
      }
    } else if (deciNo == 0.25) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `${wholeNo} and 1/4 ${data.name}s` : `1/4 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `${wholeNo} and 1/4 bunches` : `1/4 bunch`;
      }
    } else if (deciNo < 0.5) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `approx ${wholeNo} and 1/2 ${data.name}s` : `approx 1/2 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `approx ${wholeNo} and 1/2 bunches` : `approx 1/2 bunch`;
      }
    } else if (deciNo == 0.5) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `${wholeNo} and 1/2 ${data.name}s` : `1/2 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `${wholeNo} and 1/2 bunches` : `1/2 bunch`;
      }
    } else if (deciNo < 0.75) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `approx ${wholeNo} and 3/4 ${data.name}s` : `approx 3/4 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `approx ${wholeNo} and 3/4 bunches` : `approx 3/4 bunch`;
      }
    } else if (deciNo == 0.75) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `${wholeNo} and 3/4 ${data.name}s` : `3/4 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `${wholeNo} and 3/4 bunches` : `3/4 bunch`;
      }
    } else if (deciNo <= 0.99) {
      if (baseUnit === "pc") {
        return wholeNo > 0 ? `approx ${wholeNo + 1} ${data.name}s` : `approx 1 ${data.name}`;
      } else if (baseUnit === "bunch") {
        return wholeNo > 0 ? `approx ${wholeNo} and 1/4 bunches` : `approx 1/4 bunch`;
      }
    }

    // rest same logic pattern...
  }

  return "nothing";
}

module.exports = { fillMissingDays, fillMissingMeals, getEasyQuantityText };
