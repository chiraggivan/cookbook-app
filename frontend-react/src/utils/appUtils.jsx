const serverURL = "http://localhost:5001";

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

// ------------------------ function to validate INPUT for number Allowing [0123456789.] ----------------------
function validateInput(field, value, maxDecimals, maxLength) {
  // Define a regex for one optional decimal with up to maxDecimals digits
  const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);

  // Check the length
  if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
    // dis allow continous zeros
    if (ingData[field] === "0" && value === "00") {
      return;
    }
    // update ingData value
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
}
export { serverURL, getInitials, capitaliseWords, validateInput };
