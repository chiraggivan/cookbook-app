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

    console.log("data about to be sent :", body);
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
      console.log("updatedIngredients", updatedIngredients);
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
    <>
      <div className="flex flex-col  mt-(--top-bar-height) ml-(--left-side-bar) ">
        <div className="flex flex-col w-full max-w-3xl mx-auto ">
          {/* header */}
          <div className="m-2 text-2xl">
            <p>Add Your Ingredient</p>
          </div>
          {/* ingredients details with similar ing names */}
          <div className="flex flex-col-reverse border border-gray-300 rounded-2xl lg:flex-row">
            {/* details of ingredients */}
            <div className="flex flex-col p-3 lg:w-2/3">
              {/* first row */}
              <div className="flex flex-col mb-1">
                <div className="flex items-center space-x-1">
                  <p className="min-w-31">Ingredient Name: </p>
                  <TextInput
                    className="grow border-gray-300 rounded-lg max-w-72"
                    value={ingData?.name ? ingData?.name : ""}
                    onChange={(e) => {
                      handleChange("name", e.target.value);
                      setIngData((prev) => ({
                        ...prev,
                        errors: { ...prev.errors, name: "" },
                      }));
                    }}
                  />
                </div>
                <div className="pl-33 text-sm font-semibold text-red-700 h-5  max-w-100">
                  {ingData?.errors?.name ? "*Name Required" : ""}
                </div>
              </div>

              {/* second row */}
              <div className="flex items-center justify-between mb-1 max-w-105">
                <div className="flex flex-col ">
                  <div className="flex items-center space-x-1 ">
                    <p>Quantity:</p>
                    <TextInput
                      className=" border-gray-300 rounded-lg w-16"
                      value={ingData?.display_quantity ?? ""}
                      onChange={(e) => {
                        validateInput("display_quantity", e.target.value, 3, 5);
                        setIngData((prev) => ({
                          ...prev,
                          errors: { ...prev.errors, display_quantity: "" },
                        }));
                      }}
                      onBlur={() => validateNumber("display_quantity")}
                    />
                  </div>
                  <div className="flex justify-end text-sm font-semibold text-red-700 h-5 ">
                    {ingData?.errors?.display_quantity ? "*Required" : ""}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <p>Unit:</p>
                    <Select
                      className="w-19"
                      value={ingData?.display_unit ?? ""}
                      onChange={(e) => {
                        handleChange("display_unit", e.target.value);
                        setIngData((prev) => ({
                          ...prev,
                          errors: { ...prev.errors, display_unit: "" },
                        }));
                      }}
                    >
                      <option key="" value="">
                        Select
                      </option>
                      {mainUnits.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex justify-end text-sm font-semibold  text-red-700 h-5 ">
                    {ingData?.errors?.display_unit ? "*Required" : ""}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <p>Price:</p>
                    <TextInput
                      className=" border-gray-300 rounded-lg w-26"
                      value={ingData?.display_price ?? ""}
                      addon="£"
                      onChange={(e) => {
                        validateInput("display_price", e.target.value, 2, 5);
                        setIngData((prev) => ({
                          ...prev,
                          errors: { ...prev.errors, display_price: "" },
                        }));
                      }}
                      onBlur={() => validateNumber("display_price")}
                    />
                  </div>
                  <div className="flex justify-end text-sm font-semibold text-red-700 h-5 ">
                    {ingData?.errors?.display_price ? "*Required" : ""}
                  </div>
                </div>
              </div>

              {/* textarea for why cup details are helpful */}
              <div className="flex flex-col text-sm text-gray-500">
                <div className="flex text-justify mb-2">
                  Cup weight is optional, but providing it allows the app to generate additional
                  ingredient units (such as cup, tablespoon, and teaspoon) when creating recipes.
                  This is most useful for ingredients like grains, flour, powders, etc., that are
                  commonly measured in cup, tablespoon, teaspoon, etc.
                </div>
                <div className="italic mb-2">
                  * If an ingredient isn’t typically measured in cups, tablespoons or teaspoons, you
                  can safely leave this blank.
                </div>
              </div>

              {/* third row */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between max-w-104">
                  <div className="flex items-center space-x-2">
                    <p>Cup Weight:</p>
                    <TextInput
                      className=" border-gray-300 rounded-lg w-25 "
                      value={ingData?.cup_weight ?? ""}
                      onChange={(e) => {
                        validateInput("cup_weight", e.target.value, 3, 4);
                      }}
                      onBlur={() => validateNumber("cup_weight")}
                      // rightIcon={FaWeightScale}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <p>Cup Unit:</p>
                    <Select
                      className="w-19 "
                      value={ingData?.cup_unit}
                      onChange={(e) => {
                        handleChange("cup_unit", e.target.value);
                        setIngData((prev) => ({
                          ...prev,
                          errors: { ...prev.errors, cup_unit: "" },
                        }));
                      }}
                      error={ingData?.errors?.cup_unit}
                    >
                      <option key="" value="">
                        Select
                      </option>
                      {cupUnits.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex text-sm font-semibold text-red-700 h-5 ">
                  {ingData?.errors?.cup_weight ?? ingData?.errors?.cup_unit}
                </div>
              </div>

              {/* common errorMessage */}
              <div>
                {errorMessage && (
                  <p className="flex text-sm font-semibold text-red-700 h-5">{errorMessage}</p>
                )}
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
                className="w-full h-full border-hidden text-gray-500 text-sm  lg:h-full"
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
              {/* update button */}
              <div>
                <Button
                  className={false ? "cursor-pointer text-gray-300" : "cursor-pointer"}
                  color="alternative"
                  // disabled={updateBtn}
                  onClick={handlesubmit}
                >
                  Create Ingredient
                </Button>
              </div>
            </div>

            <div>
              {/* cancel button */}
              <div>
                <Button className="cursor-pointer" color="dark" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
              {/* delete button */}
              {/* <Button className="cursor-pointer" color="red" onClick={setIsConfirmModalOpen}>
                Delete
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddIngredient;
