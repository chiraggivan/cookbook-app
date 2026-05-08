const db = require("../../config/database");
const { normaliseIngredientData, validateIngredient } = require("../../utils/dishesUtils");

exports.create_dish = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    // const data = req.body;
    if (!req.body) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }
    // ----------------------------- normalize and validate data ---------------------------
    const { cleaned, error } = normaliseIngredientData(req.body);
    const data = cleaned;

    if (error) {
      return res.status(404).json({
        success: false,
        message: `${error}`,
      });
    }

    validationError = validateIngredient(data);

    if (validationError) {
      return res.status(404).json({
        success: false,
        message: `${validationError}`,
      });
    }

    // ---------------------- data normalised and validated  ---------------------------------

    const recipe_details = data;
    const recipeId = recipe_details.recipe_id;
    const recipeName = recipe_details.recipe_name;
    const portionSize = recipe_details.portion_size;
    const recipeBy = recipe_details.recipe_by;
    const components = recipe_details.components;
    const preparationDate = recipe_details.preparation_date;
    const timePrepared = recipe_details.time_prepared;

    const meal = recipe_details.meal;
    const totalCost = recipe_details.total_cost;
    const comment = recipe_details.comment;

    // --------------------------------------------- connect db and verify data ----------------------------------------------

    // Check if recipe exists and belongs to user
    const [checkResult] = await db.query(
      `SELECT 1 
      FROM recipes 
      WHERE recipe_id = ? AND name = ? AND portion_size = ? AND user_id = ? AND is_active = TRUE`,
      [recipeId, recipeName, portionSize, user.id],
    );
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Recipe not found or not authorized`,
      });
    }

    // Validate ingredients(base unit and base price coming from body is correct)
    for (const component of components) {
      const ingredients = component.ingredients;

      for (const ing of ingredients) {
        // Validate unit for the ingredient
        const [rows] = await db.query(
          `
            SELECT 1 
            FROM units u 
                LEFT JOIN ingredients i 
                    ON u.ingredient_id = i.ingredient_id 
                    AND i.ingredient_id = ? 
                    AND i.name = ? 
                    AND i.is_active = 1 
                LEFT JOIN user_ingredients ui 
                    ON ui.user_ingredient_id = u.ingredient_id 
                    AND ui.user_ingredient_id = ? 
                    AND ui.name = ?
            WHERE u.unit_id = ? 
              AND u.unit_name = ? 
              AND u.ingredient_source = ?
            `,
          [
            ing.ingredient_id,
            ing.name,
            ing.ingredient_id,
            ing.name,
            ing.unit_id,
            ing.unit_name,
            ing.ingredient_source,
          ],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Unit ID ${ing.unit_id} not matching with unit name- ${ing.unit_name}, ingredient ID ${ing.ingredient_id}, name - ${ing.name}`,
          });
        }
      }
    }

    return res.status(404).json({ success: true, message: `reached here`, data: recipe_details });

    // ---------------------------------  Data checked against DB rules and about to be inserted in db  ---------------------

    const conn = await db.getConnection();
    let dishId;
    const finalData = {};

    try {
      await conn.beginTransaction();

      // insert data in dishes table
      const [idResult] = await conn.query(
        `INSERT INTO dishes(
          user_id, 
          recipe_id, 
          recipe_name, 
          portion_size, 
          preparation_date, 
          time_prepared, 
          total_cost, 
          meal, 
          recipe_by, 
          comment) 
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          user.id,
          recipeId,
          recipeName,
          portionSize,
          preparationDate,
          timePrepared,
          totalCost,
          meal,
          recipeBy,
          comment,
        ],
      );

      dishId = idResult.insertId;

      // insert data in dish_ingredients table with the help of dishId
      for (const component of components) {
        const componentText = component.component_text;
        const componentDisplayOrder = component.display_order;

        for (const ing of component.ingredients) {
          const [insertDishIng] = await conn.query(
            `INSERT INTO dish_ingredients(
                dish_id, 
                component_text, 
                component_display_order, 
                ingredient_id, 
                ingredient_source, 
                ingredient_name, 
                ingredient_display_order, 
                quantity, 
                unit_id, 
                unit_name, 
                cost, 
                base_price, 
                base_unit)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dishId,
              componentText,
              componentDisplayOrder,
              ing.ingredient_id,
              ing.ingredient_source,
              ing.name,
              ing.display_order,
              ing.quantity,
              ing.unit_id,
              ing.unit_name,
              ing.cost,
              ing.base_price,
              ing.base_unit,
            ],
          );
        }
      }

      // send created date to front end

      // commit the transaction
      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error(
        "Error in createDishController - create_dish - while working with db for insert:",
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
      message: `Successfully save in dishes table`,
      data,
    });
  } catch (err) {
    console.error("Error in createDishController - create_dish is ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: { preparationDate, timePrepared },
    });
  } finally {
  }
};
