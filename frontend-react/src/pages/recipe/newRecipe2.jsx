import { useNavigate } from "react-router-dom";
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
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import DropdownArray from "../../components/dropdownArray";

function NewRecipe() {
  const token = localStorage.getItem("token");
  const [isPrivate, setIsPrivate] = useState(false);
  const recipeCosting = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestedIng, setSuggestedIng] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  // const [rowData, setRowData] = useState([]);

  const [activeInputId, setActiveInputId] = useState(null);
  const itemRefs = useRef([]); // -------------> for auto scroll be visible while arrow down or up in suggested ingredients div
  const emptyIngRowData = () => ({
    uid: "ing-" + (Date.now() + Math.random()),
    // rowNo: 1,
    ingredientId: "",
    ingredientSource: "",
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

  const emptySectionData = () => ({
    uid: "comp-" + (Date.now() + Math.random()),
    //   component_display_order: 0,
    component_text: "",
    ingredients: [emptyIngRowData()],
  });

  const emptyStepRow = () => ({
    uid: "step-" + (Date.now() + Math.random()),
    step_text: "",
  });

  const [sections, setSections] = useState([emptySectionData()]);

  const [recipeInfo, setRecipeInfo] = useState({
    name: "",
    portion_size: "",
    description: "",
    privacy: "",
    components: sections,
    steps: [emptyStepRow()],
  });
  const finalMainRecipe = {};
  const [checkFinalData, setCheckFinalData] = useState({});
  const [showTopRow, setShowTopRow] = useState(false);
  // const [ingRows, setIngRows] = useState([emptyIngRowData]);

  let blurTimeout;
  // config -
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Ref to keep track of timeout for ID //clicking outside suggested box of ingredient
  const timeoutRef = useRef(null);

  // call useAuth hook to check if token is available in localstorage
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  //--------------------------------- Redirect to home if token not found --------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ----------------------------- ADD new empty ingredient row function ---------------------------------------
  const addNewIngRow = (cid, index) => {
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid && section.ingredients.length === index + 1
          ? {
              ...section,
              ingredients: [...section.ingredients, emptyIngRowData()],
            }
          : section,
      ),
    );
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
    if (val.trim().length === 0) {
      clearTimeout(timeoutRef.current);
      setSuggestedIng([]);
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

  // ------------------------------------------------------- function for getting base units ----------------------------------------
  const getBaseUnits = (unit, measuringUnits) => {
    const baseUnitsToShow = [];
    const lookup = {};
    measuringUnits.forEach((i) => (lookup[i.unit_name] = i.unit_name));

    // // --------------------------------------------------- for weight units ----------------------------------
    if (weightUnits.includes(unit)) {
      // const baseUnitsToShow = [];
      weightUnits.forEach((i) => {
        if (lookup[i]) {
          baseUnitsToShow.push(lookup[i]);
        }
      });
      return baseUnitsToShow;
    }
    // // ----------------------------------------- for volume units ----------------------------------
    else if (volumeUnits.includes(unit)) {
      // const baseUnitsToShow = [];
      volumeUnits.forEach((i) => {
        if (lookup[i]) {
          baseUnitsToShow.push(lookup[i]);
        }
      });
      return baseUnitsToShow;
    } else {
      return [unit];
    }
  };

  // ------------------------------ add the selected ingredient in ingRow data --------------------------------
  const handleSelectedIng = (cid, iid, ing) => {
    // //--------- fetch the active units for the ingredient selected --------
    const fetchMeasuringUnits = async (id, source) => {
      try {
        const res = await axios.get(`${serverURL}/recipe/api/search/units/${id}/${source}`, config);
        const units = res.data.rows;
        setSections((prev) =>
          prev.map((section) =>
            section.uid === cid
              ? {
                  ...section,
                  ingredients: section.ingredients.map((ingredient) =>
                    ingredient.uid === iid
                      ? {
                          ...ingredient,
                          name: ing.name,
                          displayQuantity: ing.display_quantity,
                          displayUnit: ing.display_unit,
                          displayPrice: ing.display_price,
                          ogDisplayQuantity: ing.display_quantity,
                          ogDisplayUnit: ing.display_unit,
                          ogDisplayPrice: ing.display_price,
                          ingredientSource: ing.ingredient_source,
                          ingredientId: ing.id,
                          measuringUnits: units,
                          baseUnits: getBaseUnits(ing.display_unit, units),
                        }
                      : ingredient,
                  ),
                }
              : section,
          ),
        );
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
      setSections((prev) =>
        prev.map((section) =>
          section.uid === cid
            ? {
                ...section,
                component_text: "",
              }
            : section,
        ),
      );
    }
    if (index !== 0) {
      const toUpdtSections = sections.map((section) => ({
        ...section,
        ingredients: [...section.ingredients],
      }));
      // const toUpdtSections = [...sections];
      const ingFrom = toUpdtSections[index].ingredients;
      const ingTo = [...toUpdtSections[index - 1].ingredients];
      ingTo.pop();
      const combinedIng = [...ingTo, ...ingFrom];
      const id = toUpdtSections[index - 1].uid;
      const newSections = toUpdtSections.map((section) =>
        section.uid === id
          ? {
              ...section,
              ingredients: combinedIng,
            }
          : section,
      );

      const updated = newSections.filter((section) => section.uid !== cid);
      console.log("updated to be setSection :", updated);
      setSections(updated);
    }
  };

  // ------------------------------------------- to delete ingredients  ---------------------------------
  const deleteIngredient = (cid, iid) => {
    const selectedSection = sections.find((s) => s.uid === cid);
    const selectedIng = selectedSection.ingredients;
    const newIngList = [...selectedIng.filter((i) => i.uid !== iid)];
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: newIngList,
            }
          : section,
      ),
    );
  };

  // ------------------------------------------- to delete steps  ---------------------------------
  const deleteStep = (sid) => {
    const newStepList = [...recipeInfo.steps.filter((s) => s.uid !== sid)];
    console.log("newStepList :", newStepList);
    // return;
    setRecipeInfo((prev) => ({ ...prev, steps: newStepList }));
  };

  // ------------------------------------------- to move ingredients up or down  ---------------------------------
  const move = (cid, iid, indexi, indexc, val) => {
    console.log("cid :", cid, " iid :", iid, " indexi :", indexi, "indexc :", indexc, " val:", val);
    const section = sections.find((s) => s.uid === cid);
    const ings = [...section.ingredients];
    const iLength = ings.length;
    const ing = { ...ings.find((i) => i.uid === iid) };
    const newIngsList = [...ings.filter((i) => i.uid !== iid)];
    if ((indexi === 0 && val === -1) || (indexi === iLength - 2 && val === 1)) {
      // console.log("section [")
      const newSection = sections[indexc + val];
      const newCid = newSection.uid;
      const newIngs = [...newSection.ingredients];
      // -- create splice based on value
      if (indexi === 0 && val === -1) {
        newIngs.splice(newIngs.length + val, 0, ing);
      } else {
        newIngs.splice(0, 0, ing);
      }
      setSections((prev) =>
        prev.map((section) =>
          section.uid === newCid
            ? {
                ...section,
                ingredients: newIngs,
              }
            : section,
        ),
      );
      setSections((prev) =>
        prev.map((section) =>
          section.uid === cid
            ? {
                ...section,
                ingredients: newIngsList,
              }
            : section,
        ),
      );
      return;
    }
    newIngsList.splice(indexi + val, 0, ing);
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: newIngsList,
            }
          : section,
      ),
    );
  };

  // ------------------------------------------- to move steps up or down  ---------------------------------
  const moveStep = (sid, index, val) => {
    // const section = sections.find((s) => s.uid === cid);
    // const ings = [...section.ingredients];
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
  sections.forEach((section) => {
    section.ingredients.forEach((ingredient) => {
      const dq = Number(ingredient.displayQuantity);
      const du = ingredient.displayUnit;
      const dp = Number(ingredient.displayPrice);
      const q = ingredient.quantity;
      const u = ingredient.unit;
      const mu = ingredient.measuringUnits;

      if (dq && du && dp && q && u && mu) {
        const baseConversion = mu.find((i) => i.unit_name === du).conversion_factor || 0;
        const unitConversion = mu.find((i) => i.unit_id === u).conversion_factor || 0;
        const ingCost = (dp / dq / Number(baseConversion)) * q * Number(unitConversion);

        if (ingCost) {
          totalCost += ingCost;
          ingredient.cost = ingCost;
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
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayQuantity: Number(val),
                    }
                  : ingredient,
              ),
            }
          : section,
      ),
    );
  };

  const updateBasePrice = (cid, iid, val) => {
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayPrice: Number(val),
                    }
                  : ingredient,
              ),
            }
          : section,
      ),
    );
  };

  const updateBaseUnit = (cid, iid, val) => {
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      displayUnit: val,
                    }
                  : ingredient,
              ),
            }
          : section,
      ),
    );
  };

  const updateQuantity = (cid, iid, val) => {
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      quantity: Number(val),
                    }
                  : ingredient,
              ),
            }
          : section,
      ),
    );
  };

  const updateUnit = (cid, iid, val) => {
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
                ingredient.uid === iid
                  ? {
                      ...ingredient,
                      unit: Number(val),
                    }
                  : ingredient,
              ),
            }
          : section,
      ),
    );
  };

  // --------------------------- hide suggestions onBlur if ingredient not selected ------------------------------
  const hideSuggestions = (cid, iid) => {
    setSuggestedIng([]);
    setSections((prev) =>
      prev.map((section) =>
        section.uid === cid
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient) =>
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
          : section,
      ),
    );
  };

  // ---------------------------- console to show recipe for every input ----------------------------------
  const handlesubmit = () => {
    // get recipe info
    // console.log("sections in handlesubmit:", sections);

    finalMainRecipe.name = recipeInfo?.name ?? "";
    finalMainRecipe.portion_size = recipeInfo?.portion_size ?? "";
    finalMainRecipe.description = recipeInfo?.description ?? "";
    finalMainRecipe.privacy = recipeInfo?.privacy == "" ? "private" : recipeInfo?.privacy;

    // get components and ingredients info
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
          // check if display values are same with ogDisplay values
          if (
            i.displayPrice !== i.ogDisplayPrice ||
            i.displayQuantity !== i.ogDisplayQuantity ||
            i.displayUnit !== i.ogDisplayUnit
          ) {
            ing.display_price = i.displayPrice;
            ing.display_quantity = i.displayQuantity;
            ing.display_unit = i.displayUnit;
          }

          ingredients.push(ing);
        }
      });
      comp.ingredients = ingredients;
      components.push(comp);
    });
    finalMainRecipe.components = components;
    // finalMainRecipe.steps = recipeInfo.steps;

    //  get steps information
    const steps = [];
    let step_display_order = 0;
    recipeInfo.steps.forEach((s) => {
      if (s.step_text) {
        step_display_order++;
        const step = {};
        step.step_order = step_display_order;
        step.step_text = s.step_text;
        steps.push(step);
      }
    });

    // checking data for any errors like incomplete data or missing fields, heading ,,etc
    const checkData = { ...finalMainRecipe, steps: steps };
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
      let ingCount = 0; //---------------> to count valid ingredients in each component
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
          ingCount++;
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
          if (ing.display_quantity || ing.display_unit || ing.display_price) {
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
              checkData.errors.components[comp.uid].ingredients[ing.uid].display_price =
                "Reqiure!!";
            }
          }
        }
      });

      // make sure every component(subheading) has alteast one ingredient
      if (ingCount === 0) {
        checkData.errors.components[comp.uid].text =
          "Need atleast one ingredient within this section";
      }
    });

    if (ing_display_order < 2) {
      isValid = false;
      setErrorMessage("Need atleast 2 ingredients to make a recipe");
    }
    setCheckFinalData(checkData);
    console.log("data that is being sent to bckend:", checkData);
    if (!isValid) {
      return;
    }

    // Call api and save the recipe in db
    const saveRecipe = async () => {
      try {
        const url = `${serverURL}/recipe/api/new`;
        const method = "post";
        const body = checkData;

        const res = await axios[method](url, body, config);
        console.log("res: ", res);
        const newData = res?.data?.data;
        if (newData) {
          setRecipeDetails((prev) => [...prev, newData]);
          setMyRecipes((prev) => [newData.recipe, ...prev]);
        }
        navigate(`/recipe/${res.data.recipeId}`);
      } catch (err) {
        console.log("err found during saving new recipe api: ", err.response.data);
        return;
      }
    };
    saveRecipe();
  };

  // console.log("sections :", sections);
  // console.log("sections :", sections);
  // console.log("suggested ing  :", suggestedIng);
  // console.log("activeInputId", activeInputId);
  // console.log("recipeInfo :", recipeInfo);
  return (
    <>
      <Navbar />
      <h1>Welcome to Create Recipes</h1>
      <Input
        label={"Recipe name: "}
        type="text"
        value={recipeInfo.name ?? ""}
        onChange={(e) => {
          setRecipeInfo({ ...recipeInfo, name: e.target.value });
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
        onChange={(e) => {
          setRecipeInfo({ ...recipeInfo, portion_size: e.target.value });
          if (checkFinalData?.errors?.portion_size) {
            checkFinalData.errors.portion_size = "";
          }
        }}
        placeholder={"eg. 2 person, 1kg, 750ml, etc."}
        error={checkFinalData?.errors?.portion_size}
      />
      <Textarea
        label={"Description"}
        onChange={(e) => {
          setRecipeInfo({ ...recipeInfo, description: e.target.value });
        }}
        placeholder="description of your recipe..."
        error={checkFinalData?.errors?.description}
        rows={10}
      />
      <Toggle
        title="privacy"
        checked={isPrivate}
        onText="Private"
        offText="Public"
        onChange={(e) => {
          setIsPrivate(e.target.checked);
          setRecipeInfo({
            ...recipeInfo,
            privacy: e.target.checked === true ? "private" : "public",
          });
        }}
      />
      <div>
        {" "}
        <h3>Total cost: {recipeCosting.current === 0 ? "0.00" : recipeCosting.current}</h3>
      </div>
      <Button
        children={"Save Recipe"}
        type="button"
        disabled={false}
        onClick={() => handlesubmit()}
      />
      <div style={{ color: "#ff0000" }}>
        <h4>{errorMessage}</h4>
      </div>
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
            {sections.map((comp, indexc) => (
              <>
                {(showTopRow || indexc !== 0) && (
                  <tr key={comp.uid} style={{ backgroundColor: "#f0f0f0" }}>
                    <td colSpan={7}>
                      <Input
                        type={"text"}
                        value={comp?.component_text ?? ""}
                        placeholder={"Base, Dough, etc..."}
                        onChange={(e) => {
                          setSections((prev) =>
                            prev.map((section) =>
                              section.uid === comp.uid
                                ? { ...section, component_text: e.target.value }
                                : section,
                            ),
                          );
                          if (checkFinalData?.errors?.components[comp.uid]?.text) {
                            checkFinalData.errors.components[comp.uid].text = "";
                          }
                        }}
                        error={checkFinalData?.errors?.components[comp.uid]?.text}
                      />
                    </td>
                    <td>
                      <Button
                        // id={"delete"}
                        children={"Delete"}
                        type="button"
                        disabled={false}
                        onClick={() => deleteComponentHeader(comp.uid, indexc)}
                      />
                    </td>
                    <td></td>
                  </tr>
                )}

                {sections[indexc]?.ingredients?.map((ing, index) => (
                  <tr key={ing.uid}>
                    <td>
                      <div style={{ position: "relative" }}>
                        <Input
                          type={"text"}
                          value={ing.name ?? ""}
                          onFocus={(e) => {
                            setActiveInputId(ing.uid);
                            searchIng(e.target.value);
                            // setInputText((prev) => ({ ...prev, [index]: e.target.value }));
                            // console.log("setInputText :", inputText[index]);
                          }}
                          onChange={(e) => {
                            setSections((prev) =>
                              prev.map((section) =>
                                section.uid === comp.uid
                                  ? {
                                      ...section,
                                      ingredients: section.ingredients.map((i) =>
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
                                              unit: "",
                                              quantity: "",
                                              ogDisplayPrice: "",
                                              ogDisplayQuantity: "",
                                              ogDisplayUnit: "",
                                            }
                                          : i,
                                      ),
                                    }
                                  : section,
                              ),
                            );
                            searchIng(e.target.value);
                            addNewIngRow(comp.uid, index);
                            if (!activeInputId) {
                              setActiveInputId(ing.uid);
                            }
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
                        value={ing?.unit}
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
                      {index !== sections[indexc].ingredients.length - 1 && (
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
                      {index !== sections[indexc].ingredients.length - 1 && (
                        <>
                          {(indexc !== 0 || index !== 0) && (
                            <Button
                              // id={"delete"}
                              children={"↑"}
                              type="button"
                              disabled={false}
                              onClick={() => move(comp.uid, ing.uid, index, indexc, -1)}
                            />
                          )}
                          {(indexc !== sections.length - 1 ||
                            index !== sections[indexc].ingredients.length - 2) && (
                            <Button
                              // id={"delete"}
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
            setSections((prev) => [...prev, emptySectionData()]);
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
            {recipeInfo.steps.map((step, index) => (
              <>
                <tr key={step.uid}>
                  <td>{index + 1}</td>
                  <td>
                    <Textarea
                      label={""}
                      value={recipeInfo?.steps[index]?.step_text ?? ""}
                      onChange={(e) => {
                        setRecipeInfo({
                          ...recipeInfo,
                          steps: recipeInfo.steps.map((s, index) =>
                            s.uid === step.uid
                              ? {
                                  ...s,
                                  step_text: e.target.value,
                                }
                              : s,
                          ),
                        });
                        addNewStepRow(index);
                      }}
                      placeholder="text....."
                      error={checkFinalData?.errors?.description}
                      rows={2}
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
}

export default NewRecipe;
