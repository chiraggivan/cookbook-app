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
import Navbar from "../../../components/navbar";
import CreateIngPage from "./-createIngredientPage";

function AddNewIngredient() {
  const { token, loading, isAuthenticated } = useAuth();
  const [ingData, setIngData] = useState({});
  const [ingName, setIngName] = useState("");
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
            `http://localhost:5001/ingredient/api/search/ingredients?q=${ingName}`,
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

  // ----------------- submit button function -------------------------  ------------
  const handlesubmit = async () => {
    const checkData = { ...ingData };
    checkData.errors = {};
    let isValid = true;
    setErrorMessage("");

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
    if (!checkData.reference_unit || !mainUnits.includes(checkData.reference_unit)) {
      isValid = false;
      checkData.errors.reference_unit = `Unit required and should be one of these : ${mainUnits}`;
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
      console.log("Error found in createIngredient while creating :", err.response?.data);
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
      <Navbar />
      <CreateIngPage
        ingName={ingName}
        ingData={ingData}
        handleChange={handleChange}
        setIngName={setIngName}
        selectedMainUnit={selectedMainUnit}
        setSelectedMainUnit={setSelectedMainUnit}
        selectedCupUnit={selectedCupUnit}
        setSelectedCupUnit={setSelectedCupUnit}
        existIngs={existIngs}
        createBtn={createBtn}
        errorMessage={errorMessage}
        handlesubmit={handlesubmit}
        navigate={navigate}
      />
    </>
  );
}

export default AddNewIngredient;
