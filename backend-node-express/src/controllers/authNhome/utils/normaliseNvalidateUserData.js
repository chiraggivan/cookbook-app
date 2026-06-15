function normaliseNewUserData(data) {
  const cleaned = {};

  // Helper function (like re.sub + strip + lower)
  const normaliseString = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

  // String fields
  const strFields = ["name", "email", "username", "password"];
  strFields.forEach((field) => {
    const value = data[field];
    if (typeof value === "string") {
      cleaned[field] = value; //normaliseString(value);
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
  console.log("password :", password);
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(password)
  ) {
    return "Invalid password: min 8 characters and max 50, 1 uppercase, 1 lowercase and 1 number and not have anthing else than a-z and 0-9";
  }

  return null; // no errors
}

module.exports = { normaliseNewUserData, validateNewUserData };
