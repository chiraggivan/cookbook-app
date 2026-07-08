import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
import Button from "../../components/button";
import Toggle from "../../components/toggle";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import ConfirmModal from "../../components/confirmModal";
import DishesModal from "../../components/dishesModal";
import { capitaliseWords } from "../../utils/appUtils";
import { Alert, ToggleSwitch, TabItem, Tabs } from "flowbite-react";

import { HiTrash, HiClipboardList } from "react-icons/hi";
import ToggleSwitchC from "../../components/toggleSwitch";

function RecipeDetails() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  const [foundRecipeDetails, setFoundRecipeDetails] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [changePrvcyLoading, setChangePrvcyLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [switch1, setSwitch1] = useState(false);

  const navigate = useNavigate();
  let tableRows = [];
  const details4Dish = {};
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  //----------------------------------- delete button function -------------------------------------------------
  const handleDelete = async (e) => {
    e.preventDefault();

    // if (
    //   window.confirm(
    //     `Are you sure you want to delete this recipe - ${foundRecipeDetails?.recipe.name}`,
    //   )
    // ) {
    const deleteurl = `${serverURL}/recipe/api/delete/${id}`;
    try {
      const res = await axios.delete(deleteurl, config);
      if (res?.data?.success === true) {
        // alert(res?.data?.message);
        setAlertMsg(res?.data?.message);
        setIsAlert(true);
        // edit context variables as well
        const x = recipeDetails.filter((i) => i.recipe.recipe_id !== Number(id));
        setRecipeDetails(x);
        const y = myRecipes.filter((i) => i.recipe_id !== Number(id));
        setMyRecipes(y);
        // ---------------------------
        navigate("/MyRecipes");
        return;
      } else {
        alert(res?.data?.message);
        // console.log(res?.data?.message);
        return;
      }
    } catch (err) {
      // console.log(err.response?.data?.message);
      alert(err.response?.data?.message);
      return;
    }
    // } else {
    //   console.log("cancelled");
    // }
  };

  // ------------------------------------- create DISH button function  ----------------------------------------
  const handleCreateDish = async (additionalData) => {
    // adding current time temporarily until we create input time mechanism
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0];

    details4Dish.preparation_date = additionalData.date;
    details4Dish.comment = additionalData.comment;
    details4Dish.time_prepared = currentTime;

    // console.log("currentTime :", currentTime);
    // return;
    // if (window.confirm(`Save - ${foundRecipeDetails?.recipe.name} as dish  prepared now.`)) {
    const createURL = `${serverURL}/dish/api/create`;

    try {
      const res = await axios.post(createURL, details4Dish, config);
      if (res?.data?.success === true) {
        // alert(res?.data?.message);
        // update the recipeDetails Context (cache) on local machine
        const updatedDetails = recipeDetails.map((i) =>
          i.recipe.recipe_id === Number(id)
            ? {
                ...i,
                recipe: {
                  ...i.recipe,
                  last_prepared_date: additionalData.date,
                  last_prepared_time: currentTime,
                },
              }
            : i,
        );
        setRecipeDetails(updatedDetails);
        setIsDishModalOpen(false);

        // navigate(`/recipe/`);
        return;
      } else {
        // alert(res?.data?.message);
        console.log(res?.data?.message);
        setIsAlert(true);
        setAlertMsg(res?.data?.message);
        return;
      }
    } catch (err) {
      console.log("response message for dish created button:", err.response);
      console.log(err.response?.data?.message);
      alert(err.response?.data?.message);
      return;
    }
    // } else {
    //   console.log("cancelled");
    // }
  };

  //----------------------------------------- Redirect effect --------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------- fetch the data by giving url, method and body(if required) -------------------------------------
  const method = "get";
  const url = `${serverURL}/recipe/api/${id}`;
  const body = null;

  const searchMyRecipes = recipeDetails?.find((d) => d.recipe.recipe_id === Number(id));
  // console.log("searchMyRecipes :", searchMyRecipes);
  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    setFoundRecipeDetails(searchMyRecipes);
  }, [recipeDetails]);

  useEffect(() => {
    if (!searchMyRecipes) {
      // console.log("when searchMyRecipe not found recipeDetails");
      const fetchData = async () => {
        try {
          setFetchLoading(true);

          // call api to get recipe details
          const res = await axios[method](url, config);
          const tempRecipe = res?.data?.data;

          // save the new recipe details in recipeDetails Context variable
          setRecipeDetails((prev) => [...prev, tempRecipe]);
        } catch (err) {
          console.log("error while fetching reicpe details with axios is :", err.response);
          window.alert("Something went wrong while fetching recipe. Please try again later.");
        } finally {
          setFetchLoading(false);
        }
      };

      fetchData();
    }
    setFetchLoading(false);
  }, []);

  // ------------------------------------  change privacy in recipe details ----------------------------
  //  only option available to edit in read recipe for quick update.

  const changePrivacy = async (val) => {
    // setFetchLoading(true);
    const url = `${serverURL}/recipe/api/update-privacy/${id}`;
    const method = "put";
    const body = { privacy: val };

    try {
      const res = await axios[method](url, body, config);
      console.log("res :", res);
    } catch (err) {
      // console.log("Error found recipeDetails - changePrivacy :", err.response.data.message);
      window.alert("Something went wrong while updating privacy. Please try again later.");

      //  change back the privacy that we set with onChange in Toggle component, during err in above try block
      setRecipeDetails(
        recipeDetails.map((item) =>
          item.recipe.recipe_id === id
            ? {
                ...item,
                recipe: {
                  ...item.recipe,
                  privacy: val === "pubic" ? "private" : "public",
                },
              }
            : item,
        ),
      );
      return;
    } finally {
      // setFetchLoading(false);
    }
  };

  //-------------------------------------- get the total cost of recipe -----------------------------------
  const totalCost =
    Math.ceil(foundRecipeDetails?.ingredients?.reduce((sum, i) => sum + i.price, 0) * 100) / 100 ||
    0;

  // ------------------------------  initial page loading screen -------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  // ------------------------ Create html for table with components and ingredients rows -------------------
  if (foundRecipeDetails) {
    // //////////////////////////////////////////////////////
    // below variable to create data for dish creation api
    details4Dish.recipe_id = foundRecipeDetails.recipe.recipe_id;
    details4Dish.recipe_name = foundRecipeDetails.recipe.name;
    details4Dish.portion_size = foundRecipeDetails.recipe.portion_size;
    details4Dish.recipe_by = foundRecipeDetails.recipe.user_id;
    details4Dish.total_cost = totalCost;
    details4Dish.meal = "lunch";
    details4Dish.comment = "";
    details4Dish.components = [];
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    const recipeData = foundRecipeDetails?.ingredients;

    const uniqueComp = [...new Set(recipeData?.map((i) => i.component_display_order))].sort(
      (a, b) => a - b,
    );
    // console.log("unique comps are:", uniqueComp);

    for (const u of uniqueComp) {
      const compIngs = recipeData
        .filter((i) => i.component_display_order === u)
        .sort((a, b) => a.ingredient_display_order - b.ingredient_display_order);
      const comp_text = compIngs[0].component_text;
      //-----------------Below for create dish-----------------------------------------
      const comps = {};
      comps.component_text = comp_text;
      comps.display_order = u;
      comps.ingredients = [];
      //-----------------Above for create dish-----------------------------------------

      if (u === 0 && comp_text === "") {
        // console.log("first component text is empty");
      } else if (u === 0 && comp_text !== "") {
        tableRows.push(
          <tr colSpan={8}>
            <td>{comp_text}</td>
          </tr>,
        );
      } else if (u !== 0) {
        tableRows.push(
          <tr colSpan={8}>
            <td>{comp_text}</td>
          </tr>,
        );
      }

      for (const i of compIngs) {
        tableRows.push(
          <tr key={i.ingredient_display_order}>
            <td>{i.name}</td>
            <td>{i.quantity}</td>
            <td>{i.unit_name}</td>
            <td>{Number(i.price.toFixed(3))}</td>
            <td>{i.base_quantity}</td>
            <td>{i.unit}</td>
            <td>{i.cost}</td>
            <td>{i.ingredient_source}</td>
          </tr>,
        );
        // --------------Below for create dish---------------------------
        const ings = {};
        ings.base_price = i.cost;
        ings.ingredient_id = i.ingredient_id;
        ings.name = i.name;
        ings.cost = i.price;
        ings.quantity = i.quantity;
        ings.base_unit = i.unit;
        ings.unit_id = i.unit_id;
        ings.unit_name = i.unit_name;
        ings.display_order = i.ingredient_display_order;
        ings.ingredient_source = i.ingredient_source;
        comps.ingredients.push(ings);
        // --------------Above for create dish---------------------------
      }
      details4Dish.components.push(comps);
    }
  }

  // console.log("HiTrash :", HiTrash);
  // console.log("data is :", foundRecipeDetails);
  // console.log("details4Dish is :", details4Dish);
  console.log("recipeDetails :", recipeDetails);
  // console.log("myRecipes :", myRecipes);
  // console.log("isDishModalOpen : ", isDishModalOpen);

  // ---------------------------------------- jsx for the page ------------------------------------------------
  return (
    <div>
      <TopBar />
      <div className="flex mt-(--top-bar-height)">
        <LeftSideBar />
        <div className="w-full ml-(--left-side-bar) mt-5">
          <div className="flex flex-col bg-amber-100">
            {/* Recipe Name header */}
            <div className="flex mx-auto p-2 max-w-xl text-center text-2xl md:text-4xl lg:text-5xl bg-amber-300 ">
              {capitaliseWords(foundRecipeDetails?.recipe.name)}
            </div>
            {/* Recipe Details and image */}
            <div className="flex  flex-col-reverse h-30 md:flex-row ">
              <div className="flex flex-col w-full md:w-4/5 md:bg-amber-200">
                <div className="flex">
                  <div>Portion Size:</div>
                  <div> {foundRecipeDetails?.recipe.portion_size}</div>
                </div>

                {/* toggle switch for private recipe */}
                <div className="flex">
                  <div>
                    {!changePrvcyLoading && (
                      <Toggle
                        title=""
                        checked={foundRecipeDetails?.recipe.privacy === "private" ? true : false}
                        onText="Private"
                        offText="Private"
                        onChange={(e) => {
                          setChangePrvcyLoading(true);
                          setRecipeDetails((prev) =>
                            prev.map((item) =>
                              item.recipe.recipe_id === Number(id)
                                ? {
                                    ...item,
                                    recipe: {
                                      ...item.recipe,
                                      privacy: e.target.checked ? "private" : "public",
                                    },
                                  }
                                : item,
                            ),
                          );
                          changePrivacy(e.target.checked ? "private" : "public");
                          setChangePrvcyLoading(false);
                        }}
                      />
                    )}
                    {changePrvcyLoading && <h3> Privacy Loading .............</h3>}
                  </div>
                </div>

                {/* cost of recipe */}
                <div>
                  <h3>£ {totalCost}</h3>
                </div>

                {/* Last prepared */}
                <div>
                  <h4>
                    Last Prepared on : {foundRecipeDetails?.recipe.last_prepared_date} @{" "}
                    {foundRecipeDetails?.recipe.last_prepared_time}
                  </h4>
                </div>

                {/* Create dish button */}
                <div>
                  <button onClick={() => setIsDishModalOpen(true)}>create dish</button>
                </div>
              </div>
              <div className="flex flex-col w-full md:w-1/5 md:bg-amber-300">Image here</div>
            </div>
            {/* Buttons for owner */}
            <div className="flex justify-between">
              <button onClick={() => navigate(`/recipe/edit/${id}`)}>Edit</button>

              <button onClick={() => setIsConfirmModalOpen(true)}>Delete</button>
            </div>
            {/* description od recipe */}
            <div className="flex bg-amber-500">
              <div>Description: {foundRecipeDetails?.recipe.description}</div>
            </div>
            {/* tabs option of flowbite */}
            <div className="overflow-x-auto">
              <Tabs aria-label="Full width tabs" variant="fullWidth">
                <TabItem active title="Ingredients" icon={HiTrash}>
                  This is{" "}
                  <span className="font-medium text-gray-800 dark:text-white">
                    Profile tab's associated content
                  </span>
                  . Clicking another tab will toggle the visibility of this one for the next. The
                  tab JavaScript swaps classes to control the content visibility and styling.
                </TabItem>
                <TabItem title="Steps" icon={HiClipboardList}>
                  This is{" "}
                  <span className="font-medium text-gray-800 dark:text-white">
                    Dashboard tab's associated content
                  </span>
                  . Clicking another tab will toggle the visibility of this one for the next. The
                  tab JavaScript swaps classes to control the content visibility and styling.
                </TabItem>
              </Tabs>
            </div>
            {/* Tabs */}
            <div className="flex">
              <div className="w-1/2 text-center border-t-2 border-gray-600 rounded-t-2xl border-l-2 border-r-2">
                <button> Ingredients</button>
              </div>
              <div>
                <button> Steps</button>
              </div>
            </div>
            {/* Recipe Ingredients */}
            <div className="flex bg-amber-100">
              <table>
                <thead>
                  <tr>
                    <th>ingredient name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>price</th>
                    <th>Base Quantity</th>
                    <th>Base Unit</th>
                    <th>Base Price</th>
                    <th>Ing. Source</th>
                  </tr>
                </thead>
                <tbody>{tableRows}</tbody>
              </table>
            </div>
            {/* Recipe steps */}
            <div className="flex bg-amber-300">
              <table>
                <thead>
                  <tr>
                    <th>Sr-No.</th>
                    <th>Steps Description</th>
                  </tr>
                </thead>
                <tbody>
                  {foundRecipeDetails?.steps.map((s) => (
                    <tr key={s.step_order}>
                      <td>{s.step_order}</td>
                      <td>{s.step_text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h1>{foundRecipeDetails?.recipe.name}</h1>
          <h3>{foundRecipeDetails?.recipe.portion_size}</h3>
          <h3>{foundRecipeDetails?.recipe.description}</h3>
          <div>
            {!changePrvcyLoading && (
              <Toggle
                title=""
                checked={foundRecipeDetails?.recipe.privacy === "private" ? true : false}
                onText="Private"
                offText="Private"
                onChange={(e) => {
                  setChangePrvcyLoading(true);
                  setRecipeDetails((prev) =>
                    prev.map((item) =>
                      item.recipe.recipe_id === Number(id)
                        ? {
                            ...item,
                            recipe: {
                              ...item.recipe,
                              privacy: e.target.checked ? "private" : "public",
                            },
                          }
                        : item,
                    ),
                  );
                  changePrivacy(e.target.checked ? "private" : "public");
                  setChangePrvcyLoading(false);
                }}
              />
            )}
            {changePrvcyLoading && <h3> Privacy Loading .............</h3>}
          </div>
          <div>
            {!changePrvcyLoading && (
              <ToggleSwitch
                theme={{
                  toggle: { checked: { color: { default: "bg-blue-900" } } },
                }}
                checked={foundRecipeDetails?.recipe.privacy === "private" ? true : false}
                // checked={false}
                label="Private"
                onChange={(flag) => {
                  setChangePrvcyLoading(true);
                  setRecipeDetails((prev) =>
                    prev.map((item) =>
                      item.recipe.recipe_id === Number(id)
                        ? {
                            ...item,
                            recipe: {
                              ...item.recipe,
                              privacy: flag ? "private" : "public",
                            },
                          }
                        : item,
                    ),
                  );
                  changePrivacy(flag ? "private" : "public");
                  setChangePrvcyLoading(false);
                }}
              />
            )}
            {changePrvcyLoading && <h3> Privacy Loading .............</h3>}
          </div>
          <ToggleSwitchC />

          <h3>£ {totalCost}</h3>
          <button onClick={() => setIsDishModalOpen(true)}>create dish</button>
          <h4>
            Last Prepared on : {foundRecipeDetails?.recipe.last_prepared_date} @{" "}
            {foundRecipeDetails?.recipe.last_prepared_time}
          </h4>
          <Button onClick={() => navigate(`/recipe/edit/${id}`)}>Edit</Button>
          {/* <button onClick={handleDelete}>Delete</button> */}
          <button onClick={() => setIsConfirmModalOpen(true)}>Delete</button>
          <table>
            <thead>
              <tr>
                <th>ingredient name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>price</th>
                <th>Base Quantity</th>
                <th>Base Unit</th>
                <th>Base Price</th>
                <th>Ing. Source</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Sr-No.</th>
                <th>Steps Description</th>
              </tr>
            </thead>
            <tbody>
              {foundRecipeDetails?.steps.map((s) => (
                <tr key={s.step_order}>
                  <td>{s.step_order}</td>
                  <td>{s.step_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDelete}
          title={"Delete Recipe"}
          message={`Are you sure to delete - ${capitaliseWords(foundRecipeDetails.recipe.name)} ?`}
          OKtext={"Delete"}
          OKtextIcon={HiTrash}
          cancelText={"No, Are you crazy"}
        />
      )}
      {isDishModalOpen && (
        <DishesModal
          isOpen={isDishModalOpen}
          onClose={() => setIsDishModalOpen(false)}
          onConfirm={handleCreateDish}
          title={"Created This Dish On:"}
          cancelText={"Cancel"}
          OKtext={"Create Dish"}
          OKtextIcon={HiClipboardList}
        />
      )}
      {isAlert && <Alert message={alertMsg} />}
    </div>
  );
}

export default RecipeDetails;
