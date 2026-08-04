// const serverURL = "http://localhost:5001";
const serverURL = import.meta.env.VITE_API_URL;
// console.log("serverURL :", serverURL);
const JWTunverifiedMsg = "Invalid or Expired token from: authenticate Token"; // to check on every page if token is invalid from middleware
const showTokenErrMsgOnScreen = "Login expired";

// get the intials (mostly username) in Upper case for alternative to image of user
const getInitials = (name) => {
  if (!name) return "";
  const nameArray = name.split(" ");
  if (nameArray.length === 1) {
    return nameArray[0].slice(0, 2).toUpperCase();
  } else {
    const initials = nameArray[0].charAt(0) + nameArray[1].charAt(0);
    return initials.toUpperCase();
  }
};

//  get  capitalise first char of every word
function capitaliseWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ------------------------ function to validate Text INPUT for number Allowing [0123456789.] ----------------------
function validateInputNumber(ogData, field, value, maxDecimals, maxLength) {
  // Define a regex for one optional decimal with up to maxDecimals digits
  const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);

  // Check the length
  if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
    // dis allow continous zeros
    if (ogData[field] === "0" && value === "00") {
      return ogData[field];
    }
    // // update ingData value
    // setData((prev) => ({
    //   ...prev,
    //   [field]: value,
    // }));
    return value;
  }
  return ogData[field];
}

// ------------------------ function to validate Text INPUT for number Allowing [0123456789.] ----------------------
function validateInput(ogData, field, value, maxDecimals, maxLength) {
  // Define a regex for one optional decimal with up to maxDecimals digits
  const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);

  // Check the length
  if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
    // dis allow continous zeros
    if (ogData[field] === "0" && value === "00") {
      return ogData[field];
    }
    // // update ingData value
    // setData((prev) => ({
    //   ...prev,
    //   [field]: value,
    // }));
    return value;
  }
  return ogData[field];
}

// ------------------- function to check onBlur input values and convert if number not in proper format -------------------
function confirmInputNumber(ogData, field) {
  if (ogData[field] === "null") {
    ogData[field] = "";
  }
  const value = ogData[field] ?? "";
  return value;
}

export {
  serverURL,
  JWTunverifiedMsg,
  showTokenErrMsgOnScreen,
  getInitials,
  capitaliseWords,
  validateInput,
  validateInputNumber,
  confirmInputNumber,
};
