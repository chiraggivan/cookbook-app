import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
// import Input from "../../components/input";
import Dropdown from "../../components/dropdown";
// import Textarea from "../../components/textarea";
// import Button from "../../components/button";
import { mainUnits, cupUnits } from "../../utils/ingredientConstant";
// import Navbar from "../../components/navbarOld";
import OnDataChange from "../../utils/submitButtonActivation";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { serverURL } from "../../utils/appUtils";
import { Button, TextInput, Textarea, Select } from "flowbite-react";
import { FaWeightScale } from "react-icons/fa6";

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
  console.log("ingData :", ingData);
  return (
    <>
      <div className="flex flex-col  mt-(--top-bar-height) ml-(--left-side-bar) ">
        {/* <div className="w-full max-w-6xl mx-auto h-30 bg-amber-200"></div> */}
        {/* <div className="mx-auto max-w-6xl border h-30 bg-amber-400"></div> */}
        <div className="flex flex-col w-full max-w-6xl mx-auto ">
          {/* header */}
          <div className="m-2 text-2xl">
            <p>Edit Ingredient</p>
          </div>
          {/* ingredients details with similar ing names */}
          <div
            className="flex flex-col-reverse  w-full border border-gray-300 rounded-2xl
                          lg:flex-row"
          >
            {/* details of ingredients */}
            <div className="flex flex-col p-3 gap-y-2 lg:w-2/3">
              {/* first row */}
              <div className="flex items-center">
                <p className="min-w-31">Ingredient Name:</p>
                <TextInput
                  className="m-1 py-1 border-gray-300 rounded-lg w-65"
                  value={ingData?.name ? ingData?.name : ""}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                  }}
                  error={ingData?.errors?.name}
                />
              </div>
              {/* second row */}
              <div className="flex items-center justify-between max-w-105">
                <p>Quantity:</p>
                <TextInput
                  className="m-1 py-1 border-gray-300 rounded-lg w-20"
                  value={ingData?.display_quantity ? ingData?.display_quantity : ""}
                  onChange={(e) => {
                    handleChange("display_quantity", Number(e.target.value));
                  }}
                  error={ingData?.errors?.display_quantity}
                />
                <p>Unit:</p>
                <Select
                  value={ingData?.display_unit}
                  onChange={(e) => {
                    handleChange("display_unit", e.target.value);
                  }}
                  error={ingData?.errors?.display_unit}
                />
                <p>Price:</p>
                <TextInput
                  className="m-1 py-1 border-gray-300 rounded-lg w-25"
                  value={ingData?.display_price ? ingData?.display_price : ""}
                  onChange={(e) => {
                    handleChange("display_price", Number(e.target.value));
                  }}
                  error={ingData?.errors?.display_price}
                />
              </div>
              {/* third row */}
              <div className="flex items-center ">
                <p>Cup Weight:</p>
                <TextInput
                  className="m-1 py-1 border-gray-300 rounded-lg w-25 "
                  value={ingData?.cup_weight ?? ""}
                  onChange={(e) => {
                    handleChange("cup_weight", Number(e.target.value));
                  }}
                  error={ingData?.errors?.cup_weight}
                  // rightIcon={FaWeightScale}
                />
                <p>Cup Unit:</p>
                <TextInput
                  className="m-1 py-1 border-gray-300 rounded-lg w-25"
                  value={22}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                  }}
                  error={ingData?.errors?.name}
                />
              </div>
            </div>
            {/* similar items list */}
            <div className="flex flex-col lg:w-1/3 border border-gray-200 rounded-xl bg-white">
              <div className="mt-1 mx-auto">
                <p className="text-sm text-gray-500">Similar Ingredient Names</p>
              </div>
              {/* Line Separator */}
              <div className="flex items-center mt-1">
                <div className="grow border-t border-gray-300"></div>
              </div>
              {/* list of similar ing names */}
              <Textarea
                className="w-full h-40 border-hidden text-gray-500 text-sm  lg:h-full"
                value={existIngs}
                placeholder=""
                rows={6}
                readOnly
              />
            </div>
          </div>
          {/* buttons for update, delete and cancel */}
          <div className="flex justify-between mt-3">
            <div className="flex gap-x-2 lg:gap-x-6">
              <div>
                <Button
                  color="alternative"
                  type="button"
                  disabled={updateBtn}
                  onClick={handlesubmit}
                >
                  Update
                </Button>
              </div>
              <div>
                <Button color="dark" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </div>

            <div>
              <Button color="red" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
          {/* ///////////////////////////////////////////////////////////////// */}
          <h1>Edit Users Ingredient</h1>
          <TextInput
            label={"Name : "}
            type={"text"}
            value={ingData?.name ? ingData?.name : ""}
            onChange={(e) => {
              handleChange("name", e.target.value);
              // setIngName(e.target.value);
            }}
            error={ingData?.errors?.name}
          />
          <TextInput
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
          <TextInput
            label={"Price :"}
            type={"number"}
            value={ingData?.display_price ? ingData?.display_price : ""}
            placeholder={"0.00"}
            onChange={(e) => handleChange("display_price", Number(e.target.value))}
            error={ingData?.errors?.display_price}
          />
          <TextInput
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
          <div>
            <Button color="alternative" type="button" disabled={updateBtn} onClick={handlesubmit}>
              Update
            </Button>
          </div>
          <div>
            <Button color="dark" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
          <div>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </div>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
      </div>
    </>
  );
}

export default EditIngredient;
