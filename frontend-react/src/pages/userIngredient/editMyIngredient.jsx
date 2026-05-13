import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Input from "../../components/input";
import Dropdown from "../../components/dropdown";
import Textarea from "../../components/textarea";
import Button from "../../components/button";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
import Navbar from "../../components/navbar";

function EditIngredient() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orgData = state?.data;
  const [ingData, setIngData] = useState(state?.data);
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updateBtn, setUpdateBtn] = useState(true);
  const sendData = {};

  // if no state found in url then return
  if (!state?.data) {
    return <Navigate to="/" replace />;
  }

  const { token, loading: authHookLoading, isAuthenticated } = useAuth();

  //------------------  Redirect to home if token not found  ------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------------ function to check the change in fields  ----------------------
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ------------------------- hook to initialise data ---------------------------------
  useEffect(() => {
    if (ingData) {
      setSelectedMainUnit(ingData.display_unit);
      setSelectedCupUnit(ingData.cup_unit);
    }
  }, [ingData.display_unit, ingData.cup_unit]);

  // ----------------- hook to get list of similar ing names -------------------------------
  // Ref to keep track of timeout ID
  const timeoutRef = useRef(null);
  useEffect(() => {
    // check if token available for api
    if (!token) {
      return;
    }
    // check if previous timeout reference is active
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // up date any error if generated
    setErrorMessage("");

    // set new timeout for the delay

    timeoutRef.current = setTimeout(() => {
      const checkIng = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5001/useringredient/api/searchCombinedIngs?q=${ingData.name}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          // console.log("ingredients found are : ", res.data);
          const ingList = res.data.data.map((i) => i.name);
          const names = ingList.join("\n");
          setExistIngs(names);
        } catch (err) {
          console.log("error in editMyIng.jsx while ing search :", err.response);
        }
      };

      checkIng();
    }, 500);

    // clear the timeout if the component unmounts or before the next effect
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ingData.name]);

  //------------------------- submit button function ------------------------------
  const handlesubmit = async () => {
    const checkData = { ...ingData };
    checkData.errors = {};
    let isValid = true;
    setErrorMessage("");

    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      checkData.errors.name = "Name required";
    }
    if (!checkData.display_quantity || checkData.display_quantity <= 0) {
      isValid = false;
      checkData.errors.display_quantity = "Quantity can't be empty. Should be positive number";
    }
    if (!checkData.display_price || checkData.display_price <= 0) {
      isValid = false;
      checkData.errors.display_price = "Price can't be empty. Should be positive number";
    }
    if (!checkData.display_unit || !mainUnits.includes(checkData.display_unit)) {
      isValid = false;
      checkData.errors.display_unit = `Unit required and should be one of these : ${mainUnits}`;
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

    setIngData(checkData);
    if (!isValid) {
      console.log("isValid :", isValid);
      console.log("Error found while checking during submit", checkData);
      return;
    }

    sendData.name = ingData.name;
    sendData.display_quantity = Number(ingData.display_quantity);
    sendData.display_unit = ingData.display_unit;
    sendData.display_price = Number(ingData.display_price);
    sendData.cup_weight = Number(ingData.cup_weight);
    sendData.cup_unit = ingData.cup_unit;
    sendData.notes = ingData.notes;
    sendData.user_ingredient_id = ingData.user_ingredient_id;

    const body = sendData;

    console.log("data about to be sent :", body);
    console.log("original data: ", orgData);
    return;

    const method = "put";
    const url = `http://localhost:5001/ingredient/api/edit/${id}`;
    try {
      const res = await axios[method](url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response is :", res);
      alert(res.data.message);
      navigate("/admin/ingredients/all");
    } catch (err) {
      console.log("Error found in createIngredient while creating :", err.response?.data);
      setErrorMessage(err.response?.data.message);
    }
  };

  // ----------- active/deactivate update button based on data change or same---------------
  useEffect(() => {
    const json1 = JSON.stringify(ingData);
    const json2 = JSON.stringify(orgData);

    if (json1 === json2) {
      // console.log("The objects are the same.");
      setUpdateBtn(true);
    } else {
      // console.log("The objects are different.");
      setUpdateBtn(false);
    }
  }, [ingData]);
  return (
    <>
      <Navbar />
      <h1>Edit Users Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        value={ingData?.name ? ingData?.name : ""}
        onChange={(e) => {
          handleChange("name", e.target.value);
          // setIngName(e.target.value);
        }}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        value={ingData?.display_quantity ? ingData?.display_quantity : ""}
        onChange={(e) => handleChange("display_quantity", Number(e.target.value))}
        error={ingData?.errors?.display_quantity}
      />
      <Dropdown
        title={"Unit :"}
        options={mainUnits}
        value={selectedMainUnit ? selectedMainUnit : ""}
        onChange={(e) => {
          handleChange("display_unit", e.target.value);
          setSelectedMainUnit(e.target.value);
        }}
        error={ingData?.errors?.display_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        value={ingData?.display_price ? ingData?.display_price : ""}
        placeholder={"0.00"}
        onChange={(e) => handleChange("display_price", Number(e.target.value))}
        error={ingData?.errors?.display_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        value={ingData?.cup_weight ?? ""}
        onChange={(e) =>
          handleChange("cup_weight", e.target.value === "" ? null : Number(e.target.value))
        }
        error={ingData?.errors?.cup_weight}
      />
      <Dropdown
        title={"Cup Unit :"}
        options={cupUnits}
        value={selectedCupUnit ?? ""}
        onChange={(e) => {
          handleChange("cup_unit", e.target.value === "" ? null : e.target.value);
          setSelectedCupUnit(e.target.value);
        }}
        error={ingData?.errors?.cup_unit}
      />

      <Textarea
        label={"Notes :"}
        placeholder=""
        rows={4}
        value={ingData?.notes ? ingData?.notes : ""}
        onChange={(e) => handleChange("notes", e.target.value)}
        error={ingData?.errors?.notes}
      />
      <Textarea
        title={"Existing Ingredients :"}
        value={existIngs}
        placeholder=""
        rows={4}
        readOnly
      />
      <Button
        children={"Update Ingredient"}
        type="button"
        disabled={updateBtn}
        onClick={handlesubmit}
      />
      <Button children={`Cancel`} onClick={() => navigate(-1)} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default EditIngredient;
