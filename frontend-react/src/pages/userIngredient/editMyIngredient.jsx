import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import api from "../../api/axios";
import useFetch from "../../hooks/useFetch";
// import Input from "../../components/input";
import Dropdown from "../../components/dropdown";
// import Textarea from "../../components/textarea";
// import Button from "../../components/button";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
// import Navbar from "../../components/navbarOld";
import OnDataChange from "../../utils/submitButtonActivation";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { Button, TextInput, Textarea, Select } from "flowbite-react";
import { FaWeightScale } from "react-icons/fa6";
import ConfirmModal from "../../components/confirmModal";
import { HiTrash } from "react-icons/hi";
import CreateUpdateMyIngredientPage from "./createUpdateMyIngredientPage";

function EditIngredient() {
  const { state } = useLocation();
  const id = state?.data?.user_ingredient_id;
  const user = JSON.parse(localStorage.getItem("user"));
  const currencySymbol = user.currency_symbol || "£";
  // console.log("user is :", user);
  const navigate = useNavigate();
  const orgData = state?.data;
  const [ingData, setIngData] = useState(state?.data);
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updateBtn, setUpdateBtn] = useState(true);
  const saveLocalData = {};
  const sendData = new URLSearchParams();
  const { myIngredients, setMyIngredients } = useContext(MyIngredientContext);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const mode = "edit"; // ---> used for process identifying in common page for update and create myIngredient
  // if no state found in url then return
  if (!state?.data) {
    return <Navigate to="/" replace />;
  }

  const { token, loading: authHookLoading, isAuthenticated } = useAuth();

  // --------- Converting all the numbers into string to make comparision of og and ingData easy --------------
  orgData.display_quantity = String(orgData.display_quantity);
  orgData.display_price = String(orgData.display_price);
  orgData.cup_weight = String(orgData.cup_weight);
  ingData.display_quantity = String(ingData.display_quantity);
  ingData.display_price = String(ingData.display_price);
  ingData.cup_weight = String(ingData.cup_weight);

  //------------------  Redirect to home if token not found  ------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------------ function to check the change in fields  ----------------------
  const handleChange = (field, value) => {
    // if (field === "display_price") {
    //   setIngData((prev) => ({
    //     ...prev,
    //     [field]: Number(value),
    //   }));
    // } else {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // }
  };

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

  // ------------------- function to check onBlur input values and convert if number not in proper format -------------------
  function validateNumber(field) {
    if (ingData[field] === "null") {
      ingData[field] = "";
    }
    const value = ingData[field] ? ingData[field] : "";
    setIngData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  }

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
    // check if previous timeout reference is active
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // up date any error if generated
    setErrorMessage("");

    // set new timeout for the delay text search
    timeoutRef.current = setTimeout(() => {
      const checkIng = async () => {
        if (ingData.name && token) {
          try {
            const res = await api.get(`/useringredient/api/searchCombinedIngs?q=${ingData.name}`);
            // console.log("ingredients found are : ", res.data);
            const ingList = res.data.data.map((i) => i.name);
            const names = ingList.join("\n");
            setExistIngs(names);
          } catch (err) {
            console.log("error in editMyIng.jsx while ing search :", err.response);
          }
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
    if (checkData.cup_weight === "null") {
      checkData.cup_weight = "";
    }
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
    if (Number(checkData.cup_weight) !== 0 || checkData.cup_unit) {
      if (!checkData.cup_weight || checkData.cup_weight <= 0) {
        isValid = false;
        checkData.errors.cup_weight = `Cup Weight required - If Cup Unit selected`;
      }
      if (!checkData.cup_unit || !cupUnits.includes(checkData.cup_unit)) {
        isValid = false;
        checkData.errors.cup_unit = `Cup weight given - Cup unit required`;
      }
    }

    setIngData(checkData);
    if (!isValid) {
      console.log("isValid :", isValid);
      console.log("Error found while checking during submit", checkData);
      return;
    }
    // console.log("user :", JSON.parse(user));
    saveLocalData.name = ingData.name;
    saveLocalData.display_quantity = Number(ingData.display_quantity);
    saveLocalData.display_unit = ingData.display_unit;
    saveLocalData.display_price = Number(ingData.display_price);
    saveLocalData.cup_weight = Number(ingData.cup_weight) ?? null;
    saveLocalData.cup_unit = ingData.cup_unit ?? "";
    saveLocalData.notes = ingData.notes;
    saveLocalData.user_ingredient_id = ingData.user_ingredient_id;
    // saveLocalData.user_id = user.user_id;

    sendData.append("name", ingData.name);
    sendData.append("quantity", Number(ingData.display_quantity));
    sendData.append("unit", ingData.display_unit);
    sendData.append("price", Number(ingData.display_price));
    sendData.append("cup_weight", ingData.cup_weight ? Number(ingData.cup_weight) : null);
    sendData.append("cup_unit", ingData.cup_unit ?? "");
    sendData.append("notes", ingData.notes ?? "");
    sendData.append("user_ing_id", ingData.user_ingredient_id);
    sendData.append("user_id", user.user_id);

    const formData = sendData;

    // console.log("data about to be sent :", formData);
    // return;

    const method = "put";
    const url = `/useringredient/api/edit`;
    try {
      const res = await api[method](url, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // console.log("response is :", res);
      alert(res.data.message);
      const x = myIngredients.filter(
        (i) => i.user_ingredient_id !== saveLocalData.user_ingredient_id,
      );
      x.push(saveLocalData);
      x.sort((a, b) => b.user_ingredient_id - a.user_ingredient_id);
      // setMyIngredients(x);
      navigate("/myIngredients");
    } catch (err) {
      console.log("Error found in EditMyIngredient while updating :", err.response);
      setErrorMessage(err.response?.data.message);
    }
  };

  // ------------------------ Delete Button Function -----------------------------------
  const handleDelete = async (e) => {
    e.preventDefault();

    // if (window.confirm(`Are you sure you want to delete this recipe - ${ingData.name}`)) {
    const deleteurl = `/useringredient/api/delete/${id}`;
    try {
      const res = await api.delete(deleteurl);
      // console.log("response after delete user ingredient is : ", res);
      if (res?.data?.success === true) {
        alert(res?.data?.message);
        const x = myIngredients.filter((i) => i.user_ingredient_id !== Number(id));
        // setMyIngredients(x);
        navigate("/MyIngredients");
        // console.log(res?.data?.message);
        return;
      } else {
        alert(res?.data?.message);
        console.log(res?.data?.message);
        return;
      }
    } catch (err) {
      console.log(err.response?.data?.message);
      alert(err.response?.data?.message);
      return;
    }
    // } else {
    //   console.log("cancelled");
    // }
  };

  // ----------- active/deactivate "update" button based on change in data ---------------
  useEffect(() => {
    // create new variable to remove errors from the ingData to compare with orgData
    const comparingData = { ...ingData };
    if (comparingData.cup_weight === "0" || comparingData.cup_weight === "null") {
      comparingData.cup_weight = "";
    }

    if (orgData.cup_weight === "0" || orgData.cup_weight === "null") {
      orgData.cup_weight = "";
    }
    delete comparingData.errors;

    const btnDisabled = OnDataChange(comparingData ?? {}, orgData ?? {});
    // console.log("The data of both are same :", btnDisabled);
    setUpdateBtn(btnDisabled);
  }, [ingData]);

  // console.log("my Ingredients are: ", myIngredients);
  // console.log("ingData :", ingData);
  // console.log("orgData :", orgData);
  return (
    <CreateUpdateMyIngredientPage
      mode={mode}
      ingData={ingData}
      handleChange={handleChange}
      validateInput={validateInput}
      validateNumber={validateNumber}
      setIngData={setIngData}
      errorMessage={errorMessage}
      existIngs={existIngs}
      updateBtn={updateBtn}
      handlesubmit={handlesubmit}
      setIsConfirmModalOpen={setIsConfirmModalOpen}
      isConfirmModalOpen={isConfirmModalOpen}
      handleDelete={handleDelete}
      navigate={navigate}
      currencySymbol={currencySymbol}
    />
  );
}

export default EditIngredient;
