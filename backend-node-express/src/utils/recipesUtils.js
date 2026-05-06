const { toInt, toFloat } = require("./utilities");

function normalizeRecipeIngredientData(data) {
  const cleaned = {};

  // Helper function (like re.sub + strip + lower)
  const normalizeString = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

  // String fields
  const strFields = ["name", "portion_size", "privacy", "description"];

  strFields.forEach((field) => {
    const value = data[field];

    if (typeof value === "string") {
      cleaned[field] = normalizeString(value);
    } else {
      cleaned[field] = value;
    }
  });

  // Handle components
  const components = data.components || [];

  if (Array.isArray(components)) {
    const normalizedComponents = components.map((component) => {
      if (typeof component !== "object" || component === null) return component;

      const normComp = {};

      Object.entries(component).forEach(([k, v]) => {
        if (typeof v === "string") {
          normComp[k] = normalizeString(v);
        } else if (typeof v === "number") {
          normComp[k] = v;
        } else if (Array.isArray(v)) {
          // Handle ingredients list
          if (k === "ingredients") {
            normComp[k] = v.map((ing) => {
              if (typeof ing !== "object" || ing === null) return ing;

              const normIng = {};
              Object.entries(ing).forEach(([key, value]) => {
                if (typeof value === "string") {
                  normIng[key] = normalizeString(value);
                } else {
                  normIng[key] = value;
                }
              });
              return normIng;
            });
          }
        }
      });

      return normComp;
    });

    cleaned.components = normalizedComponents;
  } else {
    cleaned.components = [];
  }

  // Handle steps
  const steps = data.steps || [];

  if (Array.isArray(steps)) {
    cleaned.steps = steps.map((step) => {
      if (typeof step !== "object" || step === null) return step;

      const normStep = {};

      Object.entries(step).forEach(([key, value]) => {
        if (typeof value === "string") {
          normStep[key] = normalizeString(value);
        } else {
          normStep[key] = value;
        }
      });

      return normStep;
    });
  } else {
    cleaned.steps = [];
  }

  return cleaned;
}

