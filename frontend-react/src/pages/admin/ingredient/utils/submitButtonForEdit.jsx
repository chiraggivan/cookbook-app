function SubmitButton(ingData, mainUnits, cupUnits, ingName) {
  const checkData = { ...ingData };
  const sendData = {};
  checkData.errors = {};
  let isValid = true;
  // setErrorMessage("");

  if (!checkData.name || checkData.name.trim() === "") {
    isValid = false;
    checkData.errors.name = "Name required";
  }
  if (!checkData.display_quantity || checkData.display_quantity <= 0) {
    isValid = false;
    checkData.errors.reference_quantity = "Quantity can't be empty. Should be positive number";
  }
  if (!checkData.default_price || checkData.default_price <= 0) {
    isValid = false;
    checkData.errors.default_price = "Price can't be empty. Should be positive number";
  }
  if (!checkData.base_unit || !mainUnits.includes(checkData.base_unit)) {
    isValid = false;
    checkData.errors.base_unit = `Unit required and should be one of these : ${mainUnits}`;
  }
  if (checkData.cup_weight || checkData.cup_unit) {
    if (!checkData.cup_weight || checkData.cup_weight <= 0) {
      isValid = false;
      checkData.errors.cup_weight = `Weight required and  should be positive number If cup unit select`;
    }
    if (!checkData.cup_unit || !cupUnits.includes(checkData.cup_unit)) {
      isValid = false;
      checkData.errors.cup_unit = `Cup weight given - Unit required and should be one of these : ["kg","g","oz","lbs"]`;
    }
  }

  console.log(" inside function and is valid is :", isValid);
  if (!isValid) {
    console.log("Error found while checking during submit", checkData);
    return {
      success: false,
      message: "Something went wrong. check data",
      data: checkData,
      error: "Error found while checking during submit",
    };
  }

  sendData.name = ingName ? ingName : ingData.name;
  sendData.reference_quantity = Number(checkData.display_quantity);
  sendData.reference_unit = ingData.base_unit;
  sendData.default_price = Number(ingData.default_price);
  sendData.cup_equivalent_weight = Number(ingData.cup_weight);
  sendData.cup_equivalent_unit = ingData.cup_unit;
  sendData.notes = ingData.notes;

  const body = sendData;

  console.log("data about to be sent :", body);
  return {
    success: true,
    message: "Everything done now about to update by calling api",
    data: sendData,
    error: null,
  };

  const method = "put";
  const url = `http://localhost:5001/ingredient/api/edit/${id}`;
  const func = async () => {
    try {
      const res = await axios[method](url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response is :", res);
    } catch (err) {
      console.log("Error found in createIngredient while creating :", err.response?.data);
      setErrorMessage(err.response?.data.message);
    }
  };

  func();
}

export default SubmitButton;
