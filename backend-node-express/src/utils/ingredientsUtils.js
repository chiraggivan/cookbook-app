// ----------------------------- normalize ingredient data ---------------------------
function normaliseIngredientData(data) {
  const cleaned = {};

  // String fields: trim, collapse multiple spaces, convert to lowercase
  const fields = [
    "name",
    "reference_quantity",
    "reference_unit",
    "default_price",
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
function validateIngredient(data) {
  //print(data)
  // --- name ---
  const name = data.name;
  if (!name || typeof name !== "string" || name.length > 30) {
    return `Invalid name: (${name}) must be a non-empty string ≤ 30 chars`;
  }

  // --- reference_quantity ---
  const reference_quantity = data.reference_quantity;
  if (
    !reference_quantity ||
    typeof reference_quantity !== "number" ||
    !(0 < reference_quantity && reference_quantity < 100000)
  ) {
    return `Invalid reference_quantity: (${reference_quantity}) must be a number > 0 and less than 100000 `;
  }

  // --- reference_unit ---
  const reference_unit = data.reference_unit;
  if (
    !reference_unit ||
    typeof reference_unit !== "string" ||
    !["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"].includes(reference_unit)
  ) {
    return `Invalid reference_unit: (${reference_unit}) must be a non-empty string and within ('kg','g','oz','lbs','l','ml','fl.oz','pint','pc','bunch') `;
  }

  // --- default_price ---
  const default_price = data.default_price;
  if (
    !default_price ||
    typeof default_price !== "number" ||
    !(0 < default_price && default_price < 100000)
  ) {
    return `Invalid default_price: (${default_price}) must be a number > 0 and less than 100000 `;
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
  if (cup_equivalent_weight !== null && cup_equivalent_weight !== "") {
    // only validate if value is present
    if (
      typeof cup_equivalent_weight !== "number" ||
      !(0 <= cup_equivalent_weight && cup_equivalent_weight < 100000)
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
  const notes = data.notes;
  if (typeof notes !== "string" || notes.length > 100) {
    return "Invalid notes: must be a string ≤ 100 chars";
  }

  // return none if validation doesnt throw any error
  return null;
}

module.exports = { normaliseIngredientData, validateIngredient };
