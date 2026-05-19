import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Input from "../../components/input";
import Dropdown from "../../components/dropdown";
import Textarea from "../../components/textarea";
import Button from "../../components/button";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
import Navbar from "../../components/navbar";
import OnDataChange from "../../utils/submitButtonActivation";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { serverURL } from "../../utils/appUtils";

function EditIngredient() {
  const { state } = useLocation();
  const id = state?.data?.user_ingredient_id;
  const user = JSON.parse(localStorage.getItem("user"));
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

    // set new timeout for the delay text search
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

    console.log("data about to be sent :", formData);
    // return;

    const method = "put";
    const url = `${serverURL}/useringredient/api/edit`;
    try {
      const res = await axios[method](url, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("response is :", res);
      alert(res.data.message);
      const x = myIngredients.filter(
        (i) => i.user_ingredient_id !== saveLocalData.user_ingredient_id,
      );
      x.push(saveLocalData);
      x.sort((a, b) => b.user_ingredient_id - a.user_ingredient_id);
      setMyIngredients(x);
      navigate("/myIngredients");
    } catch (err) {
      console.log("Error found in EditMyIngredient while updating :", err.response);
      setErrorMessage(err.response?.data.message);
    }
  };

  // ------------------------ Delete Button Function -----------------------------------
  const handleDelete = async (e) => {
    e.preventDefault();

    if (window.confirm(`Are you sure you want to delete this recipe - ${ingData.name}`)) {
      const deleteurl = `${serverURL}/useringredient/api/delete/${id}`;
      try {
        const res = await axios.delete(deleteurl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("response after delete user ingredient is : ", res);
        if (res?.data?.success === true) {
          alert(res?.data?.message);
          const x = myIngredients.filter((i) => i.user_ingredient_id !== Number(id));
          setMyIngredients(x);
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
    } else {
      console.log("cancelled");
    }
  };

  // ----------- active/deactivate "update" button based on change in data ---------------
  useEffect(() => {
    const btnDisabled = OnDataChange(ingData ?? {}, orgData ?? {});
    setUpdateBtn(btnDisabled);
  }, [ingData]);

  // console.log("my Ingredients are: ", myIngredients);
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
      <Button children={`Delete`} onClick={handleDelete} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default EditIngredient;
