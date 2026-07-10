import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
// import Button from "../../components/button";
import Toggle from "../../components/toggle";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import ConfirmModal from "../../components/confirmModal";
import DishesModal from "../../components/dishesModal";
import { capitaliseWords } from "../../utils/appUtils";
import { Alert, ToggleSwitch, TabItem, Tabs, Button } from "flowbite-react";

import { HiTrash, HiClipboardList } from "react-icons/hi";
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineEditNote } from "react-icons/md";

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
          <tr className="bg-gray-200 text-lg font-semibold">
            <td className="p-2 rounded-sm" colSpan={8}>
              {comp_text}
            </td>
          </tr>,
        );
      } else if (u !== 0) {
        tableRows.push(
          <tr className="bg-gray-200 text-lg font-semibold">
            <td className="p-2 rounded-sm" colSpan={8}>
              {comp_text}
            </td>
          </tr>,
        );
      }

      for (const i of compIngs) {
        tableRows.push(
          <tr className="w-full text-lg" key={i.ingredient_display_order}>
            <td className="px-1 ">{i.quantity}</td>
            <td className="px-1">{i.unit_name}</td>
            <td className="px-1 ">
              {i.ingredient_source === "main"
                ? capitaliseWords(i.name)
                : capitaliseWords(i.name) + "*"}
            </td>
            <td className="px-5 text-end min-w-25">£ {Number(i.price.toFixed(3))}</td>
            <td className="px-1 text-sm text-end text-gray-400" colSpan={4}>
              £ {i.cost}/ {i.base_quantity}
              {i.unit}
            </td>
            {/* <td className="px-1">{i.unit}</td>
            <td className="px-1">{i.cost}</td> 
            <td>{i.ingredient_source}</td> */}
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
  console.log("data is :", foundRecipeDetails);
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
          <div className="flex flex-col space-y-4 mt-1">
            {/* Recipe Name header */}
            <div className="flex mx-auto p-2 max-w-xl text-center font-extrabold text-3xl md:text-4xl lg:text-5xl">
              {capitaliseWords(foundRecipeDetails?.recipe.name)}
            </div>
            {/* Recipe Details and image */}
            <div className="flex  flex-col-reverse lg:max-h-60 lg:flex-row">
              <div
                className="flex flex-col m-3 space-y-3 text-md 
                              md:text-xl md:w-3/5 rounded-2xl 
                              lg:text-2xl"
              >
                <div className="flex space-x-2">
                  <div className="font-semibold">Portion Size:</div>
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
                <div className="flex space-x-2">
                  <div className="font-semibold">Costing :</div>
                  <p>£ {totalCost}</p>
                </div>

                {/* Last prepared */}
                <div className="flex space-x-2">
                  <div className="font-semibold">Last Prepared on :</div>
                  <p>
                    {foundRecipeDetails?.recipe.last_prepared_date} @{" "}
                    {foundRecipeDetails?.recipe.last_prepared_time}
                  </p>
                </div>

                {/* Create dish button */}
                <div>
                  <Button
                    className="cursor-pointer"
                    color="dark"
                    onClick={() => setIsDishModalOpen(true)}
                  >
                    <HiClipboardList className="mr-2 w-5 h-5" />
                    create dish
                  </Button>
                </div>
              </div>
              {/* recipe image */}
              <div className="flex flex-col rounded-xl mr-3 md:w-2/5  ">
                <GiHotMeal className="h-full w-full max-h-60 bg-gray-200 rounded-xl" />
              </div>
            </div>
            {/* Buttons for owner */}
            <div className="flex justify-between p-3">
              {/* Create edit button */}
              <div className="">
                <Button
                  className="cursor-pointer"
                  color="light"
                  onClick={() => navigate(`/recipe/edit/${id}`)}
                >
                  <MdOutlineEditNote className="mr-2 w-5 h-5" />
                  Edit Recipe
                </Button>
              </div>

              {/* Delete recipe */}
              <div>
                <Button
                  className="cursor-pointer"
                  color="red"
                  onClick={() => setIsConfirmModalOpen(true)}
                >
                  <HiTrash className="mr-2 w-5 h-5" />
                  Delete Recipe
                </Button>
              </div>
            </div>
            {/* description of recipe */}
            <div className="flex min-h-20 max-w-xl m-3 text-2xl">
              <div>
                {" "}
                <span className="font-semibold">Description: </span>{" "}
                {foundRecipeDetails?.recipe.description}
              </div>
            </div>
            {/* tabs option of flowbite for smaller screen below xl */}
            <Tabs className="flex xl:hidden" aria-label="Tabs with icons" variant="fullWidth">
              {/* Ingredients */}
              <TabItem active title="Ingredients" icon={HiTrash}>
                <div className="m-2 p-2 border-3 rounded-xl border-gray-500 max-w-xl ">
                  <table>
                    <thead>
                      <tr className="">
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                        <th className=""></th>
                      </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                  </table>
                </div>
              </TabItem>
              {/* Recipe steps */}
              <TabItem title="Steps" icon={HiClipboardList}>
                <div className="m-2 p-2 border-3 rounded-xl border-gray-500 max-w-xl">
                  <table>
                    {/* <thead>
                      <tr>
                        <th>Sr-No.</th>
                        <th>Steps Description</th>
                      </tr>
                    </thead> */}
                    <tbody>
                      {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                        <div className="italic text-gray-400">No steps defined for recipe</div>
                      )}
                      {foundRecipeDetails?.steps &&
                        foundRecipeDetails?.steps.length !== 0 &&
                        foundRecipeDetails?.steps.map((s) => (
                          <tr className="" key={s.step_order}>
                            <td className="flex flex-col text-end top-0 px-4">
                              {s.step_order + "."}
                            </td>
                            <td>{s.step_text}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabItem>
            </Tabs>

            {/* tabs option of flowbite for screen bigger than xl */}
            <div className="hidden xl:block">
              <Tabs className="flex" aria-label="Tabs with icons" variant="fullWidth">
                {/* Ingredients */}
                <TabItem active title="Ingredients" icon={HiTrash}>
                  <div className="flex">
                    <table className="w-1/2">
                      <div className="m-2 p-2">
                        <thead>
                          <tr className="">
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                          </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                      </div>
                    </table>
                    <table className=" w-1/2  ">
                      {/* <thead>
                      <tr>
                        <th>Sr-No.</th>
                        <th>Steps Description</th>
                      </tr>
                    </thead> */}
                      <tbody>
                        {foundRecipeDetails?.steps && foundRecipeDetails?.steps.length === 0 && (
                          <div className="italic text-gray-400">No steps defined for recipe</div>
                        )}
                        {foundRecipeDetails?.steps &&
                          foundRecipeDetails?.steps.length !== 0 &&
                          foundRecipeDetails?.steps.map((s) => (
                            <tr className="" key={s.step_order}>
                              <td className="flex flex-col text-end top-0 px-4">
                                {s.step_order + "."}
                              </td>
                              <td>{s.step_text}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabItem>
                {/* Recipe steps */}
                <TabItem title="Steps" icon={HiClipboardList}>
                  <div className="flex  ">
                    <table className="w-1/2">
                      <div className="m-2 p-2 ">
                        <thead>
                          <tr className="">
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                          </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                      </div>
                    </table>
                    <table className="w-1/2 ">
                      {/* <thead>
                      <tr>
                        <th>Sr-No.</th>
                        <th>Steps Description</th>
                      </tr>
                    </thead> */}
                      <tbody>
                        {foundRecipeDetails?.steps && foundRecipeDetails?.steps.length === 0 && (
                          <div className="italic text-gray-400">No steps defined for recipe</div>
                        )}
                        {foundRecipeDetails?.steps &&
                          foundRecipeDetails?.steps.length !== 0 &&
                          foundRecipeDetails?.steps.map((s) => (
                            <tr className="" key={s.step_order}>
                              <td className="flex flex-col text-end top-0 px-4">
                                {s.step_order + "."}
                              </td>
                              <td>{s.step_text}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabItem>
              </Tabs>
            </div>
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
