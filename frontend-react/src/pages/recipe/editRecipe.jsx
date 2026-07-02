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
import Button from "../../components/button";
import { serverURL } from "../../utils/appUtils";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import DropdownArray from "../../components/dropdownArray";
import { getFinalDataForBackend } from "./editRecipeUtils/getFinalDataForBackend";
import OnDataChange from "../../utils/submitButtonActivation";
import { MyRecipeContext } from "../../context/myRecipeContext";
import TopBar from "../../components/topBar";

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
  // const [recipeInfo, setRecipeInfo] = useState({
  //   name: "",
  //   portion_size: "",
  //   description: "",
  //   privacy: "",
  //   components: sections,
  //   steps: [emptyStepRow()],
  // });
  const finalMainRecipe = {};
  const [checkFinalData, setCheckFinalData] = useState({});
  const [showTopRow, setShowTopRow] = useState(false);
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
  };

  // ------------------------------------------- to delete ingredients  ---------------------------------
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

  // ---------------------------- TEMP console to show recipe for every input ----------------------------------
  const handleSubmit = () => {
    const checkDataErrors = { recipe: {}, components: [], steps: [] };
    // checkData.errors = {};
    let isValid = true;
    setErrorMessage("");
    // // ---------------------------------- check recipe data ----------------------------------
    if (!recipeInfo.recipe.name || recipeInfo.recipe.name.trim() === "") {
      isValid = false;
      checkDataErrors.recipe.name = "Name required";
    }
    if (!recipeInfo.recipe.portion_size || recipeInfo.recipe.portion_size.trim() === "") {
      isValid = false;
      checkDataErrors.recipe.portion_size =
        "Portion size require. Eg: 1 person, 2 people, 1.5kg, etc";
    }
    if (!recipeInfo.recipe.privacy) {
      recipeInfo.privacy = false;
    }

    // // ---------------------------- check components + ingredients data ---------------------------
    recipeInfo.components.forEach((comp, indexc) => {
      if (!checkDataErrors.components) {
        checkDataErrors.components = [];
      }
      if (!checkDataErrors.components[indexc]) {
        checkDataErrors.components[indexc] = {};
      }

      if (indexc === 0 && showTopRow && comp.componentText === "") {
        isValid = false;
        checkDataErrors.components[indexc].text = "Text Required. Or delete this header";
      }
      if (indexc !== 0 && comp.componentText === "") {
        isValid = false;
        checkDataErrors.components[indexc].text = "Text Required. Or delete this header";
      }

      comp.ingredients.forEach((ing, indexi) => {
        if (!checkDataErrors?.components[indexc]?.ingredients) {
          checkDataErrors.components[indexc].ingredients = {};
        }
        if (!checkDataErrors.components[indexc].ingredients[indexi]) {
          checkDataErrors.components[indexc].ingredients[indexi] = {};
        }

        if (
          ing.ingredientId ||
          ing.quantity ||
          ing.unitId ||
          ing.displayQuantity ||
          ing.displayUnit ||
          ing.displayPrice
        ) {
          [
            { value: ing.ingredientId, name: "name" },
            { value: ing.quantity, name: "quantity" },
            { value: ing.unitId, name: "unitId" },
            { value: ing.displayQuantity, name: "displayQuantity" },
            { value: ing.displayUnit, name: "displayQnit" },
            { value: ing.displayPrice, name: "displayPrice" },
          ].forEach((i) => {
            if (!i.value) {
              isValid = false;
              checkDataErrors.components[indexc].ingredients[indexi][i.name] = "Reqiure!!";
            }
          });
        }
      });
    });

    // check if the data is valid and if NOT then return back to screen
    setCheckFinalData(checkDataErrors);
    if (!isValid) {
      return;
    }

    // // ------------ get the display order of components and ingredient updated from recipeInfo --------------------
    let ing_display_order = 1;
    const newComponentsData = recipeInfo.components.map((comp, indexc) => ({
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
      .filter((s) => s.step_text)
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

    // // get the final data that is backend compatible with the help of helper function getFinalDataForBackend
    const finalData = getFinalDataForBackend(newRecipeInfo, OgData);
    console.log("finalData :", finalData);

    // // ----------------------------------- call the bakend api to update recipe -----------------------------------
    const url = `${serverURL}/recipe/api/update/${id}`;
    const method = "patch";
    const body = finalData;

    const updateRecipe = async () => {
      try {
        setFetchLoading(true);
        // call api
        const res = await axios[method](url, body, config);
        // console.log("res :", res);
        const x = res.data.data;
        x.recipe.name = x.recipe.name + " (updated)";
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

  // ------------------------------  initial page loading screen -------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  return (
    <>
      <TopBar />
      <div className="flex mt-(--top-bar-height)">
        <div></div>
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
            {" "}
            <h3>
              Total cost:{" "}
              {recipeCosting.current === 0 ? "0.00" : Math.ceil(recipeCosting.current * 100) / 100}
            </h3>
          </div>
          <Button
            children={"Save Recipe"}
            type="button"
            disabled={updateBtn}
            onClick={() => handleSubmit()}
          />
          <Button children={`Cancel`} onClick={() => navigate(-1)} />
          <Card>
            <h2>Ingredients</h2>
            {!showTopRow && (
              <Button
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
