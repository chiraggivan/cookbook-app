import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { Alert, ToggleSwitch, TabItem, Tabs, Button, Dropdown, DropdownItem } from "flowbite-react";
import { SlOptionsVertical } from "react-icons/sl";
import { HiTrash, HiClipboardList, HiShare, HiPrinter } from "react-icons/hi";
import { GiHotMeal, GiAvocado } from "react-icons/gi";
import { MdOutlineEditNote } from "react-icons/md";
import { TbFoodsteps } from "react-icons/tb";

import ToggleSwitchC from "../../components/toggleSwitch";

function RecipeDetails() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  // const { state } = useLocation(); // ---> used while updating recipeDetails (not required now)
  const { id } = useParams();
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  const [foundRecipeDetails, setFoundRecipeDetails] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [changePrvcyLoading, setChangePrvcyLoading] = useState(false);
  const [isRecipeOwner, setIsRecipeOwner] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [switch1, setSwitch1] = useState(false);

  const navigate = useNavigate();
  const recipeRows = [];
  const details4Dish = {};
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const imageBaseURL = "/uploadedImages/";
  const [imageError, setImageError] = useState(false);

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
  // useEffect(() => {
  //   setFoundRecipeDetails(searchMyRecipes);
  // }, [recipeDetails]);

  useEffect(() => {
    if (!searchMyRecipes) {
      // console.log("when searchMyRecipe not found recipeDetails");
      const fetchData = async () => {
        try {
          setFetchLoading(true);

          // call api to get recipe details
          const res = await axios[method](url, config);
          const tempRecipe = res?.data?.data;
          // console.log("data from backend :", tempRecipe);

          // save the new recipe details in recipeDetails Context variable if user's recipe
          if (tempRecipe?.recipe?.user_id === user.user_id) {
            setRecipeDetails((prev) => [...prev, tempRecipe]);
          }
          setFoundRecipeDetails(tempRecipe);
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

  // ----------------------- check if user is the owner of the recipe (helps to show buttons for edit/delete )--------------------------------
  useEffect(() => {
    // this below is done to make sure there is no flicker of recipe by for owner
    if (!foundRecipeDetails) {
      return;
    }
    if (user.user_id === foundRecipeDetails?.recipe.user_id) {
      // console.log("Yes i am the owner");
      setIsRecipeOwner(true);
    } else {
      setIsRecipeOwner(false);
    }
    setImageError(false);
  }, [foundRecipeDetails]);

  //-------------------------------------- get the total cost of recipe -----------------------------------
  const totalCost =
    Math.ceil(foundRecipeDetails?.ingredients?.reduce((sum, i) => sum + i.price, 0) * 100) / 100 ||
    0;

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
        recipeRows.push(
          <div className="pl-2 bg-gray-200 text-lg font-semibold" key={u}>
            {comp_text}
          </div>,
        );
      } else if (u !== 0) {
        recipeRows.push(
          <div className="pl-2 bg-gray-200 text-lg font-semibold" key={u}>
            {comp_text}
          </div>,
        );
      }

      compIngs.forEach((i, index) => {
        recipeRows.push(
          <div
            className={
              index % 2 === 0 ? "flex w-full text-md " : "flex w-full text-md bg-app-table-row"
            }
            key={i.ingredient_display_order}
          >
            <div className="flex w-full">
              <div className="min-w-10 text-end pl-1 pt-1 ">{i.quantity}</div>
              <div className="min-w-10 pl-1 pt-1">{i.unit_name}</div>
              <div className="flex-1 pl-1 pt-1">
                {i.ingredient_source === "main"
                  ? capitaliseWords(i.name)
                  : capitaliseWords(i.name) + "*"}
              </div>
              <div className="flex flex-col items-end">
                <div className="px-2 ">£ {Number(i.price.toFixed(3))}</div>
                <div className=" text-end px-2 text-sm text-gray-500  pb-1">
                  £ {i.cost}/ {i.base_quantity} {i.unit}
                </div>
              </div>
            </div>
            {/* <div className="hidden md:block text-end px-2 text-sm text-gray-500  mb-2">
              £ {i.cost}/ {i.base_quantity} {i.unit}
            </div> */}
          </div>,
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
      });

      details4Dish.components.push(comps);
    }
  }

  // console.log("HiTrash :", HiTrash);
  console.log("foundRecipeDetails is :", foundRecipeDetails);
  // console.log("details4Dish is :", details4Dish);
  // console.log("recipeDetails :", recipeDetails);
  // console.log("myRecipes :", myRecipes);
  // console.log("isDishModalOpen : ", isDishModalOpen);
  // console.log("isRecipeOwner :", isRecipeOwner);
  // console.log("recipeData : ", state?.recipeData);
  console.log("image url for src :", foundRecipeDetails?.recipe?.image_url);
  console.log("imageError is:", imageError);
  // ---------------------------------------- jsx for the page ------------------------------------------------
  return (
    <div>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col mt-(--top-bar-height) md:ml-(--left-side-bar)">
        <div className="flex flex-col mt-1 w-full max-w-5xl lg:mx-auto">
          {/* Recipe Name header & recipe by */}
          <div className="flex flex-col relative">
            <div
              className={
                isRecipeOwner
                  ? `flex pl-2 pr-8 max-w-sm font-extrabold text-xl 
                              md:text-2xl md:max-w-lg
                              lg:text-3xl lg:max-w-xl`
                  : `flex pl-2 pr-6 pb-6 max-w-sm font-extrabold text-xl 
                              md:text-2xl md:max-w-lg
                              lg:text-3xl lg:max-w-xl`
              }
            >
              {capitaliseWords(foundRecipeDetails?.recipe.name)}
            </div>

            {/* Show recipe owner details if different from user */}
            {isRecipeOwner === false && (
              <div className="absolute flex space-x-2 right-3 bottom-0">
                <div className="font-semibold">By :</div>
                <p>{foundRecipeDetails?.recipe.user_id}</p>
              </div>
            )}

            {/* show triple option for delete recipe for owner */}
            {isRecipeOwner === true && (
              <div className="absolute right-2 top-0 text-app-primary scale-125 hover:bg-amber-100 p-2 rounded-full transition duration-300">
                {
                  // top-1/2 -translate-y-1/2
                }

                <Dropdown
                  label=""
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <span>
                      <SlOptionsVertical />
                    </span>
                  )}
                >
                  <DropdownItem
                    className="flex gap-2"
                    onClick={() => navigate(`/recipe/edit/${id}`)}
                  >
                    <MdOutlineEditNote className="w-4 h-4" /> Edit
                  </DropdownItem>
                  <DropdownItem className="flex gap-2 text-gray-300">
                    <HiPrinter className="w-4 h-4" /> Print
                  </DropdownItem>
                  <DropdownItem className="flex gap-2 text-gray-300">
                    <HiShare className="w-4 h-4" /> Share
                  </DropdownItem>
                  <DropdownItem
                    className="flex gap-2 text-sm text-app-danger"
                    onClick={() => setIsConfirmModalOpen(true)}
                  >
                    <HiTrash className=" w-4 h-4" />
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            )}
          </div>

          {/* Recipe Details and image */}
          <div className="flex  flex-col-reverse mt-4 lg:max-h-60 lg:flex-row lg:w-full  lg:justify-between">
            {/* recipe details */}
            <div className="flex flex-col w-full justify-center lg:max-w-lg">
              {/* portion-size, privacy and cost */}
              <div className="flex w-full justify-between px-2">
                {/* portion size and privacy if owner */}
                <div className="flex flex-col space-y-2">
                  {/* Portion size field */}
                  <div className="flex space-x-2 mt-2">
                    <div className="font-semibold">Portion:</div>
                    <div> {foundRecipeDetails?.recipe.portion_size}</div>
                  </div>

                  {/* toggle switch for private recipe */}
                  {isRecipeOwner === true && (
                    <div className="flex">
                      <div>
                        {!changePrvcyLoading && (
                          <Toggle
                            title=""
                            checked={
                              foundRecipeDetails?.recipe.privacy === "private" ? true : false
                            }
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
                  )}
                </div>

                {/* cost of recipe */}
                <div className="flex items-end text-3xl">£ {totalCost}</div>
              </div>

              {/* if Owner - Last prepared & create dish*/}
              {isRecipeOwner && (
                <div className="flex justify-between mt-2 px-2">
                  <div className="flex flex-col space-x-2">
                    <div className="font-semibold">Last Prepared on :</div>
                    <p>
                      {foundRecipeDetails?.recipe.last_prepared_date} @{" "}
                      {foundRecipeDetails?.recipe.last_prepared_time}
                    </p>
                  </div>
                  {/* Create dish button */}
                  <div className="hidden md:block">
                    <Button
                      className="cursor-pointer"
                      color="dark"
                      onClick={() => setIsDishModalOpen(true)}
                    >
                      <HiClipboardList className="mr-2 w-5 h-5" />
                      create dish
                    </Button>
                  </div>
                  <div className="block md:hidden ">
                    <div
                      className="flex w-17 h-17 rounded-full bg-gray-400 items-center justify-center
                                  border border-gray-600 hover:bg-gray-500"
                    >
                      <Button
                        className="cursor-pointer rounded-full w-15 h-15 "
                        color="dark"
                        onClick={() => setIsDishModalOpen(true)}
                      >
                        create dish
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* recipe image */}
            <div className="flex w-full h-60 sm:max-w-80 sm:mx-auto items-center justify-center md:rounded-md md:mr-2">
              {foundRecipeDetails?.recipe?.image_url && !imageError ? (
                <img
                  className="h-full w-full md:rounded-md"
                  src={foundRecipeDetails?.recipe?.image_url}
                  alt="Recipe Image"
                  onError={() => setImageError(true)}
                />
              ) : (
                <GiHotMeal className="h-[80%] w-[80%] bg-gray-200" />
              )}
            </div>
          </div>

          {/* description of recipe */}
          <div
            className="flex px-2 mt-2 text-sm 
                          md:text-md lg:text-lg lg:max-w-2/3 "
          >
            <div>
              <span className="font-semibold">Description: </span>{" "}
              {foundRecipeDetails?.recipe.description}
            </div>
          </div>

          {/* Buttons for owner */}
          {isRecipeOwner && (
            <div className="hidden lg:flex justify-between p-2">
              {/* Create edit button */}
              <div className="">
                <Button
                  className="cursor-pointer bg-app-secondary"
                  // color="light"
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
          )}

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
            className="flex lg:hidden mt-2"
            aria-label="Tabs with icons"
            variant="fullWidth"
          >
            {/* Ingredients */}
            <TabItem active title="Ingredients" icon={GiAvocado}>
              <div className="min-h-[calc(100vh-200px)]">{recipeRows}</div>
            </TabItem>

            {/* Recipe steps */}
            <TabItem title="Steps" icon={TbFoodsteps}>
              <div className="px-2 min-h-[calc(100vh-200px)] max-w-xl">
                {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                  <div className="italic text-gray-400 text-center bg-amber-100">
                    No steps defined for recipe
                  </div>
                )}
                {foundRecipeDetails?.steps &&
                  foundRecipeDetails?.steps.length !== 0 &&
                  foundRecipeDetails?.steps.map((s) => (
                    <div className="flex mb-2" key={s.step_order}>
                      <div className="flex flex-col text-end top-0 pl-2 min-w-8">
                        {s.step_order + "."}
                      </div>
                      <div className="pl-2">{s.step_text}</div>
                    </div>
                  ))}
              </div>
            </TabItem>
          </Tabs>

          {/* tabs option of flowbite for screen bigger than lg */}
          <div className="hidden lg:block">
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
                <div className="flex">
                  <div className="flex-1">
                    <div className="min-h-[calc(100vh-200px)]">{recipeRows}</div>
                  </div>
                  <div className="flex-1">
                    <div className="px-2 min-h-[calc(100vh-200px)] max-w-xl">
                      {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                        <div className="italic text-gray-400 text-center">
                          No steps defined for recipe
                        </div>
                      )}
                      {foundRecipeDetails?.steps &&
                        foundRecipeDetails?.steps.length !== 0 &&
                        foundRecipeDetails?.steps.map((s) => (
                          <div className="flex mb-2" key={s.step_order}>
                            <div className="flex flex-col text-end top-0 pl-2 min-w-8">
                              {s.step_order + "."}
                            </div>
                            <div className="pl-2">{s.step_text}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabItem>

              {/* Recipe steps */}
              <TabItem title="Steps" icon={TbFoodsteps}>
                <div className="flex">
                  <div className="flex-1">
                    <div className="min-h-[calc(100vh-200px)]">{recipeRows}</div>
                  </div>
                  <div className="flex-1">
                    <div className="px-2 min-h-[calc(100vh-200px)] max-w-xl">
                      {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                        <div className="italic text-gray-400 text-center">
                          No steps defined for recipe
                        </div>
                      )}
                      {foundRecipeDetails?.steps &&
                        foundRecipeDetails?.steps.length !== 0 &&
                        foundRecipeDetails?.steps.map((s) => (
                          <div className="flex mb-2" key={s.step_order}>
                            <div className="flex flex-col text-end top-0 pl-2 min-w-8">
                              {s.step_order + "."}
                            </div>
                            <div className="pl-2">{s.step_text}</div>
                          </div>
                        ))}
                    </div>
                  </div>
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
