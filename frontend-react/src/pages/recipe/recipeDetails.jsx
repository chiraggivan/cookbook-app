import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { MyRecipeContext } from "../../context/myRecipeContext";
import Toggle from "../../components/toggle";
import DishesModal from "../../components/dishesModal";
import { capitaliseWords, getInitials } from "../../utils/appUtils";
import {
  Alert,
  ToggleSwitch,
  TabItem,
  Tabs,
  Button,
  Dropdown,
  DropdownItem,
  Spinner,
} from "flowbite-react";

import { SlOptionsVertical } from "react-icons/sl";
import { HiTrash, HiClipboardList, HiShare, HiPrinter, HiInformationCircle } from "react-icons/hi";
import { GiHotMeal, GiAvocado } from "react-icons/gi";
import { MdModeEditOutline, MdOutlineEditNote } from "react-icons/md";
import { TbCalendarHeart, TbFoodsteps } from "react-icons/tb";
import { BsBookmark, BsBookmarkFill, BsFillHandThumbsUpFill } from "react-icons/bs";
import { FaLock, FaUsers } from "react-icons/fa6";
import { GoNorthStar } from "react-icons/go";
import formattedDate from "../../utils/formattedDate";
import ConfirmDeleteModal from "../../components/confirmDeleteModal";
import EditBaseValuesModal from "../../components/editBaseValuesModal";
import { weightUnits, volumeUnits } from "../../utils/ingredientConstant";
import NotFoundPage from "../../components/notFoundPage";
import AlertToast from "../../components/alertToast";
import { IoIosGlobe } from "react-icons/io";

