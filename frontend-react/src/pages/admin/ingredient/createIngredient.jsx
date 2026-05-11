import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Input from "../../../components/input";
import Textarea from "../../../components/textarea";
import Button from "../../../components/button";

function AddNewIngredient() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const [ingData, setIngData] = useState({});
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user")).role;

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated) && role !== "admin") {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // function to check the change in fields
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //   submit button function
  const handlesubmit = async () => {
    const checkData = { ...ingData };
    console.log("checkData :", checkData);
    checkData.errors = {};
    let isValid = true;
    console.log("isValid before any checks:", isValid);

    const checkUnits = ["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"];
    const cupUnits = ["kg", "g", "oz", "lbs"];

    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      checkData.errors.name = "Name required";
    }
    if (!checkData.reference_quantity || checkData.reference_quantity <= 0) {
      isValid = false;
      checkData.errors.reference_quantity = "Quantity can't be empty. Should be positive number";
    }
    if (!checkData.default_price || checkData.default_price <= 0) {
      isValid = false;
      checkData.errors.default_price = "Price can't be empty. Should be positive number";
    }
    console.log("checkData.reference_unit: ", checkData.reference_unit);
    console.log("checkData.reference_unit.trim: ", checkData.reference_unit.trim() === "");
    console.log(
      "checkUnits.includes(checkData.unit):",
      checkUnits.includes(checkData.reference_unit),
    );
    if (!checkData.reference_unit || !checkUnits.includes(checkData.reference_unit)) {
      isValid = false;
      checkData.errors.unit = `Unit required and should be one of these : ["kg","g","oz","lbs","l","ml","fl.oz","pint","pc","bunch",]`;
    }
    if (checkData.cup_equivalent_weight || checkData.cup_equivalent_unit) {
      if (!checkData.cup_equivalent_weight || checkData.cup_equivalent_weight <= 0) {
        isValid = false;
        checkData.errors.cup_equivalent_weight = `Weight required and  should be positive number If cup unit select`;
      }
      if (!checkData.cup_equivalent_unit || !cupUnits.includes(checkData.cup_equivalent_unit)) {
        isValid = false;
        checkData.errors.cup_equivalent_unit = `Cup weight given - Unit required and should be one of these : ["kg","g","oz","lbs"]`;
      }
    }

    setIngData(checkData);
    console.log("isValid data:", isValid);
    if (!isValid) {
      console.log("Error found while checking during submit", checkData);
      return;
    }
    console.log("About to call backend");
    const method = "post";
    const url = `http://localhost:5001/ingredient/api/new`;
    const body = ingData;

    try {
      const res = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response is :", res);
    } catch (err) {
      console.log("Error found in createIngredient :", err.response?.data);
    }
  };

  //   if (loading) {
  //     return <h1> Page Loading .............</h1>;
  //   }
  console.log("ingData before return html : ", ingData);
  return (
    <>
      <h1>Add new Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        onChange={(e) => handleChange("name", e.target.value)}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        onChange={(e) => handleChange("reference_quantity", Number(e.target.value))}
        error={ingData?.errors?.reference_quantity}
      />
      <Input
        label={"Unit :"}
        type={"text"}
        onChange={(e) => handleChange("reference_unit", e.target.value)}
        error={ingData?.errors?.reference_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        placeholder={"0.00"}
        onChange={(e) => handleChange("default_price", Number(e.target.value))}
        error={ingData?.errors?.default_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        onChange={(e) => handleChange("cup_equivalent_weight", Number(e.target.value))}
        error={ingData?.errors?.cup_equivalent_weight}
      />

      <Input
        label={"Cup unit :"}
        type={"text"}
        onChange={(e) => handleChange("cup_equivalent_unit", e.target.value)}
        error={ingData?.errors?.cup_equivalent_unit}
      />

      <Textarea
        label={"Notes :"}
        placeholder=""
        rows={4}
        onChange={(e) => handleChange("notes", e.target.value)}
        error={ingData?.errors?.notes}
      />
      <Textarea label={"Existing Ingredients :"} placeholder="" rows={4} />

      <Button children={"Create"} type="button" onClick={() => handlesubmit()} />
    </>
  );
}

export default AddNewIngredient;
