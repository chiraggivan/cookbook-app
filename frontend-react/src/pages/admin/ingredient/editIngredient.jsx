import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Input from "../../../components/input";
import Textarea from "../../../components/textarea";
import Button from "../../../components/button";
import Dropdown from "../../../components/dropdown";
import submitButtonForEdit from "./utils/submitButtonForEdit";
import { mainUnits, cupUnits } from "../../../utils/ingredientConstant";
import Navbar from "../../../components/navbarOld";
import EditIngPage from "./-editIngredientPage";
import { serverURL } from "../../../utils/appUtils";
import AdminTopBar from "../../../components/adminTopBar";

function EditIngredient() {
  const role = JSON.parse(localStorage.getItem("user")).role;
  const navigate = useNavigate();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const [ingData, setIngData] = useState({});
  const [orgData, setOrgData] = useState({});
  const { id } = useParams();
  const [ingName, setIngName] = useState("");
  const [selectedMainUnit, setSelectedMainUnit] = useState("");
  const [selectedCupUnit, setSelectedCupUnit] = useState("");
  const [existIngs, setExistIngs] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitResult, setSubmitResult] = useState(null);
  const sendData = {};
  const [updateBtn, setUpdateBtn] = useState(true);
  const [refQ, setRefQ] = useState(1);

  // const [FSuccess, setFSuccess] = useState(false);
  // const [FMessage, setFMessage] = useState("");
  // const [FData, setFData] = useState({});
  // const [FError, setFError] = useState("");

  // const mainUnits = ["kg", "g", "oz", "lbs", "l", "ml", "fl.oz", "pint", "pc", "bunch"];
  // const cupUnits = ["kg", "g", "oz", "lbs"];

  //--------------- Redirect effect  ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);
  // For this page role should be Admin
  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate(`/login?expired=true&msg=${"Not authorised. login with admin credientials"}`);
  }

  // console.log("ingData :", ingData);
  // ------ get data from backend for ing to be edited with the help of useFetch Hook ----
  const method = "get";
  const url = `${serverURL}/ingredient/api/${id}`;
  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  //------------------------------------ initialise data -------------------------------------
  useEffect(() => {
    if (data) {
      const d = data[0];
      setOrgData(d);
      setIngData(d);
      setSelectedMainUnit(d?.base_unit);
      setSelectedCupUnit(d?.cup_unit);
      // setOrgData((pre) => ({
      //   ...pre,
      //   // ref_quantity: 1,
      // }));
      // setIngData((pre) => ({
      //   ...pre,
      //   // ref_quantity: 1,
      // }));
    }
  }, [data]);

  //------------ hook to get list of similar ing names  ----------------------------------
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

    // clear the timeout if the component unmounts or before the next effect
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ingName]);

  // ----------------------- function to check the change in fields ----------------------
  const handleChange = (field, value) => {
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
  };

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

  // ---------------------- submit button function  ---------------------------------------
  const handlesubmit = async () => {
    const checkData = { ...ingData };
    checkData.errors = {};
    let isValid = true;
    let isErrMsg; // --> used to check if specialised error message to be shown
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
    if (checkData.cup_weight || checkData.cup_unit) {
      if (!checkData.cup_weight || checkData.cup_weight <= 0) {
        isValid = false;
        isErrMsg = `Weight required and  should be positive number If cup unit selected`;
      }
      if (!checkData.cup_unit || !cupUnits.includes(checkData.cup_unit)) {
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

    sendData.name = ingName ? ingName : ingData.name;
    sendData.reference_quantity = Number(checkData.display_quantity);
    sendData.reference_unit = ingData.base_unit;
    sendData.default_price = Number(ingData.default_price);
    sendData.cup_equivalent_weight = Number(ingData.cup_weight);
    sendData.cup_equivalent_unit = ingData.cup_unit;
    sendData.display_quantity = ingData.display_quantity;
    sendData.display_unit = ingData.display_unit;
    sendData.display_price = Number(ingData.display_price);
    sendData.notes = ingData.notes;

    const body = sendData;

    console.log("data about to be sent :", body);
    return;

    const method = "put";
    const url = `${serverURL}/ingredient/api/edit/${id}`;
    try {
      const res = await axios[method](url, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("response is :", res);
      alert("Ingredient updated successfully");
      navigate("/admin/ingredients/all");
    } catch (err) {
      console.log("Error found in createIngredient while creating :", err.response?.data);
      setErrorMessage(err.response?.data.message);
    }
  };

  //-------------XXXXXX----- submit button function (currently not used) -----XXXXXXX-------------------------
  const handlesubmit1 = () =>
    submitButtonForEdit(ingData, mainUnits, cupUnits, ingName).then((result) => {
      setFSuccess(result.success);
      setFMessage(result.message);
      setFData(result.data);
      setFError(result.error);
    });

  // ---------------- active/deactivate update button based on data change or same ----------
  useEffect(() => {
    const json1 = JSON.stringify(ingData);
    const json2 = JSON.stringify(orgData);

    if (json1 === json2) {
      setUpdateBtn(true);
    } else {
      setUpdateBtn(false);
    }
  }, [ingData]);

  // console.log("ingData :", ingData);
  return (
    <>
      <AdminTopBar />
      {/* <Navbar /> */}
      <EditIngPage
        ingData={ingData}
        handleChange={handleChange}
        setIngName={setIngName}
        selectedMainUnit={selectedMainUnit}
        setSelectedMainUnit={setSelectedMainUnit}
        selectedCupUnit={selectedCupUnit}
        setSelectedCupUnit={setSelectedCupUnit}
        validateInput={validateInput}
        validateNumber={validateNumber}
        existIngs={existIngs}
        updateBtn={updateBtn}
        handlesubmit={handlesubmit}
        errorMessage={errorMessage}
        navigate={navigate}
      />
    </>
  );
}

export default EditIngredient;
