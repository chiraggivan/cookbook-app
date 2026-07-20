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
import { Button, TextInput } from "flowbite-react";
import { GiHotMeal, GiHotSpices } from "react-icons/gi";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import { HiTrash } from "react-icons/hi";

function EditRecipe() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [OgData, setOgData] = useState({});
  const [isPrivate, setIsPrivate] = useState(false);
  const recipeCosting = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
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

  // call useAuth hook to check if token is available in localstorage
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();

  // ------------------------------------ Above, initialisation of variables done ---------------------------------------

  //--------------------------------- Redirect to home if token not found --------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

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
        setFetchLoading(true);
        // if (token) {
        const res = await axios[method](url, config);
        const tempRecipe = res?.data?.data;
        // console.log("tempRecipe :", tempRecipe);
        tempRecipe?.recipe?.privacy === "private" ? setIsPrivate(true) : setIsPrivate(false);
        const recipeData = { ...tempRecipe.recipe };
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
        window.alert(`Error while fetching recipe data from database`);
        console.log("error while fetching reicpe details with axios is :", err.response);
      } finally {
        setFetchLoading(false);
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
            ? { ...component, errorText: "Sub header already use." }
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
        setErrorMessage("Need atleast one ingredient within sub heading");
        return;
      }
    });

    // check if the data is valid and if NOT then return back to screen
    // (cant exit the function from forEach return as done above. It only stops forEach and comes out)
    if (!isValid) {
      setErrorMessage("Errors found above.");
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
    console.log("About to call api to save the edit the recipe.");
    // return;

    // // ----------------------------------- call the bakend api to update recipe -----------------------------------
    const url = `${serverURL}/recipe/api/update/${id}`;
    const method = "patch";
    const body = finalData;

    const updateRecipe = async () => {
      try {
        setFetchLoading(true);
        // call api
        const res = await axios[method](url, body, config);
        console.log("res :", res);
        const x = res.data.data.data;
        // x.recipe.name = x.recipe.name + " (updated)";
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
        setFetchLoading(false);
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

  // ------------------------------  initial page loading screen -------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  return (
    <>
      <div className="flex flex-col  mt-(--top-bar-height) ml-(--left-side-bar) ">
        {/* line just below top bar  */}
        <div className="flex sticky z-10 h-0.5 shadow top-(--top-bar-height) bg-white"></div>

        <div className="flex flex-col w-full max-w-3xl  mx-auto my-5">
          <div className="text-xl font-bold mt-8 mb-4"> Edit Recipe Details</div>
          {/* Line Separator */}
          <div className="flex items-center mb-2">
            <div className="grow border-t border-gray-300"></div>
          </div>
          {/* recipe details and image */}
          <div className="flex flex-col-reverse w-full gap-3 md:flex-row md:justify-between">
            {/* recipe details */}
            <div className="flex flex-col justify-between h-40">
              {/* recipe name section */}
              <div className="flex max-w-md">
                {/* title of recipe name */}
                <div className="flex px-1 items-center font-semibold justify-end w-36">Name :</div>
                {/* input name section */}

                <Input
                  className="flex border border-gray-300 rounded-lg bg-gray-50 placeholder:text-gray-400"
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
              {/* recipe portion size section */}
              <div className="flex max-w-md">
                {/* title of portion size*/}
                <div className="flex px-1 items-center font-semibold justify-end w-36">
                  Portion size :
                </div>
                {/* input portion section */}
                <Input
                  className="flex border border-gray-300 rounded-lg bg-gray-50 placeholder:text-gray-400"
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
              {/* recipe Privacy section */}
              <div className="flex max-w-md">
                {/* title of privacy*/}
                <div className="flex px-1 items-center font-semibold justify-end w-26">
                  Privacy :
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
            <div className="mx-auto max-w-70 h-40 md:rounded-lg  bg-gray-200 md:max-w-40 md:mx-0">
              <GiHotMeal className="h-full w-full" />
            </div>
          </div>

          {/* recipe description */}
          <div className="flex flex-col mt-5">
            <div className="flex font-semibold justify-end w-26">Description :</div>
            <div className="mt-2">
              <Textarea
                className="w-full h-40 bg-gray-50 border-gray-300 rounded-lg resize-none placeholder:text-gray-400"
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

          {/* button to add first heading */}
          {!showTopRow && (
            <div className="mt-1">
              <Button
                className="cursor-pointer rounded-full"
                color="light"
                onClick={() => setShowTopRow(true)}
              >
                Add Top Header
              </Button>
            </div>
          )}

          {/* ingredients  list - New */}
          <div className="flex flex-col ">
            {/* Ingredients table header */}
            <div className="flex w-full h-10 border rounded-t-xl border-gray-500 mt-2  ">
              <div className="flex min-w-10 items-center justify-center">No.</div>
              <div className="flex min-w-15 items-center justify-center">Move</div>
              <div className="flex flex-6 items-center justify-between ">
                <div className="flex flex-8 justify-center ">Name</div>
                <div className="flex flex-3 justify-center ">Qnty</div>
                <div className="flex flex-4 justify-center ">Unit</div>
                <div className="flex flex-3 justify-center ">Cost</div>
              </div>
              <div className=" hidden lg:flex lg:flex-4 lg:flex-col lg:w-full lg:min-w-58 lg:bg-gray-300  lg:rounded-t-xl">
                <div className="text-sm  mx-auto ">Base</div>
                <div className="grow border-t border-0.5 border-gray-500"></div>
                <div className="flex text-sm">
                  <div className="flex w-1/3 justify-center">Qty</div>
                  <div className="flex w-1/3 justify-center">Unit</div>
                  <div className="flex w-1/3 justify-center">Price</div>
                </div>
              </div>
              <div className="flex min-w-15 lg:w-1">
                <div className="flex justify-end items-center px-2">Action</div>
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
                                  ? { ...component, componentText: e.target.value, errorText: "" }
                                  : component,
                              ),
                            }));
                            removeErrorTextIfFound();
                          }}
                          error={comp.errorText ?? ""}
                          onBlur={(e) => checkDuplicateText(comp.uid, e.target.value)}
                        />
                      </div>
                      <div className="flex w-15 items-center justify-center">
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
                      <div className="flex w-10 p-1 h-10 justify-end items-center">
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

                      {/* col 3,4,5,6 in one div */}
                      <div className="flex flex-6">
                        {/* 3rd column - ing name */}
                        <div className="relative flex flex-8 items-start pt-1 justify-start ">
                          <Input
                            className="flex w-full min-w-38 py-0.5 px-1 rounded placeholder:text-gray-500 "
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
                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]?.name
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].name = "";
                              // }

                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]
                              //     ?.displayQuantity
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].displayQuantity = "";
                              // }
                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]
                              //     ?.displayUnit
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].displayUnit = "";
                              // }
                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]
                              //     ?.displayPrice
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].displayPrice = "";
                              // }
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
                                {/* <div
                                  style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #ccc",
                                    zIndex: 10,
                                    maxHeight: "70px",
                                    overflow: "auto",
                                  }}
                                > */}
                                <div
                                  className="absolute top-8.25 left-0 w-full min-w-38  text-sm max-h-25 overflow-auto z-10 
                                        border-2 border-gray-500 rounded lg:w-38"
                                >
                                  {suggestedIng.map((ingredient, index) => (
                                    <div
                                      key={ingredient.ingredient_id + "-" + index}
                                      ref={(el) => (itemRefs.current[index] = el)}
                                      style={{
                                        backgroundColor:
                                          index === highlightedIndex ? "#f0f0f0" : "white",
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
                        <div className="flex flex-3 p-1 justify-center ">
                          <Input
                            className="flex w-full p-0.5 text-center rounded placeholder:text-gray-500"
                            value={ing?.quantity ?? ""}
                            onChange={(e) => {
                              updateQuantity(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]?.quantity
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].quantity = "";
                              // }
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
                                                  errorQuantity: "",
                                                },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              }));
                            }}
                            error={
                              ing?.errors?.errorQuantity ?? ""
                              // checkFinalData?.components?.[indexc]?.ingredients?.[index]?.quantity ?? ""
                            }
                          />
                        </div>

                        {/* 5th column */}
                        <div className="flex flex-4 pt-1 items-start justify-center ">
                          <Dropdown
                            className="flex rounded  text-sm h-7.5 pl-1 pr-7 py-0"
                            options={ing?.measuringUnits}
                            value={ing?.unitId}
                            onChange={(e) => {
                              updateUnit(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId
                              // ) {
                              //   const x = checkFinalData.components[indexc];
                              //   x.ingredients[index].unitId = "";
                              // }
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
                                                  errorUnit: "",
                                                },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              }));
                            }}
                            error={
                              ing?.errors?.errorUnitId ?? ""
                              // checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId ?? ""
                            }
                          />
                        </div>

                        {/* 6th column */}
                        <div className="flex flex-3 justify-center items-center text-sm">
                          {ing?.cost ? Number(Number(ing?.cost).toFixed(4)) : ""}
                        </div>
                      </div>

                      {/* col 7,8,9 in one div */}
                      <div className="bg-gray-300 items-stretch hidden lg:flex lg:flex-4 lg:justify-between">
                        {/* 7th column - Base - Quantity */}
                        <div className="flex flex-3 px-2 pt-2 items-start justify-center">
                          <Input
                            className="flex w-full px-1 py-0 text-center  rounded "
                            value={ing?.displayQuantity ?? ""}
                            onChange={(e) => {
                              updateBaseQuantity(comp.uid, ing.uid, e.target.value);
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
                                                  errorDisplayQuantity: "",
                                                },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              }));
                            }}
                            error={ing?.errors?.errorDisplayQuantity ?? ""}
                          />
                        </div>

                        {/* 8th column - Base - Unit  */}
                        <div className="flex flex-4 pt-2 items-start justify-center">
                          <DropdownArray
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
                                        ingredients: component.ingredients.map((ingredient) =>
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
                              updateBasePrice(comp.uid, ing.uid, e.target.value);
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
                                                  errorDisplayPrice: "",
                                                },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              }));
                            }}
                            error={ing?.errors?.errorDisplayPrice ?? ""}
                          />
                        </div>
                      </div>

                      {/* 10th Column - Delete ingredient */}
                      <div className="flex w-15 text-center items-center justify-center">
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

          {/* button for adding new heading at the bottom */}
          <div className="my-3">
            <Button
              className="cursor-pointer rounded-full"
              color="light"
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
          <div className="flex flex-col">
            <div className="px-1 mt-2 h-6 font-semibold text-red-500 text-sm">{errorMessage}</div>
            <div className="flex items-center justify-between my-3">
              <Button className="cursor-pointer" color={"dark"} onClick={handleSubmit}>
                Save
              </Button>
              <Button className="cursor-pointer" color={"alternative"} onClick={() => navigate(-1)}>
                Canel
              </Button>
            </div>
          </div>

          {/* ingredients list */}
          <div className="flex flex-col ">
            {/* Ingredients table header */}
            <div className="flex w-full bg-blue-200 mt-2">
              <div className="flex w-18 min-w-15 items-center justify-center bg-amber-100">
                Move
              </div>
              <div className="flex items-center w-full justify-between bg-pink-400">
                <div className="flex min-w-10 justify-center bg-amber-100">No.</div>
                <div className="flex min-w-42 max-w-48 justify-center bg-amber-200">Name</div>
                <div className="flex min-w-15 justify-center bg-amber-100">Qnty</div>
                <div className="flex min-w-18 justify-center bg-amber-200">Unit</div>
                <div className="flex min-w-15 justify-center bg-amber-100">Cost</div>
              </div>
              <div className=" hidden lg:flex lg:flex-col lg:w-full lg:min-w-58 lg:border-2 lg:border-gray-500 lg:rounded-t-xl">
                <div className="text-sm  mx-auto ">Base</div>
                <div className="h-0.5 bg-gray-500"></div>
                <div className="flex text-sm">
                  <div className="flex w-1/3 justify-center">Qty</div>
                  <div className="flex w-1/3 justify-center">Unit</div>
                  <div className="flex w-1/3 justify-center">Price</div>
                </div>
              </div>
              <div className="flex w-14 lg:w-1">
                <div className="flex w-full justify-end items-center px-2">Action</div>
              </div>
            </div>
            {/* Dynamic ingredient rows display */}
            <div className="flex flex-col w-full bg-blue-100">
              {recipeInfo?.components?.map((comp, indexc) => (
                <>
                  {/* displaying the sub header if condition matched*/}
                  {(showTopRow || comp.componentText !== "" || indexc !== 0) && (
                    <div key={comp.uid} className="flex w-full justify-between bg-blue-100">
                      <div className="p-1 w-full max-w-sm">
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
                                  ? { ...component, componentText: e.target.value }
                                  : component,
                              ),
                            }));
                            if (checkFinalData?.components?.[indexc]?.text) {
                              checkFinalData.components[indexc].text = "";
                            }
                            removeErrorTextIfFound();
                          }}
                          error={checkFinalData?.components?.[indexc]?.text}
                          onBlur={(e) => checkDuplicateText(comp.uid, e.target.value)}
                        />
                      </div>
                      <div className="flex w-15 items-center justify-center">
                        <Button
                          className="p-0 w-8 h-8 bg-gray-100 text-red-600 border border-gray-500 "
                          onClick={() => deleteComponentHeader(comp.uid, indexc)}
                        >
                          <HiTrash className="h-full w-full py-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* displaying ingredients within sub header */}
                  {comp.ingredients?.map((ing, index) => (
                    // ingredient row
                    <div
                      key={ing.uid}
                      className="flex w-full justify-between items-center bg-blue-50 border-b border-gray-400"
                    >
                      {/* 1st column Move rows*/}
                      <div className="flex w-15 min-w-15">
                        {index !== comp.ingredients.length - 1 && (
                          <div className="flex w-full justify-center items-center my-1 space-x-2">
                            {(indexc !== 0 || index !== 0) && (
                              <div className="flex ">
                                <Button
                                  className="p-0 w-6 h-7 bg-gray-100 text-gray-700 border border-gray-500 "
                                  onClick={() => move(comp.uid, ing.uid, index, indexc, -1)}
                                >
                                  <FaAngleDoubleUp />
                                </Button>
                              </div>
                            )}
                            {(indexc !== recipeInfo?.components.length - 1 ||
                              index !== comp.ingredients.length - 2) && (
                              <div className="flex ">
                                <Button
                                  className="p-0 w-6 h-7 bg-gray-100 text-gray-700 border border-gray-500 "
                                  onClick={() => move(comp.uid, ing.uid, index, indexc, 1)}
                                >
                                  <FaAngleDoubleDown />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex w-full items-center justify-between">
                        {/* 2nd column - Sr No. */}
                        <div className="flex w-10 p-1 bg-amber-100 h-6 justify-end items-center">
                          {index + 1}
                        </div>
                        {/* 3rd column - ing name */}
                        <div className="relative">
                          <Input
                            className="flex min-w-38 max-w-48 py-0.5 rounded placeholder:text-gray-500 lg:max-w-38"
                            color="white"
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
                              if (
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.name
                              ) {
                                const x = checkFinalData.errors.components[comp.uid];
                                x.ingredients[ing.uid].name = "";
                              }
                            }}
                            onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
                            placeholder={"milk, blue cheese, etc.."}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]?.name ?? ""
                            }
                            onBlur={() => {
                              blurTimeout = setTimeout(() => {
                                hideSuggestions(comp.uid, ing.uid);
                              }, 100);
                            }}
                          />
                        </div>
                        {/* 4th column - Quantity */}
                        <div className=" flex w-12">
                          <Input
                            className="flex w-full py-0.5 rounded placeholder:text-gray-500"
                            value={ing?.quantity ?? ""}
                            onChange={(e) => {
                              updateQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]?.quantity
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].quantity = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.quantity ?? ""
                            }
                          />
                        </div>
                        {/* 5th column - Unit used */}
                        <div className="flex w-18 items-center justify-center h-6">
                          <Dropdown
                            className="flex w-full rounded  text-sm h-7.5 pl-1 pr-7 py-0"
                            options={ing?.measuringUnits}
                            value={ing?.unitId}
                            onChange={(e) => {
                              updateUnit(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].unitId = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId ??
                              ""
                            }
                            // style={{ maxHeight: "30px", overflow: "auto" }}
                          />
                        </div>
                        {/* 6th column - Costs */}
                        <div className="flex w-15 mr-2 justify-end items-center lg:pr-2">
                          {ing?.cost ?? ""}
                        </div>
                      </div>
                      {/* base values  colums in separate div */}
                      <div className="hidden lg:flex lg:w-full lg:max-w-57 lg:justify-between  bg-amber-100">
                        {/* 7th column - Base - Quantity */}
                        <div className="flex max-w-15 items-center justify-center ">
                          <Input
                            className="flex w-full px-1 py-0  rounded "
                            value={ing?.displayQuantity ?? ""}
                            onChange={(e) => {
                              updateBaseQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayQuantity
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayQuantity = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayQuantity ?? ""
                            }
                          />
                        </div>
                        {/* 8th column - Base - Unit */}
                        <div className="flex w-22 max-w-18 items-center justify-center ">
                          <DropdownArray
                            className="flex w-full rounded  text-sm h-6.5 pl-1 pr-7 py-0"
                            options={ing?.baseUnits}
                            value={ing?.displayUnit ?? ""}
                            onChange={(e) => {
                              updateBaseUnit(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayUnit
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayUnit = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayUnit ?? ""
                            }
                          />
                        </div>
                        {/* 9th column - Base - Price */}
                        <div className="flex max-w-15 item-center justify-center ">
                          <Input
                            className="flex w-full px-1 py-0  rounded "
                            value={ing?.displayPrice ?? ""}
                            onChange={(e) => {
                              updateBaseQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayQuantity
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayQuantity = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayQuantity ?? ""
                            }
                          />
                        </div>
                      </div>
                      {/* 10th column - Delete action */}
                      <div className="flex ml-auto w-15 min-w-15 max-w-15 items-center justify-center">
                        {index !== comp.ingredients.length - 1 && (
                          <Button
                            className="p-0 w-8 h-8 bg-gray-100 text-red-600 border border-gray-500 "
                            onClick={() => deleteComponentHeader(comp.uid, indexc)}
                          >
                            <HiTrash className="h-full w-full py-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* //////////////////////////////////////////////////////////////////////// */}

        <div>
          <h1>Welcome to Create Recipes</h1>
          <Input
            label={"Recipe name: "}
            type="text"
            value={recipeInfo?.recipe?.name ?? ""}
            onChange={(e) => {
              setRecipeInfo({
                ...recipeInfo,
                recipe: { ...recipeInfo.recipe, name: e.target.value },
              });
              if (checkFinalData?.recipe?.name) {
                checkFinalData.recipe.name = "";
              }
            }}
            placeholder={"Name of the recipe...."}
            error={checkFinalData?.recipe?.name}
          />
          <Input
            label={"Portion of: "}
            type="text"
            value={recipeInfo?.recipe?.portion_size ?? ""}
            onChange={(e) => {
              setRecipeInfo({
                ...recipeInfo,
                recipe: { ...recipeInfo.recipe, portion_size: e.target.value },
              });
              if (checkFinalData?.recipe?.portion_size) {
                checkFinalData.recipe.portion_size = "";
              }
            }}
            placeholder={"eg. 2 person, 1kg, 750ml, etc."}
            error={checkFinalData?.recipe?.portion_size}
          />
          <Textarea
            label={"Description"}
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
            rows={10}
          />
          <Toggle
            title={"privacy"}
            checked={isPrivate}
            onText="Private"
            offText="Private"
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
          <div>
            <h3>
              Total cost:
              {recipeCosting.current === 0 ? "0.00" : Math.ceil(recipeCosting.current * 100) / 100}
            </h3>
          </div>
          <Button
            className="bg-gray-500"
            children={"Save Recipe"}
            type="button"
            disabled={updateBtn}
            onClick={() => handleSubmit()}
          />
          <Button children={`Cancel`} onClick={() => navigate(-1)} />
          {/* -----------------------ingredients section -------------------- */}
          <Card>
            <h2>Ingredients</h2>
            {!showTopRow && (
              <Button
                className="bg-gray-200"
                id={"add_top_header"}
                children={"Add Top Header"}
                type="button"
                disabled={false}
                onClick={() => setShowTopRow(true)}
              />
            )}

            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Cost</th>
                  <th>Base quantity</th>
                  <th>Base Unit</th>
                  <th>Base price</th>
                  <th>Delete</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recipeInfo?.components?.map((comp, indexc) => (
                  <>
                    {(showTopRow || comp.componentText !== "" || indexc !== 0) && (
                      <tr key={comp.uid} style={{ backgroundColor: "#f0f0f0" }}>
                        <td colSpan={7}>
                          <Input
                            type={"text"}
                            value={comp?.componentText ?? ""}
                            placeholder={"Base, Dough, etc..."}
                            onChange={(e) => {
                              setRecipeInfo((prev) => ({
                                ...prev,
                                components: prev.components.map((component) =>
                                  component.uid === comp.uid
                                    ? { ...component, componentText: e.target.value }
                                    : component,
                                ),
                              }));
                              if (checkFinalData?.components?.[indexc]?.text) {
                                checkFinalData.components[indexc].text = "";
                              }
                            }}
                            error={checkFinalData?.components?.[indexc]?.text}
                          />
                        </td>
                        <td>
                          <Button
                            children={"Delete"}
                            type="button"
                            disabled={false}
                            onClick={() => deleteComponentHeader(comp.uid, indexc)}
                          />
                        </td>
                        <td></td>
                      </tr>
                    )}

                    {comp.ingredients?.map((ing, index) => (
                      <tr key={ing.uid}>
                        <td>
                          <div style={{ position: "relative" }}>
                            <Input
                              type={"text"}
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
                                if (
                                  checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                    ing.uid
                                  ]?.name
                                ) {
                                  const x = checkFinalData.errors.components[comp.uid];
                                  x.ingredients[ing.uid].name = "";
                                }
                              }}
                              onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
                              placeholder={"milk, blue cheese, etc.."}
                              error={
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]?.name ??
                                ""
                              }
                              onBlur={() => {
                                blurTimeout = setTimeout(() => {
                                  hideSuggestions(comp.uid, ing.uid);
                                }, 100);
                              }}
                            />
                            {activeInputId === ing.uid &&
                              suggestedIng.length > 0 && ( // inputText[index] &&
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #ccc",
                                    zIndex: 10,
                                    maxHeight: "70px",
                                    overflow: "auto",
                                  }}
                                >
                                  {/* {suggestedIng.map((ingredient, index) => (
                                    <div
                                      key={ingredient.ingredient_id + "-" + index}
                                      ref={(el) => (itemRefs.current[index] = el)}
                                      style={{
                                        backgroundColor:
                                          index === highlightedIndex ? "#f0f0f0" : "white",
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
                                  ))} */}
                                </div>
                              )}
                          </div>
                        </td>
                        <td>
                          <Input
                            type={"number"}
                            value={ing?.quantity ?? ""}
                            onChange={(e) => {
                              updateQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]?.quantity
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].quantity = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.quantity ?? ""
                            }
                          />
                        </td>
                        <td>
                          <Dropdown
                            options={ing?.measuringUnits}
                            value={ing?.unitId}
                            onChange={(e) => {
                              updateUnit(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].unitId = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]?.unitId ??
                              ""
                            }
                            style={{ maxHeight: "30px", overflow: "auto" }}
                          />
                        </td>
                        <td>{ing?.cost ?? ""}</td>
                        <td>
                          <Input
                            type={"number"}
                            value={ing?.displayQuantity ?? ""}
                            onChange={(e) => {
                              updateBaseQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayQuantity
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayQuantity = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayQuantity ?? ""
                            }
                          />
                        </td>
                        <td>
                          <DropdownArray
                            options={ing?.baseUnits}
                            value={ing?.displayUnit ?? ""}
                            onChange={(e) => {
                              updateBaseUnit(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayUnit
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayUnit = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayUnit ?? ""
                            }
                          />
                        </td>
                        <td>
                          <Input
                            type={"number"}
                            value={ing?.displayPrice ?? ""}
                            onChange={(e) => {
                              updateBasePrice(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                  ?.displayPrice
                              ) {
                                const x = checkFinalData.components[indexc];
                                x.ingredients[index].displayPrice = "";
                              }
                            }}
                            error={
                              checkFinalData?.components?.[indexc]?.ingredients?.[index]
                                ?.displayPrice ?? ""
                            }
                          />
                        </td>
                        <td>
                          {index !== comp.ingredients.length - 1 && (
                            <Button
                              // id={"delete"}
                              children={"Delete"}
                              type="button"
                              disabled={false}
                              onClick={() => deleteIngredient(comp.uid, ing.uid)}
                            />
                          )}
                        </td>
                        <td>
                          {index !== comp.ingredients.length - 1 && (
                            <>
                              {(indexc !== 0 || index !== 0) && (
                                <Button
                                  children={"↑"}
                                  type="button"
                                  disabled={false}
                                  onClick={() => move(comp.uid, ing.uid, index, indexc, -1)}
                                />
                              )}
                              {(indexc !== recipeInfo?.components.length - 1 ||
                                index !== comp.ingredients.length - 2) && (
                                <Button
                                  children={"↓"}
                                  type="button"
                                  disabled={false}
                                  onClick={() => move(comp.uid, ing.uid, index, indexc, 1)}
                                />
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </Table>

            <Button
              id={"add_header"}
              children={"Add New Section"}
              type="button"
              disabled={false}
              onClick={() => {
                setRecipeInfo((prev) => ({
                  ...prev,
                  components: [...prev.components, emptyComponentData()],
                }));
              }}
            />
          </Card>

          {/* -------------------------- Steps section ----------------------- */}

          <Card>
            <h2>Steps</h2>

            <Table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Step Text</th>
                  <th>Delete</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recipeInfo?.steps?.map((step, index) => (
                  <>
                    <tr key={step.uid}>
                      <td>{index + 1}</td>
                      <td>
                        <Textarea
                          label={""}
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
                          placeholder="text....."
                          error={checkFinalData?.errors?.description}
                          rows={3}
                        />
                      </td>
                      <td>
                        {index !== recipeInfo.steps.length - 1 && (
                          <Button
                            // id={"delete"}
                            children={"Delete"}
                            type="button"
                            disabled={false}
                            onClick={() => deleteStep(step.uid)}
                          />
                        )}
                      </td>
                      <td>
                        {index !== recipeInfo.steps.length - 1 && (
                          <>
                            {index !== 0 && (
                              <Button
                                // id={"delete"}
                                children={"↑"}
                                type="button"
                                disabled={false}
                                onClick={() => moveStep(step.uid, index, -1)}
                              />
                            )}
                            {index !== recipeInfo.steps.length - 2 && (
                              <Button
                                // id={"delete"}
                                children={"↓"}
                                type="button"
                                disabled={false}
                                onClick={() => moveStep(step.uid, index, 1)}
                              />
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}

export default EditRecipe;
