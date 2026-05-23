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
  const [selectUnit, setSelectUnit] = useState("");
  const [selectBaseUnit, setSelectBaseUnit] = useState("");
  const [finalRecipe, setFinalRecipe] = useState({});
  const [checkFinalData, setCheckFinalData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestedIng, setSuggestedIng] = useState([]);
  // const [measuringUnits, setMeasuringUnits] = useState([]);
  const emptyRowData = {
    rowNo: 1,
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
  };
  const [ingRows, setIngRows] = useState([emptyRowData]);
  const [rowData, setRowData] = useState([]);
  const [inputText, setInputText] = useState({});
  const [activeInputId, setActiveInputId] = useState(null);

  //
  let blurTimeout;

  // Ref to keep track of timeout for ID //clicking outside suggested box of ingredient
  const timeoutRef = useRef(null);

  // config -
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // call useAuth hook to check if token is available in localstorage
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  //--------------------------------- Redirect to home if token not found --------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------------------------- TEMP console to show recipe for every input ----------------------------------
  const handlesubmit = () => {
    const checkData = { ...finalRecipe };
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
      finalRecipe.privacy = false;
    }

    setCheckFinalData(checkData);
    console.log("finalRecipe after checking  :", finalRecipe);
    if (!isValid) {
      return;
    }
  };

  // ----------------------------- ADD new empty ingredient row function ---------------------------------------
  const addNewIngRow = (rowNo) => {
    if (ingRows.length === Number(rowNo)) {
      const addRow = { ...emptyRowData, rowNo: Number(rowNo) + 1 };
      setIngRows((prev) => [...prev, addRow]);
    }
  };

  // -------------------------------------change in ingredient name ----------------------------------------
  const checkAnyChangeInIngredientName = (index) => {
    if (ingRows[index].name === "") {
      return;
    }
    setIngRows((prev) =>
      prev.map((item) =>
        item.rowNo === index + 1
          ? {
              ...item,
              ingredientId: "",
              ingredientSource: "",
              name: "",
              quantity: "",
              unit: "",
              measuringUnits: [],
              cost: "",
              displayQuantity: "",
              displayUnit: "",
              displayPrice: "",
            }
          : item,
      ),
    );
  };

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

  // ------------------------------ add the selected ingredient in ingRow data --------------------------------
  const handleSelectedIng = (rowNo, ing, index) => {
    console.log(" ing:", ing);

    //---------------------------- function for getting base units -----------------------------------------------
    const getBaseUnits = (unit, measuringUnits) => {
      const baseUnitsToShow = [];
      if (weightUnits.includes(unit)) {
        // const baseUnitsToShow = [];
        weightUnits.forEach((i) => {
          const f = measuringUnits?.find((j) => j.unit_name === i);
          if (f) {
            baseUnitsToShow.push(f.unit_name);
          }
        });
        return baseUnitsToShow;
      } else if (volumeUnits.includes(unit)) {
        // const baseUnitsToShow = [];
        volumeUnits.forEach((i) => {
          const f = measuringUnits?.find((j) => j.unit_name === i);
          if (f) {
            baseUnitsToShow.push(f.unit_name);
          }
        });
        return baseUnitsToShow;
      } else {
        return [unit];
      }
    };

    // console.log("after selecting ingredient rowNo : ", rowNo, " ing :", ing, " and index :", index);
    // --------- fetch the active units for the ingredient selected --------
    const fetchMeasuringUnits = async (id, source) => {
      try {
        const res = await axios.get(`${serverURL}/recipe/api/search/units/${id}/${source}`, config);
        const units = res.data.rows;
        setIngRows((prev) => {
          const x = prev.map((row, index) =>
            index === Number(rowNo) - 1
              ? {
                  ...row,
                  measuringUnits: units,
                  baseUnits: getBaseUnits(ing.display_unit, units),
                }
              : row,
          );
          return x;
        });
        // console.log("measuing uints :", units);
        return;
      } catch (err) {
        console.log("error in createMyIng.jsx while fetching measuring units :", err.response);
      }
    };
    const measureunits = fetchMeasuringUnits(ing.id, ing.ingredient_source);

    // -------- fetch data of ingredient selected and store in rowData ------
    setIngRows((prev) => {
      const x = prev.map((row, i) =>
        i === Number(rowNo) - 1
          ? {
              ...row,
              ingredientId: ing.id,
              name: ing.name,
              displayQuantity: ing.display_quantity,
              displayUnit: ing.display_unit,
              displayPrice: ing.display_price,
              ingredientSource: ing.ingredient_source,
              // measuringUnits: fetchMeasuringUnits(ing.id, ing.ingredient_source),
            }
          : row,
      );
      return x;
    });

    setActiveInputId(null);
    setInputText((prev) => ({ ...prev, [rowNo - 1]: ing.name }));
    setSuggestedIng([]);

    //  save the ing data in rowData --> NOT SURE why its needed --------
    const findRow = rowData.find((i) => i.rowNo === rowNo);
    if (findRow) {
      setRowData((prev) => {
        const x = prev.map((i) =>
          i.rowNo === rowNo
            ? {
                ...i,
                ingName: ing.name,
                displayQuantity: ing.display_quantity,
                displayPrice: ing.display_price,
                displayUnit: ing.display_unit,
              }
            : i,
        );
        console.log("x is :", x);
        return x;
      });
    } else {
      setRowData((prev) => [
        ...prev,
        {
          rowNo: rowNo,
          ingName: ing.name,
          displayQuantity: ing.display_quantity,
          displayPrice: ing.display_price,
          displayUnit: ing.display_unit,
        },
      ]);
    }
  };

  // ------------------- update rowData and ingRows when base Quantity, price and unit changes -------------------
  const updateBaseQuantity = (val, index) => {
    setRowData((prev) =>
      prev.map((item) =>
        item.rowNo === index + 1 ? { ...item, displayQuantity: Number(val) } : item,
      ),
    );
    setIngRows((prev) =>
      prev.map((item) =>
        item.rowNo === index + 1 ? { ...item, displayQuantity: Number(val) } : item,
      ),
    );
  };

  const updateBasePrice = (val, index) => {
    setRowData((prev) =>
      prev.map((item) =>
        item.rowNo === index + 1 ? { ...item, displayPrice: Number(val) } : item,
      ),
    );
    setIngRows((prev) =>
      prev.map((item) =>
        item.rowNo === index + 1 ? { ...item, displayPrice: Number(val) } : item,
      ),
    );
  };

  const updateBaseUnit = (val, index) => {
    setRowData((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, displayUnit: val } : item)),
    );
    setIngRows((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, displayUnit: val } : item)),
    );
  };

  const updateQuantity = (val, index) => {
    setRowData((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, quantity: Number(val) } : item)),
    );
    setIngRows((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, quantity: Number(val) } : item)),
    );
  };

  const updateUnit = (val, index) => {
    setRowData((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, unit: Number(val) } : item)),
    );
    setIngRows((prev) =>
      prev.map((item) => (item.rowNo === index + 1 ? { ...item, unit: Number(val) } : item)),
    );
  };

  const cost = (index) => {
    const dq = ingRows[index].displayQuantity;
    const du = ingRows[index].displayUnit;
    const dp = ingRows[index].displayPrice;
    const q = ingRows[index].quantity;
    const u = ingRows[index].unit;
    const mu = ingRows[index].measuringUnits;

    if (dq && du && dp && q && u && mu) {
      // const measUnit =
      const baseConversion = ingRows[index].measuringUnits.find(
        (i) => i.unit_name === du,
      ).conversion_factor;
      console.log("baseunit conversion value is :", baseConversion);
      const unitConversion = ingRows[index].measuringUnits.find(
        (i) => i.unit_id === u,
      ).conversion_factor;
      console.log("unit conversion value is :", unitConversion);
      const ingCost = (dp / dq / baseConversion) * q * unitConversion;
      if (ingCost) {
        return ingCost;
      } else {
        return "";
      }
    } else {
      return "";
    }
  };
  // --------------------------- hide suggestions onBlur if ingredient not selected ------------------------------
  const hideSuggestions = (index) => {
    setSuggestedIng([]);
    console.log("inside hid suggestions");
    setInputText((prev) => ({ ...prev, [index]: " " }));
    setRowData((prev) =>
      prev?.map((item) =>
        item?.rowNo === index + 1
          ? {
              ...item,
              ingName: "",
            }
          : item,
      ),
    );
  };

  // console.log("inputText :", inputText);
  console.log("rowData :", rowData);
  console.log("ingRows :", ingRows);

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

      <Card>
        <h2>Ingredients</h2>
        <Button
          children={"Save Recipe"}
          type="button"
          disabled={false}
          onClick={() => handlesubmit()}
        />
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
            {ingRows.map((i, index) => (
              <tr key={i.rowNo}>
                <td>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={"text"}
                      value={rowData[index]?.ingName ?? inputText?.index}
                      onFocus={() => setActiveInputId(i.rowNo)}
                      // onBlur={() => setActiveInputId(null)}
                      onChange={(e) => {
                        addNewIngRow(i.rowNo);
                        searchIng(e.target.value);
                        setInputText((prev) => ({ ...prev, [index]: e.target.value }));
                        setRowData((prev) =>
                          prev.map((j) =>
                            j.rowNo === i.rowNo
                              ? {
                                  ...j,
                                  ingName: e.target.value,
                                  displayQuantity: "",
                                  displayPrice: "",
                                  displayUnit: "",
                                }
                              : j,
                          ),
                        );
                        checkAnyChangeInIngredientName(index);
                      }}
                      placeholder={"milk, blue cheese, etc.."}
                      onBlur={() => {
                        blurTimeout = setTimeout(() => {
                          hideSuggestions(index);
                        }, 100);
                      }}
                    />
                    {activeInputId === i.rowNo && suggestedIng.length > 0 && inputText[index] && (
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
                        {suggestedIng.map((ing, index) => (
                          <div
                            key={ing.ingredient_id + "-" + index}
                            onClick={() => {
                              clearTimeout(blurTimeout);
                              handleSelectedIng(i.rowNo, ing, index);
                            }}
                          >
                            {ing.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <Input
                    type={"number"}
                    value={rowData[index]?.quantity ?? ""}
                    onChange={(e) => updateQuantity(e.target.value, index)}
                  />
                </td>
                <td>
                  <Dropdown
                    options={i?.measuringUnits}
                    value={rowData[index]?.unit}
                    onChange={(e) => {
                      setSelectUnit(e.target.value);
                      updateUnit(e.target.value, index);
                    }}
                    style={{ maxHeight: "30px", overflow: "auto" }}
                  />
                </td>
                <td>{cost(index)}</td>
                <td>
                  <Input
                    type={"number"}
                    value={rowData[index]?.displayQuantity ?? ""}
                    onChange={(e) => updateBaseQuantity(e.target.value, index)}
                  />
                </td>
                <td>
                  <DropdownArray
                    options={i?.baseUnits}
                    value={rowData[index]?.displayUnit ?? ""}
                    onChange={(e) => {
                      setSelectBaseUnit(e.target.value);
                      updateBaseUnit(e.target.value, index);
                    }}
                  />
                </td>
                <td>
                  <Input
                    type={"number"}
                    value={rowData[index]?.displayPrice ?? ""}
                    onChange={(e) => updateBasePrice(e.target.value, index)}
                  />
                </td>
              </tr>
            ))}

            {/* <tr>
              <td>
                <Input type={"text"} placeholder={"milk, blue cheese, etc.."} />
              </td>
              <td>
                <Input type={"number"} />
              </td>
              <td>
                <Dropdown
                  options={["a", "b", "c"]}
                  value={selectUnit}
                  onChange={(e) => setSelectUnit(e.target.value)}
                />
              </td>
              <td></td>
              <td>
                <Input type={"number"} />
              </td>
              <td>
                <Dropdown
                  options={["a", "b", "c"]}
                  value={selectBaseUnit}
                  onChange={(e) => setSelectBaseUnit(e.target.value)}
                />
              </td>
              <td>
                <Input type={"number"} />
              </td>
            </tr> */}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

export default NewRecipe;
