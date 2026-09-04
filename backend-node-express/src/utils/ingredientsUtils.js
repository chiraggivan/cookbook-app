// ----------------------------- normalize ingredient data ---------------------------
function normaliseIngredientData(data) {
  const cleaned = {};

  // String fields: trim, collapse multiple spaces, convert to lowercase
  const fields = [
    "name",
    "form",
    "ingredient_id",
    "display_quantity",
    "display_unit",
    "display_price",
    "cup_equivalent_weight",
    "cup_equivalent_unit",
    "notes",
  ];
  // ingredient_dict = data[0]

  for (const field of fields) {
    const value = data[field];

    if (typeof value === "string") {
      // Remove leading/trailing spaces, collapse internal spaces, convert to lowercase
      cleaned[field] = value.trim().replace(/\s+/g, " ").toLowerCase();
    } else if (typeof value === "number") {
      cleaned[field] = value; // keep as-is if int or float
    } else {
      cleaned[field] = null;
    }
  }

  return cleaned;
}

// ----------------------------- validate ingredient ---------------------------
function validateIngredient(data, operation) {
  //print(data)

  // for update check ingredient_id
  if (operation === "update") {
    const ingredient_id = data.ingredient_id;
    if (!ingredient_id) {
      return `Invalid ingredient_id: (${ingredient_id}) : to update, need ingredient id`;
    }
  }
  // --- name ---
  const name = data.name;
  if (!name || typeof name !== "string" || name.length > 29) {
    return `Invalid name: (${name}) must be a non-empty string ≤ 30 chars`;
  }

  // --- form ---
  const form = data.form;
  if (form || form !== "") {
    if (typeof form !== "string" || form.length > 20) {
      return `Invalid form length: (${form}) must be a non-empty string ≤ 20 chars`;
    }
  }

  // --- display_quantity ---
  const display_quantity = data.display_quantity;
  if (
    !display_quantity ||
    typeof display_quantity !== "number" ||
    !(0 < display_quantity && display_quantity < 10000000)
  ) {
    return `Invalid display_quantity: (${display_quantity}) must be a number > 0 and less than 10000000 `;
  }

  // --- display_unit ---
  const display_unit = data.display_unit;
  if (
    !display_unit ||
    typeof display_unit !== "string" ||
    !["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"].includes(display_unit)
  ) {
    return `Invalid display_unit: (${display_unit}) must be a non-empty string and within ('kg','g','oz','lbs','l','ml','fl.oz','pint','pc','bunch') `;
  }

  // --- display_price ---
  const display_price = data.display_price;
  if (
    !display_price ||
    typeof display_price !== "number" ||
    !(0 < display_price && display_price < 1000000)
  ) {
    return `Invalid display_price: (${display_price}) must be a number > 0 and less than 1000000 `;
  }

  // --- cup_equivalent_weight  and cup_equivalent_unit---
  const cup_equivalent_weight = data.cup_equivalent_weight;
  const cup_equivalent_unit = data.cup_equivalent_unit;

  // Check if both are either empty or filled
  if (
    ((cup_equivalent_weight === 0 ||
      cup_equivalent_weight === null ||
      cup_equivalent_weight === "") &&
      cup_equivalent_unit !== null &&
      cup_equivalent_unit !== "") ||
    (cup_equivalent_weight !== 0 &&
      cup_equivalent_weight !== null &&
      cup_equivalent_weight !== "" &&
      (cup_equivalent_unit === null || cup_equivalent_unit === ""))
  ) {
    return "Both cup_equivalent_weight and cup_equivalent_unit must be provided together or left empty";
  }

  // --- cup_equivalent_weight --- if present
  if (cup_equivalent_weight && cup_equivalent_weight !== 0) {
    // only validate if value is present
    if (
      typeof cup_equivalent_weight !== "number" ||
      !(0 <= cup_equivalent_weight && cup_equivalent_weight < 100000000)
    ) {
      return `Invalid cup_equivalent_weight: (${cup_equivalent_weight}) must be a number >= 0 and less than 100000`;
    }
  }

  // --- cup_equivalent_unit --- if present
  if (cup_equivalent_unit !== null && cup_equivalent_unit !== "") {
    // only validate if value is present
    if (
      typeof cup_equivalent_unit !== "string" ||
      !["kg", "g", "oz", "lbs"].includes(cup_equivalent_unit)
    ) {
      return `Invalid cup_equivalent_unit: (${cup_equivalent_unit}) must be within ('kg','g','oz','lbs')`;
    }
  }

  // --- notes ---
  const notes = data.notes ?? "";
  if (typeof notes !== "string" || notes.length > 200) {
    return "Invalid notes: must be a string ≤ 200 chars";
  }

  // return none if validation doesnt throw any error
  return null;
}

module.exports = { normaliseIngredientData, validateIngredient };
