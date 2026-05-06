const total_weeks = 5;
const meals = ["breakfast", "lunch", "dinner"];

function normaliseString(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normaliseValue(value) {
  if (typeof value === "string") {
    return normaliseString(value);
  }
  if (typeof value === "number") {
    return value;
  }
  return value;
}

function normalisePlan(data) {
  const normalised = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "food_plan") {
      normalised[k] = normaliseFoodPlan(v);
    } else {
      normalised[k] = normaliseValue(v);
    }
  }
  return normalised;
}

function normaliseFoodPlan(food_plan) {
  if (!Array.isArray(food_plan)) return [];

  const normalised = [];
  for (const plan of food_plan) {
    if (typeof plan !== "object" || plan === null) continue;

    const norm = {};
    for (const [k, v] of Object.entries(plan)) {
      if (k === "weekly_meals") {
        norm[k] = normaliseWeeklyMeals(v);
      } else {
        norm[k] = normaliseValue(v);
      }
    }
    normalised.push(norm);
  }
  return normalised;
}

function normaliseWeeklyMeals(weekly_meals) {
  if (!Array.isArray(weekly_meals)) return [];

  const normalised = [];
  for (const day of weekly_meals) {
    if (typeof day !== "object" || day === null) continue;

    const norm = {};
    for (const [k, v] of Object.entries(day)) {
      if (k === "daily_meals") {
        norm[k] = normaliseDailyMeals(v);
      } else {
        norm[k] = normaliseValue(v);
      }
    }
    normalised.push(norm);
  }
  return normalised;
}

function normaliseDailyMeals(daily_meals) {
  if (!Array.isArray(daily_meals)) return [];

  const normalised = [];
  for (const meal of daily_meals) {
    if (typeof meal !== "object" || meal === null) continue;

    const norm = {};
    for (const [k, v] of Object.entries(meal)) {
      if (k === "recipes") {
        norm[k] = normaliseRecipes(v);
      } else {
        norm[k] = normaliseValue(v);
      }
    }
    normalised.push(norm);
  }
  return normalised;
}

function normaliseRecipes(recipes) {
  if (!Array.isArray(recipes)) return [];

  const normalised = [];
  for (const recipe of recipes) {
    if (typeof recipe !== "object" || recipe === null) continue;

    const norm = {};
    for (const [k, v] of Object.entries(recipe)) {
      if (typeof v === "object" || v === null) continue;
      norm[k] = normaliseValue(v);
    }
    normalised.push(norm);
  }
  return normalised;
}

function validateFoodPlan(data, meals) {
  if (data.food_plan_id) {
    const plan_id = data.food_plan_id;
    if (typeof plan_id !== "number" || plan_id <= 0) {
      return {
        error: `Invalid food plan id (${plan_id}): Should be positive integer`,
        recipeIds: null,
      };
    }
  }

  const food_plan = data.food_plan || [];
  const total_weeks_plan = food_plan.length;
  const recipeIds = [];

  if (total_weeks_plan > 1 || total_weeks_plan === 0) {
    return { error: `Cant be empty and Only 1 week of food planning is allowed.`, recipeIds: null };
  }

  for (const week of food_plan) {
    if (week.food_plan_week_id) {
      const id = week.food_plan_week_id;
      if (typeof id !== "number" || id <= 0) {
        return {
          error: `Invalid food plan week id (${id}): Should be positive integer`,
          recipeIds: null,
        };
      }
    }

    const week_no = week.week_no;
    if (!week_no || typeof week_no !== "number" || week_no <= 0 || week_no > 5) {
      return {
        error: `week number (${week_no}) required and should be positive int less than 6`,
        recipeIds: null,
      };
    }

    const weekly_meals = week.weekly_meals || [];
    const total_days = weekly_meals.length;

    if (total_days > 1 || total_days === 0) {
      return {
        error: `Cant be empty and Only 1 day of food planning is allowed.`,
        recipeIds: null,
      };
    }

    if (!Array.isArray(weekly_meals)) {
      return { error: `invalid weekly meals: missing or not a list type`, recipeIds: null };
    }

    for (const day of weekly_meals) {
      if (day.food_plan_day_id) {
        const id = day.food_plan_day_id;
        if (typeof id !== "number" || id <= 0) {
          return {
            error: `Invalid food plan day id (${id}): Should be positive integer`,
            recipeIds: null,
          };
        }
      }

      const day_no = day.day_no;
      if (!day_no || typeof day_no !== "number" || day_no <= 0 || day_no > 7) {
        return {
          error: `Invalid day_no. Should be positive int and not more than 7`,
          recipeIds: null,
        };
      }

      const daily_meals = day.daily_meals;
      if (!Array.isArray(daily_meals)) {
        return { error: ` invalid daily meals: missing or not a list type`, recipeIds: null };
      }

      const total_meals = daily_meals.length;
      if (total_meals > meals.length) {
        return { error: `Can't have ${total_meals} meals in a day`, recipeIds: null };
      }

      for (const meal of daily_meals) {
        if (meal.food_plan_meal_id) {
          const id = meal.food_plan_meal_id;
          if (typeof id !== "number" || id <= 0) {
            return {
              error: `Invalid food plan meal id (${id}): Should be positive integer`,
              recipeIds: null,
            };
          }
        }

        const meal_type = meal.meal_type;
        if (!meal_type || typeof meal_type !== "string" || !meals.includes(meal_type)) {
          return {
            error: `Invalid meal type (${meal_type}): missing, should be string and one of the saved meals`,
            recipeIds: null,
          };
        }

        const recipes = meal.recipes;
        if (!recipes || !Array.isArray(recipes)) {
          return { error: `Invalid recipes: should be non empty list`, recipeIds: null };
        }

        const total_recipes = recipes.length;

        for (const recipe of recipes) {
          if (recipe.food_plan_recipe_id) {
            const id = recipe.food_plan_recipe_id;
            if (typeof id !== "number" || id <= 0) {
              return {
                error: `Invalid food plan recipe id (${id}): Should be positive integer`,
                recipeIds: null,
              };
            }
          }

          const recipe_id = recipe.recipe_id;
          if (!recipe_id || typeof recipe_id !== "number" || recipe_id <= 0) {
            return {
              error: ` Invalid recipe id ${recipe_id}: missing or should be positive int`,
              recipeIds: null,
            };
          }

          recipeIds.push(recipe_id);

          const display_order = recipe.display_order;
          if (
            !display_order ||
            typeof display_order !== "number" ||
            display_order <= 0 ||
            display_order > total_recipes
          ) {
            return {
              error: `Invalid display order (${display_order}): missing or should be + int less than total recipes in a meal`,
              recipeIds: null,
            };
          }
        }
      }
    }
  }

  return { error: null, recipeIds };
}

module.exports = { meals, normalisePlan, validateFoodPlan };
