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
import Navbar from "../../components/navbarOld";
// import Button from "../../components/button";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import DropdownArray from "../../components/dropdownArray";
import TopBar from "../../components/topBar";
import { TextInput, Button } from "flowbite-react";
import { GiHotMeal } from "react-icons/gi";
import { HiTrash } from "react-icons/hi";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";

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
    errors: {},
  });

  const emptySectionData = () => ({
    uid: "comp-" + (Date.now() + Math.random()),
    //   component_display_order: 0,
    componentText: "",
    errorText: "",
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
  let sameSubHeadIds = []; // ---> to save the list of same sub header text which will be used to clear the error onChange

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
                componentText: "",
                errorText: "",
              }
            : section,
        ),
      );
      setRecipeInfo((prev) => ({
        ...prev,
        components: prev.components.map((component) =>
          component.uid === cid ? { ...component, componentText: "" } : component,
        ),
      }));
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

  // ---------------------- check duplicate text for sub headers(component) onBlur -------------------------------
  const checkDuplicateText = (uid, value) => {
    // console.log("uid :", uid, " and value is :", value);
    if (
      sections.some(
        (item) =>
          item.componentText !== "" &&
          item.componentText.replace(/\s+/g, " ").toLowerCase().trim() ===
            value.replace(/\s+/g, " ").toLowerCase().trim() &&
          item.uid !== uid,
      )
    ) {
      setSections((prev) =>
        prev.map((section) =>
          section.uid === uid ? { ...section, errorText: "Sub header already use." } : section,
        ),
      );
    }
  };

  // ---------------- find list of all the same text sub header (component) onFocus -----------------------------
  const findSameTextComponent = (uid, value) => {
    // console.log("uid :", uid, " and value is :", value);
    sameSubHeadIds = sections
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
      setSections((prev) =>
        prev.map((section) =>
          section.uid === sameSubHeadIds[0] ? { ...section, errorText: "" } : section,
        ),
      );
    }
  };

  // ---------------------------- console to show recipe for every input ----------------------------------
  const handleSubmit = () => {
    // console.log("recipeInfo", recipeInfo);
    // console.log("sections in handlesubmit:", sections);

    finalMainRecipe.name = recipeInfo?.name ?? "";
    finalMainRecipe.portion_size = recipeInfo?.portion_size ?? "";
    finalMainRecipe.description = recipeInfo?.description ?? "";
    finalMainRecipe.privacy = recipeInfo?.privacy == "" ? "private" : recipeInfo?.privacy;

    // get components and ingredients info
    const components = [];
    let ing_display_order = 0;

    // creating new variable having all info and compatible with backend naming  convention
    sections.forEach((section, indexc) => {
      const comp = {};
      comp.component_text = section.componentText ?? "";
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
      if (s.step_text.trim()) {
        step_display_order++;
        const step = {};
        step.step_order = step_display_order;
        step.step_text = s.step_text.trim();
        steps.push(step);
      }
    });

    // checking data for any errors like incomplete data or missing fields, heading ,,etc
    const checkData = { ...finalMainRecipe, steps: steps };
    let isValid = true;
    setErrorMessage("");

    // validate name of recipe
    if (!checkData.name || checkData.name.trim() === "") {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        error_name: "Name Required",
      }));
    }

    // validate portion_size of recipe
    if (!checkData.portion_size || checkData.portion_size.trim() === "") {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        error_portion_size: "Portion Size Required",
      }));
    }

    // validate privacy : if no privacy data then make it default false
    if (!checkData.privacy) {
      recipeInfo.privacy = false;
    }

    // validate Description
    if (checkData.description.length >= 500) {
      isValid = false;
      setRecipeInfo((prev) => ({
        ...prev,
        error_description: "Description should be less than 500 characters",
      }));
    }

    // check if any error fields found in subheading (component) text (like duplicate text)
    if (sections.some((item) => item.errorText !== "")) {
      isValid = false;
      setErrorMessage("Errors found above in sub headers.");
      return;
    }

    // validate sub headers and ingredients (from sections variable)
    checkData.components.forEach((comp, index) => {
      let ingCount = 0; //---------------> to count valid ingredients in each component

      //  Two if conditions: first to top header which is hidden and second is for other added header
      // console.log("comp outside :", comp, "index is :", index, " and showTopRow:", showTopRow);
      if (index === 0 && showTopRow && comp.component_text === "") {
        isValid = false;
        setSections((prev) =>
          prev.map((component) =>
            component.uid === comp.uid
              ? {
                  ...component,
                  errorText: "Text required or delete this header!!!!!!!!",
                }
              : component,
          ),
        );
      }
      if (index !== 0 && comp.component_text === "") {
        isValid = false;
        setSections((prev) =>
          prev.map((component) =>
            component.uid === comp.uid
              ? {
                  ...component,
                  errorText: "Text required or delete this header!!!!",
                }
              : component,
          ),
        );
      }

      comp.ingredients.forEach((ing) => {
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
            setSections((prev) =>
              prev.map((component) =>
                component.uid === comp.uid
                  ? {
                      ...component,
                      ingredients: component.ingredients.map((ingredient) =>
                        ingredient.uid === ing.uid
                          ? {
                              ...ingredient,
                              errors: { ...ingredient.errors, errorUnit: "Required" },
                            }
                          : ingredient,
                      ),
                    }
                  : component,
              ),
            );
          }
          if (!ing.quantity) {
            isValid = false;
            setSections((prev) =>
              prev.map((component) =>
                component.uid === comp.uid
                  ? {
                      ...component,
                      ingredients: component.ingredients.map((ingredient) =>
                        ingredient.uid === ing.uid
                          ? {
                              ...ingredient,
                              errors: { ...ingredient.errors, errorQuantity: "Required" },
                            }
                          : ingredient,
                      ),
                    }
                  : component,
              ),
            );
          }
          if (!ing.ingredient_id) {
            isValid = false;
            setSections((prev) =>
              prev.map((component) =>
                component.uid === comp.uid
                  ? {
                      ...component,
                      ingredients: component.ingredients.map((ingredient) =>
                        ingredient.uid === ing.uid
                          ? {
                              ...ingredient,
                              errors: { ...ingredient.errors, errorName: "Name Required" },
                            }
                          : ingredient,
                      ),
                    }
                  : component,
              ),
            );
          }
          if (ing.display_quantity || ing.display_unit || ing.display_price) {
            if (!ing.display_quantity) {
              isValid = false;
              setSections((prev) =>
                prev.map((component) =>
                  component.uid === comp.uid
                    ? {
                        ...component,
                        ingredients: component.ingredients.map((ingredient) =>
                          ingredient.uid === ing.uid
                            ? {
                                ...ingredient,
                                errors: {
                                  ...ingredient.errors,
                                  errorDisplayQuantity: "Required",
                                },
                              }
                            : ingredient,
                        ),
                      }
                    : component,
                ),
              );
            }
            if (!ing.display_unit) {
              isValid = false;
              setSections((prev) =>
                prev.map((component) =>
                  component.uid === comp.uid
                    ? {
                        ...component,
                        ingredients: component.ingredients.map((ingredient) =>
                          ingredient.uid === ing.uid
                            ? {
                                ...ingredient,
                                errors: { ...ingredient.errors, errorDisplayUnit: "Required" },
                              }
                            : ingredient,
                        ),
                      }
                    : component,
                ),
              );
            }
            if (!ing.display_price) {
              isValid = false;
              setSections((prev) =>
                prev.map((component) =>
                  component.uid === comp.uid
                    ? {
                        ...component,
                        ingredients: component.ingredients.map((ingredient) =>
                          ingredient.uid === ing.uid
                            ? {
                                ...ingredient,
                                errors: { ...ingredient.errors, errorDisplayPrice: "Required" },
                              }
                            : ingredient,
                        ),
                      }
                    : component,
                ),
              );
            }
          }
        }
      });

      // make sure every component(subheading) has alteast one ingredient except index 0 if not visible
      if ((showTopRow && ingCount === 0) || (!showTopRow && index !== 0 && ingCount === 0)) {
        isValid = false;
        setErrorMessage("Need atleast one ingredient within sub heading");
        return;
      }
    });

    // if no ingredients are found in sub headers then return
    // (cant exit the function from forEach return as done above. It only stops forEach and comes out)
    if (!isValid) {
      setErrorMessage("Errors found above.");
      return;
    }

    // validate if total ingredients are less than 2
    if (ing_display_order < 2) {
      isValid = false;
      setErrorMessage("Need atleast 2 ingredients to make a recipe");
      return;
    }

    // initial Input fields errors found then show on screen
    if (!isValid) {
      console.log("Input fields check done, errors found:", checkData);
      setErrorMessage("Errors found above.");
      return;
    }

    setCheckFinalData(checkData);

    // before sending data at backend checking if sub header 0 and its ingredient are empty
    //  if they are empty then discard them and re arrange the other sub header from 0 onwards
    const dataToSend = {};
    dataToSend.name = checkData.name;
    dataToSend.portion_size = checkData.portion_size;
    dataToSend.privacy = checkData.privacy;
    dataToSend.description = checkData.description;
    dataToSend.steps = checkData.steps;

    if (
      checkData.components[0].component_text === "" &&
      checkData.components[0].ingredients.length === 0
    ) {
      dataToSend.components = checkData.components
        .filter((c) => c.component_text !== "")
        .map((item) => ({ ...item, component_display_order: item.component_display_order - 1 }));
    } else {
      dataToSend.components = checkData.components;
    }

    console.log("everything passed till here with no errors found. were there any errors");
    console.log("dataToSend is:", dataToSend);
    return;

    // function to call api and save the recipe in db
    const saveRecipe = async () => {
      try {
        const url = `${serverURL}/recipe/api/new`;
        const method = "post";
        const body = dataToSend;

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
  // console.log("suggested ing  :", suggestedIng);
  // console.log("activeInputId", activeInputId);
  // console.log("recipeInfo :", recipeInfo);
  // console.log("showTopHeader", showTopRow);
  return (
    <>
      {/* <TopBar />
      <div className="flex mt-(--top-bar-height)">
        <div></div> */}
      <div className="flex flex-col  mt-(--top-bar-height) ml-(--left-side-bar) ">
        {/* line just below top bar  */}
        <div className="flex sticky z-10 h-0.5 shadow top-(--top-bar-height) bg-white"></div>

        <div className="flex flex-col w-full max-w-3xl  mx-auto my-5">
          <div className="text-xl font-bold mt-8 mb-4"> New Recipe Details</div>
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
                {/* input section */}

                <Input
                  className="flex border border-gray-300 rounded-lg bg-gray-50 placeholder:text-gray-400"
                  value={capitaliseWords(recipeInfo?.name) ?? ""}
                  onChange={(e) => {
                    setRecipeInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                      error_name: "",
                    }));
                  }}
                  placeholder={"Name of the recipe...."}
                  error={recipeInfo?.error_name}
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
                  value={capitaliseWords(recipeInfo?.portion_size) ?? ""}
                  onChange={(e) => {
                    setRecipeInfo((prev) => ({
                      ...prev,
                      portion_size: e.target.value,
                      error_portion_size: "",
                    }));
                  }}
                  placeholder={"eg. 2 person, 1kg, 750ml, etc."}
                  error={recipeInfo?.error_portion_size}
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
                      privacy: e.target.checked === true ? "private" : "public",
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
            <div className="flex font-semibold justify-end mb-2 w-26">Description :</div>
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

          {/* ingredients list */}
          <div className="flex flex-col">
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
            {sections.map((comp, indexc) => (
              <>
                <div className="flex flex-col w-full border-x border-gray-500">
                  {/* displaying the sub header if condition matched*/}
                  {(showTopRow || indexc !== 0) && (
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
                            setSections((prev) =>
                              prev.map((section) =>
                                section.uid === comp.uid
                                  ? { ...section, componentText: e.target.value, errorText: "" }
                                  : section,
                              ),
                            );
                            removeErrorTextIfFound();
                            // if (checkFinalData?.errors?.components[comp.uid]?.text) {
                            //   checkFinalData.errors.components[comp.uid].text = "";
                            // }
                          }}
                          error={
                            comp?.errorText ?? ""
                            // checkFinalData?.errors?.components[comp.uid]?.text
                          }
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
                    <div
                      key={ing.uid}
                      className="flex flex-1  items-stretch bg-gray-50 border-b border-gray-400"
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
                            {(indexc !== sections.length - 1 ||
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
                        <div className="relative flex flex-8 p-1 items-start justify-start ">
                          <Input
                            className="flex w-full min-w-38 py-0.5 px-1 rounded placeholder:text-gray-500"
                            value={ing.name ?? ""}
                            onFocus={(e) => {
                              setActiveInputId(ing.uid);
                              searchIng(e.target.value);
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
                                                errors: {},
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
                              // if (
                              //   checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                              //     ing.uid
                              //   ]?.name
                              // ) {
                              //   const x = checkFinalData.errors.components[comp.uid];
                              //   x.ingredients[ing.uid].name = "";
                              // }
                            }}
                            onKeyDown={(e) => handleKeyDown(e, comp.uid, ing.uid)}
                            placeholder={"milk, blue cheese, etc.."}
                            error={
                              ing?.errors?.errorName ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.name ?? ""
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
                        <div className="flex flex-3 py-1 items-start justify-center ">
                          <Input
                            className="flex w-full p-0.5 text-center rounded placeholder:text-gray-500"
                            value={ing?.quantity ?? ""}
                            onChange={(e) => {
                              updateQuantity(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                              //     ing.uid
                              //   ]?.quantity
                              // ) {
                              //   const x = checkFinalData.errors.components[comp.uid];
                              //   x.ingredients[ing.uid].quantity = "";
                              // }
                              setSections((prev) =>
                                prev.map((component) =>
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
                              );
                            }}
                            error={
                              ing?.errors?.errorQuantity ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.quantity ?? ""
                            }
                          />
                        </div>

                        {/* 5th column */}
                        <div className="flex flex-4 p-1 justify-center items-start ">
                          <Dropdown
                            className="flex rounded  text-sm h-7.5 pl-1 pr-7 py-0"
                            options={ing?.measuringUnits}
                            value={ing?.unitId}
                            onChange={(e) => {
                              updateUnit(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                              //     ing.uid
                              //   ]?.unit
                              // ) {
                              //   const x = checkFinalData.errors.components[comp.uid];
                              //   x.ingredients[ing.uid].unit = "";
                              // }
                              setSections((prev) =>
                                prev.map((component) =>
                                  component.uid === comp.uid
                                    ? {
                                        ...component,
                                        ingredients: component.ingredients.map((ingredient) =>
                                          ingredient.uid === ing.uid
                                            ? {
                                                ...ingredient,
                                                errors: { ...ingredient.errors, errorUnit: "" },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              );
                            }}
                            error={
                              ing?.errors?.errorUnit ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.unit ?? ""
                            }
                          />
                        </div>

                        {/* 6th column */}
                        <div className="flex flex-3 justify-center items-center text-sm">
                          {ing?.cost ? Number(Number(ing?.cost).toFixed(4)) : ""}
                        </div>
                      </div>

                      {/* col 7,8,9 in one div */}
                      <div className="bg-gray-300 item-stretch hidden lg:flex lg:flex-4 lg:justify-between">
                        {/* 7th column - Base - Quantity */}
                        <div className="flex flex-3 px-2 pt-2 items-start justify-center">
                          <Input
                            className="flex w-full px-1 py-0 text-center  rounded "
                            value={ing?.displayQuantity ?? ""}
                            onChange={(e) => {
                              updateBaseQuantity(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                              //     ing.uid
                              //   ]?.display_quantity
                              // ) {
                              //   const x = checkFinalData.errors.components[comp.uid];
                              //   x.ingredients[ing.uid].display_quantity = "";
                              // }
                              setSections((prev) =>
                                prev.map((component) =>
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
                              );
                            }}
                            error={
                              ing?.errors?.errorDisplayQuantity ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.display_quantity ?? ""
                            }
                          />
                        </div>

                        {/* 8th column - Base - Unit  */}
                        <div className="flex flex-4 pt-2 items-start justify-center">
                          <DropdownArray
                            className="flex w-full justify-end rounded text-sm h-6.5 py-0  pl-1"
                            options={ing?.baseUnits}
                            value={ing?.displayUnit ?? ""}
                            onChange={(e) => {
                              updateBaseUnit(comp.uid, ing.uid, e.target.value);
                              setSections((prev) =>
                                prev.map((component) =>
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
                              );
                            }}
                            error={
                              ing?.errors?.errorDisplayUnit ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.display_unit ?? ""
                            }
                          />
                        </div>

                        {/* 9th column - Base - price */}
                        <div className="flex flex-3 px-2 pt-2 items-start justify-center ">
                          <Input
                            className="flex w-full pl-1 pr-3 py-0  rounded text-end "
                            value={ing?.displayPrice ?? ""}
                            onChange={(e) => {
                              updateBasePrice(comp.uid, ing.uid, e.target.value);
                              // if (
                              //   checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                              //     ing.uid
                              //   ]?.display_price
                              // ) {
                              //   const x = checkFinalData.errors.components[comp.uid];
                              //   x.ingredients[ing.uid].display_price = "";
                              // }
                              setSections((prev) =>
                                prev.map((component) =>
                                  component.uid === comp.uid
                                    ? {
                                        ...component,
                                        ingredients: component.ingredients.map((ingredient) =>
                                          ingredient.uid === ing.uid
                                            ? {
                                                ...ingredient,
                                                errors: {
                                                  ...ingredient.errors,
                                                  errorDisplayPrice: "Required",
                                                },
                                              }
                                            : ingredient,
                                        ),
                                      }
                                    : component,
                                ),
                              );
                            }}
                            error={
                              ing?.errors?.errorDisplayPrice ?? ""
                              // checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[ing.uid]?.display_price ?? ""
                            }
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
                setSections((prev) => [...prev, emptySectionData()]);
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
            <div className="flex items-center justify-between my-2">
              <Button className="cursor-pointer" color={"dark"} onClick={handleSubmit}>
                Save
              </Button>
              <Button className="cursor-pointer" color={"alternative"} onClick={() => navigate(-1)}>
                Canel
              </Button>
            </div>
          </div>
        </div>

        {/* ////////////////////////////////////////////////////////// */}

        <div>
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

          {/*-------------------------- ingredients -------------------------  */}
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
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.name ?? ""
                              }
                              onBlur={() => {
                                blurTimeout = setTimeout(() => {
                                  hideSuggestions(comp.uid, ing.uid);
                                }, 100);
                              }}
                            />
                            {/* {activeInputId === ing.uid &&
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
                              )} */}
                          </div>
                        </td>
                        <td>
                          <Input
                            type={"number"}
                            value={ing?.quantity ?? ""}
                            onChange={(e) => {
                              updateQuantity(comp.uid, ing.uid, e.target.value);
                              if (
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.quantity
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
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.unit
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
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.display_quantity
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
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.display_unit
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
                                checkFinalData?.errors?.components?.[comp.uid]?.ingredients?.[
                                  ing.uid
                                ]?.display_price
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
        </div>
      </div>
    </>
  );
}

export default NewRecipe;
