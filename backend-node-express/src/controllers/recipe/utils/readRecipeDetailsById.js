const db = require("../../../config/database");
const { readRecipeDetailsQ } = require("../utils/mysqlQueries");
const { getLastRecordOfRecipeCreated } = require("./getLastRecordRecipeCreated");
const { weightUnits, volumeUnits } = require("../../../utils/constantValues");

// get recipeDetails function that can be use multiple times (sending data after updating recipe
// and also for read recipe data)
exports.getRecipeDetailsById = async (recipeId, userId) => {
  try {
    const [recipeResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.portion_size, r.description, r.privacy, r.image_url, r.created_at, r.user_id, u.username, u.display_name, u.email, u.picture_url as user_img,
            CASE 
              WHEN usr.user_saved_recipe_id IS NOT NULL THEN 
                true
              ELSE 
                false
            END AS is_bookmarked
        FROM recipes r 
          JOIN users u ON r.user_id = u.user_id 
          LEFT JOIN user_saved_recipes usr ON usr.recipe_id = ? AND usr.user_id = ?
        WHERE r.recipe_id = ? 
        AND r.is_active = 1
        AND (r.user_id = ?
        OR r.privacy = 'public')`,
      [recipeId, userId, recipeId, userId],
    );

    //  check any recipe found
    if (recipeResult.length === 0) {
      return {
        success: false,
        message: "Dint find any such recipe",
        data: null,
      };
    }

    const recipeDetails = recipeResult[0];

    // get user's language preference for ingredients
    const [lang_result] = await db.query(
      `
            SELECT u.preferred_ingredient_language_id as pil_id, l.name, l.native_script
            FROM users u 
              JOIN languages l ON u.preferred_ingredient_language_id = l.language_id
            WHERE u.user_id = ?
          `,
      [userId],
    );

    // currently only on language for user BUT future can have multiple languages and provision taken care here
    const user_langs = [];
    const lang_obj = {};
    lang_result.map((i) => {
      lang_obj.lang_id = i.pil_id;
      lang_obj.lang_name = i.name;
      lang_obj.native_script = i.native_script;

      user_langs.push(lang_obj);
    });

    recipeDetails.user_langs = user_langs;

    // get ingredients for  recipe if found
    const [ingredientResult] = await db.query(readRecipeDetailsQ, [userId, userId, recipeId]);

    // ----------------------------------------- function for getting base units ----------------------------------------
    const getBaseUnits = (unit, measuringUnits) => {
      const baseUnitsToShow = [];
      const lookup = {};
      measuringUnits.forEach((i) => (lookup[i.unit_name] = i.unit_name));

      // // --------------------------------------------------- for weight units ----------------------------------
      if (weightUnits.includes(unit)) {
        // const baseUnitsToShow = [];
        weightUnits.forEach((i) => {
          if (lookup[i]) {
            baseUnitsToShow.push(lookup[i]);
          }
        });
        return baseUnitsToShow;
      }
      // // ----------------------------------------- for volume units ----------------------------------
      else if (volumeUnits.includes(unit)) {
        // const baseUnitsToShow = [];
        volumeUnits.forEach((i) => {
          if (lookup[i]) {
            baseUnitsToShow.push(lookup[i]);
          }
        });
        return baseUnitsToShow;
      } else {
        return [unit];
      }
    };

    // add measuringUnits, base units in data and alternative ing names
    const updtdIngredientResult = await Promise.all(
      ingredientResult.map(async (ing) => {
        // get measuring units
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

        // get base units
        const base_units = getBaseUnits(ing.unit, rows);

        // get alt name of ingredient
        const alt_names = [];
        if (ing.ingredient_source === "main") {
          user_langs.map(async (lang) => {
            const lang_ing_obj = {};
            lang_ing_obj.lang_id = lang.lang_id;
            lang_ing_obj.lang_name = lang.lang_name;
            lang_ing_obj.ing_names = [];
            const ing_name = {};

            const [ingAltResult] = await db.query(
              `
              SELECT roman_text, native_text
              FROM ingredient_translations
              WHERE ingredient_id = ? AND language_id = ? AND is_active = 1
            `,
              [ing.ingredient_id, lang.lang_id],
            );
            ingAltResult.forEach((row) => {
              ing_name.roman_text = row.roman_text;
              ing_name.native_text = row.native_text;

              lang_ing_obj.ing_names.push(ing_name);
            });
            alt_names.push(lang_ing_obj);
          });
        }

        return { ...ing, measuring_units: rows, base_units, alt_names };
      }),
    );

    // updtdIngredientResult.map((ing) => {
    //   ing.base_units_new = getBaseUnits(ing.unit, ing.measuring_units);
    // });

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

    // get meals list for create dish feature in recipe details
    const [mealResult] = await db.query(
      `SELECT meal_id, name, short_name
      FROM meals
      WHERE is_active = 1`,
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
    recipeResult[0].meal = data.meal;

    // console.log("ingredients are :", updtdIngredientResult[1]);
    // return data
    return {
      success: true,
      message: `Recipe details found`,
      data: {
        recipe: recipeDetails,
        ingredients: updtdIngredientResult,
        steps: stepResult,
        meals: mealResult,
      },
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
