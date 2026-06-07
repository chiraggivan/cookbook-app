const db = require("../../config/database");
const { readRecipeDetailsQ } = require("./utils/mysqlQueries");
const { getRecipeDetailsById } = require("./utils/readRecipeDetailsById");
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

    // console.log("body : ", req.body);
    if (!req.body) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // --------------------------------- normalise and validate data received for update --------------------------------------
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
      // { action: "update", components: updateComponents }, ---> this is done later with add component below
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
    const [dbResults] = await db.query(fetchDbComponentsQuery, [recipeId]);

    // convert above result in dictionary (IMP : can be done for 2 columns data into key and value)
    let dbComponentTextDict = {};
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
      const [removeResults] = await db.query(removeQuery, removeParams);

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
        message: `Can't have duplicate sub heading. Update component text having conflict.`,
      });
    }

    // Add new component texts and check final list for duplicates
    const addCompTextList = addComponents.map((c) => c.component_text);
    // .filter((text) => text != null);

    // Again check if new component text data is having ducplicate with the old component text data
    const finalList = [...valuesAfterUpdate, ...addCompTextList];
    if (new Set(finalList).size !== finalList.length) {
      return res.status(409).json({
        success: false,
        message: `Can't have duplicate sub heading. New component text having conflict.`,
      });
    }

    //  --------------------------above to check component_text is duplicate or not --------------------------------

    // Validate add_components and update_components with db values
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

    // ------------------------------------ below validating ingredients data -------------------------------------------------
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
    const dbIngredientLength = countIngs[0].total;

    // Calculate maxIngredientDisplayOrder
    const addIngredients = data.add_ingredients || [];
    const maxIngredientDisplayOrder =
      dbIngredientLength + addIngredients.length - removeIngredients.length;

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

          if (ing.ingredient_source === "main") {
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
          } else if (ing.ingredient_source === "user") {
            // Fetch the expected base_unit from user_ingredients table
            const baseUnitQuery = `
            SELECT base_unit FROM user_ingredients 
            WHERE user_ingredient_id = ?
            LIMIT 1
          `;
            const baseUnitValues = [ing.ingredient_id];

            const [result] = await db.query(baseUnitQuery, baseUnitValues);
            if (result.length === 0) {
              return res.status(409).json({
                success: false,
                message: `Invalid ingredient_id ${ing.ingredient_id}: not found in user_ingredients table.`,
              });
            }
            checkBase = result.base_unit;
          }

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

    // ------------------------------------ below validating steps data -------------------------------------------------

    // Validate remove_steps against the database
    const removeSteps = data.remove_steps || [];
    for (const step of removeSteps) {
      const value = step.procedure_id;
      // if (value === null || value === undefined) continue;

      const checkQuery = `
        SELECT 1 FROM recipe_procedures 
        WHERE recipe_id = ? AND procedure_id = ? AND is_active = TRUE
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
    const countStepsQuery = `
      SELECT COUNT(*) as total FROM recipe_procedures
      WHERE recipe_id = ? AND is_active = 1
      LIMIT 1
    `;
    const [countSteps] = await db.query(countStepsQuery, [recipeId]);
    const dbStepsLength = countSteps[0].total;

    // Calculate maxStepDisplayOrder
    const addSteps = data.add_steps || [];
    const maxStepDisplayOrder = dbStepsLength + addSteps.length - removeSteps.length;

    // Validate add_steps and update_steps
    const stepOperations = [
      { action: "add", steps: addSteps || [] },
      { action: "update", steps: data.update_steps || [] },
    ];
    for (const { action, steps } of stepOperations) {
      for (const step of steps) {
        let oldStepText = null;
        let oldStepDisplayOrder = null;
        // let oldStepEstimatedTime = null;

        if (action === "update") {
          // Check if procedure_id exists and fetch current values
          const checkQuery = `
            SELECT step_order, step_text, estimated_time            
            FROM recipe_procedures
            WHERE procedure_id = ? AND  recipe_id = ? AND i.is_active = TRUE
            LIMIT 1
          `;
          const checkValues = [step.procedure_id, recipeId];

          const [result] = await db.query(checkQuery, checkValues);
          if (result.length === 0) {
            return res.status(409).json({
              success: false,
              message: `Can't find procedure id ${step.procedure_id} with action as ${action}`,
            });
          }

          const row = result;
          oldStepText = row.step_text;
          oldStepDisplayOrder = Number(row.display_order);
          // oldStepEstimatedTime = row.estimated_time;
        }

        // check to see how many steps are there in total after calculating add, remove and update length
        //  and make sure the step_display_order is within the range
        if (step.step_order !== null && step.step_order !== undefined) {
          if (step.step_order > maxStepDisplayOrder) {
            return res.status(409).json({
              success: false,
              message: `Internal error. stepDisplayOrder out of range`,
            });
          }
        }

        // Preserve old values if not provided (for updates)
        if (step.step_text === null || step.step_text === undefined) {
          step.step_text = oldStepText;
        }
        if (step.step_order === null || step.step_order === undefined) {
          step.step_order = oldStepDisplayOrder;
        }
        // if (step.estimated_time === null || step.estimated_time === undefined) {
        //   step.estimated_time = oldStepEstimatedTime;
        // }
      }
    }

    console.log("every ingredient check and data ready to to be inserted for update");
    const updatedRecipeDetails = await getRecipeDetailsById(recipeId, user.id);
    return res.json({
      success: updatedRecipeDetails.success,
      message: updatedRecipeDetails.message,
      data: updatedRecipeDetails.data,
    });
    return;
    // --------------------------------------- UPDATE in DB BEGINS BELOW -------------------------------------------------

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Update recipe table if any fields are provided
      if (updateFields.length > 0) {
        updateValues.push(recipeId);
        updateValues.push(user.id);
        const updateQuery = `
        UPDATE recipes 
        SET ${updateFields.join(", ")}
        WHERE recipe_id = ? AND user_id = ? AND is_active = TRUE
      `;
        const [result] = await conn.query(updateQuery, updateValues);

        // Check if any row was actually updated
        if (result.affectedRows === 0) {
          console.error(`No recipe found to update.`);
          return res.status(400).json({
            success: false,
            message: "Problem encountered while updating recipe info.",
          });
        }
      }

      // Remove components if any are provided
      for (const component of removeComponents) {
        const removeQuery = `
        UPDATE recipe_components 
        SET is_active = 0, 
        end_date = CURRENT_TIMESTAMP, 
        display_order = NULL
        WHERE recipe_id = ? AND recipe_component_id = ? AND is_active = TRUE
      `;
        const removeValues = [recipeId, component.recipe_component_id];
        const [result] = await conn.query(removeQuery, removeValues);

        // Check if any row was actually removed
        if (result.affectedRows === 0) {
          console.error(`No component found to remove with id ${component.recipe_component_id}`);
          return res.status(400).json({
            success: false,
            message: "Problem encountered while removing recipe component.",
          });
        }
      }

      // Update/add components if any are provided
      const componentOperations = [
        { action: "update", components: data.update_components || [] },
        { action: "add", components: data.add_components || [] },
      ];
      for (const { action, components } of componentOperations) {
        for (const component of components) {
          if (action === "update") {
            // Handle orderChanged flag for display_order = 0
            if (component.orderChanged && component.component_display_order === 0) {
              const nullifyQuery = `
              UPDATE recipe_components 
              SET display_order = NULL, 
              end_date = CURRENT_TIMESTAMP, 
              is_active = FALSE
              WHERE recipe_id = ? AND display_order = 0 AND is_active = TRUE
            `;
              const nullifyValues = [recipeId];

              const result = await conn.query(nullifyQuery, nullifyValues);
              if (result.affectedRows === 0) {
                return res.status(400).json({
                  error: "Problem encountered while updating recipe component.",
                });
              }
            }

            // Update component text and display order
            const updateQuery = `
            UPDATE recipe_components 
            SET component_text = ?, display_order = ?
            WHERE recipe_component_id = ?
          `;
            const updateValues = [
              component.component_text,
              component.component_display_order,
              component.recipe_component_id,
            ];
            const [result] = await conn.query(updateQuery, updateValues);

            // Check if any row was actually updated
            if (result.affectedRows === 0) {
              return res.status(400).json({
                success: false,
                message: "Problem encountered while updating recipe component.",
              });
            }
          } else {
            // action === 'add'
            let recipeComponentId;

            // Try to reuse an inactive component
            const findInactiveQuery = `
            SELECT recipe_component_id FROM recipe_components
            WHERE recipe_id = ? AND is_active = 0 
            ORDER BY recipe_component_id 
            LIMIT 1
          `;
            const findInactiveValues = [recipeId];
            const [inactiveResult] = await conn.query(findInactiveQuery, findInactiveValues);

            if (inactiveResult.length > 0) {
              recipeComponentId = inactiveResult[0].recipe_component_id;

              // Update inactive component to active
              const updateInactiveQuery = `
                UPDATE recipe_components
                SET component_text = ?, 
                display_order = ?, 
                is_active = 1, 
                end_date = NULL
                WHERE recipe_component_id = ?
              `;
              const updateInactiveValues = [
                component.component_text,
                component.component_display_order,
                recipeComponentId,
              ];
              const updateResult = await conn.query(updateInactiveQuery, updateInactiveValues);

              // Check if any row was actually updated
              if (updateResult.affectedRows === 0) {
                return res.status(400).json({
                  success: false,
                  message: "Problem encountered while adding new recipe component.",
                });
              }
            } else {
              // Insert new component
              const insertQuery = `
                INSERT INTO recipe_components (recipe_id, component_text, display_order)
                VALUES (?, ?, ?)
              `;
              const insertValues = [
                recipeId,
                component.component_text,
                component.component_display_order,
              ];
              const insertResult = await conn.query(insertQuery, insertValues);

              // Check if any row was actually inserted
              if (insertResult.affectedRows === 0) {
                return res.status(400).json({
                  success: false,
                  message: "Problem encountered while adding new row of recipe component.",
                });
              }

              // Get the newly inserted ID if needed
              recipeComponentId = insertResult.insertId;
            }
          }
        }
      }

      // Remove ingredients if any are provided
      for (const ing of removeIngredients) {
        const removeQuery = `
        UPDATE recipe_ingredients 
        SET is_active = FALSE, 
        end_date = CURRENT_TIMESTAMP, 
        display_order = -1
        WHERE recipe_id = ? AND recipe_ingredient_id = ? AND is_active = TRUE
      `;
        const removeValues = [recipeId, ing.recipe_ingredient_id];
        const [result] = await conn.query(removeQuery, removeValues);

        // Check if any row was actually updated
        if (result.affectedRows === 0) {
          console.error(`No ingredient found to remove with id ${ing.recipe_ingredient_id}`);
          return res.status(400).json({
            success: false,
            message: "Problem encountered while removing recipe ingredient.",
          });
        }
      }

      // Update/add ingredients if any are provided
      const ingOperations = [
        { action: "add", ingredients: data.add_ingredients || [] },
        { action: "update", ingredients: data.update_ingredients || [] },
      ];
      for (const { action, ingredients } of ingOperations) {
        for (const ing of ingredients) {
          // Find recipe_component_id from component_display_order to
          // store as component_id in new ingredient for new component
          const componentQuery = `
          SELECT recipe_component_id FROM recipe_components 
          WHERE recipe_id = ? AND display_order = ? AND is_active = 1 
          LIMIT 1
        `;
          const componentValues = [recipeId, ing.component_display_order];
          const [result] = await conn.query(componentQuery, componentValues);

          if (result.length > 0) {
            ing.component_id = result[0].recipe_component_id;
          } else {
            // This should not happen - every ingredient must belong to a valid component
            //  mostly wont get executed as new ingredient will have to be under one of the components
            // this is done if new component is added and new/updated ingredient is under it then we need to
            // find the recipe_component_id from recipe_components table that has been created and
            // save it in component_id field of recipe_ingredients table.
            console.error(
              `Can't find recipe_component_id for ingredient with component_display_order ${ing.component_display_order}`,
            );
            return res.status(404).json({
              success: false,
              message: `Can't find recipe_component_id for new/updated ingredient thru component_display_order`,
            });
          }

          if (action === "add") {
            // Check if ingredient exists in recipe_ingredients and is inactive
            const checkQuery = `
            SELECT recipe_ingredient_id FROM recipe_ingredients 
            WHERE recipe_id = ? AND ingredient_id = ? AND ingredient_source = ? AND is_active = 0
            LIMIT 1
          `;
            const checkValues = [recipeId, ing.ingredient_id, ing.ingredient_source];
            const [result] = await conn.query(checkQuery, checkValues);
            if (result.length > 0) {
              const riId = result[0].recipe_ingredient_id;

              // Reuse inactive ingredient by activating it
              const updateQuery = `
                UPDATE recipe_ingredients 
                SET quantity = ?, 
                unit_id = ?, 
                display_order = ?, 
                component_id = ?, 
                is_active = TRUE, 
                end_date = NULL
                WHERE recipe_ingredient_id = ?
              `;
              const updateValues = [
                ing.quantity,
                ing.unit_id,
                ing.ingredient_display_order,
                ing.component_id,
                riId,
              ];
              const [updateResult] = await conn.query(updateQuery, updateValues);

              // Check if any row was actually updated
              if (updateResult.affectedRows === 0) {
                return res.status(400).json({
                  success: false,
                  message:
                    "Problem encountered while adding new recipe ingredient found as inactive in recipe ingredient table.",
                });
              }
            } else {
              // Insert new ingredient
              const insertQuery = `
                INSERT INTO recipe_ingredients 
                (recipe_id, ingredient_id, ingredient_source, quantity, unit_id, component_id, display_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
              `;
              const insertValues = [
                recipeId,
                ing.ingredient_id,
                ing.ingredient_source,
                ing.quantity,
                ing.unit_id,
                ing.component_id,
                ing.ingredient_display_order,
              ];
              const [insertResult] = await conn.query(insertQuery, insertValues);

              // Check if any row was actually inserted
              if (insertResult.affectedRows === 0) {
                return res.status(400).json({
                  error: "Problem encountered while adding new row of recipe ingredient.",
                });
              }
            }
          } else {
            // action === 'update'
            const updateQuery = `
            UPDATE recipe_ingredients 
            SET ingredient_id = ?, 
            ingredient_source = ?, 
            quantity = ?, 
            unit_id = ?, 
            display_order = ?, 
            component_id = ?
            WHERE recipe_ingredient_id = ? AND is_active = TRUE
          `;
            const updateValues = [
              ing.ingredient_id,
              ing.ingredient_source,
              ing.quantity,
              ing.unit_id,
              ing.ingredient_display_order,
              ing.component_id,
              ing.recipe_ingredient_id,
            ];

            const result = await conn.query(updateQuery, updateValues);

            // Optional : Check if any row was actually updated
            if (result.affectedRows === 0) {
              return res.status(400).json({
                error: "Problem encountered while updating recipe ingredient.",
                submitted_data: data,
              });
            }
          }
        }
      }

      // if base unit doesnt match with original base unit then convert custom price and unit. eg:  if main unit is kg and
      // supplied base_unit in g, oz, or lbs then convert it into kg. similar for litre for ml, fl.oz and pint
      // but leave pc and bunch as it is.

      if (ing.base_price) {
        let defaultPrice, actualBaseUnit;

        if (ing.ingredient_source === "main") {
          // Get ingredient's default price and base unit
          const ingredientQuery = `
          SELECT default_price, base_unit FROM ingredients 
          WHERE ingredient_id = ? 
          LIMIT 1
        `;
          const ingredientValues = [ing.ingredient_id];
          const [ingredientResult] = await conn.query(ingredientQuery, ingredientValues);

          if (ingredientResult.length === 0) {
            return res.status(400).json({
              error: `Ingredient ${ing.ingredient_id} not found or not approved`,
              submitted_data: data,
            });
          }

          defaultPrice = ingredientResult[0].default_price;
          actualBaseUnit = ingredientResult[0].base_unit;
        } else if (ing.ingredient_source === "user") {
          // Get user_ingredient's default price and base unit
          const ingredientQuery = `
          SELECT base_price, base_unit FROM user_ingredients 
          WHERE user_ingredient_id = ? AND  submitted_by = ?
          LIMIT 1
        `;
          const ingredientValues = [ing.ingredient_id, user.id];
          const [ingredientResult] = await conn.query(ingredientQuery, ingredientValues);

          if (ingredientResult.length === 0) {
            return res.status(400).json({
              error: `Ingredient ${ing.ingredient_id} not found or not approved`,
              submitted_data: data,
            });
          }
          defaultPrice = ingredientResult[0].default_price;
          actualBaseUnit = ingredientResult[0].base_unit;
        }

        // Check for user's custom price
        const priceQuery = `
          SELECT custom_price FROM user_prices 
          WHERE ingredient_id = ? AND user_id = ? AND is_active = 1
          LIMIT 1
        `;
        const priceValues = [ing.ingredient_id, sUserId];
        const [priceResult] = await conn.query(priceQuery, priceValues);

        if (priceResult.length > 0) {
          defaultPrice = priceResult[0].custom_price;
        }

        // Only proceed with price update if values differ from defaults
        if (
          ing.base_quantity !== 1 ||
          ing.base_unit !== actualBaseUnit ||
          ing.base_price !== defaultPrice
        ) {
          let basePrice, baseQuantity, baseUnit;

          // Normalize quantity to 1 if needed
          if (ing.base_quantity !== 1) {
            basePrice = ing.base_price / ing.base_quantity;
            baseQuantity = 1;
          } else {
            basePrice = ing.base_price;
            baseQuantity = ing.base_quantity;
          }

          // Convert to standard units (kg for weight, l for volume)
          if (ing.base_unit === "kg") {
            baseUnit = "kg";
          } else if (ing.base_unit === "g") {
            basePrice = basePrice * 1000;
            baseUnit = "kg";
          } else if (ing.base_unit === "oz") {
            basePrice = basePrice * 35.274;
            baseUnit = "kg";
          } else if (ing.base_unit === "lbs") {
            basePrice = basePrice * 2.205;
            baseUnit = "kg";
          } else if (ing.base_unit === "l") {
            baseUnit = "l";
          } else if (ing.base_unit === "ml") {
            basePrice = basePrice * 1000;
            baseUnit = "l";
          } else if (ing.base_unit === "fl.oz") {
            basePrice = basePrice * 35.1951;
            baseUnit = "l";
          } else if (ing.base_unit === "pint") {
            basePrice = basePrice * 1.75975;
            baseUnit = "l";
          } else if (ing.base_unit === "pc") {
            baseUnit = "pc";
          } else if (ing.base_unit === "bunch") {
            baseUnit = "bunch";
          } else {
            baseUnit = ing.base_unit; // fallback
          }

          // Handle optional place field
          const place = ing.place || "";

          // Call stored procedure to update/insert user price
          const callQuery = `
            CALL update_insert_user_price(?, ?, ?, ?, ?, ?)
          `;
          const callValues = [user.id, ing.ingredient_id, basePrice, baseQuantity, baseUnit, place];
          const [result] = await conn.query(callQuery, callValues);

          // optional : Check if any row was actually updated as during call procedure ti might not
          // update as values might be same so no need to raise error
          // if (result.affectedRows === 0) {
          //   console.error(`No update happend in user_prices table.`);
          //   return res.status(400).json({
          //     success: false,
          //     message: "Problem encountered while updating custom price in user_prices.",
          //   });
          // }
        }
      }
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in updateRecipeController- (update_recipe) while updating in DB :", err);
      return res.status(500).json({
        success: false,
        message: "Error while updating recipe in db",
      });
    } finally {
      conn.release();
    }
    //  ---------------------- call express function get_recipe_details to send the recipe details back -----------------
    // const updatedRecipeDetails = getRecipeDetailsById(recipeId, user.id);
    // response the data----------------------- X X X --------------------------------------------------
    res.json({
      success: true,
      message: `Recipe updated.`,
      data: updatedRecipeDetails,
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
