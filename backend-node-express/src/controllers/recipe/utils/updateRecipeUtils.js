const { toInt, toFloat } = require("../../../utils/utilities");

function normalizeRecipeIngredientDataForUpdate(data) {
  const cleaned = {};

  // Helper function (like re.sub + strip + lower)
  const normalizeString = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

  // String fields
  const strFields = ["name", "portion_size", "privacy", "description"];

  strFields.forEach((field) => {
    const value = data[field];

    if (!value) {
    } else if (typeof value === "string") {
      cleaned[field] = normalizeString(value);
    } else {
      cleaned[field] = value;
    }
  });

  // Check and normalize remove_components
  const removeComponentFields = ["recipe_component_id"];
  const removeComponents = data.remove_components;
  if (!removeComponents) {
    cleaned.remove_components = [];
  } else if (Array.isArray(removeComponents)) {
    cleaned.remove_components = removeComponents.map((eachComponent) => {
      const cleanedEachComponent = {};
      removeComponentFields.forEach((field) => {
        const value = eachComponent[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedEachComponent[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedEachComponent[field] = value;
        }
      });
      return cleanedEachComponent;
    });
  }

  // Check and normalize add_components
  const addComponentsFields = ["component_display_order", "component_text"];
  const addComponents = data.add_components;
  if (!addComponents) {
    cleaned.add_components = [];
  } else if (Array.isArray(addComponents)) {
    cleaned.add_components = addComponents.map((eachComponent) => {
      const cleanedEachComponent = {};
      addComponentsFields.forEach((field) => {
        const value = eachComponent[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedEachComponent[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedEachComponent[field] = value;
        }
      });
      return cleanedEachComponent;
    });
  }

  // Check and normalize update_components
  const updateComponentsFields = [
    "recipe_component_id",
    "component_text",
    "component_display_order",
    "orderChanged",
  ];
  const updateComponents = data.update_components;
  if (!updateComponents) {
    cleaned.update_components = [];
  } else if (Array.isArray(updateComponents)) {
    cleaned.update_components = updateComponents.map((eachComponent) => {
      const cleanedEachComponent = {};
      updateComponentsFields.forEach((field) => {
        const value = eachComponent[field];

        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          const val = value.trim().replace(/\s+/g, " ").toLowerCase();
          // Skip if component_display_order is not 0 and val is empty
          if (eachComponent.component_display_order !== 0 && val === "") {
            return;
          }
          cleanedEachComponent[field] = val;
        } else {
          cleanedEachComponent[field] = value;
        }
      });
      return cleanedEachComponent;
    });
  }

  // Check and normalize update_ingredients
  const updateIngredientFields = [
    "recipe_ingredient_id",
    "ingredient_id",
    "ingredient_source",
    "quantity",
    "unit_id",
    "base_price",
    "base_quantity",
    "base_unit",
    "place",
    "component_display_order",
    "ingredient_display_order",
  ];
  const updateIngredients = data.update_ingredients;
  if (!updateIngredients) {
    cleaned.update_ingredients = [];
  } else if (Array.isArray(updateIngredients)) {
    cleaned.update_ingredients = updateIngredients.map((upIng) => {
      const cleanedUpIng = {};
      updateIngredientFields.forEach((field) => {
        const value = upIng[field];

        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          const val = value.trim().replace(/\s+/g, " ").toLowerCase();
          if (val === "") return;
          cleanedUpIng[field] = val;
        } else {
          cleanedUpIng[field] = value;
        }
      });
      return cleanedUpIng;
    });
  }

  // Check and normalize add_ingredients
  const addIngredientFields = [
    "ingredient_id",
    "ingredient_source",
    "quantity",
    "unit_id",
    "base_price",
    "base_quantity",
    "base_unit",
    "component_display_order",
    "ingredient_display_order",
  ];
  const addIngredients = data.add_ingredients;
  if (!addIngredients) {
    cleaned.add_ingredients = [];
  } else if (Array.isArray(addIngredients)) {
    cleaned.add_ingredients = addIngredients.map((addIng) => {
      const cleanedAddIng = {};
      addIngredientFields.forEach((field) => {
        const value = addIng[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedAddIng[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedAddIng[field] = value;
        }
      });

      // Handle 'place' field separately
      const placeValue = addIng.place;
      if (typeof placeValue === "string") {
        cleanedAddIng.place = placeValue.trim().replace(/\s+/g, " ").toLowerCase();
      } else {
        cleanedAddIng.place = placeValue;
      }

      return cleanedAddIng;
    });
  }

  // Check and normalize remove_ingredients
  const removeIngredientFields = ["recipe_ingredient_id"];
  const removeIngredients = data.remove_ingredients;
  if (!removeIngredients) {
    cleaned.remove_ingredients = [];
  } else if (Array.isArray(removeIngredients)) {
    cleaned.remove_ingredients = removeIngredients.map((removeIng) => {
      const cleanedRemoveIng = {};
      removeIngredientFields.forEach((field) => {
        const value = removeIng[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedRemoveIng[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedRemoveIng[field] = value;
        }
      });
      return cleanedRemoveIng;
    });
  }

  // Check and normalize remove_steps
  const removeStepsFields = ["recipe_procedure_id"];
  const removeSteps = data.remove_steps;
  if (!removeSteps) {
    cleaned.remove_steps = [];
  } else if (Array.isArray(removeSteps)) {
    cleaned.remove_steps = removeSteps.map((removeStep) => {
      const cleanedRemoveStep = {};
      removeStepsFields.forEach((field) => {
        const value = removeStep[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedRemoveStep[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedRemoveStep[field] = value;
        }
      });
      return cleanedRemoveStep;
    });
  }

  // Check and normalize add_steps
  const addStepFields = ["step_text"];
  const addSteps = data.add_steps;
  if (!addSteps) {
    cleaned.add_steps = [];
  } else if (Array.isArray(addSteps)) {
    cleaned.add_steps = addSteps.map((addStep) => {
      const cleanedAddStep = {};
      addStepFields.forEach((field) => {
        const value = addStep[field];
        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          cleanedAddStep[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleanedAddStep[field] = value;
        }
      });

      // Handle 'place' field separately
      const placeValue = addStep.place;
      if (typeof placeValue === "string") {
        cleanedAddStep.place = placeValue.trim().replace(/\s+/g, " ").toLowerCase();
      } else {
        cleanedAddStep.place = placeValue;
      }

      return cleanedAddStep;
    });
  }

  // Check and normalize update_ingredients
  const updateStepsFields = ["step_text"];
  const updateSteps = data.update_steps;
  if (!updateSteps) {
    cleaned.update_steps = [];
  } else if (Array.isArray(updateSteps)) {
    cleaned.update_steps = updateSteps.map((upStep) => {
      const cleanedUpStep = {};
      updateStepsFields.forEach((field) => {
        const value = upStep[field];

        if (value === null || value === undefined) {
          return;
        } else if (typeof value === "string") {
          const val = value.trim().replace(/\s+/g, " ").toLowerCase();
          if (val === "") return;
          cleanedUpStep[field] = val;
        } else {
          cleanedUpStep[field] = value;
        }
      });
      return cleanedUpStep;
    });
  }

  return cleaned;
}

function validateRecipeIngredientForUpdate(data) {
  // Validate name, portion_size, privacy, and description
  const name = data.name;
  const portionSize = data.portion_size;
  const privacy = data.privacy;
  const description = data.description;

  // --- name ---
  if (name !== undefined && name !== null) {
    if (typeof name !== "string" || name.length < 1 || name.length > 50) {
      return `Invalid name: ${name} must be a non-empty string ≤ 50 chars`;
    }
  }

  // --- portion_size ---
  if (portionSize !== undefined && portionSize !== null) {
    if (typeof portionSize !== "string" || portionSize.length < 1 || portionSize.length > 20) {
      return `Invalid portion_size: must be a non-empty string ≤ 20 chars`;
    }
  }

  // --- privacy ---
  if (privacy !== undefined && privacy !== null) {
    if (typeof privacy !== "string" || !["public", "private"].includes(privacy)) {
      return `Invalid privacy: must be within (public, private)`;
    }
  }

  // --- description ---
  if (description !== undefined && description !== null) {
    if (typeof description !== "string" || description.length > 500) {
      return `Invalid description: must be a string ≤ 500 chars`;
    }
  }

  // Extract and default ingredients/components
  const removeComponents = data.remove_components || [];
  const addComponents = data.add_components || [];
  const updateComponents = data.update_components || [];
  const updateIngredients = data.update_ingredients || [];
  const addIngredients = data.add_ingredients || [];
  const removeIngredients = data.remove_ingredients || [];

  // Validate remove_components
  if (removeComponents.length > 0) {
    for (const component of removeComponents) {
      const value = component.recipe_component_id;
      if (value === null || value === undefined) {
        return "need to have recipe component id to remove it";
      }
      if (!Number.isInteger(value) || value <= 0) {
        return `Invalid recipe component id \`${value}\`: must be an int > 0`;
      }
    }
  }

  // Validate update_components and add_components
  const componentGroups = { update_components: updateComponents, add_components: addComponents };

  for (const [groupName, components] of Object.entries(componentGroups)) {
    if (components.length > 0) {
      for (const comp of components) {
        const componentDisplayOrder = comp.component_display_order;
        const componentText = comp.component_text;
        const recipeComponentId = comp.recipe_component_id;

        // Required fields for add
        if (groupName === "add_components") {
          if (
            componentDisplayOrder === null ||
            componentDisplayOrder === undefined ||
            componentText === null ||
            componentText === undefined
          ) {
            return "Need component_display_order and component_text to add new component in recipe.";
          }
        }

        // Required fields for update
        if (groupName === "update_components") {
          if (
            recipeComponentId === null ||
            recipeComponentId === undefined ||
            componentDisplayOrder === null ||
            componentDisplayOrder === undefined
          ) {
            return "Need recipe_component_id and component_display_order to update component in recipe.";
          }
        }

        // Validate recipe_component_id (if present)
        if (recipeComponentId !== null && recipeComponentId !== undefined) {
          if (!Number.isInteger(recipeComponentId) || recipeComponentId < 0) {
            return `Invalid recipe_component_id '${recipeComponentId}': must be int >= 0`;
          }
        }

        // Validate component_display_order (if present)
        if (componentDisplayOrder !== null && componentDisplayOrder !== undefined) {
          if (!Number.isInteger(componentDisplayOrder) || componentDisplayOrder < 0) {
            return `Invalid component_display_order '${componentDisplayOrder}': must be int >= 0`;
          }
        }

        // Validate component_text (if present)
        if (componentText !== null && componentText !== undefined) {
          if (typeof componentText !== "string" || componentText.length > 99) {
            return `Invalid component_text '${componentText}': must be string type and less than 100 characters`;
          }
          if (componentDisplayOrder !== 0 && componentText.trim() === "") {
            return `Invalid component_text '${componentText}': must be non-empty when component_display_order is not 0`;
          }
        }
      }
    }
  }

  // Validate remove_ingredients
  if (removeIngredients.length > 0) {
    for (const ingredient of removeIngredients) {
      const value = ingredient.recipe_ingredient_id;
      if (value === null || value === undefined) {
        return "need to have recipe ingredient id to remove it";
      }
      if (!Number.isInteger(value) || value <= 0) {
        return "Invalid recipe ingredient id: must be an int > 0";
      }
    }
  }

  // Group update and add ingredients for validation
  const ingredientGroups = {
    update_ingredients: updateIngredients,
    add_ingredients: addIngredients,
  };

  for (const [groupName, ingredients] of Object.entries(ingredientGroups)) {
    if (ingredients.length > 0) {
      for (const ing of ingredients) {
        if (groupName === "add_ingredients") {
          const ingredientId = ing.ingredient_id;
          const ingredientSource = ing.ingredient_source;
          const quantity = ing.quantity;
          const unitId = ing.unit_id;

          if (!ingredientId || !quantity || !unitId) {
            return {
              error: "Need ingredient_id, quantity and unit id to add new ingredient in recipe.",
            };
          }
        }

        if (groupName === "update_ingredients") {
          const recipeIngredientId = ing.recipe_ingredient_id;
          if (
            recipeIngredientId === null ||
            recipeIngredientId === undefined ||
            !Number.isInteger(recipeIngredientId)
          ) {
            return { error: "Invalid recipe ingredient id. Must be int > 0" };
          }
        }

        // ingredient_id
        const ingredientId = ing.ingredient_id;
        if (ingredientId !== null && ingredientId !== undefined) {
          if (ingredientId === "" || !Number.isInteger(ingredientId) || ingredientId <= 0) {
            return { error: `Invalid ingredient id '${ingredientId}': must be int > 0` };
          }
        }

        // ingredient_source
        const ingredientSource = ing.ingredient_source;
        if (ingredientSource !== null && ingredientSource !== undefined) {
          if (
            typeof ingredientSource !== "string" ||
            !["main", "user"].includes(ingredientSource)
          ) {
            return {
              error: `Invalid ingredient source '${ingredientSource}': must be string within [main, user]`,
            };
          }
        }

        // quantity
        const quantity = ing.quantity;
        if (quantity !== null && quantity !== undefined) {
          if (typeof quantity !== "number" || quantity <= 0) {
            return { error: "Invalid quantity: must be numeric > 0" };
          }
        }

        // unit_id
        const unitId = ing.unit_id;
        if (unitId !== null && unitId !== undefined) {
          if (!Number.isInteger(unitId) || unitId <= 0) {
            return { error: "Invalid unit id: must be int > 0" };
          }
        }

        // component_display_order
        const componentDisplayOrder = ing.component_display_order;
        if (componentDisplayOrder !== null && componentDisplayOrder !== undefined) {
          if (!Number.isInteger(componentDisplayOrder) || componentDisplayOrder < 0) {
            return { error: "Invalid component_display_order: must be integer type >= 0" };
          }
        }

        // ingredient_display_order
        const ingredientDisplayOrder = ing.ingredient_display_order;
        if (ingredientDisplayOrder !== null && ingredientDisplayOrder !== undefined) {
          if (!Number.isInteger(ingredientDisplayOrder) || ingredientDisplayOrder <= 0) {
            return { error: "Invalid ingredient_display_order: must be int > 0" };
          }
        }

        // If any of base_price, base_unit, base_quantity is provided, all must be provided
        const hasBasePrice = ing.base_price !== null && ing.base_price !== undefined;
        const hasBaseUnit = ing.base_unit !== null && ing.base_unit !== undefined;
        const hasBaseQuantity = ing.base_quantity !== null && ing.base_quantity !== undefined;

        if (hasBasePrice || hasBaseUnit || hasBaseQuantity) {
          if (!hasBasePrice || !hasBaseUnit || !hasBaseQuantity) {
            return {
              error: "'base price', 'base unit' and 'base quantity' must all be provided together",
            };
          }

          const customPrice = ing.base_price;
          const baseUnit = ing.base_unit;
          const baseQuantity = ing.base_quantity;
          const place = ing.place;

          // Validate customPrice
          if (typeof customPrice !== "number" || customPrice <= 0) {
            return { error: "Invalid custom_price: must be numeric > 0" };
          }

          // Validate baseUnit
          if (
            typeof baseUnit !== "string" ||
            !["kg", "g", "oz", "lbs", "l", "ml", "pint", "fl.oz", "pc", "bunch"].includes(baseUnit)
          ) {
            return {
              error:
                "Invalid base_unit: must be one of these: ['kg', 'g', 'oz', 'lbs','l', 'ml', 'pint', 'fl.oz', 'pc', 'bunch']",
            };
          }

          // Validate baseQuantity
          if (typeof baseQuantity !== "number" || baseQuantity <= 0) {
            return { error: "Invalid base_quantity: must be numeric > 0" };
          }

          // Validate place
          if (place) {
            if (typeof place !== "string" || place.trim().length === 0 || place.length > 25) {
              return { error: "Invalid place: must be a string ≤ 25 chars" };
            }
          }
        }
      }
    }
  }

  return none;
}

module.exports = { normalizeRecipeIngredientDataForUpdate, validateRecipeIngredientForUpdate };
