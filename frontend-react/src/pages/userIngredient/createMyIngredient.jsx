import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Input from "../../components/input";
// import Textarea from "../../components/textarea";
// import Button from "../../components/button";
import Dropdown from "../../components/dropdown";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
// import Navbar from "../../components/navbarOld";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { serverURL } from "../../utils/appUtils";
import { Select, TextInput, Textarea, Button } from "flowbite-react";
import ConfirmModal from "../../components/confirmModal";
import { HiTrash } from "react-icons/hi";
import CreateUpdateMyIngredientPage from "./createUpdateMyIngredientPage";

function AddIngredient() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ingData, setIngData] = useState({});
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [createBtn, setCreateBtn] = useState(true);
  const sendData = {};
  const { myIngredients, setMyIngredients } = useContext(MyIngredientContext);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const mode = "create";

  //------------------------------- Redirect effect ---------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------------------- function to check the change in fields value --------------------
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    const value = ingData[field] ? ingData[field] : "";

    setIngData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  }

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
            `${serverURL}/useringredient/api/searchCombinedIngs?q=${ingData.name}`,
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
        checkData.errors.cup_weight = `Cup Weight required - If Cup Unit selected`;
      }
      if (!checkData.cup_unit || !cupUnits.includes(checkData.cup_unit)) {
        isValid = false;
        checkData.errors.cup_unit = `Cup Weight given - Cup Unit required`;
      }
    }

    setIngData(checkData);
    if (!isValid) {
      console.log("isValid :", isValid);
      console.log("Error found while checking during submit", checkData);
      return;
    }

    sendData.name = ingData.name;
    sendData.quantity = Number(ingData.display_quantity);
    sendData.unit = ingData.display_unit;
    sendData.price = Number(ingData.display_price);
    sendData.cup_weight = ingData.cup_weight ? Number(ingData.cup_weight) : null;
    sendData.cup_unit = ingData.cup_unit ?? "";
    sendData.notes = ingData.notes ?? "";

    const body = sendData;

    // console.log("data about to be sent :", body);
    // return;

    const method = "post";
    const url = `${serverURL}/useringredient/api/create`;
    try {
      const res = await axios[method](url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      alert(res.data.message);
      const updatedIngredients = [...myIngredients, res?.data?.data];
      // console.log("updatedIngredients", updatedIngredients);
      updatedIngredients.sort((a, b) => b.user_ingredient_id - a.user_ingredient_id);
      setMyIngredients(updatedIngredients);
      navigate("/myIngredients");
    } catch (err) {
      console.log("Error found in createMyIngredient while creating :", err.response);
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
    <CreateUpdateMyIngredientPage
      mode={mode}
      ingData={ingData}
      handleChange={handleChange}
      validateInput={validateInput}
      validateNumber={validateNumber}
      setIngData={setIngData}
      errorMessage={errorMessage}
      existIngs={existIngs}
      // updateBtn={updateBtn}
      handlesubmit={handlesubmit}
      setIsConfirmModalOpen={setIsConfirmModalOpen}
      isConfirmModalOpen={isConfirmModalOpen}
      navigate={navigate}
      // handleDelete={handleDelete}
    />
  );
}

export default AddIngredient;
