import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Input from "../../components/input";
import Textarea from "../../components/textarea";
import Toggle from "../../components/toggle";
import Card from "../../components/card";
import Table from "../../components/table";
import Dropdown from "../../components/dropdown";
import Navbar from "../../components/navbarOld";
// import Button from "../../components/button";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import DropdownArray from "../../components/dropdownArray";
import { getFinalDataForBackend } from "./editRecipeUtils/getFinalDataForBackend";
import OnDataChange from "../../utils/submitButtonActivation";
import { MyRecipeContext } from "../../context/myRecipeContext";
import TopBar from "../../components/topBar";
import { Button, Progress, Spinner, TabItem, Tabs, TextInput } from "flowbite-react";
import { GiAvocado, GiHotMeal, GiHotSpices } from "react-icons/gi";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import { HiClipboardList, HiTrash } from "react-icons/hi";
import { TbFoodsteps } from "react-icons/tb";
import EditBaseValuesModal from "../../components/editBaseValuesModal";

function EditRecipe() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [OgData, setOgData] = useState({});
  const [isPrivate, setIsPrivate] = useState(false);
  const recipeCosting = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedIng, setSuggestedIng] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // const [rowData, setRowData] = useState([]);
  const [activeInputId, setActiveInputId] = useState(null);
  const itemRefs = useRef([]); // -------------> for auto scroll be visible while arrow down or up in suggested ingredients div
  const emptyIngRowData = () => ({
    uid: "ing-" + (Date.now() + Math.floor(Math.random() * 1000)),
    ingredientId: "",
    ingredientSource: "",
    ingredientBy: "",
    name: "",
    quantity: "",
    unitId: "",
    unitName: "",
    measuringUnits: [],
    baseUnits: [],
    cost: "",
    displayQuantity: "",
    displayUnit: "",
    displayPrice: "",
    errors: {},
  });
  const emptyComponentData = () => ({
    uid: "comp-" + (Date.now() + Math.floor(Math.random() * 1000)),
    //   component_display_order: 0,
    componentText: "",
    ingredients: [emptyIngRowData()],
  });
  const emptyStepRow = () => ({
    uid: "step-" + (Date.now() + Math.floor(Math.random() * 1000)),
    step_text: "",
  });
  // const [sections, setSections] = useState([emptySectionData()]);
  const [recipeInfo, setRecipeInfo] = useState({});

  const finalMainRecipe = {};
  const [checkFinalData, setCheckFinalData] = useState({});
  const [showTopRow, setShowTopRow] = useState(false);
  let sameSubHeadIds = []; // ---> to save the list of same sub header text which will be used to clear the error onChange
  const [updateBtn, setUpdateBtn] = useState(true);
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  const navigate = useNavigate();
  let blurTimeout;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Ref to keep track of timeout for ID //clicking outside suggested box of ingredient
  const timeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const imageBaseURL = "/uploadedImages/";
  const [imageError, setImageError] = useState(false);
  const [imgErrMsg, setImgErrMsg] = useState("");
  const [imgUploadSuccessMsg, setImgUploadSuccessMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isEditBaseValuesOpen, setIsEditBaseValuesOpen] = useState(false);
  const [quantityValue, setQuantityValue] = useState(0);
  const [unitValue, setUnitValue] = useState("");
  const [baseUnits, setBaseUnits] = useState([]);
  const [priceValue, setPriceValue] = useState(0);
  const [compUid, setCompUid] = useState(null);
  const [ingUid, setIngUid] = useState(null);

  // call useAuth hook to check if token is available in localstorage
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();

  // ------------------------------------ Above, initialisation of variables done ---------------------------------------

  //--------------------------------- Redirect to home if token not found --------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------------------------- Handle image picker function ------------------------------------
  const handleImagePicker = () => {
    setImgErrMsg("");
    setImgUploadSuccessMsg("");
    fileInputRef.current?.click();
  };

  // -------------------------------------------- Handle image Cange  --------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // console.log("file is :", file);
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 6 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      setImgErrMsg("Only images and videos are allowed.");
      return;
    }

    if (file.size > maxSize) {
      setImgErrMsg("File must be less than 6 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    // console.log("imageUrl", imageUrl);
    setPreviewImage(imageUrl);

    const formData = new FormData();
    formData.append("image", file);

    const sendImage = async () => {
      try {
        const res = await axios.post(`${serverURL}/recipe/api/updateRecipeImage/${id}`, formData, {
          ...config,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            setUploadProgress(percent);
          },
        });
        setUploadProgress(0);
        setImgUploadSuccessMsg("Image uploaded successfully");
        // setImageURL(res?.data?.file?.path);
      } catch (err) {
        console.log("Error while sending image file:", err.response);
        setPreviewImage(null);
      }
    };
    sendImage();
  };

  // --------------------------------------------- update db for image selected -------------------------------------
  // useEffect(() => {
  //   if (imageURL) {
  //     const url = `${serverURL}/recipe/api/updateRecipeImage/${id}`;
  //     const body = { imageURL: imageURL };

  //     const updateImageURL = async () => {
  //       try {
  //         const res = await axios.post(url, body, config);
  //       } catch (err) {
  //         console.log("Error in editRecipe while updating image in backend", err.response);
  //       }
  //     };

  //     updateImageURL();
  //   }
  // }, [setImageURL]);

  // --------------------------------- function for getting base units ----------------------------------------
  const getBaseUnits = (unit, measuringUnits) => {
    const baseUnitsToShow = [];
    const lookup = {};
    measuringUnits.forEach((i) => (lookup[i.unit_name] = i.unit_name));

    // // ------------------------------- for weight units ----------------------------------
    if (weightUnits.includes(unit)) {
      // const baseUnitsToShow = [];
      weightUnits.forEach((i) => {
        if (lookup[i]) {
          baseUnitsToShow.push(lookup[i]);
        }
      });
      return baseUnitsToShow;
    }
    // // -------------------------------- for volume units ----------------------------------
    else if (volumeUnits.includes(unit)) {
      // const baseUnitsToShow = [];
      volumeUnits.forEach((i) => {
        if (lookup[i]) {
          baseUnitsToShow.push(lookup[i]);
        }
      });
      return baseUnitsToShow;
    }
    // // -------------------------------- for other units ----------------------------------
    else {
      return [unit];
    }
  };

  // ------------------------------------ get the recipe data via API from backend -----------------------------------------
  useEffect(() => {
    const method = "get";
    const url = `${serverURL}/recipe/api/${id}`;
    const body = null;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // if (token) {
        const res = await axios[method](url, config);
        const tempRecipe = res?.data?.data;
        // console.log("Data from the backend of recipe :", tempRecipe);
        tempRecipe?.recipe?.privacy === "private" ? setIsPrivate(true) : setIsPrivate(false);
        const recipeData = { ...tempRecipe.recipe };
        // updating previewImage use state if recipe iamge available
        if (recipeData?.image_url) {
          setPreviewImage(recipeData?.image_url);
        }
        setRecipeInfo((prev) => ({ ...prev, recipe: { ...tempRecipe.recipe } }));
        const components = [];
        const ingredientData = [...tempRecipe?.ingredients];

        const uniqueComp = [...new Set(ingredientData?.map((i) => i.component_display_order))].sort(
          (a, b) => a - b,
        );

        for (const u of uniqueComp) {
          const compIngs = ingredientData
            .filter((i) => i.component_display_order === u)
            .sort((a, b) => a.ingredient_display_order - b.ingredient_display_order);

          // check if first component text is empty, then hide the "add top header" button
          if (u === 0 && compIngs[0]?.component_text && compIngs[0]?.component_text !== "") {
            setShowTopRow(true);
          }
          const comp = {};
          comp.uid = "comp-" + (Date.now() + Math.floor(Math.random() * 1000));
          // getting the values of comp_text, recipeCompId and displayOrder from the first element of array
          comp.recipeComponentId = compIngs[0]?.recipe_component_id ?? "";
          comp.componentText = compIngs[0]?.component_text ?? "";
          comp.componentDisplayOrder = compIngs[0]?.component_display_order;
          comp.ingredients = [];

          for (const i of compIngs) {
            const ing = {};
            ing.uid = "ing-" + (Date.now() + Math.floor(Math.random() * 1000));
            ing.recipeComponentId = compIngs[0]?.recipe_component_id ?? "";
            ing.componentDisplayOrder = compIngs[0]?.component_display_order;
            ing.recipeIngredientId = i.recipe_ingredient_id;
            ing.ingredientDisplayOrder = i.ingredient_display_order;
            ing.ingredientId = i.ingredient_id;
            ing.ingredientSource = i.ingredient_source;
            ing.ingredientBy = i.ingredient_by;
            ing.name = i.name;
            ing.quantity = Number(i.quantity);
            ing.unitId = i.unit_id;
            ing.unitName = i.unit_name;
            ing.measuringUnits = i.measuring_units;
            ing.baseUnits = getBaseUnits(i.unit, i.measuring_units);
            // ing.cost = Number(i.price.toFixed(4));
            ing.displayQuantity = Number(i.base_quantity);
            ing.displayUnit = i.unit;
            ing.displayPrice = Number(i.cost);
            ing.errors = {};

            comp.ingredients.push(ing);
          }
          comp.ingredients.push(emptyIngRowData());
          components.push(comp);
          const componentData = [...components];
          setRecipeInfo((prev) => ({ ...prev, components: components }));
          setOgData(structuredClone({ recipe: { ...recipeData }, components: [...componentData] }));
        }

        const stepsData = [...tempRecipe.steps];
        const updtdStepsData = stepsData.map((s) => ({
          ...s,
          uid: "step-" + (Date.now() + Math.floor(Math.random() * 1000)),
        }));
        updtdStepsData.push(emptyStepRow());
        setRecipeInfo((prev) => ({ ...prev, steps: updtdStepsData }));
        setOgData((prev) => ({ ...prev, steps: [...updtdStepsData] }));
        // }
      } catch (err) {
        // window.alert(`Error while fetching recipe data from database`);
        console.log("error while fetching reicpe details with axios is :", err.response);
        setErrorMessage(err?.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----------------------------- ADD new empty ing row function ---------------------------------------
  const addNewIngRow = (cid, index) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.uid === cid && comp.ingredients.length === index + 1
          ? {
              ...comp,
              ingredients: [...comp.ingredients, emptyIngRowData()],
            }
          : comp,
      ),
    }));
  };

  // ----------------------------- ADD new empty step row function ---------------------------------------
  const addNewStepRow = (index) => {
    if (index === recipeInfo.steps.length - 1) {
      setRecipeInfo((prev) => ({
        ...prev,
        steps: [...prev.steps, emptyStepRow()],
      }));
    }
  };

  // ----------------------------- search ingredient when typed in box -----------------------------------------
  const searchIng = (val) => {
    //  if val.length < 1 then return
    if (val.trim().length === 0 || val === "") {
      clearTimeout(timeoutRef.current);
      setSuggestedIng([]);
      return;
    }
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
          const res = await axios.get(`${serverURL}/recipe/api/search/ingredient/${val}`, config);
          // console.log("ingredients found are : ", res.data);
          setSuggestedIng(res.data.rows);
        } catch (err) {
          window.alert(`Error while fetching ingredients list from database`);
          console.log("error in newRecipe.jsx while ing search :", err.response);
        }
      };

      checkIng();
    }, 500);

    // clear the timeout if the component unmounts or re renders
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // timeoutRef.current = null;
      }
    };
  };

  // -----------------------in Suggested ingredient, set the first item highlighted -------------------------------
  useEffect(() => {
    if (suggestedIng.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [suggestedIng]);

  // ------------------------------Handle key down within suggested ingredient -----------------------------------------
  const handleKeyDown = (e, cid, iid) => {
    if (!suggestedIng.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestedIng.length - 1 ? prev + 1 : prev));
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation();
          // setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          handleSelectedIng(cid, iid, suggestedIng[highlightedIndex]); // Select the item
        }
        break;

      case "Tab":
        if (highlightedIndex >= 0) {
          // e.preventDefault();
          e.stopPropagation();
          handleSelectedIng(cid, iid, suggestedIng[highlightedIndex]); // Select the item
        }
        break;

      default:
        break;
    }
  };

  // -----------------------handling the ScrollIntoView of suggeted ing list to show highlighted ing in view and not hide ----------
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest", // Keeps it in view without jumping
        behavior: "smooth", // Optional: smooth scroll
      });
    }
  }, [highlightedIndex]);

  // ------------------------------ add the selected ingredient in ingRow data --------------------------------
  const handleSelectedIng = (cid, iid, ing) => {
    // //--------- fetch the active units for the ingredient selected --------
    const fetchMeasuringUnits = async (id, source) => {
      try {
        const res = await axios.get(`${serverURL}/recipe/api/search/units/${id}/${source}`, config);
        const units = res.data.rows;
        setRecipeInfo((prev) => ({
          ...prev,
          components: prev.components.map((comp) =>
            comp.uid === cid
              ? {
                  ...comp,
                  ingredients: comp.ingredients.map((ingredient) =>
                    ingredient.uid === iid
                      ? {
                          ...ingredient,
                          name: ing.name,
                          displayQuantity: ing.display_quantity,
                          displayUnit: ing.display_unit,
                          displayPrice: ing.display_price,
                          ingredientSource: ing.ingredient_source,
                          ogBaseQuantity: ing.display_quantity,
                          ogBaseUnit: ing.display_unit,
                          ogBasePrice: ing.display_price,
                          ingredientId: ing.id,
                          measuringUnits: units,
                          baseUnits: getBaseUnits(ing.display_unit, units),
                        }
                      : ingredient,
                  ),
                }
              : comp,
          ),
        }));
        // update ogData for display values if ingredient_id has changed. While
        // comparing at the end it should not compare with the old ingredient's display values
        setOgData((prev) => ({
          ...prev,
          components: prev.components.map((comp) =>
            comp.uid === cid
              ? {
                  ...comp,
                  ingredients: comp.ingredients.map((ingredient) =>
                    ingredient.uid === iid
                      ? {
                          ...ingredient,
                          displayQuantity: ing.display_quantity,
                          displayUnit: ing.display_unit,
                          displayPrice: ing.display_price,
                        }
                      : ingredient,
                  ),
                }
              : comp,
          ),
        }));
      } catch (err) {
        window.alert(`Error while fetching measuring unit data from database`);
        console.log("error in createMyIng.jsx while fetching measuring units :", err.response);
      }
    };
    fetchMeasuringUnits(ing.id, ing.ingredient_source);

    setActiveInputId(null);
    setSuggestedIng([]);
    setHighlightedIndex(-1);
  };

  // ------------------------------ to delete / hide component(section) header ---------------------------------
  const deleteComponentHeader = (cid, index) => {
    if (index === 0) {
      if (checkFinalData?.errors?.components[cid]?.text) {
        checkFinalData.errors.components[cid].text = "";
      }
      setShowTopRow(false);
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((comp) =>
          comp.uid === cid
            ? {
                ...comp,
                componentText: "",
                errorText: "",
              }
            : comp,
        ),
      }));
    }
    if (index !== 0) {
      const toUpdtComponents = recipeInfo.components.map((comp) => ({
        ...comp,
        ingredients: [...comp.ingredients],
      }));
      const ingFrom = toUpdtComponents[index].ingredients;
      const ingTo = [...toUpdtComponents[index - 1].ingredients];
      ingTo.pop();
      const combinedIng = [...ingTo, ...ingFrom];
      const id = toUpdtComponents[index - 1].uid;
      const newComponents = toUpdtComponents.map((comp) =>
        comp.uid === id
          ? {
              ...comp,
              ingredients: combinedIng,
            }
          : comp,
      );

      const updated = newComponents.filter((section) => section.uid !== cid);
      // console.log("updated to be setSection :", updated);
      setRecipeInfo((prev) => ({
        ...prev,
        components: updated,
      }));
    }

    // remove error Messages from the rows if any before the row was deleted
    setCheckFinalData(
      checkFinalData?.components?.map((comp) =>
        comp.uid === cid
          ? {
              uid: cid,
              ingredients: comp.ingredients,
            }
          : comp,
      ),
    );
  };

  // ------------------------------------------- to delete ingredients  ---------------------------------
  const deleteIngredient = (cid, iid) => {
    const selectedComponent = recipeInfo.components.find((c) => c.uid === cid);
    const selectedIng = selectedComponent.ingredients;
    const newIngList = [...selectedIng.filter((i) => i.uid !== iid)];
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.uid === cid
          ? {
              ...comp,
              ingredients: [...newIngList],
            }
          : comp,
      ),
    }));

    // remove error Messages from the rows if any before the row was deleted
    // checkFinalData?.components?.map((comp) =>
    //   comp.uid === cid
    //     ? {
    //         uid: cid,
    //         ingredients: comp.ingredients,
    //       }
    //     : comp,
    // );

    setCheckFinalData(
      checkFinalData?.components?.map((comp) =>
        comp.ingredients?.map((ing) =>
          ing.uid === iid
            ? {
                uid: iid,
              }
            : ing,
        ),
      ),
    );
  };

  // ------------------------------------------- to delete steps  ---------------------------------
  const deleteStep = (sid) => {
    const newStepList = [...recipeInfo.steps.filter((s) => s.uid !== sid)];
    setRecipeInfo((prev) => ({ ...prev, steps: newStepList }));
  };

  // ------------------------------------------- to move ingredients up or down  ---------------------------------
  const move = (cid, iid, indexi, indexc, val) => {
    // console.log("cid :", cid, " iid :", iid, " indexi :", indexi, "indexc :", indexc, " val:", val);
    const component = recipeInfo.components.find((c) => c.uid === cid);
    const ings = [...component.ingredients];
    const iLength = ings.length;
    const ing = { ...ings.find((i) => i.uid === iid) };
    const oldCompNewIngsList = [...ings.filter((i) => i.uid !== iid)];
    // // ----------------- transfering ingredients in above/below component ---------------------
    if ((indexi === 0 && val === -1) || (indexi === iLength - 2 && val === 1)) {
      const newComponent = recipeInfo.components[indexc + val];
      const newCid = newComponent.uid;
      const newIngs = [...newComponent.ingredients];
      // -- create splice based on value
      if (indexi === 0 && val === -1) {
        newIngs.splice(newIngs.length + val, 0, ing);
      } else {
        newIngs.splice(0, 0, ing);
      }
      // // --------------------- updating new ingredient list for new component ---------------
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((comp) =>
          comp.uid === newCid
            ? {
                ...comp,
                ingredients: newIngs,
              }
            : comp,
        ),
      }));
      // // --------------------- updating new ingredient list for old component ---------------
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((comp) =>
          comp.uid === cid
            ? {
                ...comp,
                ingredients: oldCompNewIngsList,
              }
            : comp,
        ),
      }));
      return;
    }
    oldCompNewIngsList.splice(indexi + val, 0, ing);
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.uid === cid
          ? {
              ...comp,
              ingredients: oldCompNewIngsList,
            }
          : comp,
      ),
    }));
  };

  // ------------------------------------------- to move steps up or down  ---------------------------------
  const moveStep = (sid, index, val) => {
    const sLength = recipeInfo.steps.length;
    const step = { ...recipeInfo.steps.find((s) => s.uid === sid) };
    const newStepsList = [...recipeInfo.steps.filter((s) => s.uid !== sid)];

    newStepsList.splice(index + val, 0, step);
    setRecipeInfo((prev) => ({
      ...prev,
      steps: newStepsList,
    }));
  };

  // ------------------------ function to validate INPUT for number Allowing [0123456789.] ----------------------
  function validateInput(field, value, maxDecimals, maxLength, cid, iid) {
    // Define a regex for one optional decimal with up to maxDecimals digits
    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);
    const errorField = "error" + capitaliseWords(field.slice(0, 1)) + field.slice(1);

    // Check the length
    if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
      // get the input field
      const inputField = recipeInfo.components
        .find((item) => item.uid === cid)
        .ingredients.find((item) => item.uid === iid).quantity;
      // console.log("input field value is :", inputField);

      // dis allow continous zeros
      if (inputField === "0" && value === "00") {
        return;
      }
      // update ingData value
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((component) =>
          component.uid === cid
            ? {
                ...component,
                ingredients: component.ingredients.map((ingredient) =>
                  ingredient.uid === iid
                    ? {
                        ...ingredient,
                        [field]: value,
                        errors: {
                          ...ingredient.errors,
                          [errorField]: "",
                        },
                      }
                    : ingredient,
                ),
              }
            : component,
        ),
      }));
    }
  }

  // ---------------------------------- To calculate the individual ing cost / total cost of recipe ----------------------------------------------
  let totalCost = 0;
  recipeInfo?.components?.forEach((component) => {
    component.ingredients.forEach((ingredient) => {
      const dq = ingredient.displayQuantity;
      const du = ingredient.displayUnit;
      const dp = ingredient.displayPrice;
      const q = ingredient.quantity;
      const u = ingredient.unitId;
      const mu = ingredient.measuringUnits;

      if (dq && du && dp && q && u && mu) {
        const baseConversion = mu.find((i) => i.unit_name === du).conversion_factor || 0;
        const unitConversion = mu.find((i) => i.unit_id === u).conversion_factor || 0;
        const ingCost = (dp / dq / Number(baseConversion)) * q * Number(unitConversion);

        if (ingCost) {
          totalCost += ingCost;
          ingredient.cost = Number(ingCost.toFixed(4));
        } else {
          ingredient.cost = "";
        }
      } else {
        ingredient.cost = "";
      }
    });
    recipeCosting.current = totalCost;
  });

  const updateBaseQuantity = (cid, iid, val) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === cid
          ? {
              ...component,
              ingredients: component.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayQuantity: Number(val),
                    }
                  : ingredient,
              ),
            }
          : component,
      ),
    }));
  };

  const updateBasePrice = (cid, iid, val) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === cid
          ? {
              ...component,
              ingredients: component.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayPrice: Number(val),
                    }
                  : ingredient,
              ),
            }
          : component,
      ),
    }));
  };

  const updateBaseUnit = (cid, iid, val) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === cid
          ? {
              ...component,
              ingredients: component.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayUnit: val,
                    }
                  : ingredient,
              ),
            }
          : component,
      ),
    }));
  };

  const updateQuantity = (cid, iid, val) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === cid
          ? {
              ...component,
              ingredients: component.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      quantity: Number(val),
                    }
                  : ingredient,
              ),
            }
          : component,
      ),
    }));
  };

  const updateUnit = (cid, iid, val) => {
    // console.log("value is :", val);
    // return;
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === cid
          ? {
              ...component,
              ingredients: component.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      unitId: Number(val),
                      unitName:
                        val === ""
                          ? ""
                          : ingredient.measuringUnits.find((mu) => mu.unit_id === Number(val))
                              .unit_name,
                    }
                  : ingredient,
              ),
            }
          : component,
      ),
    }));
  };

  // --------------------------- hide suggestions onBlur if ingredient not selected ------------------------------
  const hideSuggestions = (cid, iid) => {
    setSuggestedIng([]);
    // setSections((prev) =>
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.uid === cid
          ? {
              ...comp,
              ingredients: comp.ingredients.map((ingredient) =>
                ingredient.uid === iid && ingredient.ingredientId === ""
                  ? {
                      ...ingredient,
                      name: "",
                      quantity: "",
                      unit: "",
                    }
                  : ingredient,
              ),
            }
          : comp,
      ),
    }));
  };

  // -------------------- update the base values of ingredient thru modal for small screen -----------------------
  const updateBaseValues = (compUid, ingUid, updateQuantity, updateUnit, updatePrice) => {
    setRecipeInfo((prev) => ({
      ...prev,
      components: prev.components.map((component) =>
        component.uid === compUid
          ? {
              ...component,
              ingredients: component.ingredients.map((i) =>
                i.uid === ingUid
                  ? {
                      ...i,
                      displayQuantity: Number(updateQuantity),
                      displayUnit: updateUnit,
                      displayPrice: Number(updatePrice),
                    }
                  : i,
              ),
            }
          : component,
      ),
    }));

    setIsEditBaseValuesOpen(false);
  };

  // ----------- active/deactivate "Edit recipe" button based on change in data ---------------
  useEffect(() => {
    const costLessRecipeInfo = {
      ...recipeInfo,
      components: recipeInfo?.components?.map((comp) => ({
        ...comp,
        ingredients: comp.ingredients
          .filter((i) => i.ingredientId)
          .map(({ cost, ...rest }) => rest),
      })),
      steps: recipeInfo?.steps?.filter((s) => s.step_text !== ""),
    };
    const costLessOgData = {
      ...OgData,
      components: OgData?.components?.map((comp) => ({
        ...comp,
        ingredients: comp.ingredients
          .filter((i) => i.ingredientId)
          .map(({ cost, ...rest }) => rest),
      })),
      steps: OgData?.steps?.filter((s) => s.step_text !== ""),
    };
    const btnDisabled = OnDataChange(costLessRecipeInfo ?? {}, costLessOgData ?? {});
    // console.log("btnDisabled:", btnDisabled);
    setUpdateBtn(btnDisabled);
  }, [recipeInfo]);

  // ---------------------- check duplicate text for sub headers(component) onBlur -------------------------------
  const checkDuplicateText = (uid, value) => {
    // console.log("uid :", uid, " and value is :", value);
    if (
      recipeInfo.components.some(
        (item) =>
          item.componentText !== "" &&
          item.componentText.replace(/\s+/g, " ").toLowerCase().trim() ===
            value.replace(/\s+/g, " ").toLowerCase().trim() &&
          item.uid !== uid,
      )
    ) {
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((component) =>
          component.uid === uid
            ? { ...component, errorText: "Sub header already used" }
            : component,
        ),
      }));
    }
  };

  // ---------------- create list of all the same text sub header (component) onFocus -----------------------------
  const findSameTextComponent = (uid, value) => {
    // console.log("uid :", uid, " and value is :", value);
    sameSubHeadIds = recipeInfo.components
      .filter(
        (item) =>
          item.uid !== uid &&
          item.componentText.replace(/\s+/g, " ").toLowerCase().trim() ===
            value.replace(/\s+/g, " ").toLowerCase().trim() &&
          item.componentText !== "",
      )
      .map((item) => item.uid);
    // console.log("sameTextComponent is :", sameSubHeadIds);
  };

  // ----- Remove error Text from subHeaders if only one same subheader (component)  onChange ----------------------
  const removeErrorTextIfFound = () => {
    // remove errorText if only one same subheader is there. If more than one, dont do anything
    if (sameSubHeadIds.length === 1) {
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((component) =>
          component.uid === sameSubHeadIds[0] ? { ...component, errorText: "" } : component,
        ),
      }));
    }
  };

  // ---------------------------- Handle sumbit button function  ----------------------------------
  const handleSubmit = () => {
    // const checkDataErrors = { recipe: {}, components: [], steps: [] };
    // checkData.errors = {};
    let isValid = true;
    let isErrMsg; // --> used to check if specialised error message to be shown
    setErrorMessage("");

    // // ---------------------------------- check recipe data ----------------------------------
    // validate name of recipe
    if (!recipeInfo.recipe.name || recipeInfo.recipe.name.trim() === "") {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        recipe: { ...prev.recipe, error_name: "Name Required" },
      }));
    }

    // validate portion_size of recipe
    if (!recipeInfo.recipe.portion_size || recipeInfo.recipe.portion_size.trim() === "") {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        recipe: {
          ...prev.recipe,
          error_portion_size: "Portion Size Required",
        },
      }));
    }

    // validate privacy : if no privacy data then make it default false
    if (!recipeInfo.recipe.privacy) {
      recipeInfo.recipe.privacy = false;
    }

    // validate Description of recipe
    if (recipeInfo.recipe.description.length >= 500) {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        recipe: {
          ...prev.recipe,
          error_description: "Description should be less than 500 characters",
        },
      }));
    }

    // check if any error fields found in subheading (component) text (like duplicate text)
    if (recipeInfo.components.some((item) => item.errorText?.trim())) {
      isValid = false;
      setErrorMessage("Errors found above in header section.");
      return;
    }

    // // ---------------------------- check components + ingredients data ---------------------------
    recipeInfo.components.forEach((comp, indexc) => {
      let ingCount = 0; //---------------> to count valid ingredients in each component

      if (indexc === 0 && showTopRow && comp.componentText === "") {
        isValid = false;
        setRecipeInfo((prev) => ({
          ...prev,
          components: prev.components.map((component) =>
            component.uid === comp.uid
              ? { ...component, errorText: "Text required or delete this header!" }
              : component,
          ),
        }));
        // checkDataErrors.components[indexc].uid = comp.uid;
        // checkDataErrors.components[indexc].text = "Text Required. Or delete this header";
      }
      if (indexc !== 0 && comp.componentText === "") {
        isValid = false;
        setRecipeInfo((prev) => ({
          ...prev,
          components: prev.components.map((component) =>
            component.uid === comp.uid
              ? { ...component, errorText: "Text required or delete this header!!!" }
              : component,
          ),
        }));
        // checkDataErrors.components[indexc].uid = comp.uid;
        // checkDataErrors.components[indexc].text = "Text Required. Or delete this header";
      }

      comp.ingredients.forEach((ing, indexi) => {
        if (
          ing.ingredientId ||
          ing.quantity ||
          ing.unitId ||
          ing.displayQuantity ||
          ing.displayUnit ||
          ing.displayPrice
        ) {
          ingCount++;
          [
            { value: ing.ingredientId, name: "Name" },
            { value: ing.quantity, name: "Quantity" },
            { value: ing.unitId, name: "UnitId" },
            { value: ing.displayQuantity, name: "DisplayQuantity" },
            { value: ing.displayUnit, name: "DisplayUnit" },
            { value: ing.displayPrice, name: "DisplayPrice" },
          ].forEach((i) => {
            if (!i.value) {
              const field = "error" + i.name;
              isValid = false;
              setRecipeInfo((prev) => ({
                ...prev,
                components: prev.components.map((component) =>
                  component.uid === comp.uid
                    ? {
                        ...component,
                        ingredients: component.ingredients.map((ingredient) =>
                          ingredient.uid === ing.uid
                            ? {
                                ...ingredient,
                                errors: {
                                  ...ingredient.errors,
                                  [field]: field === "errorName" ? "Name Require" : "Require",
                                },
                              }
                            : ingredient,
                        ),
                      }
                    : component,
                ),
              }));

              // checkDataErrors.components[indexc].ingredients[indexi].uid = ing.uid;
              // checkDataErrors.components[indexc].ingredients[indexi][i.name] = "Name Require!!";
            }
          });
        }
      });

      // make sure every component(subheading) has alteast one ingredient except index 0 if not visible
      if ((showTopRow && ingCount === 0) || (!showTopRow && indexc !== 0 && ingCount === 0)) {
        isValid = false;
        isErrMsg = "Need atleast one ingredient within sub heading";
        return;
      }
    });

    // check if the data is valid and if NOT then return back to screen
    // (cant exit the function from "forEach return" as done above. It only stops forEach and comes out)
    if (!isValid) {
      if (isErrMsg) {
        setErrorMessage(isErrMsg);
      } else {
        setErrorMessage("Errors found above.");
      }
      return;
    }

    // // ------------ get the display order of components and ingredient updated from recipeInfo --------------------
    // while assigning new display order, we 1st filter the components, if top header is hidden and
    // no ingredients within top header given. so the the header which is after the empty ing row
    // will become header 0(index 0)
    let ing_display_order = 1;
    const newComponentsData = recipeInfo.components
      .filter((item) => item.componentText !== "" || item.ingredients.length !== 1)
      .map((comp, indexc) => ({
        ...comp,
        componentDisplayOrder: indexc,
        ingredients: comp.ingredients
          .filter((i) => i.ingredientId)
          .map((ing, indexi) => ({
            ...ing,
            componentDisplayOrder: indexc,
            recipeComponentId: comp.recipeComponentId ?? "",
            ingredientDisplayOrder: ing_display_order++,
          })),
      }));

    // // ------------------------ get the display order of Steps updated from recipeInfo -----------------------------
    let step_display_order = 1;
    const newStepsData = recipeInfo.steps
      .filter((s) => s.step_text.trim())
      .map((step, indexs) => ({
        ...step,
        step_order: step_display_order++,
      }));

    // // ------------------------ udpate recipeInfo with newComponentData and newStepData ---------------------------
    const newRecipeInfo = {
      ...recipeInfo,
      components: newComponentsData,
      steps: newStepsData,
    };

    // console.log("newRecipeInfo :", newRecipeInfo);
    // return;

    // // get the final data that is backend compatible with the help of helper function getFinalDataForBackend
    const finalData = getFinalDataForBackend(newRecipeInfo, OgData);
    console.log("finalData :", finalData);
    // console.log("About to call api to save the edit the recipe.");
    // return;

    // // ----------------------------------- call the bakend api to update recipe -----------------------------------
    const url = `${serverURL}/recipe/api/update/${id}`;
    const method = "patch";
    const body = finalData;

    const updateRecipe = async () => {
      try {
        setIsLoading(true);
        // call api
        const res = await axios[method](url, body, config);
        // console.log("res :", res);
        const x = res.data.data;
        setRecipeDetails(
          recipeDetails.map((r) => (r.recipe.recipe_id === x.recipe.recipe_id ? x : r)),
        );
        setMyRecipes(
          myRecipes.map((item) =>
            item.recipe_id === x.recipe.recipe_id
              ? {
                  ...item,
                  portion_size: x.recipe.portion_size,
                  name: x.recipe.name,
                  description: x.recipe.description,
                }
              : item,
          ),
        );
        navigate(`/recipe/${id}`);
      } catch (err) {
        window.alert(`Error while  finalData recipe update with database`);
        console.log("error while updating finalData with axios is :", err.response.data.message);
      } finally {
        setIsLoading(false);
      }
    };
    updateRecipe();
  };

  // console.log("inputText :", inputText);
  // console.log("sections :", sections);
  // console.log("suggested ing  :", suggestedIng);
  // console.log("activeInputId", activeInputId);
  // console.log("recipeInfo :", recipeInfo);
  // console.log("OgData :", OgData);
  // console.log("checkFinalData :", checkFinalData);
  // console.log("total cost is :", totalCost);

  // ------------------------------  initial page loading screen -------------------------------------------
  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner
          theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
          color="default"
          aria-label="Loading"
          size="xl"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col mt-(--top-bar-height) md:ml-(--left-side-bar)">
        {/* line just below top bar  */}
        <div className="flex sticky z-10 h-0.5 shadow top-(--top-bar-height) bg-white"></div>

        <div className="flex flex-col">
          <div className="text-lg font-bold mt-3 pl-2 line-clamp-1">Editing:</div>

          {/* Line Separator */}
          <div className="flex items-center mt-2">
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* recipe details and image */}
          <div className=" mt-2 border-2 rounded-xl m-1 border-app-primary md:border-none">
            <div className="flex flex-col-reverse w-full gap-4 mt-0 sm:mt-2 md:flex-row md:justify-between lg:max-w-200">
              {/* recipe details */}
              <div className="flex flex-col justify-between h-40">
                {/* recipe name section */}
                <div className="flex max-w-md">
                  {/* title of recipe name */}
                  <div className="flex px-1 items-center font-semibold justify-end w-28">Name:</div>

                  {/* input name section */}
                  <div className="mr-1.75">
                    <Input
                      className="flex border border-gray-300 rounded-lg w-full min-w-25 placeholder:text-gray-400"
                      value={capitaliseWords(recipeInfo?.recipe?.name) ?? ""}
                      onChange={(e) => {
                        setRecipeInfo({
                          ...recipeInfo,
                          recipe: { ...recipeInfo.recipe, name: e.target.value, error_name: "" },
                        });
                        // if (checkFinalData?.recipe?.name) {
                        //   checkFinalData.recipe.name = "";
                        // }
                      }}
                      placeholder={"Name of the recipe...."}
                      // error={checkFinalData?.recipe?.name}
                      error={recipeInfo?.recipe?.error_name}
                    />
                  </div>
                </div>

                {/* recipe portion size section */}
                <div className="flex max-w-md">
                  {/* title of portion size*/}
                  <div className="flex px-1 items-center font-semibold justify-end  w-28 min-w-28">
                    Portion Size:
                  </div>
                  {/* input portion section */}
                  <div className="mr-1.75">
                    <Input
                      className="flex border border-gray-300 rounded-lg w-full min-w-25 placeholder:text-gray-400"
                      value={recipeInfo?.recipe?.portion_size ?? ""}
                      onChange={(e) => {
                        setRecipeInfo((prev) => ({
                          ...prev,
                          recipe: {
                            ...prev.recipe,
                            portion_size: e.target.value,
                            error_portion_size: "",
                          },
                        }));
                        // if (checkFinalData?.recipe?.portion_size) {
                        //   checkFinalData.recipe.portion_size = "";
                        // }
                      }}
                      placeholder={"eg. 2 person, 1kg, 750ml, etc."}
                      // error={checkFinalData?.recipe?.portion_size}
                      error={recipeInfo?.recipe?.error_portion_size}
                    />
                  </div>
                </div>

                {/* recipe Privacy section */}
                <div className="flex max-w-md">
                  {/* title of privacy*/}
                  <div className="flex px-1 items-center font-semibold justify-end w-28">
                    Privacy:
                  </div>

                  {/* Toggle for privacy*/}
                  <Toggle
                    checked={isPrivate}
                    onText=" Private"
                    offText=" Public"
                    onChange={(e) => {
                      setIsPrivate(e.target.checked);
                      setRecipeInfo({
                        ...recipeInfo,
                        recipe: {
                          ...recipeInfo.recipe,
                          privacy: e.target.checked === false ? "public" : "private",
                        },
                      });
                    }}
                  />
                </div>
              </div>

              {/* image */}
              <div
                className="max-w-full aspect-video md:max-h-40 rounded-t-xl md:rounded-lg  bg-gray-200 md:max-w-40 md:mx-0 cursor-pointer"
                onClick={handleImagePicker}
              >
                {previewImage && !imageError ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover rounded-t-xl md:rounded-lg"
                  />
                ) : (
                  <GiHotMeal className="h-full w-full" />
                )}
                <input
                  className="hidden"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imgErrMsg && <p className="text-xs text-app-danger ml-2 md:ml-0">{imgErrMsg}</p>}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress
                    color="teal"
                    progress={uploadProgress}
                    textLabel="uploaded "
                    size="lg"
                    labelProgress
                    labelText
                  />
                )}
                {uploadProgress === 100 && (
                  <p className="text-xs text-teal-600 ml-2 md:ml-0"> Processing Image...</p>
                )}
                {imgUploadSuccessMsg && (
                  <p className="text-xs text-teal-600 ml-2 md:ml-0"> {imgUploadSuccessMsg}</p>
                )}
              </div>
            </div>

            {/* recipe description */}
            <div className="flex flex-col mt-5 lg:max-w-200">
              <div className="flex font-semibold justify-end w-27">Description:</div>
              <div className="mx-1.75 md:mr-0">
                <Textarea
                  className="w-full h-40 border-gray-300 rounded-lg resize-none placeholder:text-gray-400"
                  value={recipeInfo?.recipe?.description ?? ""}
                  onChange={(e) => {
                    setRecipeInfo({
                      ...recipeInfo,
                      recipe: { ...recipeInfo.recipe, description: e.target.value },
                    });
                    if (checkFinalData?.recipe?.description) {
                      checkFinalData.recipe.description = "";
                    }
                  }}
                  placeholder="description of your recipe..."
                  error={checkFinalData?.recipe?.description}
                />
              </div>
              {/* error of Description */}
              <div className="text-red-500 text-sm font-semibold"></div>
            </div>
          </div>

          {/* tabs option of flowbite for smaller screen below lg */}
          <Tabs
            theme={{
              tablist: {
                tabitem: {
                  variant: {
                    fullWidth: {
                      active: { on: "bg-app-primary text-white", off: "hover:bg-app-table-row" },
                    },
                  },
                },
              },
            }}
            className="flex"
            aria-label="Tabs with icons"
            variant="fullWidth"
          >
            {/* Ingredients */}
            <TabItem active title="Ingredients" icon={GiAvocado}>
              <div className="min-h-[calc(100vh-100px)]">
                {/* button to add first heading and Total cost of recipe*/}
                <div className="flex items-center justify-between h-10 p-1">
                  {/* Top header button */}
                  <div>
                    {!showTopRow && (
                      <div className="">
                        <Button
                          className="cursor-pointer bg-app-secondary rounded-full"
                          // color="light"
                          onClick={() => setShowTopRow(true)}
                        >
                          Add Top Header
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* cost of recipe */}
                  <div className="flex space-x-2 text-lg ">
                    <div className="font-semibold">Costing :</div>
                    <p className="">£ {totalCost.toFixed(2)}</p>
                  </div>
                </div>

                {/* ingredients  list*/}
                <div className="overflow-x-auto">
                  <div className="flex flex-col min-w-107 px-0.5 pb-14">
                    {/* Ingredients table header */}
                    <div className="flex w-full h-10 border rounded-t-xl border-gray-500 mt-2  ">
                      <div className="flex w-6 sm:min-w-10 items-center justify-center pl-0.5">
                        No.
                      </div>
                      <div className="flex min-w-15 items-center justify-center">Move</div>
                      <div className="flex flex-6 items-center">
                        <div className="flex flex-8 justify-center ">Name</div>
                        <div className="flex flex-3 justify-center ">Qnty</div>
                        <div className="flex flex-4 justify-center ">Unit</div>
                        <div className="flex flex-3 justify-center ">Cost</div>
                      </div>
                      <div className=" hidden lg:flex lg:flex-4 lg:flex-col lg:bg-gray-300  lg:rounded-t-xl">
                        <div className="text-sm  mx-auto ">Base</div>
                        <div className="grow border-t border-0.5 border-gray-500"></div>
                        <div className="flex text-sm">
                          <div className="flex flex-1 justify-center">Qty</div>
                          <div className="flex flex-1 justify-center">Unit</div>
                          <div className="flex flex-1 justify-center">Price</div>
                        </div>
                      </div>
                      <div className="block w-10 sm:hidden"></div>
                      <div className="hidden sm:flex min-w-15 justify-center items-center">
                        <div className="flex">Action</div>
                      </div>
                    </div>

                    {/* Dynamic ingredient rows display */}
                    {recipeInfo?.components?.map((comp, indexc) => (
                      <>
                        <div className="flex flex-col w-full border-x border-gray-500">
                          {/* displaying the sub header if condition matched*/}
                          {(showTopRow || comp.componentText !== "" || indexc !== 0) && (
                            <div
                              key={comp.uid}
                              className="flex w-full justify-between bg-gray-200 border-b border-gray-500"
                            >
                              <div className="flex-1 p-1 max-w-sm">
                                <Input
                                  className="flex w-full py-1 rounded placeholder:text-gray-400"
                                  color="white"
                                  value={comp?.componentText ?? ""}
                                  placeholder={"Base, Dough, etc..."}
                                  onFocus={(e) => findSameTextComponent(comp.uid, e.target.value)}
                                  onChange={(e) => {
                                    setRecipeInfo((prev) => ({
                                      ...prev,
                                      components: prev.components.map((component) =>
                                        component.uid === comp.uid
                                          ? {
                                              ...component,
                                              componentText: e.target.value,
                                              errorText: "",
                                            }
                                          : component,
                                      ),
                                    }));
                                    removeErrorTextIfFound();
                                  }}
                                  error={comp.errorText ?? ""}
                                  onBlur={(e) => checkDuplicateText(comp.uid, e.target.value)}
                                />
                              </div>
                              <div className="flex w-10 sm:min-w-15 items-center justify-center">
                                <div
                                  className=" text-red-400 hover:text-red-900 transition duration-300"
                                  onClick={() => deleteComponentHeader(comp.uid, indexc)}
                                >
                                  <HiTrash className="cursor-pointer h-6 w-6 hover:scale-125 transition duration-300" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* displaying ingredients within sub header */}
                          {comp.ingredients?.map((ing, index) => (
                            // ingredient row
                            <div
                              key={ing.uid}
                              className="flex flex-1 items-stretch bg-gray-50 border-b border-gray-400"
                            >
                              {/* 1st column - Sr No. */}
                              <div className="flex w-6 sm:min-w-10 p-1 h-10 justify-end items-center">
                                {index + 1}.
                              </div>

                              {/* 2nd column - Move rows buttons */}
                              <div className="flex w-15 p-1 items-center justify-center gap-x-1">
                                {index !== comp.ingredients.length - 1 && (
                                  <>
                                    {(indexc !== 0 || index !== 0) && (
                                      <div
                                        className="p-1 border border-gray-600 text-gray-500 rounded-md cursor-pointer 
                                hover:scale-125 hover:text-gray-900 hover:bg-gray-400 transition  duration-300"
                                        onClick={() => move(comp.uid, ing.uid, index, indexc, -1)}
                                      >
                                        <FaAngleDoubleUp className="" />
                                      </div>
                                    )}
                                    {(indexc !== recipeInfo?.components.length - 1 ||
                                      index !== comp.ingredients.length - 2) && (
                                      <div
                                        className="p-1 border border-gray-600 text-gray-500 rounded-md cursor-pointer 
                                hover:scale-125 hover:text-gray-900 hover:bg-gray-400 transition  duration-300"
                                        onClick={() => move(comp.uid, ing.uid, index, indexc, 1)}
                                      >
                                        <FaAngleDoubleDown
                                          className=""
                                          // onClick={() => moveStep(step.uid, index, 1)}
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* col 3,4,5,6 in one div and base values for small screen */}
                              <div className="flex flex-col flex-6">
                                <div className="flex flex-6">
                                  {/* 3rd column - ing name */}
                                  <div className="relative flex flex-8 items-start pt-1 justify-start ">
                                    <Input
                                      className="flex w-full min-w-18 py-0.5 px-1 rounded placeholder:text-gray-500 "
                                      value={ing.name ?? ""}
                                      onFocus={(e) => {
                                        setActiveInputId(ing.uid);
                                        searchIng(e.target.value);
                                      }}
                                      onChange={(e) => {
                                        setRecipeInfo((prev) => ({
                                          ...prev,
                                          components: prev.components.map((component) =>
                                            component.uid === comp.uid
                                              ? {
                                                  ...component,
                                                  ingredients: component.ingredients.map((i) =>
                                                    i.uid === ing.uid
                                                      ? {
                                                          ...i,
                                                          name: e.target.value,
                                                          displayQuantity: "",
                                                          displayUnit: "",
                                                          displayPrice: "",
                                                          ogBaseQuantity: "",
                                                          ogBaseUnit: "",
                                                          ogBasePrice: "",
                                                          ingredientSource: "",
                                                          ingredientId: "",
                                                          measuringUnits: [],
                                                          baseUnits: [],
                                                          unitId: "",
                                                          unitName: "",
                                                          unit: "",
                                                          quantity: "",
                                                          errors: {},
                                                        }
                                                      : i,
                                                  ),
                                                }
                                              : component,
                                          ),
                                        }));
                                        searchIng(e.target.value);
                                        addNewIngRow(comp.uid, index);
                                        if (!activeInputId) {
                                          setActiveInputId(ing.uid);
                                        }
                                      }}
                                      onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
                                      placeholder={"milk, blue cheese, etc.."}
                                      error={
                                        ing?.errors?.errorName ?? ""
                                        // checkFinalData?.components?.[indexc]?.ingredients?.[index]?.name ?? ""
                                      }
                                      onBlur={() => {
                                        blurTimeout = setTimeout(() => {
                                          hideSuggestions(comp.uid, ing.uid);
                                        }, 100);
                                      }}
                                    />
                                    {activeInputId === ing.uid &&
                                      suggestedIng.length > 0 && ( // inputText[index] &&
                                        <div className="flex flex-8 items-center justify-center">
                                          <div
                                            className="absolute top-8.25 left-0 w-full min-w-18  text-sm max-h-25 overflow-auto z-10 
                                                          border-2 border-gray-500 rounded lg:w-38"
                                          >
                                            {suggestedIng.map((ingredient, index) => (
                                              <div
                                                key={ingredient.ingredient_id + "-" + index}
                                                ref={(el) => (itemRefs.current[index] = el)}
                                                style={{
                                                  backgroundColor:
                                                    index === highlightedIndex
                                                      ? "#c0c0c0"
                                                      : "white",
                                                  // padding: "10px",
                                                  cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                  clearTimeout(blurTimeout);
                                                  handleSelectedIng(comp.uid, ing.uid, ingredient);
                                                }}
                                              >
                                                {ingredient.name}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                  </div>

                                  {/* 4th column - quantity */}
                                  <div className="flex flex-3 p-1 min-w-7 justify-center ">
                                    <Input
                                      className="flex w-full p-0.5 text-center rounded placeholder:text-gray-500"
                                      value={ing?.quantity ?? ""}
                                      onChange={(e) => {
                                        validateInput(
                                          "quantity",
                                          e.target.value,
                                          3,
                                          5,
                                          comp.uid,
                                          ing.uid,
                                        );
                                      }}
                                      onBlur={(e) =>
                                        updateQuantity(comp.uid, ing.uid, e.target.value)
                                      }
                                      error={
                                        ing?.errors?.errorQuantity ?? ""
                                        // checkFinalData?.components?.[indexc]?.ingredients?.[index]?.quantity ?? ""
                                      }
                                    />
                                  </div>

                                  {/* 5th column unit */}
                                  <div className="flex flex-4 pt-1 items-start justify-center">
                                    <Dropdown
                                      key={ing?.unitId}
                                      className="flex rounded w-14 md:min-w-18 text-sm h-7.5 pl-1 pr-7 py-0"
                                      options={ing?.measuringUnits}
                                      value={ing?.unitId}
                                      onChange={(e) => {
                                        updateUnit(comp.uid, ing.uid, e.target.value);
                                        setRecipeInfo((prev) => ({
                                          ...prev,
                                          components: prev.components.map((component) =>
                                            component.uid === comp.uid
                                              ? {
                                                  ...component,
                                                  ingredients: component.ingredients.map(
                                                    (ingredient) =>
                                                      ingredient.uid === ing.uid
                                                        ? {
                                                            ...ingredient,
                                                            errors: {
                                                              ...ingredient.errors,
                                                              errorUnitId: "",
                                                            },
                                                          }
                                                        : ingredient,
                                                  ),
                                                }
                                              : component,
                                          ),
                                        }));
                                      }}
                                      error={ing?.errors?.errorUnitId ?? ""}
                                    />
                                  </div>

                                  {/* 6th column cost */}
                                  {/* created 2 div- one for mobile(less than sm), 2nd for wider than mobile - for sm and more) */}
                                  <div className="hidden sm:flex flex-3 justify-center items-center text-sm">
                                    {ing?.cost ? Number(Number(ing?.cost).toFixed(4)) : ""}
                                  </div>
                                  <div className="sm:hidden flex flex-3 justify-center items-center text-sm">
                                    {ing?.cost ? Number(Number(ing?.cost).toFixed(3)) : ""}
                                  </div>
                                </div>

                                {/* button for base values for small screen less than lg */}
                                {ing.name && ing.displayQuantity && (
                                  <div className="flex lg:hidden">
                                    <div
                                      className="flex items-center justify-center h-5 w-25 bg-gray-200 rounded-md text-xs mb-1 hover:cursor-pointer"
                                      onClick={() => {
                                        setCompUid(comp.uid);
                                        setIngUid(ing.uid);
                                        setQuantityValue(ing?.displayQuantity);
                                        setUnitValue(ing?.displayUnit);
                                        setBaseUnits(ing?.baseUnits);
                                        setPriceValue(ing?.displayPrice);
                                        setIsEditBaseValuesOpen(true);
                                      }}
                                    >
                                      <span>Edit Base Price</span>
                                    </div>
                                    <div className="flex h-5 items-end pl-2 text-xs text-gray-400">
                                      £ {ing?.displayPrice}/ {ing?.displayQuantity}{" "}
                                      {ing?.displayUnit}{" "}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* col 7,8,9 in one div */}
                              <div className="bg-gray-300 items-stretch hidden lg:flex lg:flex-4 lg:justify-between">
                                {/* 7th column - Base - Quantity */}
                                <div className="flex flex-3 px-2 pt-2 items-start justify-center">
                                  <Input
                                    className="flex w-full px-1 py-0 text-center  rounded "
                                    value={ing?.displayQuantity ?? ""}
                                    onChange={(e) => {
                                      validateInput(
                                        "displayQuantity",
                                        e.target.value,
                                        3,
                                        5,
                                        comp.uid,
                                        ing.uid,
                                      );
                                    }}
                                    onBlur={(e) =>
                                      updateBaseQuantity(comp.uid, ing.uid, e.target.value)
                                    }
                                    error={ing?.errors?.errorDisplayQuantity ?? ""}
                                  />
                                </div>

                                {/* 8th column - Base - Unit  */}
                                <div className="flex flex-4 pt-2 items-start justify-center">
                                  <DropdownArray
                                    key={ing?.displayUnit ?? ""}
                                    className="flex w-full rounded text-sm h-6.5 py-0  pl-1"
                                    options={ing?.baseUnits}
                                    value={ing?.displayUnit ?? ""}
                                    onChange={(e) => {
                                      updateBaseUnit(comp.uid, ing.uid, e.target.value);
                                      setRecipeInfo((prev) => ({
                                        ...prev,
                                        components: prev.components.map((component) =>
                                          component.uid === comp.uid
                                            ? {
                                                ...component,
                                                ingredients: component.ingredients.map(
                                                  (ingredient) =>
                                                    ingredient.uid === ing.uid
                                                      ? {
                                                          ...ingredient,
                                                          errors: {
                                                            ...ingredient.errors,
                                                            errorDisplayUnit: "",
                                                          },
                                                        }
                                                      : ingredient,
                                                ),
                                              }
                                            : component,
                                        ),
                                      }));
                                    }}
                                    error={ing?.errors?.errorDisplayUnit ?? ""}
                                  />
                                </div>

                                {/* 9th column - Base - Price */}
                                <div className="flex flex-3 px-2 pt-2 items-start justify-center ">
                                  <Input
                                    className="flex w-full pl-1 pr-3 py-0  rounded text-end "
                                    value={ing?.displayPrice ?? ""}
                                    onChange={(e) => {
                                      validateInput(
                                        "displayPrice",
                                        e.target.value,
                                        2,
                                        5,
                                        comp.uid,
                                        ing.uid,
                                      );
                                      // setRecipeInfo((prev) => ({
                                      //   ...prev,
                                      //   components: prev.components.map((component) =>
                                      //     component.uid === comp.uid
                                      //       ? {
                                      //           ...component,
                                      //           ingredients: component.ingredients.map((ingredient) =>
                                      //             ingredient.uid === ing.uid
                                      //               ? {
                                      //                   ...ingredient,
                                      //                   errors: {
                                      //                     ...ingredient.errors,
                                      //                     errorDisplayPrice: "",
                                      //                   },
                                      //                 }
                                      //               : ingredient,
                                      //           ),
                                      //         }
                                      //       : component,
                                      //   ),
                                      // }));
                                    }}
                                    onBlur={(e) =>
                                      updateBasePrice(comp.uid, ing.uid, e.target.value)
                                    }
                                    error={ing?.errors?.errorDisplayPrice ?? ""}
                                  />
                                </div>
                              </div>

                              {/* 10th Column - Delete ingredient */}
                              <div className="flex min-w-10 sm:w-15 text-center items-center justify-center">
                                {index !== comp.ingredients.length - 1 && (
                                  <div className=" text-red-400 hover:text-red-900 transition duration-300">
                                    <HiTrash
                                      className="cursor-pointer h-6 w-6 hover:scale-125 transition duration-300"
                                      onClick={() => deleteIngredient(comp.uid, ing.uid)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ))}
                  </div>
                </div>

                {/* button for adding new heading at the bottom */}
                <div className="my-3 pl-1">
                  <Button
                    className="cursor-pointer bg-app-secondary rounded-full"
                    // color="light"
                    onClick={() => {
                      setRecipeInfo((prev) => ({
                        ...prev,
                        components: [...prev.components, emptyComponentData()],
                      }));
                    }}
                  >
                    Add New Header
                  </Button>
                </div>

                {/* button for save and cancel at the bottom  along with global errorMessage div */}
                <div className="flex flex-col px-2">
                  <div className="px-1 h-6 font-semibold text-app-danger text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                  <div className="flex items-center justify-between my-3">
                    <Button
                      className="cursor-pointer bg-app-primary"
                      color={"dark"}
                      onClick={handleSubmit}
                    >
                      Save
                    </Button>
                    <Button
                      className="cursor-pointer"
                      color={"alternative"}
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </TabItem>

            {/* Recipe steps */}
            <TabItem title="Steps" icon={TbFoodsteps}>
              <div className="min-h-[calc(100vh-100px)]">
                {/* steps list */}
                <div className="flex flex-col">
                  {/* steps header row */}
                  <div className="flex w-full h-10 items-center border border-gray-500 rounded-t-2xl">
                    <div className="w-10 text-center">No.</div>
                    <div className="w-15 text-center">Move</div>
                    <div className="flex-1 pl-3">Steps</div>
                    <div className="w-15 texts-center">Action</div>
                  </div>

                  {/* steps from db rows */}
                  {recipeInfo?.steps?.map((step, index) => (
                    <>
                      {/* step row basic CSS(height, background, borders, width , etc...)  */}
                      <div
                        className="flex items-center w-full h-20 bg-gray-100
                              border-x border-b border-gray-500 "
                        key={step.uid}
                      >
                        {/* Steps - 1st column - Sr No. */}
                        <div className="flex w-10 pr-2 pt-2 justify-end">{index + 1}</div>

                        {/* Steps - 2nd column - Move rows buttons */}
                        <div className="flex w-15 items-center justify-center gap-x-1">
                          {index !== recipeInfo.steps.length - 1 && (
                            <>
                              {index !== 0 && (
                                <div
                                  className="p-1 border border-gray-600 text-gray-500 rounded-md cursor-pointer 
                                      hover:scale-125 hover:text-gray-900 hover:bg-gray-400 transition  duration-300"
                                  onClick={() => moveStep(step.uid, index, -1)}
                                >
                                  <FaAngleDoubleUp
                                    className=""
                                    // onClick={() => moveStep(step.uid, index, -1)}
                                  />
                                </div>
                              )}
                              {index !== recipeInfo.steps.length - 2 && (
                                <div
                                  className="p-1 border border-gray-600 text-gray-500 rounded-md cursor-pointer 
                                      hover:scale-125 hover:text-gray-900 hover:bg-gray-400 transition  duration-300"
                                  onClick={() => moveStep(step.uid, index, 1)}
                                >
                                  <FaAngleDoubleDown
                                    className=""
                                    // onClick={() => moveStep(step.uid, index, 1)}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Steps - 3rd column - step deails textarea */}
                        <div className="flex-1 ml-3 min-w-40 mt-1 items-center">
                          <Textarea
                            className="w-full p-0 px-2 h-16  border border-gray-400 rounded-md 
                              placeholder:text-gray-400 overflow-y-auto resize-none"
                            value={recipeInfo?.steps[index]?.step_text ?? ""}
                            onChange={(e) => {
                              setRecipeInfo((prev) => ({
                                ...prev,
                                steps: prev.steps.map((s, index) =>
                                  s.uid === step.uid
                                    ? {
                                        ...s,
                                        step_text: e.target.value,
                                      }
                                    : s,
                                ),
                              }));
                              addNewStepRow(index);
                            }}
                            placeholder="Next step....."
                            error={checkFinalData?.errors?.description}
                            rows={1}
                          />
                        </div>

                        {/* steps - 4th Column - Delete step */}
                        <div className="flex w-15 text-center justify-center">
                          {index !== recipeInfo.steps.length - 1 && (
                            <div
                              className=" text-red-400 hover:text-red-900 transition duration-300"
                              onClick={() => deleteStep(step.uid)}
                            >
                              <HiTrash
                                className="cursor-pointer h-6 w-6 hover:scale-125 transition duration-300"
                                // onClick={() => deleteStep(step.uid)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ))}
                </div>

                {/* button for save and cancel at the bottom  along with global errorMessage div */}
                <div className="flex flex-col px-2">
                  <div className="px-1 h-6 font-semibold text-red-500 text-sm">{errorMessage}</div>
                  <div className="flex items-center justify-between my-3">
                    <Button
                      className="cursor-pointer bg-app-primary"
                      color={"dark"}
                      onClick={handleSubmit}
                    >
                      Save
                    </Button>
                    <Button
                      className="cursor-pointer"
                      color={"alternative"}
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </TabItem>
          </Tabs>

          {/* button for save and cancel at the bottom  along with global errorMessage div */}
          {/* <div className="flex flex-col px-2">
            <div className="px-1 h-6 font-semibold text-red-500 text-sm">{errorMessage}</div>
            <div className="flex items-center justify-between my-3">
              <Button
                className="cursor-pointer bg-app-primary"
                color={"dark"}
                onClick={handleSubmit}
              >
                Save
              </Button>
              <Button className="cursor-pointer" color={"alternative"} onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div> */}
        </div>
      </div>

      {isEditBaseValuesOpen && (
        <EditBaseValuesModal
          isOpen={isEditBaseValuesOpen}
          onClose={() => setIsEditBaseValuesOpen(false)}
          onConfirm={(compUid, ingUid, updateQuantity, updateUnit, updatePrice) =>
            updateBaseValues(compUid, ingUid, updateQuantity, updateUnit, updatePrice)
          }
          title={"Created This Dish On:"}
          message={`Update values of ingredient bought`}
          cancelText={"Cancel"}
          OKtext={"Update"}
          OKtextIcon={HiClipboardList}
          quantityValue={quantityValue}
          unitValue={unitValue}
          baseUnits={baseUnits}
          priceValue={priceValue}
          compUid={compUid}
          ingUid={ingUid}
        />
      )}
    </>
  );
}

export default EditRecipe;
