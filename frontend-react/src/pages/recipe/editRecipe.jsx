import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Input from "../../components/input";
import Textarea from "../../components/textarea";
import Toggle from "../../components/toggle";
import Card from "../../components/card";
import Table from "../../components/table";
import Dropdown from "../../components/dropdown";
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { serverURL } from "../../utils/appUtils";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import DropdownArray from "../../components/dropdownArray";

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
    unit: "",
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
        console.log("tempRecipe :", tempRecipe);
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
          comp.recipeComponentId = compIngs[0]?.recipe_component_id ?? "";
          comp.componentText = compIngs[0]?.component_text ?? "";
          comp.componentDisplayOrder = compIngs[0]?.component_display_order;
          comp.ingredients = [];

          for (const i of compIngs) {
            const ing = {};
            ing.uid = "ing-" + (Date.now() + Math.floor(Math.random() * 1000));
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
            // ing.cost = i.cost;
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
        console.log("error while fetching reicpe details with axios is :", err.response);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------------------- TEMP console to show recipe for every input ----------------------------------
  const handlesubmit = () => {
    finalMainRecipe.name = recipeInfo?.recipe?.name ?? "";
    finalMainRecipe.portion_size = recipeInfo?.recipe?.portion_size ?? "";
    finalMainRecipe.description = recipeInfo?.recipe?.description ?? "";
    finalMainRecipe.privacy = recipeInfo?.recipe?.privacy == "" ? false : recipeInfo?.privacy;

    const components = [];
    let ing_display_order = 0;

    sections.forEach((section, indexc) => {
      const comp = {};
      comp.component_text = section.component_text ?? "";
      comp.component_display_order = indexc;
      comp.uid = section.uid;
      const ingredients = [];

      section.ingredients.forEach((i) => {
        if (
          i.ingredientId ||
          i.ingredientSource ||
          i.quantity ||
          i.unit ||
          i.displayQuantity ||
          i.displayUnit ||
          i.displayPrice
        ) {
          ing_display_order++;
          const ing = {};
          ing.uid = i.uid;
          ing.ingredient_display_order = ing_display_order;
          ing.ingredient_id = i.ingredientId ?? 0;
          ing.ingredient_source = i.ingredientSource ?? "";
          ing.quantity = i.quantity ?? "";
          ing.unit = i.unit ?? "";
          ing.display_price = i.displayPrice;
          ing.display_quantity = i.displayQuantity;
          ing.display_unit = i.displayUnit;
          ingredients.push(ing);
        }
      });
      comp.ingredients = ingredients;
      components.push(comp);
    });
    finalMainRecipe.components = components;

    const steps = [];
    let step_display_order = 0;

    // console.log("finalMainRecipe", finalMainRecipe);
    const checkData = { ...finalMainRecipe };
    checkData.errors = {};
    let isValid = true;
    setErrorMessage("");

    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      checkData.errors.name = "Name required";
    }
    if (!checkData.portion_size || checkData.portion_size.trim() === "") {
      isValid = false;
      checkData.errors.portion_size = "Portion size require. Eg: 1 person, 2 people, 1.5kg, etc";
    }
    if (!checkData.privacy) {
      recipeInfo.privacy = false;
    }

    checkData.components.forEach((comp, index) => {
      if (!checkData.errors.components) {
        checkData.errors.components = {};
      }
      if (!checkData.errors.components[comp.uid]) {
        checkData.errors.components[comp.uid] = {};
      }

      if (index === 0 && showTopRow && comp.component_text === "") {
        isValid = false;
        checkData.errors.components[comp.uid].text = "Text Required. Or delete this header";
      }
      if (index !== 0 && comp.component_text === "") {
        isValid = false;
        checkData.errors.components[comp.uid].text = "Text Required. Or delete this header";
      }

      comp.ingredients.forEach((ing) => {
        if (!checkData?.errors?.components[comp.uid]?.ingredients) {
          checkData.errors.components[comp.uid].ingredients = {};
        }
        if (!checkData.errors.components[comp.uid].ingredients[ing.uid]) {
          checkData.errors.components[comp.uid].ingredients[ing.uid] = {};
        }

        if (
          ing.ingredient_id ||
          ing.quantity ||
          ing.unit ||
          ing.display_quantity ||
          ing.display_unit ||
          ing.display_price
        ) {
          if (!ing.display_quantity) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].display_quantity =
              "Reqiure!!";
          }
          if (!ing.display_unit) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].display_unit = "Reqiure!!";
          }
          if (!ing.display_price) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].display_price = "Reqiure!!";
          }
          if (!ing.unit) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].unit = "Unit Req";
          }
          if (!ing.quantity) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].quantity = "Quantity Req";
          }
          if (!ing.ingredient_id) {
            isValid = false;
            checkData.errors.components[comp.uid].ingredients[ing.uid].name = "Name Reqiure";
          }
        }
      });
    });

    setCheckFinalData(checkData);
    // console.log("recipeInfo after checking  :", recipeInfo);
    console.log("checkFinalData", checkFinalData);
    if (!isValid) {
      return;
    }
  };

  // ----------------------------- ADD new empty ingredient row function ---------------------------------------
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
          // setExistIngs("");
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
      } catch (err) {
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
          ingredient.cost = ingCost.toFixed(4);
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
                      unitName: ingredient.measuringUnits.find((mu) => mu.unit_id === Number(val))
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

  // console.log("inputText :", inputText);
  // console.log("sections :", sections);
  // console.log("suggested ing  :", suggestedIng);
  // console.log("activeInputId", activeInputId);
  console.log("recipeInfo :", recipeInfo);
  console.log("OgData :", OgData);

  // ------------------------------  initial page loading screen -------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  return (
    <>
      <Navbar />
      <h1>Welcome to Create Recipes</h1>
      <Input
        label={"Recipe name: "}
        type="text"
        value={recipeInfo?.recipe?.name ?? ""}
        onChange={(e) => {
          setRecipeInfo({ ...recipeInfo, recipe: { ...recipeInfo.recipe, name: e.target.value } });
          if (checkFinalData?.errors?.name) {
            checkFinalData.errors.name = "";
          }
        }}
        placeholder={"Name of the recipe...."}
        error={checkFinalData?.errors?.name}
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
          if (checkFinalData?.errors?.portion_size) {
            checkFinalData.errors.portion_size = "";
          }
        }}
        placeholder={"eg. 2 person, 1kg, 750ml, etc."}
        error={checkFinalData?.errors?.portion_size}
      />
      <Textarea
        label={"Description"}
        value={recipeInfo?.recipe?.description ?? ""}
        onChange={(e) => {
          setRecipeInfo({
            ...recipeInfo,
            recipe: { ...recipeInfo.recipe, description: e.target.value },
          });
        }}
        placeholder="description of your recipe..."
        error={checkFinalData?.errors?.description}
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
        disabled={false}
        onClick={() => handlesubmit()}
      />
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
                {(showTopRow || indexc !== 0) && (
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
                          if (checkFinalData?.errors?.components[comp.uid]?.text) {
                            checkFinalData.errors.components[comp.uid].text = "";
                          }
                        }}
                        error={checkFinalData?.errors?.components[comp.uid]?.text}
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
                                              ingredientSource: "",
                                              ingredientId: "",
                                              measuringUnits: [],
                                              baseUnits: [],
                                              unitId: "",
                                              unitName: "",
                                            }
                                          : i,
                                      ),
                                    }
                                  : section,
                              ),
                            }));
                            searchIng(e.target.value);
                            addNewIngRow(comp.uid, index);
                            if (
                              checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                                ?.name
                            ) {
                              const x = checkFinalData.errors.components[comp.uid];
                              x.ingredients[ing.uid].name = "";
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
                          placeholder={"milk, blue cheese, etc.."}
                          error={
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.name ?? ""
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
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.quantity
                          ) {
                            const x = checkFinalData.errors.components[comp.uid];
                            x.ingredients[ing.uid].quantity = "";
                          }
                        }}
                        error={
                          checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
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
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.unit
                          ) {
                            const x = checkFinalData.errors.components[comp.uid];
                            x.ingredients[ing.uid].unit = "";
                          }
                        }}
                        error={
                          checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                            ?.unit ?? ""
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
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.display_quantity
                          ) {
                            const x = checkFinalData.errors.components[comp.uid];
                            x.ingredients[ing.uid].display_quantity = "";
                          }
                        }}
                        error={
                          checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                            ?.display_quantity ?? ""
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
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.display_unit
                          ) {
                            const x = checkFinalData.errors.components[comp.uid];
                            x.ingredients[ing.uid].display_unit = "";
                          }
                        }}
                        error={
                          checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                            ?.display_unit ?? ""
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
                            checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                              ?.display_price
                          ) {
                            const x = checkFinalData.errors.components[comp.uid];
                            x.ingredients[ing.uid].display_price = "";
                          }
                        }}
                        error={
                          checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
                            ?.display_price ?? ""
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
    </>
  );
  // return (
  //   <>
  //     <Navbar />
  //     <h1>Welcome to Create Recipes</h1>
  //     <Input
  //       label={"Recipe name: "}
  //       type="text"
  //       value={recipeInfo.name ?? ""}
  //       onChange={(e) => {
  //         setRecipeInfo({ ...recipeInfo, name: e.target.value });
  //         if (checkFinalData?.errors?.name) {
  //           checkFinalData.errors.name = "";
  //         }
  //       }}
  //       placeholder={"Name of the recipe...."}
  //       error={checkFinalData?.errors?.name}
  //     />
  //     <Input
  //       label={"Portion of: "}
  //       type="text"
  //       onChange={(e) => {
  //         setRecipeInfo({ ...recipeInfo, portion_size: e.target.value });
  //         if (checkFinalData?.errors?.portion_size) {
  //           checkFinalData.errors.portion_size = "";
  //         }
  //       }}
  //       placeholder={"eg. 2 person, 1kg, 750ml, etc."}
  //       error={checkFinalData?.errors?.portion_size}
  //     />
  //     <Textarea
  //       label={"Description"}
  //       onChange={(e) => {
  //         setRecipeInfo({ ...recipeInfo, description: e.target.value });
  //       }}
  //       placeholder="description of your recipe..."
  //       error={checkFinalData?.errors?.description}
  //       rows={10}
  //     />
  //     <Toggle
  //       title="privacy"
  //       checked={isPrivate}
  //       onText="Private"
  //       offText="Public"
  //       onChange={(e) => {
  //         setIsPrivate(e.target.checked);
  //         setRecipeInfo({ ...recipeInfo, privacy: e.target.checked });
  //       }}
  //     />
  //     <div>
  //       {" "}
  //       <h3>Total cost: {recipeCosting.current === 0 ? "0.00" : recipeCosting.current}</h3>
  //     </div>
  //     <Button
  //       children={"Save Recipe"}
  //       type="button"
  //       disabled={false}
  //       onClick={() => handlesubmit()}
  //     />
  //     <Card>
  //       <h2>Ingredients</h2>
  //       {!showTopRow && (
  //         <Button
  //           id={"add_top_header"}
  //           children={"Add Top Header"}
  //           type="button"
  //           disabled={false}
  //           onClick={() => setShowTopRow(true)}
  //         />
  //       )}

  //       <Table>
  //         <thead>
  //           <tr>
  //             <th>Name</th>
  //             <th>Quantity</th>
  //             <th>Unit</th>
  //             <th>Cost</th>
  //             <th>Base quantity</th>
  //             <th>Base Unit</th>
  //             <th>Base price</th>
  //             <th>Delete</th>
  //             <th>Action</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {sections.map((comp, indexc) => (
  //             <>
  //               {(showTopRow || indexc !== 0) && (
  //                 <tr key={comp.uid} style={{ backgroundColor: "#f0f0f0" }}>
  //                   <td colSpan={7}>
  //                     <Input
  //                       type={"text"}
  //                       value={comp?.component_text ?? ""}
  //                       placeholder={"Base, Dough, etc..."}
  //                       onChange={(e) => {
  //                         setSections((prev) =>
  //                           prev.map((section) =>
  //                             section.uid === comp.uid
  //                               ? { ...section, component_text: e.target.value }
  //                               : section,
  //                           ),
  //                         );
  //                         if (checkFinalData?.errors?.components[comp.uid]?.text) {
  //                           checkFinalData.errors.components[comp.uid].text = "";
  //                         }
  //                       }}
  //                       error={checkFinalData?.errors?.components[comp.uid]?.text}
  //                     />
  //                   </td>
  //                   <td>
  //                     <Button
  //                       // id={"delete"}
  //                       children={"Delete"}
  //                       type="button"
  //                       disabled={false}
  //                       onClick={() => deleteComponentHeader(comp.uid, indexc)}
  //                     />
  //                   </td>
  //                   <td></td>
  //                 </tr>
  //               )}

  //               {sections[indexc]?.ingredients?.map((ing, index) => (
  //                 <tr key={ing.uid}>
  //                   <td>
  //                     <div style={{ position: "relative" }}>
  //                       <Input
  //                         type={"text"}
  //                         value={ing.name ?? ""}
  //                         onFocus={(e) => {
  //                           setActiveInputId(ing.uid);
  //                           searchIng(e.target.value);
  //                           // setInputText((prev) => ({ ...prev, [index]: e.target.value }));
  //                           // console.log("setInputText :", inputText[index]);
  //                         }}
  //                         onChange={(e) => {
  //                           setSections((prev) =>
  //                             prev.map((section) =>
  //                               section.uid === comp.uid
  //                                 ? {
  //                                     ...section,
  //                                     ingredients: section.ingredients.map((i) =>
  //                                       i.uid === ing.uid
  //                                         ? {
  //                                             ...i,
  //                                             name: e.target.value,
  //                                             displayQuantity: "",
  //                                             displayUnit: "",
  //                                             displayPrice: "",
  //                                             ingredientSource: "",
  //                                             ingredientId: "",
  //                                             measuringUnits: [],
  //                                             baseUnits: [],
  //                                           }
  //                                         : i,
  //                                     ),
  //                                   }
  //                                 : section,
  //                             ),
  //                           );
  //                           searchIng(e.target.value);
  //                           addNewIngRow(comp.uid, index);
  //                           if (
  //                             checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                               ?.name
  //                           ) {
  //                             const x = checkFinalData.errors.components[comp.uid];
  //                             x.ingredients[ing.uid].name = "";
  //                           }
  //                         }}
  //                         onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
  //                         placeholder={"milk, blue cheese, etc.."}
  //                         error={
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.name ?? ""
  //                         }
  //                         onBlur={() => {
  //                           blurTimeout = setTimeout(() => {
  //                             hideSuggestions(comp.uid, ing.uid);
  //                           }, 100);
  //                         }}
  //                       />
  //                       {activeInputId === ing.uid &&
  //                         suggestedIng.length > 0 && ( // inputText[index] &&
  //                           <div
  //                             style={{
  //                               position: "absolute",
  //                               top: "100%",
  //                               left: 0,
  //                               width: "100%",
  //                               background: "white",
  //                               border: "1px solid #ccc",
  //                               zIndex: 10,
  //                               maxHeight: "70px",
  //                               overflow: "auto",
  //                             }}
  //                           >
  //                             {suggestedIng.map((ingredient, index) => (
  //                               <div
  //                                 key={ingredient.ingredient_id + "-" + index}
  //                                 ref={(el) => (itemRefs.current[index] = el)}
  //                                 style={{
  //                                   backgroundColor:
  //                                     index === highlightedIndex ? "#f0f0f0" : "white",
  //                                   // padding: "10px",
  //                                   cursor: "pointer",
  //                                 }}
  //                                 onClick={() => {
  //                                   clearTimeout(blurTimeout);
  //                                   handleSelectedIng(comp.uid, ing.uid, ingredient);
  //                                 }}
  //                               >
  //                                 {ingredient.name}
  //                               </div>
  //                             ))}
  //                           </div>
  //                         )}
  //                     </div>
  //                   </td>
  //                   <td>
  //                     <Input
  //                       type={"number"}
  //                       value={ing?.quantity ?? ""}
  //                       onChange={(e) => {
  //                         updateQuantity(comp.uid, ing.uid, e.target.value);
  //                         if (
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.quantity
  //                         ) {
  //                           const x = checkFinalData.errors.components[comp.uid];
  //                           x.ingredients[ing.uid].quantity = "";
  //                         }
  //                       }}
  //                       error={
  //                         checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                           ?.quantity ?? ""
  //                       }
  //                     />
  //                   </td>
  //                   <td>
  //                     <Dropdown
  //                       options={ing?.measuringUnits}
  //                       value={ing?.unit}
  //                       onChange={(e) => {
  //                         updateUnit(comp.uid, ing.uid, e.target.value);
  //                         if (
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.unit
  //                         ) {
  //                           const x = checkFinalData.errors.components[comp.uid];
  //                           x.ingredients[ing.uid].unit = "";
  //                         }
  //                       }}
  //                       error={
  //                         checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                           ?.unit ?? ""
  //                       }
  //                       style={{ maxHeight: "30px", overflow: "auto" }}
  //                     />
  //                   </td>
  //                   <td>{ing?.cost ?? ""}</td>
  //                   <td>
  //                     <Input
  //                       type={"number"}
  //                       value={ing?.displayQuantity ?? ""}
  //                       onChange={(e) => {
  //                         updateBaseQuantity(comp.uid, ing.uid, e.target.value);
  //                         if (
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.display_quantity
  //                         ) {
  //                           const x = checkFinalData.errors.components[comp.uid];
  //                           x.ingredients[ing.uid].display_quantity = "";
  //                         }
  //                       }}
  //                       error={
  //                         checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                           ?.display_quantity ?? ""
  //                       }
  //                     />
  //                   </td>
  //                   <td>
  //                     <DropdownArray
  //                       options={ing?.baseUnits}
  //                       value={ing?.displayUnit ?? ""}
  //                       onChange={(e) => {
  //                         updateBaseUnit(comp.uid, ing.uid, e.target.value);
  //                         if (
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.display_unit
  //                         ) {
  //                           const x = checkFinalData.errors.components[comp.uid];
  //                           x.ingredients[ing.uid].display_unit = "";
  //                         }
  //                       }}
  //                       error={
  //                         checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                           ?.display_unit ?? ""
  //                       }
  //                     />
  //                   </td>
  //                   <td>
  //                     <Input
  //                       type={"number"}
  //                       value={ing?.displayPrice ?? ""}
  //                       onChange={(e) => {
  //                         updateBasePrice(comp.uid, ing.uid, e.target.value);
  //                         if (
  //                           checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                             ?.display_price
  //                         ) {
  //                           const x = checkFinalData.errors.components[comp.uid];
  //                           x.ingredients[ing.uid].display_price = "";
  //                         }
  //                       }}
  //                       error={
  //                         checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]
  //                           ?.display_price ?? ""
  //                       }
  //                     />
  //                   </td>
  //                   <td>
  //                     {index !== sections[indexc].ingredients.length - 1 && (
  //                       <Button
  //                         // id={"delete"}
  //                         children={"Delete"}
  //                         type="button"
  //                         disabled={false}
  //                         onClick={() => deleteIngredient(comp.uid, ing.uid)}
  //                       />
  //                     )}
  //                   </td>
  //                   <td>
  //                     {index !== sections[indexc].ingredients.length - 1 && (
  //                       <>
  //                         {(indexc !== 0 || index !== 0) && (
  //                           <Button
  //                             // id={"delete"}
  //                             children={"↑"}
  //                             type="button"
  //                             disabled={false}
  //                             onClick={() => move(comp.uid, ing.uid, index, indexc, -1)}
  //                           />
  //                         )}
  //                         {(indexc !== sections.length - 1 ||
  //                           index !== sections[indexc].ingredients.length - 2) && (
  //                           <Button
  //                             // id={"delete"}
  //                             children={"↓"}
  //                             type="button"
  //                             disabled={false}
  //                             onClick={() => move(comp.uid, ing.uid, index, indexc, 1)}
  //                           />
  //                         )}
  //                       </>
  //                     )}
  //                   </td>
  //                 </tr>
  //               ))}
  //             </>
  //           ))}
  //         </tbody>
  //       </Table>

  //       <Button
  //         id={"add_header"}
  //         children={"Add New Section"}
  //         type="button"
  //         disabled={false}
  //         onClick={() => {
  //           setSections((prev) => [...prev, emptySectionData()]);
  //         }}
  //       />
  //     </Card>

  //     {/* -------------------------- Steps section ----------------------- */}

  //     <Card>
  //       <h2>Steps</h2>

  //       <Table>
  //         <thead>
  //           <tr>
  //             <th>Sr. No.</th>
  //             <th>Step Text</th>
  //             <th>Delete</th>
  //             <th>Action</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {recipeInfo.steps.map((step, index) => (
  //             <>
  //               <tr key={step.uid}>
  //                 <td>{index + 1}</td>
  //                 <td>
  //                   <Textarea
  //                     label={""}
  //                     value={recipeInfo?.steps[index]?.step_text ?? ""}
  //                     onChange={(e) => {
  //                       setRecipeInfo({
  //                         ...recipeInfo,
  //                         steps: recipeInfo.steps.map((s, index) =>
  //                           s.uid === step.uid
  //                             ? {
  //                                 ...s,
  //                                 step_text: e.target.value,
  //                               }
  //                             : s,
  //                         ),
  //                       });
  //                       addNewStepRow(index);
  //                     }}
  //                     placeholder="text....."
  //                     error={checkFinalData?.errors?.description}
  //                     rows={2}
  //                   />
  //                 </td>
  //                 <td>
  //                   {index !== recipeInfo.steps.length - 1 && (
  //                     <Button
  //                       // id={"delete"}
  //                       children={"Delete"}
  //                       type="button"
  //                       disabled={false}
  //                       onClick={() => deleteStep(step.uid)}
  //                     />
  //                   )}
  //                 </td>
  //                 <td>
  //                   {index !== recipeInfo.steps.length - 1 && (
  //                     <>
  //                       {index !== 0 && (
  //                         <Button
  //                           // id={"delete"}
  //                           children={"↑"}
  //                           type="button"
  //                           disabled={false}
  //                           onClick={() => moveStep(step.uid, index, -1)}
  //                         />
  //                       )}
  //                       {index !== recipeInfo.steps.length - 2 && (
  //                         <Button
  //                           // id={"delete"}
  //                           children={"↓"}
  //                           type="button"
  //                           disabled={false}
  //                           onClick={() => moveStep(step.uid, index, 1)}
  //                         />
  //                       )}
  //                     </>
  //                   )}
  //                 </td>
  //               </tr>
  //             </>
  //           ))}
  //         </tbody>
  //       </Table>
  //     </Card>
  //   </>
  // );
}

export default EditRecipe;
