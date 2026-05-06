function toInt(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    throw new Error(`Invalid ${fieldName}: must be an integer`);
  }
  return num;
}

function toFloat(value, fieldName) {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: must be an numeric`);
  }
  return num;
}

module.exports = { toInt, toFloat };
