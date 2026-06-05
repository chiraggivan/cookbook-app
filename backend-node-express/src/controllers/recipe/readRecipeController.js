const db = require("../../config/database");
const { readRecipeDetailsQ } = require("./utils/mysqlQueries");
const { getRecipeDetailsById } = require("./utils/readRecipeDetailsById");

// get all the recipes
exports.get_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    const [result] = await db.query(
      `
        SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username, u.display_name 
        FROM recipes r JOIN users u ON r.user_id = u.user_id
        WHERE r.is_active = TRUE
        AND (r.user_id = ? OR r.privacy = 'public') 
        `,
      [user.id],
    );

    res.json({
      success: true,
      message: `All recipes found`,
      data: result,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_recipes is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get all the recipe of a certain user
exports.get_user_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const find_user = Number(req.params.q);

    if (!find_user || find_user < 1 || !Number.isInteger(find_user)) {
      return res.status(404).json({
        success: false,
        message: "user not found in params or not defined properly",
      });
    }

    // searched user is same as logged in user
    if (user.id === find_user) {
    }

    // verify user exists
    const [userResult] = await db.query(
      "SELECT username FROM users WHERE user_id = ? AND is_active = 1",
      [find_user],
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "searched user not found",
      });
    }

    // search list of public recipes of a particular user
    const [finalResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username
            FROM recipes r 
            JOIN users u ON r.user_id = u.user_id
            WHERE r.is_active = TRUE
            AND r.user_id = ?
            AND r.privacy = 'public'`,
      [find_user],
    );

    // response the data
    res.json({
      success: true,
      message: `Recipes found for ${find_user}`,
      data: finalResult,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_user_recipes:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get my recipes
exports.get_my_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // verify user exists
    const [userResult] = await db.query(
      "SELECT username FROM users WHERE user_id = ? AND is_active = 1",
      [user.id],
    );
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: " user not active or not found",
      });
    }

    // find all the recipes of logged in user
    const [finalResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username
        FROM recipes r 
        JOIN users u ON r.user_id = u.user_id
        WHERE r.is_active = TRUE
        AND r.user_id = ? `,
      [user.id],
    );

    // response the data back
    res.json({
      success: true,
      message: `Recipes found for user`,
      data: finalResult,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_my_recipes:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get a recipe details
exports.get_recipe_details = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipeId = Number(req.params.q);

    //  check if recipeId is negative
    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: "Recipe id must a positive number",
      });
    }

    const { success, message, data } = await getRecipeDetailsById(recipeId, user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: message,
      });
    }
    // // query recipes table
    // const [recipeResult] = await db.query(
    //   `SELECT r.recipe_id, r.name, r.portion_size, r.description, r.privacy, r.created_at, r.user_id, u.username, u.display_name
    //     FROM recipes r JOIN users u ON r.user_id = u.user_id
    //     WHERE r.recipe_id = ?
    //     AND r.is_active = 1
    //     AND (r.user_id = ?
    //     OR r.privacy = 'public')`,
    //   [recipeId, user.id],
    // );

    // //  check any recipe found
    // if (recipeResult.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Dint find any such recipe",
    //   });
    // }

    // // get ingredients for  recipe if found
    // const [ingredientResult] = await db.query(readRecipeDetailsQ, [user.id, recipeId]);

    // // add measuringUnits  and base units in data
    // const updtdIngredientResult = await Promise.all(
    //   ingredientResult.map(async (ing) => {
    //     const [rows] = await db.query(
    //       `SELECT unit_id, unit_name, conversion_factor
    //       FROM units
    //       WHERE ingredient_id = ? AND ingredient_source = ? AND is_active = 1
    //       `,
    //       [ing.ingredient_id, ing.ingredient_source],
    //     );
    //     // convert decimal columns - which are auto converted to string - to Number type
    //     for (const row of rows) {
    //       const toNumberFields = ["conversion_factor"];
    //       for (const field of toNumberFields) {
    //         row[field] = Number(row[field]);
    //       }
    //     }

    //     return { ...ing, measuring_units: rows };
    //   }),
    // );

    // // convert decimal columns - which are auto converted to string - to Number type
    // for (const ing of updtdIngredientResult) {
    //   const toNumberFields = ["base_quantity", "cost", "price", "quantity"];
    //   for (const field of toNumberFields) {
    //     ing[field] = Number(ing[field]);
    //   }
    // }

    // // Get steps for the recipe
    // const [stepResult] = await db.query(
    //   `SELECT procedure_id, step_order, step_text, estimated_time
    //     FROM recipe_procedures
    //     WHERE recipe_id = ?
    //     AND is_active = 1
    //     ORDER BY step_order`,
    //   [recipeId],
    // );

    // response the data
    res.json({
      success: success,
      message: message,
      data: data,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_recipe_details:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// get last dish prepared info
exports.get_last_record = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipeId = Number(req.params.recipeId);
    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: `recipeId provided is not defined properly. should be positive integer`,
      });
    }
    // check db to get the dish prepared in the past
    const [lastPrepared] = await db.query(
      `SELECT preparation_date, time_prepared, created_at 
        FROM dishes 
        WHERE recipe_id =  ? AND user_id = ? AND is_active = 1 ORDER BY preparation_date DESC, time_prepared DESC LIMIT 1`,
      [recipeId, user.id],
    );
    if (lastPrepared.length !== 0) {
      lastPrepared[0].preparation_date = new Date(lastPrepared[0].preparation_date).toISOString();
    }
    // console.log("last record : ", lastPrepared);
    let date_prepared;
    let time_prepared;
    let created_at;
    if (lastPrepared.length === 0) {
      date_prepared = "";
      time_prepared = "";
      created_at = "";
    } else {
      date_prepared = lastPrepared[0].preparation_date.split("T")[0];
      time_prepared = lastPrepared[0].time_prepared;
      created_at = lastPrepared[0].created_at;
    }

    // FINAL response
    res.json({
      success: true,
      message: `Recipe last record found.`,
      data: { date_prepared, time_prepared, created_at },
    });
  } catch (err) {
    console.error("Error in createDishController - get_last_record is:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
