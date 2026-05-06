const db = require("../../config/database");

// get recipe details but also make sure owner is logged in
exports.get_recipe_details_for_update = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipeId = Number(req.params.recipeId);
    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: `recipe Id provided is not defined properly. should be positive integer`,
      });
    }

    // Get recipe info and it also checks if the user is the rightful owner of the recipe
    const [recipeResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.portion_size, r.description, r.privacy, r.created_at, r.user_id, u.username
        FROM recipes r JOIN users u ON r.user_id = u.user_id 
        WHERE r.recipe_id = ? 
        AND r.is_active = 1
        AND (r.user_id = ?
        OR r.privacy = 'public')
        LIMIT 1`,
      [recipeId, user.id],
    );
    if (recipeResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "you dont owe the recipe or recipe is inactive",
      });
    }

    // Get recipe ingredients and its price
    const [ingredientsResult] = await db.query(
      `
        SELECT 
            rc.recipe_component_id,
            rc.display_order as component_display_order,
            rc.component_text,
            ri.display_order as ingredient_display_order,
            COALESCE(i.ingredient_id, ui.user_ingredient_id) as ingredient_id,
            COALESCE(i.name, ui.name) as name,
            ri.recipe_ingredient_id,
            ri.quantity,
            ri.ingredient_source,
            u.unit_id,
            u.unit_name,
            COALESCE(ui.display_quantity, 1) as base_quantity,
            COALESCE(ui.display_price, COALESCE(up.custom_price, i.default_price)) AS cost,
            COALESCE(ui.display_unit, COALESCE(up.base_unit, i.base_unit)) AS unit
        FROM recipe_ingredients ri 
        LEFT JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
        LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
        JOIN units u ON ri.unit_id = u.unit_id
        LEFT JOIN user_prices up ON up.user_id = ? 
            AND up.ingredient_id = i.ingredient_id 
            AND up.is_active = TRUE
        WHERE ri.recipe_id = ?
        AND ri.is_active = TRUE
        ORDER BY rc.display_order, ri.display_order`,
      [user.id, recipeId],
    );
    // const ingredients = recipeResult.map(r => normalizeRow(r));

    // Get recipe steps
    const [stepResult] = await db.query(
      `SELECT procedure_id, step_order, step_text, estimated_time
        FROM recipe_procedures
        WHERE recipe_id = ?
        AND is_active = 1
        ORDER BY step_order`,
      [recipeId],
    );

    // if (stepResult.length > 0){
    //     for (const step in stepResult){
    //         step.estimated_time =
    //     }
    // }

    // response the data
    res.json({
      success: true,
      message: `Recipe found for ${recipeId}`,
      data: { recipe: recipeResult, ingredients: ingredientsResult, steps: stepResult },
    });
  } catch (err) {
    console.error("Error in updateRecipeController - get_recipe_details_for_update :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// get units of ingredients from unit table.
exports.get_units = async (req, res) => {
  try {
    const ingSrc = req.params.ingSrc;
    //  checking if ingSrc is ('main' or 'user') otherwise return error message
    if (!["main", "user"].includes(ingSrc)) {
      //(ingSrc !== "main" && ingSrc !== "user")
      return res.status(404).json({
        success: false,
        message: `ingredient source provided is not defined properly. main or user`,
      });
    }

    // checking ingId exists and is a whole number not less than 0
    const ingredientId = Number(req.params.ingId);
    if (!ingredientId || ingredientId < 1 || !Number.isInteger(ingredientId)) {
      return res.status(404).json({
        success: false,
        message: `ingredient Id provided is not defined properly. should be positive integer`,
      });
    }

    // get units for the ingredient.
    const [unitsResult] = await db.query(
      `SELECT unit_id, unit_name FROM units WHERE ingredient_id = ? AND ingredient_source = ? AND is_active = 1`,
      [ingredientId, ingSrc],
    );

    // response the data
    res.json({
      success: true,
      message: `Units found for ${ingredientId}`,
      data: unitsResult,
    });
  } catch (err) {
    console.error("Error in updateRecipeController - get_units :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// update privacy only(PUT)
exports.update_privacy = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const privacy = req.body.privacy;
    const recipeId = req.params.recipeId;

    // check the value of privacy
    if (!privacy || !["private", "public"].includes(privacy)) {
      return res.status(404).json({
        success: false,
        message: `privacy provided is not defined properly. should be private or public`,
      });
    }

    // check the  owner owns recipe  and recipe/owner is active
    const [checkResult] = await db.query(
      `SELECT r.privacy FROM recipes r JOIN users u ON u.user_id = r.user_id    
      WHERE r.recipe_id = ? AND u.user_id = ? AND u.is_active = 1 AND r.is_active = 1 
      LIMIT 1`,
      [recipeId, user.id],
    );
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No such Recipe found for user. Or user/recipe not active`,
      });
    }

    // if privacy sent is same then no need to update
    if (checkResult[0].privacy == privacy) {
      return res.json({
        success: true,
        message: `recipe is already ${privacy}.`,
      });
    }

    // ready to update privacy
    await db.query(
      `UPDATE recipes 
      SET privacy =  ?
      WHERE recipe_id = ?
      `,
      [privacy, recipeId],
    );

    // response the data
    res.json({
      success: true,
      message: `Privacy updated.`,
    });
  } catch (err) {
    console.error("Error in updateRecipeController - update_privacy :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Update recipe (PATCH)
exports.update_recipe = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;
    const recipeId = req.params.recipeId;

    if (!data) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // response the data
    res.json({
      success: true,
      message: `Recipe updated.`,
    });
  } catch (err) {
    console.error("Error in updateRecipeController - update_recipe :", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
