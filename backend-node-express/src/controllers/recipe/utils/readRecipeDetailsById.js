const db = require("../../../config/database");
const { readRecipeDetailsQ } = require("../utils/mysqlQueries");
const { getLastRecordOfRecipeCreated } = require("./getLastRecordRecipeCreated");

// get recipeDetails function that can be use multiple times (sending data after updating recipe
// and also for read recipe data)
exports.getRecipeDetailsById = async (recipeId, userId) => {
  try {
    const [recipeResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.portion_size, r.description, r.privacy, r.created_at, r.user_id, u.username, u.display_name
        FROM recipes r JOIN users u ON r.user_id = u.user_id 
        WHERE r.recipe_id = ? 
        AND r.is_active = 1
        AND (r.user_id = ?
        OR r.privacy = 'public')`,
      [recipeId, userId],
    );

    //  check any recipe found
    if (recipeResult.length === 0) {
      return {
        success: false,
        message: "Dint find any such recipe",
        data: null,
      };
    }

    // get ingredients for  recipe if found
    const [ingredientResult] = await db.query(readRecipeDetailsQ, [userId, recipeId]);

    // add measuringUnits  and base units in data
    const updtdIngredientResult = await Promise.all(
      ingredientResult.map(async (ing) => {
        const [rows] = await db.query(
          `SELECT unit_id, unit_name, conversion_factor
          FROM units 
          WHERE ingredient_id = ? AND ingredient_source = ? AND is_active = 1
          `,
          [ing.ingredient_id, ing.ingredient_source],
        );

        // convert decimal columns - which are auto converted to string - to Number type
        for (const row of rows) {
          const toNumberFields = ["conversion_factor"];
          for (const field of toNumberFields) {
            row[field] = Number(row[field]);
          }
        }

        return { ...ing, measuring_units: rows };
      }),
    );

    // convert decimal columns - which are auto converted to string - to Number type
    for (const ing of updtdIngredientResult) {
      const toNumberFields = ["base_quantity", "cost", "price", "quantity"];
      for (const field of toNumberFields) {
        ing[field] = Number(ing[field]);
      }
    }

    // Get steps for the recipe
    const [stepResult] = await db.query(
      `SELECT procedure_id, step_order, step_text, estimated_time
        FROM recipe_procedures
        WHERE recipe_id = ?
        AND is_active = 1
        ORDER BY step_order`,
      [recipeId],
    );

    // console.log("reached here");
    // get the last record of this dish created
    const { success, message, data } = await getLastRecordOfRecipeCreated(recipeId, userId);

    if (!success) {
      return {
        success: success,
        message: message,
        data: data,
      };
    }

    recipeResult[0].last_prepared_time = data.last_prepared_time;
    recipeResult[0].last_prepared_date = data.last_prepared_date;

    // return data
    return {
      success: true,
      message: `Recipe details found`,
      data: { recipe: recipeResult[0], ingredients: updtdIngredientResult, steps: stepResult },
    };
  } catch (err) {
    console.log("error found in getRecipeDetailsById : ", err);
    return {
      success: false,
      message: `error during getRecipeDetailsById function : ${err}`,
      data: null,
    };
  }
};
