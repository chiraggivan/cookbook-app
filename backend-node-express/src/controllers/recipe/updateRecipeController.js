const db = require("../../config/database");
const { readRecipeDetailsQ } = require("./utils/mysqlQueries");
const {
  normalizeRecipeIngredientDataForUpdate,
  validateRecipeIngredientForUpdate,
} = require("./utils/updateRecipeUtils");

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
    const [ingredientsResult] = await db.query(readRecipeDetailsQ, [user.id, recipeId]);
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
    const recipeId = req.params.recipeId;

    if (!req.body) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // normalise and validate data received for update
    const data = normalizeRecipeIngredientDataForUpdate(req.body);
    const error = validateRecipeIngredientForUpdate(data);

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

    // Validate if recipe exists and belongs to user
    const [recipeRows] = await db.query(
      `SELECT name, portion_size FROM recipes WHERE user_id = ? AND recipe_id = ? AND is_active = 1`,
      [user.id, recipeId],
    );
    if (recipeRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: `Recipe not found or not authorized`,
      });
    }

    // Initialize update fields
    const updateFields = [];
    const updateValues = [];
    let currentName = recipeRows.name;
    let currentPortionSize = recipeRows.portion_size;

    // Handle recipe fields update
    if (data.name && typeof data.name === "string") {
      updateFields.push("name = ?");
      updateValues.push(data.name);
      currentName = data.name;
    }

    if (data.portion_size && typeof data.portion_size === "string") {
      updateFields.push("portion_size = ?");
      updateValues.push(data.portion_size);
      currentPortionSize = data.portion_size;
    }

    if (data.privacy && ["public", "private"].includes(data.privacy)) {
      updateFields.push("privacy = ?");
      updateValues.push(data.privacy);
    }

    if (data.description !== null && data.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(data.description);
    }

    // Check for duplicate name and portion_size
    if ("name" in data || "portion_size" in data) {
      const duplicateQuery = `
        SELECT recipe_id FROM recipes 
        WHERE name = ? AND portion_size = ? AND user_id = ? AND is_active = TRUE AND recipe_id != ?
        LIMIT 1
      `;
      const duplicateValues = [currentName, currentPortionSize, user.id, recipeId];

      const [result] = await db.query(duplicateQuery, duplicateValues);
      if (result.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Recipe with same name and portion size already exists`,
        });
      }
    }

    // --------------------------------------------------------------------------------------------------
    // check all the fields of components like add, update and remove but first we will find some data to help verify later

    // Validate remove_components/update_components (recipe_component_id) are there in the database
    const removeComponents = data.remove_components || [];
    const updateComponents = data.update_components || [];

    const compValidationOperations = [
      { action: "remove", components: removeComponents },
      // { action: "update", components: updateComponents },
    ];

    for (const { action, components } of compValidationOperations) {
      for (const component of components) {
        const value = component.recipe_component_id;
        const checkQuery = `
          SELECT 1 FROM recipe_components 
          WHERE recipe_id = ? AND recipe_component_id = ? AND is_active = 1
          LIMIT 1
        `;
        const checkValues = [recipeId, value];

        const [result] = await db.query(checkQuery, checkValues);
        if (result.length === 0) {
          console.error(
            `Invalid recipe component id ${value} for ${action} components: this does not belong to the recipe id ${recipe_id}`,
          );
          return res.status(400).json({
            success: false,
            message: `Invalid recipe component id ${value} for ${action} components: this does not belong to the recipe id ${recipe_id}`,
          });
        }
      }
    }

    // Get current component count from DB to calculate max display order
    const countQuery = `
      SELECT COUNT(*) as total FROM recipe_components
      WHERE recipe_id = ? AND is_active = 1
      LIMIT 1
    `;

    const [countResult] = await db.query(countQuery, [recipeId]);
    const dbComponentLength = countResult[0].total;

    // Calculate maxCompDisplayOrder
    const addComponents = data.add_components || [];
    const removeComponentsCount = removeComponents.length;
    const maxCompDisplayOrder = dbComponentLength + addComponents.length - removeComponentsCount;
    //  --------------------------below to check component_text is duplicate or not --------------------------------
    // Get all active component_text entries from DB for this recipe
    const fetchDbComponentsQuery = `
      SELECT recipe_component_id, component_text FROM recipe_components
      WHERE recipe_id = ? AND is_active = 1 AND component_text != ''
    `;
    let dbComponentTextDict = {};

    const [dbResults] = await db.query(fetchDbComponentsQuery, [recipeId]);
    dbComponentTextDict = dbResults.reduce((acc, row) => {
      acc[row.recipe_component_id] = row.component_text;
      return acc;
    }, {});

    // Get component_text for components being removed
    const removeRCId = removeComponents.map((c) => c.recipe_component_id);

    let removeComponentTextDict = {};
    if (removeRCId.length > 0) {
      const placeholders = removeRCId.map(() => "?").join(","); // one ? per ID
      const removeQuery = `
        SELECT recipe_component_id, component_text FROM recipe_components
        WHERE recipe_id = ? AND is_active = 1 AND component_text != '' AND recipe_component_id IN (${placeholders})
      `;
      const removeParams = [recipeId, ...removeRCId];

      const removeResults = await db.query(removeQuery, removeParams);
      removeComponentTextDict = removeResults.reduce((acc, row) => {
        acc[row.recipe_component_id] = row.component_text;
        return acc;
      }, {});
    }

    // Components remaining after removal
    const compTextDictAfterRemove = Object.fromEntries(
      Object.entries(dbComponentTextDict).filter(
        ([compId]) => !removeComponentTextDict.hasOwnProperty(compId),
      ),
    );

    // Component text from update_components
    const updateComponentTextDict = updateComponents
      .filter((row) => row.component_text != null)
      .reduce((acc, row) => {
        acc[row.recipe_component_id] = row.component_text;
        return acc;
      }, {});

    // Apply updates to remaining components
    const compTextDictAfterUpdate = Object.fromEntries(
      Object.entries(compTextDictAfterRemove).map(([compId, text]) => [
        compId,
        updateComponentTextDict.hasOwnProperty(compId) ? updateComponentTextDict[compId] : text,
      ]),
    );

    // Check for duplicates among updated components
    const valuesAfterUpdate = Object.values(compTextDictAfterUpdate);
    if (new Set(valuesAfterUpdate).size !== valuesAfterUpdate.length) {
      return res.status(409).json({
        success: false,
        message: `Can't have duplicate sub heading.`,
      });
    }

    // Add new component texts and check final list for duplicates
    const addCompTextList = addComponents
      .map((c) => c.component_text)
      .filter((text) => text != null);

    const finalList = [...valuesAfterUpdate, ...addCompTextList];
    if (new Set(finalList).size !== finalList.length) {
      return res.status(409).json({
        success: false,
        message: `Can't have duplicate sub heading.`,
      });
    }

    //  --------------------------above to check component_text is duplicate or not --------------------------------

    // Validate add_components and update_components with db
    const compOperations = [
      { action: "add", components: data.add_components || [] },
      { action: "update", components: data.update_components || [] },
    ];

    for (const { action, components } of compOperations) {
      for (const component of components) {
        let oldComponentText = null;
        let oldComponentDisplayOrder = null;

        if (action === "update") {
          // Check if recipe_component_id exists in DB
          const checkQuery = `
            SELECT display_order, component_text 
            FROM recipe_components
            WHERE recipe_component_id = ? AND recipe_id = ? AND is_active = TRUE
            LIMIT 1
          `;
          const checkValues = [component.recipe_component_id, recipeId];

          const [result] = await db.query(checkQuery, checkValues);
          if (result.length === 0) {
            return res.status(409).json({
              success: false,
              message: `Can't find recipe component id ${component.recipe_component_id} with action as ${action}`,
            });
          }
          oldComponentText = result.component_text;
          oldComponentDisplayOrder = result.display_order;
        }

        // check to see how many components are there in total after calculating add, remove and update length
        // and make sure the component_display _order is within that range
        if (
          component.component_display_order !== null &&
          component.component_display_order !== undefined
        ) {
          if (component.component_display_order >= maxCompDisplayOrder) {
            return res.status(409).json({
              success: false,
              message: `Internal error. compDisplayOrder out of range`,
            });
          }
        }

        // Preserve old values if not provided (for updates)
        if (component.component_text === null || component.component_text === undefined) {
          component.component_text = oldComponentText;
        }
        if (
          component.component_display_order === null ||
          component.component_display_order === undefined
        ) {
          component.component_display_order = oldComponentDisplayOrder;
        }
      }
    }
    // ------------------------------------------------------------------------------------------------------------------------
    // Validate remove_ingredients against the database
    const removeIngredients = data.remove_ingredients || [];

    for (const ing of removeIngredients) {
      const value = ing.recipe_ingredient_id;
      // if (value === null || value === undefined) continue;

      const checkQuery = `
        SELECT 1 FROM recipe_ingredients 
        WHERE recipe_id = ? AND recipe_ingredient_id = ? AND is_active = TRUE
        LIMIT 1
      `;
      const checkValues = [recipeId, value];

      const result = await db.query(checkQuery, checkValues);
      if (result.length === 0) {
        return res.status(409).json({
          success: false,
          message: `Invalid recipe ingredient id ${value}: this does not belong to the recipe id ${recipe_id}`,
        });
      }
    }

    // Get current count of active ingredients from DB
    const countIngsQuery = `
      SELECT COUNT(*) as total FROM recipe_ingredients
      WHERE recipe_id = ? AND is_active = 1
      LIMIT 1
    `;

    const [countIngs] = await db.query(countIngsQuery, [recipeId]);
    const dbIngredientLength = countResult.total;

    // Calculate maxIngredientDisplayOrder
    const addIngredients = data.add_ingredients || [];

    const maxIngredientDisplayOrder =
      dbIngredientLength + addIngredients.length - removeIngredients.length;

    // ------------------------------------------------------------------------------------------------------
    // Validate add_ingredients and update_ingredients
    const ingredientOperations = [
      { action: "add", ingredients: data.add_ingredients || [] },
      { action: "update", ingredients: data.update_ingredients || [] },
    ];

    for (const { action, ingredients } of ingredientOperations) {
      for (const ing of ingredients) {
        let oldIngId = null;
        let oldIngSource = null;
        let oldQuantity = null;
        let oldUnitId = null;
        let oldIngredientDisplayOrder = null;
        let oldComponentId = null;
        let oldComponentDisplayOrder = null;

        if (action === "update") {
          // Check if recipe_ingredient_id exists and fetch current values
          const checkQuery = `
            SELECT 
            i.ingredient_id, 
            i.ingredient_source, 
            i.quantity, 
            i.unit_id, 
            i.display_order, 
            i.component_id, 
            c.display_order as cdo
            FROM recipe_ingredients i 
            JOIN recipe_components c ON i.component_id = c.recipe_component_id
            WHERE i.recipe_ingredient_id = ? AND i.recipe_id = ? AND i.is_active = TRUE
            LIMIT 1
          `;
          const checkValues = [ing.recipe_ingredient_id, recipeId];

          const [result] = await db.query(checkQuery, checkValues);
          if (result.length === 0) {
            return res.status(409).json({
              success: false,
              message: `Can't find recipe ingredient id ${ing.recipe_ingredient_id} with action as ${action}`,
            });
          }

          const row = result;
          oldIngId = row.ingredient_id;
          oldIngSource = row.ingredient_source;
          oldQuantity = parseFloat(row.quantity);
          oldUnitId = row.unit_id;
          oldIngredientDisplayOrder = row.display_order;
          oldComponentId = row.component_id;
          oldComponentDisplayOrder = row.cdo;
        }

        // check to see how many ingredients are there in total after calculating add, remove and update length
        //  and make sure the ingredient_display_order is within the range
        if (ing.ingredient_display_order !== null && ing.ingredient_display_order !== undefined) {
          if (ing.ingredient_display_order > maxIngredientDisplayOrder) {
            return res.status(409).json({
              success: false,
              message: `Internal error. ingredientDisplayOrder out of range`,
            });
          }
        }

        // check component_display_order sent in add/update ingredients are in range
        if (ing.component_display_order !== null && ing.component_display_order !== undefined) {
          if (ing.component_display_order >= maxDisplayOrder) {
            return res.status(409).json({
              success: false,
              message: `component_display_order out of range. it was submitted within add/update ingredients`,
            });
          }
        }

        // check if new ingredient id exists in ingredients table or user_ingredients table
        if (ing.ingredient_id !== null && ing.ingredient_id !== undefined) {
          let mainBaseUnit = null;

          if (ing.ingredient_source === "main") {
            // Check if ingredient exists in the main ingredients table
            const mainIngQuery = `
              SELECT base_unit FROM ingredients 
              WHERE ingredient_id = ? AND is_active = TRUE 
              AND (approval_status = 'approved' OR submitted_by = ?)
              LIMIT 1
            `;
            const mainIngValues = [ing.ingredient_id, s_user_id];

            const [result] = await db.query(mainIngQuery, mainIngValues);
            if (result.length === 0) {
              return res.status(409).json({
                success: false,
                message: `Can't find ingredient id ${ing.ingredient_id}`,
              });
            }
            mainBaseUnit = result.base_unit;
          } else if (ing.ingredient_source === "user") {
            // Check if user_ingredient exists in user_ingredients table
            const userIngQuery = `
              SELECT base_unit FROM user_ingredients 
              WHERE user_ingredient_id = ? AND is_active = TRUE 
              AND (approval_status = 'approved' OR submitted_by = ?)
              LIMIT 1
            `;
            const userIngValues = [ing.ingredient_id, s_user_id];

            const [result] = await db.query(userIngQuery, userIngValues);
            if (result.length === 0) {
              return res.status(409).json({
                success: false,
                message: `Can't find user ingredient id ${ing.ingredient_id}`,
              });
            }
            mainBaseUnit = result.base_unit;
          } else {
            // Invalid ingredient_source
            return res.status(409).json({
              success: false,
              message: `Invalid ingredient_source: ${ing.ingredient_source}. Must be 'main' or 'user'.`,
            });
          }

          // Optionally store or use mainBaseUnit for further validation or conversion
          // ing.base_unit = mainBaseUnit;
        }

        if (ing.ingredient_id === null || ing.ingredient_id === undefined) {
          ing.ingredient_id = oldIngId;
        }
        if (ing.ingredient_source === null || ing.ingredient_source === undefined) {
          ing.ingredient_source = oldIngSource;
        }
        if (ing.unit_id === null || ing.unit_id === undefined) {
          ing.unit_id = oldUnitId;
        }
        if (ing.quantity === null || ing.quantity === undefined) {
          ing.quantity = oldQuantity;
        }
        if (ing.ingredient_display_order === null || ing.ingredient_display_order === undefined) {
          ing.ingredient_display_order = oldIngredientDisplayOrder;
        }
        if (ing.component_display_order === null || ing.component_display_order === undefined) {
          ing.component_display_order = oldComponentDisplayOrder;
        }

        // check if ingredient id and unit id exists in units table
        const [unitCheckQuery] = `
          SELECT 1 FROM units 
          WHERE ingredient_id = ? AND unit_id = ?
          LIMIT 1
        `;
        const unitCheckValues = [ing.ingredient_id, ing.unit_id];

        const result = await db.query(unitCheckQuery, unitCheckValues);
        if (result.length === 0) {
          return res.status(409).json({
            success: false,
            message: `ingredient id ${ing.ingredient_id} and unit id ${ing.unit_id} not matched in units table.`,
          });
        }

        //  check if the base_unit provided is acceptable eg- for base_unit in ingredients table in 'kg',
        //        acceptable base unit is ['kg','g','oz','lbs'] and similar for 'l' its ['l','ml','fl.oz','pint']
        //        for 'pc' and 'bunch' base unit must be same.

        if (ing.base_unit != null) {
          let checkBase = null;

          // Fetch the expected base_unit from ingredients table
          const baseUnitQuery = `
            SELECT base_unit FROM ingredients 
            WHERE ingredient_id = ?
            LIMIT 1
          `;
          const baseUnitValues = [ing.ingredient_id];

          const [result] = await db.query(baseUnitQuery, baseUnitValues);
          if (result.length === 0) {
            return res.status(409).json({
              success: false,
              message: `Invalid ingredient_id ${ing.ingredient_id}: not found in ingredients table.`,
            });
          }
          checkBase = result.base_unit;

          // Validate base_unit based on the expected type
          if (checkBase === "kg") {
            if (!["kg", "g", "oz", "lbs"].includes(ing.base_unit)) {
              return res.status(409).json({
                success: false,
                message: `new base_unit Can't be ${ing.base_unit}. should be one of [kg, g, oz, lbs]`,
              });
            }
          } else if (checkBase === "l") {
            if (!["l", "ml", "fl.oz", "pint"].includes(ing.base_unit)) {
              return res.status(409).json({
                success: false,
                message: `new base_unit Can't be ${ing.base_unit}. should be one of [l, ml, fl.oz, pint]`,
              });
            }
          } else if (checkBase === "pc") {
            if (ing.base_unit !== "pc") {
              return res.status(409).json({
                success: false,
                message: `new base_unit Can't be ${ing.base_unit}. should be pc`,
              });
            }
          } else if (checkBase === "bunch") {
            if (ing.base_unit !== "bunch") {
              return res.status(409).json({
                success: false,
                message: `new base_unit Can't be ${ing.base_unit}. should be bunch`,
              });
            }
          }
        }
      }
    }

    console.log("every ingredient check and data ready to to be inserted for update");
    return;

    // response the data----------------------- X X X --------------------------------------------------
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
