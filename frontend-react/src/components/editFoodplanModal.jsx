import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import Dropdown from "./dropdown";
import Input from "../components/input";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

function EditFoodplanModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  OKtext,
  OKtextIcon,
  cancelText,
  meals,
  dayData,
  weekData,
  foodplanId,
  selectedMeal,
  setSelectedMeal,
}) {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData({ food_plan_id: foodplanId, food_plan: [{ ...weekData, weekly_meals: [dayData] }] });
  }, [weekData]);

  const [mealType, setMealType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const timeoutRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  // ------------- function to remove recipe from the day list ---------------------------------
  const removeRecipe = (fpm_id, fpr_id) => {
    const newDailyMeal = {
      ...data,
      food_plan: [
        {
          ...data.food_plan[0],
          weekly_meals: [
            {
              ...data.food_plan[0].weekly_meals[0],
              daily_meals: data.food_plan[0].weekly_meals[0].daily_meals.map((meal) =>
                meal.food_plan_meal_id === fpm_id
                  ? {
                      ...meal,
                      recipes: meal.recipes.filter(
                        (recipe) => recipe.food_plan_recipe_id !== fpr_id,
                      ),
                    }
                  : meal,
              ),
            },
          ],
        },
      ],
    };
    setData(newDailyMeal);
  };

  // ----------------------------- search ingredient when typed in box -----------------------------------------
  const searchRecipe = (val) => {
    //  if val.length < 1 then return
    if (val.trim().length <= 1 || val === "") {
      clearTimeout(timeoutRef.current);
      setRecipeList([]);
      return;
    }

    // check if previous timeout reference is active
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // up date any error if generated
    setErrMsg("");

    // console.log("searching for :", val.trim());
    // return;

    const method = "get";
    const url = `/foodplan/api/searchrecipes?q=${val.trim()}`;

    // set new timeout for the delay
    timeoutRef.current = setTimeout(() => {
      const checkRecipes = async () => {
        try {
          const res = await api[method](url);
          // console.log("ingredients found are : ", res.data);
          setRecipeList(res.data.rows);
        } catch (err) {
          // window.alert(`Error while fetching ingredients list from database`);
          console.log("error in newRecipe.jsx while ing search :", err.response);
        }
      };

      checkRecipes();
    }, 500);

    // clear the timeout if the component unmounts or re renders
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // timeoutRef.current = null;
      }
    };
  };

  // ------------------------------Handle key down within suggested recipes -----------------------------------------
  const handleKeyDown = (e) => {
    if (!recipeList.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < recipeList.length - 1 ? prev + 1 : prev));
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
          setErrMsg("");
          handleSelectedRecipe(recipeList[highlightedIndex]); // Select the item
        }
        break;

      case "Tab":
        if (highlightedIndex >= 0) {
          // e.preventDefault();
          e.stopPropagation();
          setErrMsg("");
          handleSelectedRecipe(recipeList[highlightedIndex]); // Select the item
        }
        break;

      default:
        break;
    }
  };

  // ------------------------------ add the selected ingredient in ingRow data --------------------------------
  const handleSelectedRecipe = (recipe) => {
    if (!mealType) {
      setErrMsg("select the meal");
      return;
    }

    const mealSelected = Number(mealType);

    // get all the recipes of that particular meal selected for that day
    const mealReicpes = data.food_plan[0].weekly_meals[0].daily_meals.find(
      (meal) => meal.meal_id === mealSelected,
    ).recipes;

    // check if the new recipe selected for that particular meal already exist in that meal.
    // if yes then stop and let user know about it. Cant add same recipe for the same meal on same day
    const alreadyThereRecipe = mealReicpes.find((rec) => rec.recipe_id === recipe.recipe_id);

    if (alreadyThereRecipe) {
      setErrMsg("Recipe already present for the selected meal");
      return;
    }

    // new recipe object to be added in meal
    const newRecipe = {
      recipe_id: recipe.recipe_id,
      recipe_name: recipe.recipe_name,
      cost: Number(Number(recipe.price).toFixed(2)),
      display_order:
        data.food_plan[0].weekly_meals[0].daily_meals.find((m) => m.meal_id === mealSelected)
          .recipes.length + 1,
    };

    // console.log("newRecipe :", newRecipe);
    // return;
    setSearchText("");
    setRecipeList([]);
    setHighlightedIndex(0);
    setData((prev) => ({
      ...prev,
      food_plan: [
        {
          ...prev.food_plan[0],
          weekly_meals: [
            {
              ...prev.food_plan[0].weekly_meals[0],
              daily_meals: prev.food_plan[0].weekly_meals[0].daily_meals.map((m) =>
                m.meal_id === mealSelected ? { ...m, recipes: [...m.recipes, newRecipe] } : m,
              ),
            },
          ],
        },
      ],
    }));
  };

  // console.log("searchText is:", searchText);
  // console.log("meal Type is :", mealType);
  // console.log("recipeList is :", recipeList);
  // console.log("week data :", weekData);
  // console.log("data is :", data);

  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader className="">{title}</ModalHeader>
      <ModalBody>
        <div className="flex w-full">
          {/* left column in modal */}
          <div className="flex flex-1 flex-col">
            <div className="m-2 text-blue-400 text-sm font-semibold">Select the Meal first</div>
            {/* select meal */}
            <div className="flex">
              {/* <div className="flex items-center">Meal</div> */}
              <Dropdown
                className="text-xs rounded-md border border-gray-300 mt-2"
                title={"Meal: "}
                options={meals}
                optionValueText={"meal_id"}
                optionText={"name"}
                value={mealType}
                onChange={(e) => {
                  setMealType(e.target.value);
                  setErrMsg("");
                }}
              />
            </div>

            {/* error line */}
            <div className="mt-2 h-6 text-xs text-app-danger">{errMsg}</div>

            {/* recipe search field */}
            <div className="mt-2">
              <div className="text-sm">Recipe:</div>
              <div className="relative h-40">
                <Input
                  className="rounded border-gray-300 h-8 w-38 text-sm placeholder:text-gray-300"
                  value={searchText}
                  placeholder={"Your recipe name..."}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    searchRecipe(e.target.value);
                    setErrMsg("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e)}
                  onBlur={() => {
                    setSearchText("");
                    setRecipeList([]);
                    setHighlightedIndex(0);
                  }}
                />
                {recipeList.length > 0 && (
                  <div className="absolute top-7.5 bg-white left-0 w-38 max-h-35 z-10 overflow-y-auto rounded-b border border-gray-300">
                    {recipeList.map((recipe, index) => (
                      <div
                        key={recipe.recipe_id}
                        className={
                          index === highlightedIndex
                            ? "border-b border-gray-300 bg-gray-100"
                            : "border-b border-gray-300"
                        }
                      >
                        <div className="text-sm font-semibold">{recipe.recipe_name}</div>
                        <div className="italic text-xs text-gray-400">{recipe.portion_size}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* middle vertical divider */}
          <div className="mx-1 border-l border-gray-400"></div>

          {/* right window in modal for showing day's food plan */}
          <div className="flex flex-1 justify-center">
            <div className="w-full h-40 overflow-y-auto scrollbar-gutter-stable">
              {data &&
                data?.food_plan[0].weekly_meals[0].daily_meals.map((meal) =>
                  meal.recipes.length > 0 ? (
                    <div>
                      <div className="px-1 text-sm font-semibold text-blue-400">
                        {meal.meal_type}
                      </div>
                      {meal.recipes.map((recipe, index) => (
                        <div className="flex text-xs">
                          <div className="px-1"> {index + 1}.</div>
                          <div className="pr-1 flex flex-1">{recipe.recipe_name}</div>
                          <div className="">
                            <div
                              className="flex items-center justify-center text-xs hover:cursor-pointer rounded-full w-3 h-3 pb-px text-red-500"
                              onClick={() =>
                                removeRecipe(meal.food_plan_meal_id, recipe.food_plan_recipe_id)
                              }
                            >
                              x
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className=""></div>
                    </div>
                  ) : (
                    ""
                  ),
                )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex justify-between w-full text-sm">
          <div
            className=" flex  items-center px-3 py-1 bg-app-primary rounded text-white hover:cursor-pointer"
            onClick={() => onConfirm(data)}
          >
            <OKtextIcon className=" flex w-5 h-5 pr-1" /> {OKtext}
          </div>
          <div
            className="flex py-1 justify-end bg-gray-200 rounded px-3 hover:cursor-pointer hover:bg-gray-400"
            onClick={onClose}
          >
            {cancelText}
          </div>
        </div>
      </ModalFooter>
      {/* <ModalFooter>
        <Button
          className="border"
          color="success"
          onClick={() => onConfirm({ date: selectedDate, comment: customMsg, meal: selectedMeal })}
        >
          <OKtextIcon className="mr-2 w-5 h-5" />
          {OKtext}
        </Button>
        <Button color="gray" onClick={onClose}>
          {cancelText}
        </Button>
      </ModalFooter> */}
    </Modal>
  );
}

export default EditFoodplanModal;