function validateRecipeIngredient(data) {
  const recipe = data;

  // helper converters (you must already have equivalents)
  //   const toInt = (val, field) => {
  //     const num = Number(val);
  //     if (!Number.isInteger(num)) throw new Error(`${field} must be an integer`);
  //     return num;
  //   };

  //   const toFloat = (val, field) => {
  //     const num = Number(val);
  //     if (isNaN(num)) throw new Error(`${field} must be a number`);
  //     return num;
  //   };

  // --- name ---
  const name = recipe.name;
  if (!name || typeof name !== "string" || name.length > 50) {
    return "Invalid name: must be a non-empty string ≤ 50 chars";
  }

  // --- portion_size ---
  const portionSize = recipe.portion_size;
  if (!portionSize || typeof portionSize !== "string" || portionSize.length > 50) {
    return "Invalid portion_size: must be a non-empty string ≤ 50 chars";
  }

  // --- privacy ---
  const privacy = recipe.privacy;
  if (
    !privacy ||
    typeof privacy !== "string" ||
    !["public", "private"].includes(privacy) ||
    privacy.length > 10
  ) {
    return "Invalid privacy: must be within (public, private)";
  }

  // --- description ---
  const description = recipe.description;
  if (typeof description !== "string" || description.length > 500) {
    return "Invalid description: must be a string ≤ 500 chars";
  }

  // --- Components ---
  const components = recipe.components || [];
  const totalComponents = components.length;

  for (const component of components) {
    if (!component.ingredients || component.ingredients.length < 1) {
      return "Component cant be empty. atleast one ingredient required";
    }
  }

  let totalIngredients = 0;
  for (const component of components) {
    totalIngredients += component.ingredients.length;
  }

  if (totalIngredients < 2) {
    return "minimum 2 ingredients required to make a recipe";
  }

  // --- Validate components & ingredients ---
  for (const component of components) {
    try {
      const componentDisplayOrder = toInt(
        component.component_display_order,
        "component_display_order",
      );

      if (componentDisplayOrder < 0 || componentDisplayOrder >= totalComponents) {
        return `Invalid component display order`;
      }

      const componentText = component.component_text;
      if (
        typeof componentText !== "string" ||
        componentText.length > 50 ||
        (componentDisplayOrder !== 0 && componentText === "")
      ) {
        return "Invalid component_input_text";
      }

      const ingredients = component.ingredients || [];

      for (const ing of ingredients) {
        const ingredientDisplayOrder = toInt(
          ing.ingredient_display_order,
          "ingredient_display_order",
        );

        if (ingredientDisplayOrder <= 0 || ingredientDisplayOrder > totalIngredients) {
          return "Invalid ingredient display order";
        }

        const ingredientId = toInt(ing.ingredient_id, "ingredient_id");
        if (ingredientId <= 0 || ingredientId >= 1e6) {
          return "Invalid ingredient id";
        }

        const ingredientSource = ing.ingredient_source;
        if (typeof ingredientSource !== "string" || !["main", "user"].includes(ingredientSource)) {
          return "Invalid ingredient_source";
        }

        const quantity = toFloat(ing.quantity, "quantity");
        if (quantity <= 0 || quantity >= 1e6) {
          return "Invalid quantity";
        }

        const unitId = toInt(ing.unit_id, "unit_id");
        if (unitId <= 0 || unitId >= 1e8) {
          return "Invalid unit_id";
        }

        if (ing.base_price !== undefined) {
          const basePrice = toFloat(ing.base_price, "base_price");
          if (basePrice <= 0 || basePrice >= 1e8) {
            return "Invalid base_price";
          }
        }

        if (ing.base_quantity !== undefined) {
          const baseQuantity = toFloat(ing.base_quantity, "base_quantity");
          if (baseQuantity <= 0 || baseQuantity >= 1e6) {
            return "Invalid base_quantity";
          }
        }

        if (ing.base_unit !== undefined) {
          const baseUnit = ing.base_unit;
          if (typeof baseUnit !== "string" || !["kg", "l", "pc", "bunch"].includes(baseUnit)) {
            return "Invalid base_unit";
          }
        }

        if (ing.location !== undefined) {
          const location = ing.location;
          if (typeof location !== "string" || location.length > 50) {
            return "Invalid location";
          }
        }
      }
    } catch (err) {
      return err.message;
    }
  }

  // --- Validate steps ---
  const steps = recipe.steps || [];
  const totalSteps = steps.length;

  for (const step of steps) {
    if (typeof step !== "object") {
      return "step must be object";
    }

    const stepDisplayOrder = toInt(step.step_display_order, "step_display_order");

    if (stepDisplayOrder < 0 || stepDisplayOrder > totalSteps) {
      return "Invalid step display order";
    }

    const stepText = step.step_text;
    if (
      typeof stepText !== "string" ||
      stepText.length > 500 ||
      (stepDisplayOrder !== 0 && stepText === "")
    ) {
      return "Invalid step_text. Should be less than 500 character";
    }

    const stepTime = step.step_time;
    if (typeof stepTime !== "string") {
      return "Invalid step_time";
    }

    // HH:MM validation
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(stepTime)) {
      return `Invalid step_time format (${stepTime})`;
    }
  }

  return null; // no errors
}

function normalize_unit(price, quantity, unit) {
  // normalize quantity first
  if (quantity !== 1) {
    price = Number((price / quantity).toFixed(6));
    quantity = 1;
  }

  //  conversion factors to a standard unit
  const conversions = {
    g: (1000, "kg"),
    oz: (35.274, "kg"),
    lbs: (2.205, "kg"),

    ml: (1000, "l"),
    "fl.oz": (35.1951, "l"),
    pint: (1.75975, "l"),
  };

  const [factor, newUnit] = conversions[unit] || [1, unit];

  return [price * factor, quantity, newUnit];
}

module.exports = { normalizeRecipeIngredientData, validateRecipeIngredient, normalize_unit };
