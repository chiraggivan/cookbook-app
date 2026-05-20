function normaliseIngredientData(data) {
  const cleaned = {};

  // Check if data exists, is a non-empty dictionary and if component exists as list
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray(data.components) ||
    data.components.length === 0
  ) {
    return { cleaned: null, error: "Recipe details are missing or invalid type" };
  }

  // String fields: trim, collapse multiple spaces, convert to lowercase
  const recipe_fields = [
    "recipe_id",
    "recipe_name",
    "portion_size",
    "preparation_date",
    "time_prepared",
    "meal",
    "recipe_by",
    "comment",
    "total_cost",
  ];

  for (const field of recipe_fields) {
    const value = data[field];

    if (typeof value === "string") {
      // Remove leading/trailing spaces, collapse internal spaces, convert to lowercase
      cleaned[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
    } else {
      cleaned[field] = value; // keep as-is if not a string
    }
  }
  // cleaned[field] = recipe_cleaned

  const components = data.components;
  const cleaned_components = [];

  // checking if ingredients exists in components
  for (const component of components) {
    if (!Array.isArray(component.ingredients) || component.ingredients.length === 0) {
      return { cleaned: null, error: "ingredients are missing or invalid type" };
    }
    const component_fields = ["component_text", "display_order"];
    const cleaned_component = {};

    for (const field of component_fields) {
      const value = component[field];

      if (typeof value === "string") {
        // Remove leading/trailing spaces, collapse internal spaces, convert to lowercase
        cleaned_component[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
      } else {
        cleaned_component[field] = value; // keep as-is if not a string
      }
    }

    const ingredients = component.ingredients;
    const cleaned_ingredients = [];

    for (const ingredient of ingredients) {
      const ingredient_fields = [
        "ingredient_id",
        "name",
        "ingredient_source",
        "quantity",
        "unit_id",
        "unit_name",
        "cost",
        "base_price",
        "base_unit",
        "display_order",
      ];
      const cleaned_ingredient = {};

      for (const field of ingredient_fields) {
        const value = ingredient[field];

        if (typeof value === "string") {
          // Remove leading/trailing spaces, collapse internal spaces, convert to lowercase
          cleaned_ingredient[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
        } else {
          cleaned_ingredient[field] = value; // keep as-is if not a string
        }
      }

      cleaned_ingredients.push(cleaned_ingredient);
    }

    cleaned_component["ingredients"] = cleaned_ingredients;
    cleaned_components.push(cleaned_component);
  }

  cleaned["components"] = cleaned_components;

  return { cleaned, error: null };
}

function validateIngredient(data) {
  // recipe = data.get("recipe")
  // --- recipe_id ---
  const recipe_id = data.recipe_id;
  if (!Number.isInteger(recipe_id) || recipe_id <= 0) {
    return "Invalid recipe id: must be a non-empty int> 0";
  }

  // --- recipe_name ---
  const recipe_name = data.recipe_name;
  if (!recipe_name || typeof recipe_name !== "string" || recipe_name.length > 50) {
    return "Invalid recipe name: must be a non-empty string ≤ 50 chars";
  }

  // --- portion_size ---
  const portion_size = data.portion_size;
  if (!portion_size || typeof portion_size !== "string" || portion_size.length > 50) {
    return "Invalid portion_size: must be a non-empty string ≤ 50 chars";
  }

  // --- preparation_date ---
  const preparation_date = data.preparation_date;
  if (typeof preparation_date !== "string" || !preparation_date || preparation_date.length > 50) {
    return "Invalid preparation_date: must be a non-empty string ≤ 50 chars";
  }
  // check if date given as string is compatible
  if (isNaN(Date.parse(preparation_date))) {
    return "Invalid preparation_date: must be compatible with YYYY-MM-DD";
  }

  // --- time_prepared ---
  const time_prepared = data.time_prepared;
  if (typeof time_prepared !== "string" || !time_prepared || time_prepared.length > 50) {
    return "Invalid time_prepared: must be a non-empty string ≤ 50 chars";
  }
  // check if time given as string is compatible
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  //   if (!timeRegex.test(time_prepared)) {
  //     return "Invalid preparation_time: must be compatible with HH:MM";
  //   }

  // --- meal ---
  const meal = data.meal;
  if (typeof meal !== "string" || meal.length > 16) {
    return "Invalid time_prepared: must be a non-empty string ≤ 16 chars";
  }

  // --- recipe_by ---
  const recipe_by = data.recipe_by;
  if (!Number.isInteger(recipe_by) || recipe_by <= 0) {
    return "Invalid recipe by: must be a non-empty int> 0";
  }

  // --- total_cost ---
  const total_cost = data.total_cost;
  if (typeof total_cost !== "number" || total_cost <= 0 || total_cost > 10000000000) {
    return "Invalid total_cost: must be a non-empty int ≤ 10000000000";
  }

  // --- comment ---
  const comment = data.comment;
  if (typeof comment !== "string" || comment.length > 500) {
    return "Invalid comment: must not be > 500 character";
  }

  const components = data.components;

  // find total ingredients for checking display order
  let total_ingredients = 0;
  for (const component of components) {
    total_ingredients += component.ingredients.length;
  }

  for (const component of components) {
    // --- component_text ---
    const component_text = component.component_text;
    if (typeof component_text !== "string" || component_text.length > 255) {
      return "Invalid component_text : must be of length < 255";
    }

    // --- display_order ---
    const display_order = component.display_order;
    if (
      !Number.isInteger(display_order) ||
      display_order < 0 // || display_order >= components.length
    ) {
      return `Invalid display_order: must be a integer >= 0`;
    }

    // --- ingredients ---
    const ingredients = component.ingredients;
    for (const ing of ingredients) {
      // --- cost ---
      const base_price = ing.base_price;
      if (typeof base_price !== "number" || base_price <= 0 || base_price > 1000000) {
        return "Invalid base_price: must be a int between 0 and 1000000";
      }

      // --- ingredient_id ---
      const ingredient_id = ing.ingredient_id;
      if (!Number.isInteger(ingredient_id) || ingredient_id <= 0) {
        return "Invalid ingredient_id: must be > 0 ";
      }

      // --- name ---
      const name = ing.name;
      if (typeof name !== "string" || name.length > 255) {
        return "Invalid name: must be string of length < 255";
      }

      // --- ingredient_source ---
      const ingredient_source = ing.ingredient_source;
      if (typeof ingredient_source !== "string" || ingredient_source.length > 20) {
        return "Invalid ingredient_source: must be string of length < 20";
      }

      // --- cost ---
      const cost = ing.cost;
      if (typeof cost !== "number" || cost <= 0 || cost > 100000) {
        return "Invalid cost: must be a int between 0 and 100000";
      }

      // --- quantity ---
      const quantity = ing.quantity;
      if (typeof quantity !== "number" || quantity <= 0 || quantity > 100000) {
        return "Invalid quantity: must be a int between 0 and 100000";
      }

      // --- unit_id ---
      const unit_id = ing.unit_id;
      if (!Number.isInteger(unit_id) || unit_id <= 0) {
        return "Invalid unit_id: must be a int > 0";
      }

      // --- base_unit ---
      const base_unit = ing.base_unit;
      if (typeof base_unit !== "string" || base_unit.length > 1000000) {
        return "Invalid base unit: must be of length < 1000000";
      }

      // --- unit_name ---
      const unit_name = ing.unit_name;
      if (typeof unit_name !== "string" || unit_name.length > 500) {
        return "Invalid unit_name: must be of length < 500";
      }

      // --- display_order ---
      const ing_display_order = ing.display_order;
      if (
        !Number.isInteger(ing_display_order) ||
        ing_display_order < 0 //|| ing_display_order > total_ingredients
      ) {
        return `Invalid display_order for ingredients: must be a int > 0 `;
      }
    }
  }

  const steps = data.steps || [];
  if (steps.length > 0) {
    for (const step of steps) {
      // --- step_order ---
      const step_order = step.step_order;
      if (!Number.isInteger(step_order) || step_order <= 0 || step_order > 1000) {
        return "Invalid step_order: must be a int between 0 and 1000";
      }

      // --- step_text ---
      const step_text = step.step_text;
      if (typeof step_text !== "string" || step_text.length > 500) {
        return "Invalid step_text: must be of length < 500";
      }

      // --- estimated_time ---
      const estimated_time = step.estimated_time;
      if (!Number.isInteger(estimated_time) || estimated_time <= 0) {
        return "Invalid estimated_time: must be a int > 0";
      }
    }
  }

  return null;
}

module.exports = { normaliseIngredientData, validateIngredient };
