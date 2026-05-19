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
import Navbar from "../../../components/navbar";
import EditIngPage from "./-editIngredientPage";
import { serverURL } from "../../../utils/appUtils";

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

  // ----------------------- function to check the change in fields ----------------------
  const handleChange = (field, value) => {
    setIngData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ------ get data from backend for ing to be edited with the help of useFetch Hook ----
  const method = "get";
  const url = `${serverURL}/ingredient/api/${id}`;
  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  // hook to initialise data
  useEffect(() => {
    if (data) {
      const d = data[0];
      setOrgData(d);
      setIngData(d);
      setSelectedMainUnit(d?.base_unit);
      setSelectedCupUnit(d?.cup_unit);
      setOrgData((pre) => ({
        ...pre,
        ref_quantity: 1,
      }));
      setIngData((pre) => ({
        ...pre,
        ref_quantity: 1,
      }));
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

  // ---------------------- submit button function  ---------------------------------------
  const handlesubmit = async () => {
    const checkData = { ...ingData };
    checkData.errors = {};
    let isValid = true;
    setErrorMessage("");

    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      checkData.errors.name = "Name required";
    }
    if (!refQ || refQ <= 0) {
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

    setIngData(checkData);
    if (!isValid) {
      console.log("Error found while checking during submit", checkData);
      return;
    }

    sendData.name = ingName ? ingName : ingData.name;
    sendData.reference_quantity = Number(refQ);
    sendData.reference_unit = ingData.base_unit;
    sendData.default_price = Number(ingData.default_price);
    sendData.cup_equivalent_weight = Number(ingData.cup_weight);
    sendData.cup_equivalent_unit = ingData.cup_unit;
    sendData.notes = ingData.notes;

    const body = sendData;

    console.log("data about to be sent :", body);
    // return;

    const method = "put";
    const url = `${serverURL}/ingredient/api/edit/${id}`;
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

  //----------------- submit button function (currently not used) -------------------------
  const handlesubmit1 = () =>
    submitButtonForEdit(ingData, refQ, mainUnits, cupUnits, ingName).then((result) => {
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

  return (
    <>
      <Navbar />
      <EditIngPage
        ingData={ingData}
        handleChange={handleChange}
        setIngName={setIngName}
        refQ={refQ}
        setRefQ={setRefQ}
        selectedMainUnit={selectedMainUnit}
        setSelectedMainUnit={setSelectedMainUnit}
        selectedCupUnit={selectedCupUnit}
        setSelectedCupUnit={setSelectedCupUnit}
        existIngs={existIngs}
        updateBtn={updateBtn}
        handlesubmit={handlesubmit}
        errorMessage={errorMessage}
        navigate={navigate}
      />
      {/* <h1>Edit Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        value={ingData?.name ? ingData?.name : ""}
        onChange={(e) => {
          handleChange("name", e.target.value);
          setIngName(e.target.value);
        }}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        value={refQ}
        onChange={(e) => {
          setRefQ(e.target.value);
          handleChange("ref_quantity", Number(e.target.value));
        }}
        error={ingData?.errors?.reference_quantity}
      />
      <Dropdown
        title={"Unit :"}
        options={mainUnits}
        value={selectedMainUnit ? selectedMainUnit : ""}
        onChange={(e) => {
          handleChange("base_unit", e.target.value);
          setSelectedMainUnit(e.target.value);
        }}
        error={ingData?.errors?.reference_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        value={ingData?.default_price ? ingData?.default_price : 0}
        placeholder={"0.00"}
        onChange={(e) => handleChange("default_price", Number(e.target.value))}
        error={ingData?.errors?.default_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        value={ingData?.cup_weight ? ingData?.cup_weight : ""}
        onChange={(e) => handleChange("cup_weight", Number(e.target.value))}
        error={ingData?.errors?.cup_equivalent_weight}
      />
      <Dropdown
        title={"Cup Unit :"}
        options={cupUnits}
        value={selectedCupUnit ? selectedCupUnit : ""}
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
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} */}
    </>
  );
}

export default EditIngredient;
