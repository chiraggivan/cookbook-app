// const jsonwebtoken = require("jsonwebtoken");
const db = require("../../config/database");
const {
  normalizeRecipeIngredientData,
  validateRecipeIngredient,
  normalize_unit,
} = require("../../utils/recipesUtils");
const readRecipeDetailsById = require("./utils/readRecipeDetailsById");

exports.search_ingredients = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const q = (req.params.q || "").trim().toLowerCase();
    const i = `%${q}%`;
    const id = Number(user.id);
    // console.log(" id is :", id, " and search word is :", q);
    // console.log("q is a type of ", typeof q, " and id is type of ", typeof id);

    if (!q) {
      return res.status(404).json({
        success: true,
        message: "Ingredient name is empty",
        rows: [],
      });
    }

    const [rows] = await db.query(
      ` SELECT user_ingredient_id as id, name, display_price, display_unit, display_quantity, 'user' as ingredient_source
        FROM user_ingredients
        WHERE submitted_by = ? AND LOWER(name) LIKE ? AND  is_active = 1
        UNION ALL
        SELECT i.ingredient_id, i.name, COALESCE(up.display_price , i.display_price) as price, COALESCE(up.display_unit , i.display_unit) as display_unit, COALESCE(up.display_quantity , i.display_quantity) as display_quantity, 'main' as ingredient_source
        FROM ingredients i 
        LEFT JOIN user_prices up ON i.ingredient_id = up.ingredient_id AND up.user_id = ? AND up.is_active = 1
        WHERE LOWER(i.name) LIKE ?
        AND (i.approval_status = "approved" OR i.submitted_by = ?)
        LIMIT 40`,
      [id, i, id, i, id],
    );
    if (rows.length > 0) {
      for (const row of rows) {
        row.display_quantity = Number(row.display_quantity);
        row.display_price = Number(row.display_price);
      }
    }
    // FINAL response
    res.json({
      success: true,
      message: `ingredients found for - ${q}`,
      rows,
    });
  } catch (error) {
    console.error("Error in createRecipeController - search_ingredients is : ", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.get_ingredient_units = async (req, res) => {
  try {
    // get the params values
    const ing_id = Number(req.params.ing_id);
    const source = (req.params.source || "").trim().toLowerCase();

    // check params are correct and ready to be used
    if (!ing_id || !source) {
      return res.json({
        success: false,
        message: "ing id or source not submitted properly",
        rows: [],
      });
    }

    //  get data from db
    const [rows] = await db.query(
      `
        SELECT unit_id, unit_name, conversion_factor
        FROM units 
        WHERE ingredient_id = ? AND ingredient_source = ? AND is_active = 1
        `,
      [ing_id, source],
    );

    // response the data back
    res.json({
      success: true,
      message: `units found for ing_id ${ing_id} and source as ${source}`,
      rows,
    });
  } catch (error) {
    console.error("Error in recipeController - get_ingredient_units is : ", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.create_recipe = async (req, res) => {
  const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

  // check if data is available
  if (!req.body) {
    return res.status(500).json({
      success: false,
      message: "Data not sent with the body.",
    });
  }

  try {
    const data = normalizeRecipeIngredientData(req.body);
    const error = validateRecipeIngredient(data);
    // return res.json({ success: true, message: `reached here till now`, data, error });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const name = data.name;
    const portion_size = data.portion_size;
    const privacy = data.privacy;
    const description = data.description;
    const components = data.components;
    const steps = data.steps;

    // ------------------validation of every field of data done, now cross check db -------------------------------

    // Validate user_id exists
    const [userRows] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);
    if (userRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `User not found`,
      });
    }

    //--------------------- Check for existing recipe with same name and portion_size ------------------------------
    const [recipeRows] = await db.query(
      `SELECT 1 FROM recipes 
        WHERE name = ? AND portion_size = ? AND user_id = ? AND is_active = TRUE
        `,
      [name, portion_size, user.id],
    );
    if (recipeRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Recipe with same name and portion size already exists`,
      });
    }

    // ---------------- Validate ingredients(base unit and base price coming from body is correct) -----------------
    for (const component of components) {
      const ingredients = component.ingredients || [];

      for (const ing of ingredients) {
        // Validate unit refers to ingredient
        const [unitRows] = await db.query(
          "SELECT 1 FROM units WHERE unit_id = ? AND ingredient_id = ? AND ingredient_source = ?",
          [ing.unit, ing.ingredient_id, ing.ingredient_source],
        );
        if (unitRows.length === 0) {
          return res.status(400).json({
            error: `Unit ID ${ing.unit} not valid for ingredient ID ${ing.ingredient_id}`,
          });
        }

        // If base_unit exists - validate compatibility
        if (ing.display_unit) {
          let ingRows;
          if (ing.ingredient_source === "main") {
            [ingRows] = await db.query(
              `SELECT base_unit FROM ingredients
              WHERE ingredient_id = ? AND is_active = 1
              `,
              [ing.ingredient_id],
            );
          } else if (ing.ingredient_source === "user") {
            [ingRows] = await db.query(
              `SELECT base_unit FROM user_ingredients
              WHERE user_ingredient_id = ? AND is_active = 1
              `,
              [ing.ingredient_id],
            );
          }

          if (ingRows.length === 0) {
            return res.status(404).json({
              error: `Ingredient details for id ${ing.ingredient_id} not found in db`,
            });
          }

          const ingData = ingRows[0];

          const groups = {
            kg: ["kg", "g", "oz", "lbs"],
            g: ["kg", "g", "oz", "lbs"],
            oz: ["kg", "g", "oz", "lbs"],
            lbs: ["kg", "g", "oz", "lbs"],
            l: ["l", "ml", "fl.oz", "pint"],
            ml: ["l", "ml", "fl.oz", "pint"],
            "fl.oz": ["l", "ml", "fl.oz", "pint"],
            pint: ["l", "ml", "fl.oz", "pint"],
            pc: ["pc"],
            bunch: ["bunch"],
          };

          if (!groups[ingData.base_unit]?.includes(ing.display_unit)) {
            return res.status(400).json({
              error: `base unit of ingredient ${ing.ingredient_id} not matched with stored data`,
            });
          }
        }
      }
    }
    // validate steps for recipe_procedures if any wrt database

    // ---------------- Data checked and ready to be inserted. About to actually insert data in db ---------------------------

    // create a connection for easy rollback if any insert break
    const conn = await db.getConnection();
    let recipeId;

    try {
      await conn.beginTransaction();

      // Insert into recipes
      const [recipeResult] = await conn.query(
        `INSERT INTO recipes (name, portion_size, user_id, privacy, description, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
        `,
        [name, portion_size, user.id, privacy, description],
      );
      recipeId = recipeResult.insertId;
      // console.log("recipeId is:", recipeId);

      // Insert data in recipe components and get the recipe_component_id
      for (const component of components) {
        const [rcResult] = await conn.query(
          `INSERT INTO recipe_components (recipe_id, component_text, display_order)
                VALUES (?,?,?)`,
          [recipeId, component.component_text, component.component_display_order],
        );

        const component_id = rcResult.insertId;

        // Insert into recipe_ingredients
        for (const ingredient of component.ingredients) {
          const [riResult] = await conn.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_source, quantity, unit_id, is_active, display_order, component_id)
            VALUES (?, ?, ?, ?, ?, TRUE, ?,?)`,
            [
              recipeId,
              ingredient.ingredient_id,
              ingredient.ingredient_source,
              ingredient.quantity,
              ingredient.unit,
              ingredient.ingredient_display_order,
              component_id,
            ],
          );

          // Update user_prices if display_unit/display_price/display_quantity is provided
          if (ingredient.display_unit) {
            const [base_price, base_quantity, base_unit] = normalize_unit(
              ingredient.display_price,
              ingredient.display_quantity,
              ingredient.display_unit,
            );

            if (ingredient.ingredient_source === "main") {
              await db.query("CALL update_insert_user_price(?,?,?,?,?,?,?,?,?)", [
                user.id,
                ingredient.ingredient_id,
                ingredient.ingredient_source,
                base_price,
                base_quantity,
                base_unit,
                ingredient.location,
                ingredient.display_price,
                ingredient.display_quantity,
                ingredient.display_unit,
              ]);
            } else if (ingredient.ingredient_source === "user") {
            }
          }
        }
      }

      // Insert data in steps
      for (const step of steps) {
        const step_time = step?.step_time || "00:00";
        const formattedTime = `${step_time}:00`;
        // console.log("inserting in recipe_procedure");
        const [rpResult] = await conn.query(
          `INSERT INTO recipe_procedures (recipe_id, step_order, step_text, estimated_time)
            VALUES(?, ?, ?, ?)`,
          [recipeId, step.step_display_order, step.step_text, formattedTime],
        );
      }

      // Commit if everything succeeds
      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in recipeController-create_recipe while inserting recipe:", err);

      return res.status(500).json({
        success: false,
        message: "Error while inserting recipe in db",
      });
    } finally {
      conn.release();
    }

    //-----------  new recipe details data that we saved recently to be sent with res
    const newData = readRecipeDetailsById(recipeId, user.id);

    // ----- response the data back
    res.json({
      success: true,
      message: `${name} : Recipe created successfully!!!!!`,
      data: newData,
    });
  } catch (error) {
    console.error("Error in createRecipeController - create_recipe");
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
