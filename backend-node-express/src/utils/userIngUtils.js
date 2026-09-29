// ----------------------------- normalize ingredient data ---------------------------
function normaliseIngredientData(data) {
  const cleaned = {};

  // String fields: trim, collapse multiple spaces, convert to lowercase
  const fields = [
    "user_ing_id",
    "name",
    "quantity",
    "unit",
    "price",
    "cup_weight",
    "cup_unit",
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
function validateIngredients(data) {
  //print(data)

  // --- user_ing_id ---
  const ing_id = data.user_ing_id;
  if (ing_id) {
    if (!Number.isInteger(ing_id) || ing_id < 0) {
      return `Invalid ID: (${ing_id}) must be a positive whole number > 0`;
    }
  }
  // --- name ---
  const name = data.name;
  if (!name || typeof name !== "string" || name.length > 30) {
    return `Invalid name: (${name}) must be a non-empty string ≤ 30 chars`;
  }

  // --- quantity ---
  const quantity = data.quantity;
  if (!quantity || typeof quantity !== "number" || !(0 < quantity && quantity < 100000)) {
    return `Invalid quantity: (${quantity}) must be a number > 0 and less than 100000 `;
  }

  // --- unit ---
  const unit = data.unit;
  if (
    !unit ||
    typeof unit !== "string" ||
    !["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"].includes(unit)
  ) {
    return `Invalid unit: (${unit}) must be a non-empty string and within ('kg','g','oz','lbs','l','ml','fl.oz','pint','pc','bunch') `;
  }

  // --- price ---
  const price = data.price;
  if (!price || typeof price !== "number" || !(0 < price && price < 100000)) {
    return `Invalid price: (${price}) must be a number > 0 and less than 100000 `;
  }

  // --- cup_weight  and cup_unit---
  const cup_weight = data.cup_weight;
  const cup_unit = data.cup_unit;
  // console.log("cup_weight : ", cup_weight, "cup_unit : ", cup_unit);

  // --- cup_weight --- if present
  if (cup_weight !== null && cup_weight !== "") {
    // only validate if value is present
    if (typeof cup_weight !== "number" || !(0 <= cup_weight && cup_weight < 100000)) {
      return `Invalid cup_weight: (${cup_weight}) must be a number >= 0 and less than 100000`;
    }
  }

  // --- cup_unit --- if present
  if (cup_unit !== null && cup_unit !== "") {
    // only validate if value is present
    if (typeof cup_unit !== "string" || !["kg", "g", "oz", "lbs"].includes(cup_unit)) {
      return `Invalid cup_unit: (${cup_unit}) must be within ('kg','g','oz','lbs')`;
    }
  }

  // --- notes ---
  const notes = data.notes;
  if (typeof notes !== "string" || notes.length > 100) {
    return `Invalid notes: must be a string ≤ 100 chars`;
  }

  // Check if both are either empty or filled
  if (
    ((cup_weight === 0 || cup_weight === null || cup_weight === "") &&
      cup_unit !== null &&
      cup_unit !== "") ||
    (cup_weight !== 0 &&
      cup_weight !== null &&
      cup_weight !== "" &&
      (cup_unit === null || cup_unit === ""))
  ) {
    return "Both cup_weight and cup_unit must be provided together or left empty";
  }

  // return none if validation doesnt throw any error
  return null;
}

module.exports = { normaliseIngredientData, validateIngredients };
