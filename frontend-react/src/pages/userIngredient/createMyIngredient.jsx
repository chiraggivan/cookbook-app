import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Input from "../../components/input";
import Textarea from "../../components/textarea";
import Button from "../../components/button";
import Dropdown from "../../components/dropdown";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
import Navbar from "../../components/navbar";

function AddIngredient() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ingData, setIngData] = useState({});
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [createBtn, setCreateBtn] = useState(true);
  const sendData = {};

  const [errorMessage, setErrorMessage] = useState("");

  //------------------------------- Redirect effect ---------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------------------- function to check the change in fields --------------------
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------- hook to initialise data ------------------------------
  useEffect(() => {
    if (ingData) {
      setSelectedMainUnit(ingData.display_unit);
      setSelectedCupUnit(ingData.cup_unit);
    }
  }, [ingData.display_unit, ingData.cup_unit]);

  //------------------- hook to get list of similar ing names  -----------------------
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
          setExistIngs("");
          console.log("error in createMyIng.jsx while ing search :", err.response);
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

  // ---------------------------- submit button function ------------------------------
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

    const body = sendData;

    console.log("data about to be sent :", body);
    return;

    const method = "post";
    const url = `http://localhost:5001/useringredient/api/create`;
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
      console.log("Error found in createMyIngredient while creating :", err.response?.data);
      setErrorMessage(err.response?.data.message);
    }
  };

  //---------- active/deactivate create button based on data change or same--------------
  useEffect(() => {
    if (
      !ingData.name ||
      !ingData.display_quantity ||
      !ingData.display_unit ||
      !ingData.display_price
    ) {
      setCreateBtn(true);
    } else {
      setCreateBtn(false);
    }
  }, [ingData]);

  return (
    <>
      <Navbar />
      <h1>Add new User Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        value={ingData.name ?? ""}
        onChange={(e) => {
          handleChange("name", e.target.value);
        }}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        placeholder={""}
        // value={ingData.display_quantity ?? ""}
        onChange={(e) => handleChange("display_quantity", Number(e.target.value))}
        error={ingData?.errors?.display_quantity}
      />
      <Dropdown
        title={"Unit :"}
        options={mainUnits}
        value={selectedMainUnit}
        onChange={(e) => {
          handleChange("display_unit", e.target.value);
          setSelectedMainUnit(e.target.value);
        }}
        error={ingData?.errors?.display_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        placeholder={"0.00"}
        onChange={(e) => handleChange("display_price", Number(e.target.value))}
        error={ingData?.errors?.display_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        onChange={(e) => handleChange("cup_weight", Number(e.target.value))}
        error={ingData?.errors?.cup_weight}
      />
      <Dropdown
        title={"Cup Unit :"}
        options={cupUnits}
        value={selectedCupUnit}
        onChange={(e) => {
          handleChange("cup_unit", e.target.value);
          setSelectedCupUnit(e.target.value);
        }}
        error={ingData?.errors?.cup_unit}
      />

      <Textarea
        label={"Notes :"}
        placeholder=""
        rows={4}
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
        children={"Create"}
        type="button"
        disabled={createBtn}
        onClick={() => handlesubmit()}
      />
      <Button children={`Cancel`} onClick={() => navigate(-1)} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default AddIngredient;
