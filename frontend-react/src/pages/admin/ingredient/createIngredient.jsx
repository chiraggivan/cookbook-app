import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Input from "../../../components/input";
import Textarea from "../../../components/textarea";
import Button from "../../../components/button";
import Dropdown from "../../../components/dropdown";
import { mainUnits, cupUnits } from "../../../utils/ingredientConstant";
import Navbar from "../../../components/navbarOld";
import CreateIngPage from "./-createIngredientPage";
import { serverURL } from "../../../utils/appUtils";
import AdminTopBar from "../../../components/adminTopBar";

function AddNewIngredient() {
  const { token, loading, isAuthenticated } = useAuth();
  const [ingData, setIngData] = useState({});
  const [ingName, setIngName] = useState("");
  const [ingForm, setIngForm] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [createBtn, setCreateBtn] = useState(false); // <-- change to true if using activate/deactivate button option
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user")).role;

  // const mainUnits = ["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"];
  // const cupUnits = ["kg", "g", "oz", "lbs"];

  // -------------------------- Redirect effect -------------------------------------
  useEffect(() => {
    if (!loading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [loading, token, isAuthenticated, navigate]);
  // if role is NOT admin then redirect
  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate(`/login?expired=true&msg=${"Not authorised. login with admin credientials"}`);
  }

  // ----------------------- function to check the change in fields ---------------------
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  //------- search all the ingredient with similar name to help admin not create same name ingredient ------
  const timeoutRef = useRef(null);
  useEffect(() => {
    if (!token) {
      return;
    }
    // check if previous timeout reference is active
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // up date any error if generated
    setErrorMessage("");

    timeoutRef.current = setTimeout(() => {
      const checkIng = async () => {
        try {
          const res = await axios.get(
            `${serverURL}/ingredient/api/search/ingredients?q=${ingName}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          // console.log("ingredients found are : ", res.data);
          const ingList = res.data.data.map((i) => i.name);
          const names = ingList.join("\n");
          setExistIngs(names);
        } catch (err) {
          console.log("error in createIng.jsx while ing search :", err.response.data);
        }
      };
      checkIng();
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear the timeout if the component unmounts or before the next effect
      }
    };
  }, [ingName]);

  // ------------------------ function to validate INPUT for number Allowing [0123456789.] ----------------------
  function validateInput(field, value, maxDecimals, maxLength) {
    // Define a regex for one optional decimal with up to maxDecimals digits
    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);

    // const errorField = "error" + capitaliseWords(field.slice(0, 1)) + field.slice(1);

    // Check the length
    if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
      // get the input field
      const inputField = ingData[field];
      // console.log("input field value is :", inputField);

      // dis allow continous zeros
      if (inputField === "0" && value === "00") {
        return;
      }
      // update ingData value
      if (ingData?.errors) {
        setIngData((prev) => ({
          ...prev,
          [field]: value,
          errors: { ...prev.errors, [field]: "" },
        }));
      } else {
        setIngData((prev) => ({ ...prev, [field]: value }));
      }
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

  // ----------------- submit button function -------------------------  ------------
  const handlesubmit = async () => {
    const checkData = { ...ingData };

    checkData.errors = {};
    let isValid = true;
    let isErrMsg = ""; // --> used to check if specialised error message to be shown
    setErrorMessage("");

    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      checkData.errors.name = "Name required";
    }
    if (!checkData.display_quantity || checkData.display_quantity <= 0) {
      isValid = false;
      checkData.errors.display_quantity = "Require";
    }
    if (!checkData.display_price || checkData.display_price <= 0) {
      isValid = false;
      checkData.errors.display_price = "Require";
    }
    if (!checkData.display_unit || !mainUnits.includes(checkData.display_unit)) {
      isValid = false;
      checkData.errors.display_unit = `Require`;
    }
    if (checkData.cup_equivalent_weight || checkData.cup_equivalent_unit) {
      if (!checkData.cup_equivalent_weight || checkData.cup_equivalent_weight <= 0) {
        isValid = false;
        isErrMsg = `Weight required and  should be positive number If cup unit selected`;
      }
      if (!checkData.cup_equivalent_unit || !cupUnits.includes(checkData.cup_equivalent_unit)) {
        isValid = false;
        isErrMsg = `Cup weight given - Cup Unit required`;
      }
    }

    setIngData(checkData);
    if (!isValid) {
      if (isErrMsg) {
        setErrorMessage(isErrMsg);
      } else {
        setErrorMessage("Errors found above.");
      }
      return;
    }

    // remove 'errors' property before sending to backend
    const { errors, ...finalData } = ingData;
    // console.log("About to call backend with :", finalData);

    // return;
    const method = "post";
    const url = `${serverURL}/ingredient/api/new`;
    const body = finalData;

    try {
      const res = await axios[method](url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("response is :", res);
      navigate("/admin/ingredients/all");
    } catch (err) {
      // console.log("Error found in createIngredient while creating :", err.response?.data?.message);
      setErrorMessage(err.response?.data.message);
    }
  };

  //---------- active/deactivate create button based on data change or same--------------
  // useEffect(() => {
  //   if (!ingName || !ingData.reference_quantity || !selectedMainUnit || !ingData.default_price) {
  //     setCreateBtn(true);
  //   } else {
  //     setCreateBtn(false);
  //   }
  // }, [ingData]);

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("ingData before return html : ", ingData);
  return (
    <>
      {/* <Navbar /> */}
      <AdminTopBar />
      <CreateIngPage
        ingData={ingData}
        handleChange={handleChange}
        ingName={ingName}
        setIngName={setIngName}
        ingForm={ingForm}
        setIngForm={setIngForm}
        selectedMainUnit={selectedMainUnit}
        setSelectedMainUnit={setSelectedMainUnit}
        selectedCupUnit={selectedCupUnit}
        setSelectedCupUnit={setSelectedCupUnit}
        existIngs={existIngs}
        createBtn={createBtn}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        handlesubmit={handlesubmit}
        navigate={navigate}
        validateInput={validateInput}
        validateNumber={validateNumber}
      />
    </>
  );
}

export default AddNewIngredient;
