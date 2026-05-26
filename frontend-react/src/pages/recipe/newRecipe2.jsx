import { useNavigate } from "react-router-dom";
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

function NewRecipe() {
  const token = localStorage.getItem("token");
  const [isPrivate, setIsPrivate] = useState(false);
  // const [selectUnit, setSelectUnit] = useState("");
  // const [selectBaseUnit, setSelectBaseUnit] = useState("");
  const [finalRecipe, setFinalRecipe] = useState({});
  const [checkFinalData, setCheckFinalData] = useState({});
  const recipeCosting = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestedIng, setSuggestedIng] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // // const [measuringUnits, setMeasuringUnits] = useState([]);
  const [rowData, setRowData] = useState([]);
  //   const [inputText, setInputText] = useState([]);
  const [activeInputId, setActiveInputId] = useState(null);
  const itemRefs = useRef([]); // -------------> for auto scroll be visible while arrow down or up in suggested ingredients div
  const emptyIngRowData = () => ({
    uid: "ing-" + (Date.now() + Math.floor(Math.random() * 1000)),
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
    uid: "comp-" + (Date.now() + Math.floor(Math.random() * 1000)),
    //   component_display_order: 0,
    component_text: "",
    ingredients: [emptyIngRowData()],
  });

  const [sections, setSections] = useState([emptySectionData()]);
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
  const addNewIngRow = (compUid, indexc, index) => {
    if (sections[indexc].ingredients.length === Number(index) + 1) {
      setSections((prev) =>
        prev.map(
          (section) =>
            (section.uid = compUid
              ? {
                  ...section,
                  ingredients: [...section.ingredients, emptyIngRowData()],
                }
              : section),
        ),
      );
    }
  };

  // ------------------------------ show top header button function ---------------------------------------------
  const showTopHeader = () => {};
  // ----------------------------- search ingredient when typed in box -----------------------------------------
  const searchIng = (val) => {
    //  if val.length < 1 then return
    if (val.trim().length === 0) {
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
  const handleKeyDown = (e) => {
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
          handleSelectedIng(activeInputId, suggestedIng[highlightedIndex], highlightedIndex); // Select the item
        }
        break;

      case "Tab":
        if (highlightedIndex >= 0) {
          // e.preventDefault();
          e.stopPropagation();
          handleSelectedIng(activeInputId, suggestedIng[highlightedIndex], highlightedIndex); // Select the item
        }
        break;

      default:
        break;
    }
  };

  // ------------------------------ add the selected ingredient in ingRow data --------------------------------
  const handleSelectedIng = (cid, iid, ing) => {
    // //---------------------------- function for getting base units ----------------------------------------
    const getBaseUnits = (unit, measuringUnits) => {
      const baseUnitsToShow = [];
      const lookup = {};
      measuringUnits.forEach((i) => (lookup[i.unit_name] = i.unit_name));

      // // // ------------------------- for weight units ----------------------------------
      if (weightUnits.includes(unit)) {
        // const baseUnitsToShow = [];
        weightUnits.forEach((i) => {
          if (lookup[i]) {
            baseUnitsToShow.push(lookup[i]);
          }
        });
        return baseUnitsToShow;
      }
      // // // ------------------------- for volume units ----------------------------------
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
      } catch (err) {
        console.log("error in createMyIng.jsx while fetching measuring units :", err.response);
      }
    };
    fetchMeasuringUnits(ing.id, ing.ingredient_source);

    // // // -------- fetch data of ingredient selected and store in rowData ------
    // setIngRows((prev) => {
    //   const x = prev.map((row, i) =>
    //     i === Number(rowNo) - 1
    //       ? {
    //           ...row,
    //           ingredientId: ing.id,
    //           name: ing.name,
    //           displayQuantity: ing.display_quantity,
    //           displayUnit: ing.display_unit,
    //           displayPrice: ing.display_price,
    //           ingredientSource: ing.ingredient_source,
    //           // measuringUnits: fetchMeasuringUnits(ing.id, ing.ingredient_source),
    //         }
    //       : row,
    //   );
    //   return x;
    // });

    setActiveInputId(null);
    // setInputText((prev) => ({ ...prev, [rowNo - 1]: ing.name }));
    setSuggestedIng([]);
    setHighlightedIndex(-1);

    // // --------  save the ing data in rowData  (very IMPORTANT array )------------------------
    // const findRow = rowData.find((i) => i.rowNo === rowNo);
    // if (findRow) {
    //   setRowData((prev) => {
    //     const x = prev.map((i) =>
    //       i.rowNo === rowNo
    //         ? {
    //             ...i,
    //             ingName: ing.name,
    //             displayQuantity: ing.display_quantity,
    //             displayPrice: ing.display_price,
    //             displayUnit: ing.display_unit,
    //           }
    //         : i,
    //     );
    //     console.log("x is :", x);
    //     return x;
    //   });
    // } else {
    //   setRowData((prev) => [
    //     ...prev,
    //     {
    //       rowNo: rowNo,
    //       ingName: ing.name,
    //       displayQuantity: ing.display_quantity,
    //       displayPrice: ing.display_price,
    //       displayUnit: ing.display_unit,
    //     },
    //   ]);
    // }
  };

  // ---------------------------------- To calculate the individual ing cost / total cost of recipe ----------------------------------------------
  const cost = (index) => {
    const dq = rowData[index]?.displayQuantity;
    const du = rowData[index]?.displayUnit;
    const dp = rowData[index]?.displayPrice;
    const q = rowData[index]?.quantity;
    const u = rowData[index]?.unit;
    const mu = ingRows[index]?.measuringUnits;
    // console.log("dq :", dq, " du :", du, " dp: ", dp, " q: ", q, " u:", u);

    if (dq && du && dp && q && u && mu) {
      // const measUnit =
      const baseConversion = mu.find((i) => i.unit_name === du).conversion_factor;
      // console.log("baseunit conversion value is :", baseConversion);
      const unitConversion = mu.find((i) => i.unit_id === u).conversion_factor;
      // console.log("unit conversion value is :", unitConversion);
      const ingCost = (dp / dq / Number(baseConversion)) * q * Number(unitConversion);
      if (ingCost) {
        return ingCost;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };

  let totalCost = 0;
  sections.forEach((section) => {
    section.ingredients.forEach((ingredient) => {
      const dq = ingredient.displayQuantity;
      const du = ingredient.displayUnit;
      const dp = ingredient.displayPrice;
      const q = ingredient.quantity;
      const u = ingredient.unit;
      const mu = ingredient.measuringUnits;

      if (dq && du && dp && q && u && mu) {
        console.log("dq :", dq, " du :", du, " dp :", dp, " q :", q, " u :", u);
        // const measUnit =
        const baseConversion = mu.find((i) => i.unit_name === du).conversion_factor;
        // console.log("baseunit conversion value is :", baseConversion);
        const unitConversion = mu.find((i) => i.unit_id === u).conversion_factor;
        // console.log("unit conversion value is :", unitConversion);
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

  //   console.log("inputText :", inputText);
  console.log("sections :", sections);
  //   console.log("suggested ing  :", suggestedIng);
  //   console.log("activeInputId", activeInputId);
  //   console.log("inputText :", inputText);
  return (
    <>
      <Navbar />
      <h1>Welcome to Create Recipes</h1>
      <Input
        label={"Recipe name: "}
        type="text"
        value={finalRecipe.name ?? ""}
        onChange={(e) => {
          setFinalRecipe({ ...finalRecipe, name: e.target.value });
          checkFinalData.errors.name = "";
          // handleChange("display_unit", e.target.value);
        }}
        placeholder={"Name of the recipe...."}
        error={checkFinalData?.errors?.name}
      />
      <Input
        label={"Portion of: "}
        type="text"
        onChange={(e) => {
          setFinalRecipe({ ...finalRecipe, portion_size: e.target.value });
          checkFinalData.errors.portion_size = "";
        }}
        placeholder={"eg. 2 person, 1kg, 750ml, etc."}
        error={checkFinalData?.errors?.portion_size}
      />
      <Textarea
        label={"Description"}
        onChange={(e) => {
          setFinalRecipe({ ...finalRecipe, description: e.target.value });
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
          setFinalRecipe({ ...finalRecipe, privacy: e.target.checked });
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
      <Card>
        <h2>Ingredients</h2>
        {!showTopRow && (
          <Button
            id={"add_header"}
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
            </tr>
          </thead>
          <tbody>
            {sections.map((comp, indexc) => (
              <>
                {showTopRow && (
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
                        }}
                        error={checkFinalData?.component?.component_text}
                      />
                    </td>
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
                                            }
                                          : i,
                                      ),
                                    }
                                  : section,
                              ),
                            );
                            searchIng(e.target.value);
                            addNewIngRow(comp.uid, indexc, index);

                            // checkAnyChangeInIngredientName(index);
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder={"milk, blue cheese, etc.."}
                          onBlur={() => {
                            blurTimeout = setTimeout(() => {
                              //   hideSuggestions(index);
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
                        onChange={(e) => updateQuantity(comp.uid, ing.uid, e.target.value)}
                      />
                    </td>
                    <td>
                      <Dropdown
                        options={ing?.measuringUnits}
                        value={ing?.unit}
                        onChange={(e) => {
                          //   setSelectUnit(e.target.value);
                          updateUnit(comp.uid, ing.uid, e.target.value);
                        }}
                        style={{ maxHeight: "30px", overflow: "auto" }}
                      />
                    </td>
                    <td>{ing?.cost ?? ""}</td>
                    <td>
                      <Input
                        type={"number"}
                        value={ing?.displayQuantity ?? ""}
                        onChange={(e) => updateBaseQuantity(comp.uid, ing.uid, e.target.value)}
                      />
                    </td>
                    <td>
                      <DropdownArray
                        options={ing?.baseUnits}
                        value={ing?.displayUnit ?? ""}
                        onChange={(e) => {
                          updateBaseUnit(comp.uid, ing.uid, e.target.value);
                        }}
                      />
                    </td>
                    <td>
                      <Input
                        type={"number"}
                        value={ing?.displayPrice ?? ""}
                        onChange={(e) => updateBasePrice(comp.uid, ing.uid, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

export default NewRecipe;
