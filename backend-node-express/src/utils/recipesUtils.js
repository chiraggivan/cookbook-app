const { toInt, toFloat } = require("./utilities");
const { mainUnits } = require("../utils/constantValues");

function normalizeRecipeIngredientData(data) {
  const cleaned = {};

  // Helper function (like re.sub + strip + lower)
  const normaliseString = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

  // String fields
  const strFields = ["name", "portion_size", "privacy", "description"];
  strFields.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      cleaned[field] = normaliseString(value);
    } else {
      cleaned[field] = value;
    }
  });

  // Handle components
  const components = data.components || [];

  if (Array.isArray(components)) {
    const onlyObjComponents = components.filter((comp) => typeof comp === "object");
    const normalisedComponents = onlyObjComponents.map((component) => {
      const normComp = {};
      Object.entries(component).forEach(([k, v]) => {
        if (typeof v === "string") {
          normComp[k] = normaliseString(v);
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
                  normIng[key] = normaliseString(value);
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

    cleaned.components = normalisedComponents;
  } else {
    cleaned.components = [];
  }

  // Handle steps
  const steps = data.steps || [];

  if (Array.isArray(steps)) {
    const onlyObjSteps = steps.filter((step) => typeof step === "object");
    cleaned.steps = onlyObjSteps.map((step) => {
      // if (typeof step !== "object" || step === null) return step;

      const normStep = {};

      Object.entries(step).forEach(([key, value]) => {
        if (typeof value === "string") {
          normStep[key] = normaliseString(value);
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

  // --- check component should have ingredients
  for (const component of components) {
    if (!component.ingredients || component.ingredients.length < 1) {
      return "Component cant be empty. atleast one ingredient required";
    }
  }

  //  --- check total ingredients
  let totalIngredients = 0;
  for (const component of components) {
    totalIngredients += component.ingredients.length;
  }
  if (totalIngredients < 2) {
    return "minimum 2 ingredients required to make a recipe";
  }

  // --- Validate components & ingredients ---
  for (const component of components) {
    const componentDisplayOrder = toInt(
      component.component_display_order,
      "component_display_order",
    );

    // --- validate if comp_display_order in range
    if (componentDisplayOrder < 0 || componentDisplayOrder >= totalComponents) {
      return `Invalid component display order`;
    }
    // --- validate for empty comp text for comp (allow empty for comp_display_order === 0)
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

      // ---- Validate if ing_display_order in range
      if (
        !ingredientDisplayOrder ||
        ingredientDisplayOrder <= 0 ||
        ingredientDisplayOrder > totalIngredients
      ) {
        return "Invalid ingredient display order";
      }

      // ---- limit check the ingredient_id value
      const ingredientId = toInt(ing.ingredient_id, "ingredient_id");
      if (!ingredientId || ingredientId <= 0 || ingredientId >= 1e6) {
        return "Invalid ingredient id";
      }

      // ---- validate ingredient_source within [main user]
      const ingredientSource = ing.ingredient_source;
      if (
        !ingredientSource ||
        typeof ingredientSource !== "string" ||
        !["main", "user"].includes(ingredientSource)
      ) {
        return "Invalid ingredient_source";
      }

      // ---- validate quantity value within limit
      const quantity = toFloat(ing.quantity, "quantity");
      if (!quantity || quantity <= 0 || quantity >= 1e6) {
        return "Invalid quantity";
      }

      // ---- validate unit_id value within limit
      const unitId = toInt(ing.unit, "unit_id");
      if (unitId <= 0 || unitId >= 1e8) {
        return "Invalid unit_id";
      }

      if (ing.display_price !== undefined) {
        // ---- validate base_price value within limit
        const basePrice = toFloat(ing.display_price, "base_price");
        if (basePrice <= 0 || basePrice >= 1e8) {
          return "Invalid base_price";
        }
      }

      if (ing.display_quantity !== undefined) {
        // ---- validate base_quantity value within limit
        const baseQuantity = toFloat(ing.display_quantity, "base_quantity");
        if (baseQuantity <= 0 || baseQuantity >= 1e6) {
          return "Invalid base_quantity";
        }
      }

      if (ing.display_unit !== undefined) {
        // ---- validate base_unit value within limit []
        const baseUnit = ing.display_unit;
        if (typeof baseUnit !== "string" || !mainUnits.includes(baseUnit)) {
          return "Invalid base_unit";
        }
      }

      if (ing.location !== undefined) {
        // ---- validate location value as string and within limit
        const location = ing.location;
        if (typeof location !== "string" || location.length > 50) {
          return "Invalid location";
        }
      }
    }
  }

  // --- Validate steps ---
  const steps = recipe.steps || [];
  const totalSteps = steps.length;

  for (const step of steps) {
    // ---- validate step as object
    if (typeof step !== "object") {
      return "step must be object";
    }

    // ---- Validate if step_display_order in range
    const stepDisplayOrder = toInt(step.step_order, "step_order");
    if (stepDisplayOrder < 0 || stepDisplayOrder > totalSteps) {
      return "Invalid step display order";
    }

    // ---- Validate if step_text is not empty and in range
    const stepText = step.step_text;
    if (
      typeof stepText !== "string" ||
      stepText.length > 500 ||
      (stepDisplayOrder !== 0 && stepText === "")
    ) {
      return "Invalid step_text. Should be less than 500 character";
    }

    // ---- validate step_time if received
    if (step.step_time) {
      const stepTime = step.step_time;
      if (typeof stepTime !== "string") {
        return "Invalid step_time";
      }

      // HH:MM validation
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(stepTime)) {
        return `Invalid step_time format (${stepTime})`;
      }
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
    g: [1000, "kg"],
    oz: [35.274, "kg"],
    lbs: [2.205, "kg"],

    ml: [1000, "l"],
    "fl.oz": [35.1951, "l"],
    pint: [1.75975, "l"],
  };

  const [factor, newUnit] = conversions[unit] || [1, unit];

  return [price * factor, quantity, newUnit];
}

module.exports = { normalizeRecipeIngredientData, validateRecipeIngredient, normalize_unit };
