function normaliseNewUserData(data) {
  const cleaned = {};

  // Helper function (like re.sub + strip + lower)
  const normaliseString = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

  // String fields
  const strFields = ["name", "email", "username", "password", "country"];
  strFields.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      if (field === "username" || field === "email") {
        cleaned[field] = normaliseString(value);
      } else {
        cleaned[field] = value.trim(); //normaliseString(value); // want to save uppercase as it is
      }
    } else {
      cleaned[field] = value;
    }
  });

  return cleaned;
}

function validateNewUserData(data) {
  const user = data;

  // ---- name ------
  const name = user.name;
  if (!name || typeof name !== "string" || name.length > 50) {
    return "Invalid name: must be a non-empty string ≤ 50 chars";
  }

  // --- email ---
  const email = user.email;
  if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
    return "Invalid email: must have @ and . ";
  }

  // --- username ---
  const username = user.username;
  if (
    !username ||
    typeof username !== "string" ||
    username.length < 3 ||
    !/^[a-zA-Z0-9]+$/.test(username)
  ) {
    return "Invalid username: min 3 characters and max 50, 1 uppercase, 1 lowercase and 1 number and not have anthing else than a-z and 0-9";
  }

  // --- password --- password should be min 8 char, lowercase, uppercase, number and spcl char(_$#*&%@)
  const password = user.password;
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 50 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(password)
  ) {
    return "Invalid password: min 8 characters and max 50 with min 1 uppercase, 1 lowercase, 1 number and any of these special charaacter";
  }

  // --- country ---
  const country = user.country;
  if (!Number.isInteger(country) || country === 0) {
    return "Invalid country: Should be an integer";
  }

  return null; // no errors
}

module.exports = { normaliseNewUserData, validateNewUserData };