function RecipeDetails() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userCountryId = user.country_id;
  const userCurrencyId = user.currency_id;
  const userCountryName = user.country_name;
  const currencySymbol = user.currency_symbol;

  // const { state } = useLocation(); // ---> used while updating recipeDetails (not required now)
  const { id } = useParams();
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const [isNotFound, setIsNotFound] = useState(false);
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  const [foundRecipeDetails, setFoundRecipeDetails] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [showBookmarkIcon, setShowBookmarkIcon] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(null);
  const [isChangingBookmark, setIsChangingBookmark] = useState(null);
  const [changePrvcyLoading, setChangePrvcyLoading] = useState(false);
  const [isRecipeOwner, setIsRecipeOwner] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [successAlert, setSuccessAlert] = useState(false);
  const [changePrice, setChangePrice] = useState(false);
  const hasUserCreatedIngredient = useRef(false);
  const [openAlertToast, setOpenAlertToast] = useState(false);
  const alertForSuccess = useRef(false);
  const alertMsg = useRef(null);

  const navigate = useNavigate();
  const recipeRows = [];
  const details4Dish = {};
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [imageError, setImageError] = useState(false);

  // variable for base price change
  const [isEditBaseValuesOpen, setIsEditBaseValuesOpen] = useState(false);
  const [quantityValue, setQuantityValue] = useState(0);
  const [unitValue, setUnitValue] = useState("");
  const [baseUnits, setBaseUnits] = useState([]);
  const [priceValue, setPriceValue] = useState(0);
  const [compUid, setCompUid] = useState(null);
  const [ingUid, setIngUid] = useState(null);
  const [ingName, setIngName] = useState(null);
  const [ingId, setIngId] = useState(null);
  const [ingSource, setIngSource] = useState(null);
  const [recpIngUnitId, setRecpIngUnitId] = useState(null);
  const [recpIngQty, setRecpIngQty] = useState(null);
  const [isMiniLoading, setIsMiniLoading] = useState(false);

  //----------------------------------------- Redirect effect --------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------- fetch the data by giving url, method and body(if required) -------------------------------------
  const method = "get";
  const url = `/recipe/api/details/${id}`;
  const body = null;

  const recipeFound = undefined; // recipeDetails?.find((d) => d.recipe.recipe_id === Number(id));
  // console.log("recipeFound :", recipeFound);
  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    if (!recipeFound) {
      // console.log("when recipeFound not found recipeDetails");
      const fetchData = async () => {
        try {
          setIsLoading(true);
          // call api to get recipe details
          const res = await api[method](url);
          const tempRecipe = res?.data?.data;
          // add base units to change base price
          tempRecipe.ingredients.forEach(
            (item) => (item.base_units = getBaseUnits(item.unit, item.measuring_units)),
          );

          // save the new recipe details in recipeDetails Context variable if user's recipe
          // if (tempRecipe?.recipe?.user_id === user.user_id) {
          // Below vairable is for useContext. Temp switching off. Need to work on it for every condition
          // setRecipeDetails((prev) => [...prev, tempRecipe]);
          // }

          // is the user is the owner of the recipe , DONT show bookmark icon.
          if (user.user_id == tempRecipe.recipe.user_id) {
            setShowBookmarkIcon(false);
          } else {
            setShowBookmarkIcon(true);
          }

          // find if bookmarked
          setIsBookmarked(tempRecipe.recipe.is_bookmarked);
          setFoundRecipeDetails(tempRecipe);
        } catch (err) {
          console.log("error while fetching reicpe details with axios is :", err.response);
          if (err.response?.status === 404) {
            setIsNotFound(true);
            return;
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setFoundRecipeDetails(recipeFound);
    }
  }, []);

  // ----------------------- check if user is the owner of the recipe (helps to show buttons for edit/delete )--------------------------------
  useEffect(() => {
    // this below is done to make sure there is no flicker of recipe by for owner
    if (!foundRecipeDetails) {
      return;
    }
    if (user.user_id === foundRecipeDetails?.recipe?.user_id) {
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
    const privacyURL = `/recipe/api/update-privacy/${id}`;
    const method = "put";
    const body = { privacy: val };

    try {
      const res = await api[method](privacyURL, body);
      // console.log("res :", res);
    } catch (err) {
      // window.alert("Something went wrong while updating privacy. Please try again later.");
      alertMsg.current = `Something went wrong while updating privacy. Please try again later.`;
      alertForSuccess.current = false;
      showAlert();

      //  change back the privacy that we set with onChange in Toggle component, during err in above try block
      // setRecipeDetails(
      //   recipeDetails.map((item) =>
      //     item.recipe.recipe_id === id
      //       ? {
      //           ...item,
      //           recipe: {
      //             ...item.recipe,
      //             privacy: val === "pubic" ? "private" : "public",
      //           },
      //         }
      //       : item,
      //   ),
      // );
      return;
    } finally {
      // setFetchLoading(false);
    }
  };

  //----------------------------------- delete recipe button function -------------------------------------------------
  const handleDelete = async (e) => {
    e.preventDefault();
    const deleteurl = `/recipe/api/delete/${id}`;
    try {
      const res = await api.delete(deleteurl);
      if (res?.data?.success === true) {
        // // edit context variables as well
        // const x = recipeDetails.filter((i) => i.recipe.recipe_id !== Number(id));
        // setRecipeDetails(x);
        // const y = myRecipes.filter((i) => i.recipe_id !== Number(id));
        // setMyRecipes(y);
        // ---------------------------
        alertMsg.current = res?.data?.message;
        alertForSuccess.current = true;
        showAlert();
        setTimeout(() => navigate("/MyRecipes"), 3000); // timeout matches with timeout of alertToast in showAlert func
        return;
      } else {
        // console.log(res?.data?.message);
        return;
      }
    } catch (err) {
      console.log("Error while deleting recipe :", err.response?.data?.message);
      // WINDOW ALERT Condition for Demo account
      if (err.response?.status === 403 && err.response?.data?.role === "demo") {
        // window.alert(err.response.data?.message || "forbidden to do this.");
        setIsConfirmModalOpen(false);
        alertMsg.current = err.response.data?.message || "forbidden to do this.";
        alertForSuccess.current = false;
        showAlert();
        return;
      }
      alert(err.response?.data?.message);
      return;
    }
  };

  // ------------------------------------- create DISH button function  ----------------------------------------
  const handleCreateDish = async (additionalData) => {
    // adding current time temporarily until we create input time mechanism
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0];

    // need to get meal name from meal_id attached in additionalData
    const mealObject = foundRecipeDetails.meals.find(
      (meal) => meal.meal_id === Number(additionalData.meal),
    );

    // updaating data for dishes with the selected data, meal, comment and time
    details4Dish.preparation_date = additionalData.date;
    details4Dish.comment = additionalData.comment;
    details4Dish.meal = mealObject.name;
    details4Dish.time_prepared = currentTime;

    // console.log("details for dish before sending :", details4Dish);
    // setFoundRecipeDetails((prev) => ({ ...prev, recipe: { ...prev.recipe, last_prepared_date: additionalData.date, meal: mealObject.name }, }));
    // setIsDishModalOpen(false);
    // return;

    const createURL = `/dish/api/create`;

    // call create dish api
    try {
      await api.post(createURL, details4Dish);
      // update the recipeDetails Context (cache) on local machine
      // const updatedDetails = recipeDetails.map((i) =>
      //   i.recipe.recipe_id === Number(id)
      //     ? {
      //         ...i,
      //         recipe: {
      //           ...i.recipe,
      //           last_prepared_date: additionalData.date,
      //           last_prepared_time: currentTime,
      //         },
      //       }
      //     : i,
      // );
      // setRecipeDetails(updatedDetails);
      setFoundRecipeDetails((prev) => ({
        ...prev,
        recipe: {
          ...prev.recipe,
          last_prepared_date: additionalData.date,
          meal: mealObject.name,
        },
      }));
      setIsDishModalOpen(false);
      setSuccessAlert(true);
      return;
    } catch (err) {
      console.log("Error for dish created button:", err.response);
      // WINDOW ALERT Condition for Demo account
      if (err.response?.status === 403 && err.response?.data?.role === "demo") {
        // window.alert(
        //   err.response?.data?.message +
        //     " This section will be temporarily updated for viewing, but the changes won't be saved. Refreshing the page will restore the previous values." ||
        //     "forbidden to do this.",
        // );
        alertMsg.current =
          err.response?.data?.message +
            " This section will be temporarily updated for viewing, but the changes won't be saved. Refreshing the page will restore the previous values." ||
          "forbidden to do this.";
        alertForSuccess.current = false;
        showAlert();
        setFoundRecipeDetails((prev) => ({
          ...prev,
          recipe: {
            ...prev.recipe,
            last_prepared_date: additionalData.date,
            meal: mealObject.name,
          },
        }));
        setIsDishModalOpen(false);
        setSuccessAlert(true);
        return;
      }

      alertMsg.current = err.response?.data?.message;
      alertForSuccess.current = false;
      showAlert();
      return;
    }
  };

  // ----------------------------------------- function for getting base units ----------------------------------------
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

  // -------------------- update the base values of ingredient thru modal -----------------------
  const updateBaseValues = async (compUid, ingUid, updateQuantity, updateUnit, updatePrice) => {
    const method = "put";
    const url = `/ingredient/api/edit/baseValues/${ingId}`;
    const body = {
      ing_used_qty: recpIngQty,
      ing_used_unitId: recpIngUnitId,
      ingredient_source: ingSource,
      display_quantity: Number(updateQuantity),
      display_unit: updateUnit,
      display_price: Number(updatePrice),
    };

    setIsMiniLoading(true);
    try {
      const res = await api[method](url, body);
      // get conversion factor list & custom price (for 1 unit of base unit) for changing same multiple times in same recipe
      const convFactList = res?.data?.conversionList;
      const custom_price = res?.data?.custom_price;

      // update the current page to updated price of ingredient
      const updatedIngrediientsData = foundRecipeDetails.ingredients.map((i) => {
        return i.ingredient_id === ingId && i.ingredient_source === ingSource
          ? {
              ...i,
              cost: Number(updatePrice),
              base_quantity: Number(updateQuantity),
              unit: updateUnit,
              price: i.quantity * custom_price * Number(convFactList[i.unit_name]),
            }
          : i;
      });

      setFoundRecipeDetails((prev) => ({ ...prev, ingredients: updatedIngrediientsData }));
    } catch (err) {
      console.log("Error while update base values :", err);
      // WINDOW ALERT Condition for Demo account ///////////////////////////////////////
      if (err.response?.status === 403 && err.response?.data?.role === "demo") {
        const convFactList = err.response?.data?.conversionList;
        const custom_price = err.response?.data?.custom_price;
        // update the current page to updated price of ingredient
        const updatedIngrediientsData = foundRecipeDetails.ingredients.map((i) => {
          return i.ingredient_id === ingId && i.ingredient_source === ingSource
            ? {
                ...i,
                cost: Number(updatePrice),
                base_quantity: Number(updateQuantity),
                unit: updateUnit,
                price: i.quantity * custom_price * Number(convFactList[i.unit_name]),
              }
            : i;
        });
        setFoundRecipeDetails((prev) => ({ ...prev, ingredients: updatedIngrediientsData }));
        setIsEditBaseValuesOpen(false);
        // window.alert(
        //   err.response.data?.message +
        //     " This section will be temporarily updated for viewing, but the changes won't be saved. Refreshing the page will restore the previous values." ||
        //     "forbidden to do this.",
        // );
        alertMsg.current =
          err.response?.data?.message +
            " This section will be temporarily updated for viewing, but the changes won't be saved. Refreshing the page will restore the previous values." ||
          "forbidden to do this.";
        alertForSuccess.current = false;
        showAlert();
        return;
      }
      ///////////////////////////////////////////////////////////////////////////////////
      // window.alert(`Error While updating Base price of ${ingName}`);
      alertMsg.current(`Error While updating Base price of ${ingName}`);
      alertForSuccess.current = false;
      showAlert();
    } finally {
      setIsMiniLoading(false);
    }

    setIsEditBaseValuesOpen(false);
  };

  // ------------------------------------------ change bookmark logic ----------------------------------------------
  const bookmarkRecipe = () => {
    if (!isBookmarked) {
      const url = "/userSavedRecipe/api/bookmarkRecipe";
      const method = "post";
      const body = { recipe_id: id };

      setIsChangingBookmark(true);
      // function to call api
      const sendData = async () => {
        try {
          await api[method](url, body);
          setIsBookmarked(true);
          setFoundRecipeDetails((prev) => ({
            ...prev,
            recipe: { ...prev.recipe, is_bookmarked: 1 },
          }));
        } catch (err) {
          console.log("Error while bookmarking recipe :", err);
          // window.alert(`Something went wrong. Try again later.`);
          alertMsg.current = `Something went wrong. Try again later.`;
          alertForSuccess.current = false;
          showAlert();
        } finally {
          setIsChangingBookmark(false);
        }
      };

      sendData();
    } else {
      const url = `/userSavedRecipe/api/delete/${id}`;
      const method = "delete";

      setIsChangingBookmark(true);
      // function to call api
      const sendData = async () => {
        try {
          await api[method](url);
          setIsBookmarked(false);
          setFoundRecipeDetails((prev) => ({
            ...prev,
            recipe: { ...prev.recipe, is_bookmarked: 0 },
          }));
        } catch (err) {
          console.log("Error while removing bookmark from recipe :", err);
          // window.alert(`Something went wrong. Try again later.`);
          alertMsg.current = `Something went wrong. Try again later.`;
          alertForSuccess.current = false;
          showAlert();
        } finally {
          setIsChangingBookmark(false);
        }
      };

      sendData();
    }
  };

  // ------------------------------ Loading screen ---------------------------------
  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner
          theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
          color="default"
          aria-label="Loading"
          size="xl"
        />
      </div>
    );
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
    // details4Dish.meal = "lunch";
    details4Dish.image_url = foundRecipeDetails.recipe.image_url;
    details4Dish.comment = "";
    details4Dish.components = [];
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // get all the ingredients and club it according to its (component) heading display order
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
        if (i.ingredient_source === "user") {
          hasUserCreatedIngredient.current = true;
        }
        recipeRows.push(
          <div
            className={
              index % 2 === 0
                ? "flex w-full text-sm md:text-lg "
                : "flex w-full text-sm md:text-lg bg-gray-100"
            }
            key={i.ingredient_display_order}
          >
            <div className="flex w-full">
              {/* ing qnty */}
              <div className="min-w-10 text-end pl-1 pt-1 ">{i.quantity}</div>

              {/* unit name */}
              <div className="min-w-10 pl-1 pt-1">{i.unit_name}</div>

              {/* ing name */}
              {i.ingredient_source === "main" ? (
                <div className="flex flex-1 pl-1 pt-1">
                  {capitaliseWords(i.name)}
                  {i.form !== "" && ` (${i.form})`}{" "}
                  {i.ingredient_style !== null && i.ingredient_style !== "" && (
                    <div className="flex flex-1 pl-2 pt-0.75 md:pt-1.25 text-xs md:text-sm italic">
                      {" "}
                      {i.ingredient_style}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 pl-1 pt-1">
                  {capitaliseWords(i.name)}
                  <GoNorthStar className="px-0.5 " />
                  {i.ingredient_style !== null && i.ingredient_style !== "" && (
                    <span className="flex flex-1 pl-2 pt-0.75 md:pt-1.25 text-xs md:text-sm italic">
                      {" "}
                      {i.ingredient_style}
                    </span>
                  )}
                </div>
              )}

              {/* edit base price */}
              {changePrice && (i.ingredient_source === "main" || isRecipeOwner) && (
                <div className="flex items-end pb-1 ">
                  <div
                    className="bg-gray-700 text-white p-0.5 rounded-sm hover:cursor-pointer hover:bg-gray-900 hover:scale-125 transition duration-300"
                    onClick={() => {
                      setIngId(i.ingredient_id);
                      setIngSource(i.ingredient_source);
                      setIngName(i.name);
                      setQuantityValue(i.base_quantity);
                      setUnitValue(i.unit);
                      setPriceValue(i.cost);
                      setBaseUnits(i.base_units);
                      setRecpIngQty(i.quantity);
                      setRecpIngUnitId(i.unit_id);
                      setIsEditBaseValuesOpen(true);
                    }}
                  >
                    <MdModeEditOutline />
                  </div>
                </div>
              )}

              {/* price column for ing and base price */}
              <div className="flex flex-col items-end">
                <div className="px-2 ">
                  {currencySymbol}{" "}
                  {i.price > 100
                    ? Math.ceil(i.price)
                    : i.price > 1
                      ? i.price.toFixed(2)
                      : i.price.toFixed(3)}
                </div>
                <div className=" text-end px-2 text-sm text-gray-600  pb-1">
                  {currencySymbol} {Number(i.cost > 100 ? Math.ceil(i.cost) : i.cost.toFixed(2))}/
                  {Number(i.base_quantity) === 1 ? "" : i.base_quantity}
                  {i.unit === "l" ? "litre" : i.unit}
                </div>
              </div>
            </div>
          </div>,
        );

        // --------------Below for create dish---------------------------
        const ing = {};

        ing.base_quantity = i.base_quantity;
        ing.base_unit = i.unit;
        ing.base_price = i.cost;
        ing.ingredient_id = i.ingredient_id;
        ing.name = i.form ? i.name + " (" + i.form + ")" : i.name;
        // ing.form = i.form;
        ing.cost = i.price;
        ing.quantity = i.quantity;
        ing.unit_id = i.unit_id;
        ing.unit_name = i.unit_name;
        ing.display_order = i.ingredient_display_order;
        ing.ingredient_source = i.ingredient_source;
        comps.ingredients.push(ing);
        // --------------Above for create dish---------------------------
      });

      details4Dish.components.push(comps);
    }
  }

  //-------------------- function for alert toast (as multiple alerts in this page) ------------------------------
  const showAlert = () => {
    setOpenAlertToast(true);
    setTimeout(() => {
      setOpenAlertToast(false);
      alertMsg.current = null;
    }, 5000);
  };

  // console.log("HiTrash :", HiTrash);
  // console.log("foundRecipeDetails is :", foundRecipeDetails);
  // console.log("showBookmarkICon :", showBookmarkIcon);
  // console.log("details4Dish is :", details4Dish);
  // console.log("recipeDetails :", recipeDetails);
  // console.log("myRecipes :", myRecipes);
  // console.log("isDishModalOpen : ", isDishModalOpen);
  // console.log("isRecipeOwner :", isRecipeOwner);
  // console.log("recipeData : ", state?.recipeData);
  // console.log("image url for src :", foundRecipeDetails?.recipe?.image_url);
  // console.log("imageError is:", imageError);
  // console.log("user is :", user);
  // console.log("alertForSuccess :", alertForSuccess);

  // ---------------------------------------- jsx for the page ------------------------------------------------
  return (
    <div>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col mt-(--top-bar-height) md:ml-(--left-side-bar)">
        {isNotFound ? (
          <NotFoundPage />
        ) : (
          <div className="flex flex-col mt-1 w-full sm:max-w-lg sm:mx-auto md:max-w-2xl lg:max-w-5xl lg:mx-auto">
            {/* NEW DIV TO REPLACE Details and Image */}
            <div className="flex flex-col mt-4 lg:flex-row lg:max-h-">
              {/* image */}
              <div
                className={`flex flex-1 ${foundRecipeDetails?.recipe?.image_url && !imageError ? `xl:border-2 xl:rounded-xl xl:border-gray-300` : ``} `}
              >
                {foundRecipeDetails?.recipe?.image_url && !imageError ? (
                  <img
                    className="h-full w-full lg:object-cover xl:object-contain sm:rounded-lg md:rounded-2xl"
                    src={foundRecipeDetails?.recipe?.image_url}
                    alt="Recipe Image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-gray-100 w-full h-full aspect-video 
                              sm:max-h-50 sm:rounded-lg sm:aspect-[unset]
                              md:rounded-2xl
                              lg:max-h-full lg:aspect-video
                              xl:rounded-xl"
                  >
                    <GiHotMeal className="h-[80%] w-[80%] sm:h-[20%] sm:w-[20%] md:h-[20%] md:w-[20%] lg:h-[40%] lg:w-[40%] bg-gray-100" />
                  </div>
                )}
              </div>

              {/* details */}
              <div className="flex flex-1 flex-col ">
                {/* recipe name */}
                <div className="text-lg mt-2 mx-2 font-semibold">
                  {capitaliseWords(foundRecipeDetails?.recipe.name)}
                </div>
                {/* portion size & privacy */}
                <div className="flex p-2 gap-2 justify-between">
                  {/* portion size AND recipe owner name if user NOT owner */}
                  <div className="flex gap-2 rounded-md text-gray-600">
                    <div className="flex items-center">
                      <FaUsers className="text-gray-600" />
                    </div>
                    <p className="flex items-center text-sm">
                      {foundRecipeDetails?.recipe.portion_size}
                    </p>
                    {isRecipeOwner === false && (
                      <div className="flex space-x-1 right-3 bottom-0 items-center">
                        <div className="font-semibold">
                          <span>•</span>
                        </div>

                        {/* recipe owner's pic */}
                        <div
                          className="flex min-w-4 min-h-4 h-5 w-5 rounded-full bg-neutral-500 p-2 text-xs text-white items-center justify-center hover:cursor-pointer"
                          onClick={() => {
                            navigate(`/recipesBy/${foundRecipeDetails?.recipe.user_id}`);
                          }}
                        >
                          {foundRecipeDetails?.recipe?.user_img ? (
                            <div className="w-full h-full">
                              <img
                                className="rounded-full h-full"
                                src={foundRecipeDetails?.recipe?.user_img}
                                alt={getInitials(
                                  foundRecipeDetails?.recipe?.display_name ??
                                    foundRecipeDetails?.recipe?.username ??
                                    foundRecipeDetails?.recipe?.email,
                                )}
                                // onError={(e) => {
                                //   console.log("Image failed:", e.currentTarget.src);
                                // }}
                              />
                            </div>
                          ) : (
                            getInitials(
                              foundRecipeDetails?.recipe?.display_name ??
                                foundRecipeDetails?.recipe?.username ??
                                foundRecipeDetails?.recipe?.email,
                            )
                          )}
                        </div>

                        {/* recipe owner's name */}
                        <p
                          className="hover:cursor-pointer"
                          onClick={() =>
                            navigate(`/recipesBy/${foundRecipeDetails?.recipe.user_id}`)
                          }
                        >
                          {foundRecipeDetails?.recipe.username ??
                            foundRecipeDetails?.recipe.dislay_name ??
                            foundRecipeDetails?.recipe.email}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* privacy */}
                  {isRecipeOwner === true && (
                    <div className="flex rounded-full border-2 border-gray-300 bg-gray-100 p-1 gap-2 justify-between min-w-33">
                      {/* icon and text */}
                      <div className="flex items-center ">
                        {foundRecipeDetails?.recipe.privacy === "private" ? (
                          <div className="flex gap-2">
                            <FaLock className="text-gray-600 scale-80" />{" "}
                            <p className="text-xs">Private</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <IoIosGlobe className="text-gray-600 scale-110" />{" "}
                            <p className="text-xs">Public</p>
                          </div>
                        )}
                      </div>

                      {/* toggle switch */}
                      <div className="">
                        {!changePrvcyLoading && (
                          <Toggle
                            title=""
                            checked={
                              foundRecipeDetails?.recipe.privacy === "private" ? true : false
                            }
                            onText=""
                            offText=""
                            onChange={(e) => {
                              setChangePrvcyLoading(true);
                              setFoundRecipeDetails((prev) => ({
                                ...prev,
                                recipe: {
                                  ...prev.recipe,
                                  privacy: prev.recipe.privacy === "private" ? "public" : "private",
                                },
                              }));
                              // setRecipeDetails((prev) =>
                              //   prev.map((item) =>
                              //     item.recipe.recipe_id === Number(id)
                              //       ? {
                              //           ...item,
                              //           recipe: {
                              //             ...item.recipe,
                              //             privacy: e.target.checked ? "private" : "public",
                              //           },
                              //         }
                              //       : item,
                              //   ),
                              // );
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

                {/* Total price and other options like bookmark, options */}
                <div className="flex items-center justify-between px-2">
                  {/* total cost */}
                  <div className="text-md font-semibold">
                    Total:
                    <span className="">
                      {" "}
                      {currencySymbol} {totalCost.toFixed(2)}
                    </span>
                  </div>

                  {/* options like - bookmark, option button, forward, likes,etc */}
                  <div className="">
                    {/* bookmark */}
                    {showBookmarkIcon && (
                      <div className="pr-2">
                        {isBookmarked ? (
                          <BsBookmarkFill
                            className="h-10 scale-150 hover:scale-125 hover:cursor-pointer"
                            onClick={() => {
                              bookmarkRecipe();
                            }}
                          />
                        ) : (
                          <BsBookmark
                            className="h-10 scale-150 hover:scale-125 hover:cursor-pointer"
                            onClick={() => {
                              bookmarkRecipe();
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* show triple option for delete recipe for owner */}
                    {isRecipeOwner === true && (
                      <div className="rounded-full transition duration-300">
                        <Dropdown
                          className="rounded-lg border-2 border-gray-300"
                          label=""
                          dismissOnClick={false}
                          renderTrigger={() => (
                            <span className="flex w-full h-full items-center justify-center p-2 hover:bg-gray-100 rounded-full">
                              <SlOptionsVertical className="" />
                            </span>
                          )}
                        >
                          <DropdownItem
                            className="flex gap-2"
                            onClick={() => navigate(`/recipe/edit/${id}`)}
                          >
                            <MdOutlineEditNote className="w-4 h-4" /> Edit
                          </DropdownItem>
                          <DropdownItem className="flex gap-2 text-gray-300 hover:bg-white hover:cursor-default">
                            <HiPrinter className="w-4 h-4" /> Print
                          </DropdownItem>
                          <DropdownItem className="flex gap-2 text-gray-300 hover:bg-white hover:cursor-default">
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
                </div>

                {/* created dish section */}
                {isRecipeOwner === true && (
                  <div className="flex flex-col mt-2 mx-2 py-2 gap-2 rounded-lg border-2 bg-gray-100 border-gray-300 ">
                    {/* first line  */}
                    <div className="flex px-2 gap-2">
                      <h2 className="flex items-center">
                        <TbCalendarHeart className="scale-115" />{" "}
                      </h2>
                      <h2 className="flex items-center text-xs font-semibold">Last Prepared:</h2>
                      <p className="text-xs flex items-center">
                        {(foundRecipeDetails?.recipe.last_prepared_date &&
                          formattedDate(foundRecipeDetails?.recipe.last_prepared_date) +
                            " for " +
                            foundRecipeDetails?.recipe.meal) ||
                          "No record of past"}
                      </p>
                    </div>

                    {/* create dish Button */}
                    <Button
                      className="flex mx-2 text-center justify-center rounded-lg hover:cursor-pointer"
                      color={"dark"}
                      onClick={() => setIsDishModalOpen(true)}
                    >
                      Create Dish
                    </Button>
                  </div>
                )}

                {/* Description */}
                <div className="flex flex-col mt-2 mx-2 py-2 gap-1 rounded-lg border-2 border-gray-300 bg-gray-100">
                  <h2 className="px-2 font-semibold">Description</h2>
                  {/* <div className="border-y w-38 ml-2 border-gray-600"></div> */}
                  <div className="px-2 rounded-lg border-gray-600 text-sm max-h-35 overflow-y-auto scrollbar-thin">
                    {foundRecipeDetails?.recipe.description}
                  </div>
                </div>

                <div className=""></div>
              </div>
            </div>
            <div className=""></div>

            {/* tabs option of flowbite for smaller screen below lg */}
            <Tabs
              theme={{
                tablist: {
                  tabitem: {
                    variant: {
                      fullWidth: {
                        active: {
                          on: "bg-gray-200",
                          off: "hover:bg-gray-100 hover:cursor-pointer",
                        },
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
                {/* change price button and mini loading screen when base price is being changed*/}
                {isMiniLoading && (
                  <div className="flex w-full h-8 items-center justify-center">
                    <Spinner
                      theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
                      color="default"
                      aria-label="Loading"
                      size="xl"
                    />
                  </div>
                )}
                {!isMiniLoading && (
                  <div className="flex justify-end pr-2 text-sm h-8">
                    <div
                      className="border rounded-md bg-gray-700 text-white px-2 py-1 mb-1 hover:cursor-pointer hover:bg-gray-900"
                      onClick={() => setChangePrice(!changePrice)}
                    >
                      {changePrice ? (
                        <div className="flex">
                          <span className="flex items-center pr-1.5">
                            <FaLock />
                          </span>{" "}
                          Lock Price
                        </div>
                      ) : (
                        "Change Price"
                      )}
                    </div>
                  </div>
                )}

                {/* ingredients list */}
                <div
                  className={hasUserCreatedIngredient.current ? `` : `min-h-[calc(100vh-180px)]`}
                >
                  {recipeRows}
                </div>

                {/* show * description for user created ingredients */}
                {hasUserCreatedIngredient.current && (
                  <div className="flex min-h-[calc(100vh-300px)] px-2 text-gray-600 italic text-xs md:text-sm">
                    <GoNorthStar className="" /> User created Ingredient. Only available for recipe
                    owner.
                  </div>
                )}
              </TabItem>

              {/* Recipe steps */}
              <TabItem title="Steps" icon={TbFoodsteps}>
                <div className="px-2 min-h-[calc(100vh-150px)] max-w-xl">
                  {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                    <div className="italic text-gray-600 text-center ">
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

            {/* tabs option of flowbite for screen bigger than lg(showing ingredients and steps side by side) */}
            <div className="hidden lg:block">
              <Tabs
                theme={{
                  tablist: {
                    tabitem: {
                      variant: {
                        fullWidth: {
                          active: {
                            on: "bg-app-primary text-white",
                            off: "hover:bg-app-table-row",
                          },
                        },
                      },
                    },
                  },
                }}
                className="flex mt-2"
                aria-label="Tabs with icons"
                variant="fullWidth"
              >
                {/* Ingredients TAB screen*/}
                <TabItem active title="Ingredients" icon={GiAvocado}>
                  {/* change price button */}
                  <div className="flex">
                    {/* change price button and mini loading screen when base price is being changed*/}
                    <div className="flex-1">
                      {isMiniLoading && (
                        <div className="flex w-full h-8 items-center justify-center">
                          <Spinner
                            theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
                            color="default"
                            aria-label="Loading"
                            size="xl"
                          />
                        </div>
                      )}
                      {!isMiniLoading && (
                        <div className="flex justify-end pr-2 text-sm h-8">
                          <div
                            className="border rounded-md bg-gray-700 text-white px-2 py-1 mb-1 hover:cursor-pointer hover:bg-gray-900"
                            onClick={() => setChangePrice(!changePrice)}
                          >
                            {changePrice ? (
                              <div className="flex">
                                <span className="flex items-center pr-1.5">
                                  <FaLock />
                                </span>{" "}
                                Lock Price
                              </div>
                            ) : (
                              "Change Price"
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* just to keep change price button within ingredients section  */}
                    <div className="flex-1"></div>
                  </div>

                  {/* ingredients list */}
                  <div className="flex">
                    <div className="flex-1">
                      <div
                        className={
                          hasUserCreatedIngredient.current ? `` : `min-h-[calc(100vh-200px)]`
                        }
                      >
                        {recipeRows}
                      </div>

                      {/* show * description for user created ingredients */}
                      {hasUserCreatedIngredient.current && (
                        <div className="flex min-h-[calc(100vh-300px)] px-2 text-gray-600 italic text-xs md:text-sm">
                          <GoNorthStar className="" /> User created Ingredient. Only available for
                          recipe owner.
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {/* steps list */}
                      <div className="px-2 min-h-[calc(100vh-200px)] max-w-xl">
                        {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                          <div className="italic text-gray-600 text-center">
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

                {/* Steps TAB screen*/}
                <TabItem title="Steps" icon={TbFoodsteps}>
                  {/* change price button */}
                  <div className="flex">
                    {/* change price button and mini loading screen when base price is being changed*/}
                    <div className="flex-1">
                      {isMiniLoading && (
                        <div className="flex w-full h-8 items-center justify-center">
                          <Spinner
                            theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
                            color="default"
                            aria-label="Loading"
                            size="xl"
                          />
                        </div>
                      )}
                      {!isMiniLoading && (
                        <div className="flex justify-end pr-2 text-sm h-8">
                          <div
                            className="border rounded-md bg-gray-700 text-white px-2 py-1 mb-1 hover:cursor-pointer hover:bg-gray-900"
                            onClick={() => setChangePrice(!changePrice)}
                          >
                            {changePrice ? (
                              <div className="flex">
                                <span className="flex items-center pr-1.5">
                                  <FaLock />
                                </span>{" "}
                                Lock Price
                              </div>
                            ) : (
                              "Change Price"
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* just to keep change price button within ingredients section  */}
                    <div className="flex-1"></div>
                  </div>

                  {/* ingredients list */}
                  <div className="flex">
                    <div className="flex-1">
                      <div
                        className={
                          hasUserCreatedIngredient.current ? `` : `min-h-[calc(100vh-200px)]`
                        }
                      >
                        {recipeRows}
                      </div>

                      {/* show * description for user created ingredients */}
                      {hasUserCreatedIngredient.current && (
                        <div className="flex min-h-[calc(100vh-300px)] px-2 text-gray-600 italic text-xs md:text-sm">
                          <GoNorthStar className="" /> User created Ingredient. Only available for
                          recipe owner.
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {/* steps list */}
                      <div className="px-2 min-h-[calc(100vh-200px)] max-w-xl">
                        {foundRecipeDetails?.steps && foundRecipeDetails.steps.length === 0 && (
                          <div className="italic text-gray-600 text-center">
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
        )}
      </div>

      {/* Delete Modal */}
      {isConfirmModalOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDelete}
          title={"Delete Recipe"}
          message={`Are you sure to delete - ${capitaliseWords(foundRecipeDetails.recipe.name)} ?`}
          OKtext={"Delete"}
          OKtextIcon={HiTrash}
          cancelText={"Cancel"}
        />
      )}

      {/* Create Dish Modal */}
      {isDishModalOpen && (
        <DishesModal
          isOpen={isDishModalOpen}
          onClose={() => setIsDishModalOpen(false)}
          onConfirm={handleCreateDish}
          title={"Created This Dish On:"}
          cancelText={"Cancel"}
          OKtext={"Create Dish"}
          OKtextIcon={HiClipboardList}
          meals={foundRecipeDetails.meals}
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
          optionValueText={"unit_id"}
          optionText={"unit_name"}
          onChange={setSelectedMeal}
        />
      )}

      {/* Change base price of ingredient modal */}
      {isEditBaseValuesOpen && (
        <EditBaseValuesModal
          isOpen={isEditBaseValuesOpen}
          onClose={() => setIsEditBaseValuesOpen(false)}
          onConfirm={(compUid, ingUid, updateQuantity, updateUnit, updatePrice) =>
            updateBaseValues(compUid, ingUid, updateQuantity, updateUnit, updatePrice)
          }
          title={""}
          message={`Purchase Price of : ${capitaliseWords(ingName)}`}
          cancelText={"Cancel"}
          OKtext={"Update"}
          OKtextIcon={HiClipboardList}
          quantityValue={quantityValue}
          unitValue={unitValue}
          baseUnits={baseUnits}
          priceValue={priceValue}
          compUid={compUid}
          ingUid={ingUid}
          currencySymbol={currencySymbol}
        />
      )}

      {/* alert toast */}
      {openAlertToast && (
        <AlertToast message={alertMsg.current} success={alertForSuccess.current} yPosition="top" />
      )}
    </div>
  );
}

export default RecipeDetails;

// {/* NEW DIV TO REPLACE Details and Image */}
// <div className="flex flex-col-reverse mt-4 lg:flex-row lg:max-w-lg">
//   {/* details */}
//   <div className="">
//     {/* portion size & privacy */}
//     <div className="flex mt-2 mx-2 gap-2">
//       {/* portion size */}
//       <div className="flex-col flex-6 rounded-md p-2 ">
//         <div className="text-md font-semibold">Portion Details</div>
//         <div className="border-y w-28 border-gray-600"></div>
//         <div className="flex gap-2">
//           <div className="flex items-center">
//             <FaUsers className="text-gray-600" />
//           </div>
//           <div className="">2 people</div>
//         </div>
//       </div>

//       {/* privacy */}
//       <div className="flex-col flex-4 rounded-md p-2">
//         <div className="flex gap-2 justify-center">
//           <div className="flex items-center ">
//             <FaLock className="text-gray-600" />{" "}
//           </div>
//           <div className="text-md font-semibold">Recipe Public</div>
//         </div>
//         <div className="border-y mx-auto w-32 border-gray-600"></div>
//         <div className="flex gap-2 justify-center">
//           <div className="">toggle</div>
//           <div className=""> text</div>
//         </div>
//       </div>
//     </div>

//     {/* created dish section */}
//     <div className="flex flex-col mt-2 mx-2 py-2 gap-2 rounded-lg border bg-gray-50 border-gray-600 ">
//       {/* first line  */}
//       <div className="flex px-2 gap-2">
//         <div className="flex items-center">
//           <TbCalendarHeart />{" "}
//         </div>
//         <div className="text-md font-semibold">Last Prepared:</div>
//         <div className="flex text-sm items-center"> 26th Oct '26 for Lunch</div>
//       </div>

//       {/* create dish Button */}
//       <Button className="flex mx-2 text-center justify-center rounded" color={"dark"}>
//         Create Dish
//       </Button>
//     </div>

//     {/* Description */}
//     <div className="flex flex-col mt-2 mx-2 py-2 gap-1 rounded-lg">
//       <div className="px-2 font-semibold">Description Header</div>
//       <div className="border-y w-38 ml-2 border-gray-600"></div>
//       <div className="px-2 rounded-lg border-gray-600 text-sm max-h-50 overflow-y-auto scrollbar-thin">
//         It has the details of a recipe and that includes the image of the recipe the
//         portion details if the private on not private Toggles which it has got the last
//         prepared details it has got also the button to create the create dish button
//         which will be adjusting to last prepared as this two are dependent on each other
//         or they are like a relative of each other and descriptions which is of the
//         recipe and also the total price of the recipe which is displayed in that section
//         or in that day now give me a nice way to display all these details on a large
//         screen with a div having a landscape which is more of a wider angle like you can
//         say something in the range of 20 years to 6 screen size or something like that
//         so that my details are quite spread enough way which we can have as one section
//         for image and another section for all the other details also you can think about
//         it as description can be of a very length so keeping that thing within the same
//         dev is it feasible or not because then the image size might keep on increasing
//         dependent upon the size of description so just give me few examples as in the
//         screenshots of how it the best way to make it look on the screen
//       </div>
//     </div>

//     <div className=""></div>
//   </div>

//   {/* image */}
//   <div className="flex w-full aspect-video sm:max-w-80 sm:mx-auto items-center justify-center md:rounded-md md:mr-2">
//     {foundRecipeDetails?.recipe?.image_url && !imageError ? (
//       <img
//         className="h-full w-full md:rounded-md"
//         src={foundRecipeDetails?.recipe?.image_url}
//         alt="Recipe Image"
//         onError={() => setImageError(true)}
//       />
//     ) : (
//       <GiHotMeal className="h-[80%] w-[80%] bg-gray-200" />
//     )}
//   </div>
// </div>
// <div className=""></div>

// {/* Recipe Name header & recipe by OR option button */}
//             <div className="flex flex-col relative">
//               <div
//                 className={
//                   isRecipeOwner
//                     ? `flex pl-2 pr-12 max-w-sm font-extrabold text-xl
//                               md:text-2xl md:max-w-lg
//                               lg:text-3xl lg:max-w-xl`
//                     : `flex pl-2 pr-6 pb-6 max-w-sm font-extrabold text-xl
//                               md:text-2xl md:max-w-lg
//                               lg:text-3xl lg:max-w-xl`
//                 }
//               >
//                 {capitaliseWords(foundRecipeDetails?.recipe.name)}
//               </div>

//               {/* Show recipe owner details if different from user */}
//               {isRecipeOwner === false && (
//                 <div className="absolute flex space-x-1 right-3 bottom-0 hover:cursor-pointer">
//                   <div className="font-semibold">-</div>
//                   <p onClick={() => navigate(`/recipesBy/${foundRecipeDetails?.recipe.user_id}`)}>
//                     {foundRecipeDetails?.recipe.username ??
//                       foundRecipeDetails?.recipe.dislay_name ??
//                       foundRecipeDetails?.recipe.email}
//                   </p>
//                 </div>
//               )}

//               {/* show triple option for delete recipe for owner */}
//               {isRecipeOwner === true && (
//                 <div className="absolute right-2 top-0 scale-125  rounded-full transition duration-300">
//                   <Dropdown
//                     label=""
//                     dismissOnClick={false}
//                     renderTrigger={() => (
//                       <span className="flex w-full h-full items-center justify-center p-2 hover:bg-amber-100 rounded-full">
//                         <SlOptionsVertical className="" />
//                       </span>
//                     )}
//                   >
//                     <DropdownItem
//                       className="flex gap-2"
//                       onClick={() => navigate(`/recipe/edit/${id}`)}
//                     >
//                       <MdOutlineEditNote className="w-4 h-4" /> Edit
//                     </DropdownItem>
//                     <DropdownItem className="flex gap-2 text-gray-300 hover:bg-white hover:cursor-default">
//                       <HiPrinter className="w-4 h-4" /> Print
//                     </DropdownItem>
//                     <DropdownItem className="flex gap-2 text-gray-300 hover:bg-white hover:cursor-default">
//                       <HiShare className="w-4 h-4" /> Share
//                     </DropdownItem>
//                     <DropdownItem
//                       className="flex gap-2 text-sm text-app-danger"
//                       onClick={() => setIsConfirmModalOpen(true)}
//                     >
//                       <HiTrash className=" w-4 h-4" />
//                       Delete
//                     </DropdownItem>
//                   </Dropdown>
//                 </div>
//               )}
//             </div>

//             {/* Recipe Details and image */}
//             <div className="flex  flex-col-reverse mt-4 lg:max-h-60 lg:flex-row lg:w-full  lg:justify-between">
//               {/* recipe details */}
//               <div className="flex flex-col w-full justify-center lg:max-w-lg">
//                 {/* portion-size, privacy and cost */}
//                 <div className="flex w-full justify-between px-2">
//                   {/* portion size and privacy if owner */}
//                   <div className="flex flex-col space-y-2">
//                     {/* Portion size field */}
//                     <div className="flex space-x-2 mt-2">
//                       <div className="font-semibold">Portion:</div>
//                       <div> {foundRecipeDetails?.recipe.portion_size}</div>
//                     </div>

//                     {/* toggle switch for private recipe */}
//                     {isRecipeOwner === true && (
//                       <div className="flex">
//                         <div>
//                           {!changePrvcyLoading && (
//                             <Toggle
//                               title="Private"
//                               checked={
//                                 foundRecipeDetails?.recipe.privacy === "private" ? true : false
//                               }
//                               onText="Private"
//                               offText="Private"
//                               onChange={(e) => {
//                                 setChangePrvcyLoading(true);
//                                 setFoundRecipeDetails((prev) => ({
//                                   ...prev,
//                                   recipe: {
//                                     ...prev.recipe,
//                                     privacy:
//                                       prev.recipe.privacy === "private" ? "public" : "private",
//                                   },
//                                 }));
//                                 // setRecipeDetails((prev) =>
//                                 //   prev.map((item) =>
//                                 //     item.recipe.recipe_id === Number(id)
//                                 //       ? {
//                                 //           ...item,
//                                 //           recipe: {
//                                 //             ...item.recipe,
//                                 //             privacy: e.target.checked ? "private" : "public",
//                                 //           },
//                                 //         }
//                                 //       : item,
//                                 //   ),
//                                 // );
//                                 changePrivacy(e.target.checked ? "private" : "public");
//                                 setChangePrvcyLoading(false);
//                               }}
//                             />
//                           )}
//                           {changePrvcyLoading && <h3> Privacy Loading .............</h3>}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* cost of recipe */}
//                   <div className="flex items-end text-3xl">
//                     {currencySymbol} {totalCost.toFixed(2)}
//                   </div>
//                 </div>

//                 {/* if Owner - Last prepared & create dish*/}
//                 {isRecipeOwner && (
//                   <div className="flex justify-between mt-2 px-2">
//                     <div className="flex flex-col space-x-2">
//                       <div className="font-semibold">Last Prepared:</div>
//                       <p>
//                         {(foundRecipeDetails?.recipe.last_prepared_date &&
//                           formattedDate(foundRecipeDetails?.recipe.last_prepared_date) +
//                             " for " +
//                             foundRecipeDetails?.recipe.meal) ||
//                           "No record of past"}
//                       </p>
//                     </div>
//                     {/* Create dish button */}
//                     <div className="hidden md:block">
//                       <Button
//                         className="cursor-pointer"
//                         color="dark"
//                         onClick={() => setIsDishModalOpen(true)}
//                       >
//                         <HiClipboardList className="mr-2 w-5 h-5" />
//                         create dish
//                       </Button>
//                     </div>
//                     <div className="block md:hidden ">
//                       <div
//                         className="flex w-17 h-17 rounded-full bg-gray-400 items-center justify-center
//                                   border border-gray-600 hover:bg-gray-500"
//                       >
//                         <Button
//                           className="cursor-pointer rounded-full w-15 h-15 "
//                           color="dark"
//                           onClick={() => setIsDishModalOpen(true)}
//                         >
//                           create dish
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* alert msg for succefully created dish record */}
//                 {isRecipeOwner && successAlert && (
//                   <div className="">
//                     <Alert
//                       color="success"
//                       icon={BsFillHandThumbsUpFill}
//                       onDismiss={() => setSuccessAlert(false)}
//                     >
//                       <span className="">Dish record successfully created</span>
//                     </Alert>
//                   </div>
//                 )}
//               </div>

//               {/* recipe image */}
//               <div className="flex w-full aspect-video sm:max-w-80 sm:mx-auto items-center justify-center md:rounded-md md:mr-2">
//                 {foundRecipeDetails?.recipe?.image_url && !imageError ? (
//                   <img
//                     className="h-full w-full md:rounded-md"
//                     src={foundRecipeDetails?.recipe?.image_url}
//                     alt="Recipe Image"
//                     onError={() => setImageError(true)}
//                   />
//                 ) : (
//                   <GiHotMeal className="h-[80%] w-[80%] bg-gray-200" />
//                 )}
//               </div>
//             </div>

//             {/* description of recipe */}
//             <div
//               className="flex px-2 mt-2 text-sm
//                           md:text-md lg:text-lg lg:max-w-2/3 "
//             >
//               <div>
//                 <span className="font-semibold">Description: </span>{" "}
//                 {foundRecipeDetails?.recipe.description}
//               </div>
//             </div>

//             {/* Buttons for owner */}
//             {isRecipeOwner && (
//               <div className="hidden lg:flex justify-between p-2">
//                 {/* Create edit button */}
//                 <div className="">
//                   <Button
//                     className="cursor-pointer bg-app-secondary"
//                     // color="light"
//                     onClick={() => navigate(`/recipe/edit/${id}`)}
//                   >
//                     <MdOutlineEditNote className="mr-2 w-5 h-5" />
//                     Edit Recipe
//                   </Button>
//                 </div>

//                 {/* Delete recipe */}
//                 <div>
//                   <Button
//                     className="cursor-pointer"
//                     color="red"
//                     onClick={() => setIsConfirmModalOpen(true)}
//                   >
//                     <HiTrash className="mr-2 w-5 h-5" />
//                     Delete Recipe
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Row for bookmark, forward, like, dislike, etc */}
//             <div className="flex justify-end h-10 w-full pr-4 gap-3">
//               {/* <TiArrowForward className="h-10 scale-200" /> */}
//               {showBookmarkIcon && (
//                 <>
//                   {isBookmarked ? (
//                     <BsBookmarkFill
//                       className="h-10 scale-150 hover:scale-125 hover:cursor-pointer"
//                       onClick={() => {
//                         bookmarkRecipe();
//                       }}
//                     />
//                   ) : (
//                     <BsBookmark
//                       className="h-10 scale-150 hover:scale-125 hover:cursor-pointer"
//                       onClick={() => {
//                         bookmarkRecipe();
//                       }}
//                     />
//                   )}{" "}
//                 </>
//               )}
//             </div>
