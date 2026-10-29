import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import api from "../../api/axios";
import Input from "../../components/input";
import { capitaliseWords, serverURL, windowScrollPercentage } from "../../utils/appUtils";
import { Button, Spinner } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { TbBowlSpoonFilled } from "react-icons/tb";
import { FaCarrot, FaCircleInfo } from "react-icons/fa6";
import { IoIosLock, IoMdAdd, IoMdHome } from "react-icons/io";
import EmptyResponsePage from "../../components/emptyResponsePage";
import { BsBookmark } from "react-icons/bs";
import { GoBookmarkFill, GoBookmarkSlashFill } from "react-icons/go";
import { ImInfo } from "react-icons/im";
import { GiHotMeal } from "react-icons/gi";

function MySavedRecipes() {
  const navigate = useNavigate();
  const [savedRecipeList, setSavedRecipeList] = useState();
  const [hasNoSavedRecipe, setHasNoSavedRecipe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isChangingBookmark, setIsChangingBookmark] = useState(false);

  const limit = 5;
  const scrollwindowPercent = 90;
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  //  for animation of delete bookmark
  const [parent] = useAutoAnimate();

  const method = "get";
  const url = `/userSavedRecipe/api/bookmarkedlist`;
  // console.log("coming from savedRecipes2 file");

  // ----------------------------- fetch data from backend  -------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (cursor === null) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const res = await api[method](url, { params: { q: searchText, limit, cursor } });
        if (cursor === null) {
          setSavedRecipeList(res?.data?.data);
          // check if user has saved any recipe, if not then flag the pageNo with setHasNoSavedRecipe to show relevant display
          if (res.data?.data?.length === 0 && searchText.length === 0) {
            setHasNoSavedRecipe(true);
          }
        } else {
          setSavedRecipeList((prev) => [...prev, ...res?.data?.data]);
        }
        setHasMore(res?.data?.hasMore || false);
      } catch (err) {
        console.log("error while fetching my saved recipe list with axios is :", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchData();
  }, [cursor, searchText]);

  // -------------------------------- scroll listener -----------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = windowScrollPercentage();

      if (scrollPercentage >= scrollwindowPercent && hasMore && !isLoadingMore) {
        setCursor(savedRecipeList[savedRecipeList.length - 1].created_at);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoadingMore]);

  // ------------------- search button result of user's recipe -----------------------
  const searchButton = () => {
    const stringText = inputText.trim().replace(/\s+/g, " ");
    setSearchText(stringText);
    setCursor(1);
  };

  // ------------------------------ creating variable to store which recipe have images and valid --------
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (recipeId) => {
    setFailedImages((prev) => ({
      ...prev,
      [recipeId]: true,
    }));
  };

  // ------------------------------------------ change bookmark logic ----------------------------------------------
  const removeBookmark = (id) => {
    if (!id) {
      return;
    }
    const url = `/userSavedRecipe/api/delete/${id}`;
    const method = "delete";

    setIsChangingBookmark(true);
    // function to call api
    const sendData = async () => {
      try {
        await api[method](url);
        // if successful, get check the length and if less than five, fetch new and append it
        const newListLength = savedRecipeList.length - 1;
        setSavedRecipeList((prev) => prev.filter((i) => i.recipe_id !== id));
        if (newListLength < 5 && hasMore) {
          setCursor(savedRecipeList[savedRecipeList.length - 1].created_at);
        }
      } catch (err) {
        console.log("Error while bookmarking recipe :", err);
        window.alert(`Something went wrong. Try again later.`);
      } finally {
        setIsChangingBookmark(false);
      }
    };

    sendData();
  };

  // ------------------------------------------- loading screen ----------------------------------------------
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

  //   console.log("savedRecipeList :", savedRecipeList);

  return (
    <>
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5 ">
        {/* Check if the data is empty and show the page accordingly */}
        {hasNoSavedRecipe ? (
          <EmptyResponsePage
            title={"Not Saved Any Recipe Yet"}
            message={
              <>
                Click the bookmark icon{" "}
                <span className="inline-block align-middle font-bold text-gray-800">
                  <BsBookmark className="inline-block scale-150" />
                </span>{" "}
                on any recipe to save it here for later.
              </>
            }
            urlPath={"/"}
            imageSrc={"/images/no_ingredient_yet.png"}
            ButtonText={"Go To Home Page"}
            ButtonIcon={IoMdHome}
            hideSecondButton={true}
            hideFirstButton={true}
          />
        ) : (
          <>
            {/* Create header and search bar for your saved recipes and a line separator */}
            <div className="flex flex-col sticky z-8 top-(--top-bar-height) bg-white shadow-md">
              {/* header of your saved recipes & search bar */}
              <div
                className="flex flex-col mb-4 items-center
                    lg:flex-row  lg:justify-between"
              >
                {/* header */}
                <div className="flex flex-col items-center gap-y-2">
                  <p className="text-2xl font-semibold">Saved Recipes:</p>
                </div>

                {/* search bar for Saved recipes */}
                <div
                  className="flex flex-col items-start sm:w-1/2 
                            lg:items-start  lg:w-1/3"
                >
                  {/* search header */}
                  <div className="flex mt-4 lg:mt-0 "></div>
                  {/* search bar */}
                  <div className="flex w-full items-end justify-end  py-2">
                    {/* search input */}
                    <Input
                      className="border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                          focus:ring-2 focus:ring-gray-300 h-10 w-full lg:w-100 px-2 pb-1 placeholder:text-gray-400"
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={"Search Saved Recipe"}
                      value={inputText}
                    />
                    {/* search button */}
                    <button
                      className=" text-xl cursor-pointer rounded-r-md border-r border-t border-b border-gray-400 bg-gray-200 text-gray-700 h-10 px-4 
                              hover:ring-2 hover:ring-gray-600 hover:cursor-pointer"
                      onClick={searchButton}
                    >
                      <HiOutlineSearch />
                    </button>
                  </div>
                </div>
              </div>

              {/* Line Separator
          <div className="flex items-center mb-2">
            <div className="grow border-t border-gray-300"></div>
          </div> */}
            </div>

            {/* show all your Saved Recipes */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 lg:gap-8"
              ref={parent}
            >
              {savedRecipeList?.map((i) => (
                <div
                  key={i.id}
                  className="relative flex border border-gray-300 rounded-xl m-2 p-2 
                          hover:scale-101 transition duration-300"
                >
                  {/* image section - left */}
                  <div
                    className="h-20 aspect-4/3 border-0 hover:cursor-pointer"
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    <div className=" h-full w-full">
                      {failedImages[i.recipe_id] || !i.image_url ? (
                        <GiHotMeal className="h-full w-full bg-gray-200 rounded-lg md:rounded-xl" />
                      ) : (
                        <img
                          className="h-full w-full rounded-lg md:rounded-xl object-cover object-center"
                          src={i?.image_url}
                          alt="Recipe Image"
                          onError={() => handleImageError(i.recipe_id)}
                        />
                      )}
                    </div>
                  </div>

                  {/* details section right */}
                  <div
                    className="px-2 flex-1 hover:cursor-pointer"
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    {/* recipe name */}
                    <p className="text-md font-semibold line-clamp-2">{capitaliseWords(i.name)}</p>
                    {/* portion size */}
                    <p className="text-gray-500 italic text-xs md:text-sm line-clamp-1">
                      {i.portion_size}
                    </p>
                    {/* owner description */}
                    <p className="px-1 mb-1 text-xs md:text-sm text-gray-500  line-clamp-1">
                      by: {i.username ?? i.display_name ?? i.email}
                    </p>
                  </div>

                  {/* remove bookmark symbol */}
                  <div className="pr-2 pt-1 ">
                    <GoBookmarkFill
                      className="hover:cursor-pointer scale-125 "
                      onClick={() => removeBookmark(i.recipe_id)}
                    />
                  </div>

                  {/* overlay if recipe is public any more */}
                  {i.privacy === "private" && (
                    <div className="absolute flex left-0 top-0 h-full w-[full-1] rounded-xl gap-2 bg-white/80 z-50 p-2">
                      <div className="flex items-center justify-center h-20 aspect-16/12 border-0 bg-gray-300/10 rounded-md">
                        <IoIosLock className=" text-white bg-gray-700/80 rounded-full h-6 w-6 scale-150 p-1.5" />
                      </div>
                      <div className="flex flex-1 items-center border border-red-500 bg-red-100 opacity-100 mt-8 gap-3 rounded-md py-2 px-4">
                        <FaCircleInfo className="pt-0.5 h-5 w-5 text-red-500 scale-125" />
                        <p className="text-xs text-red-500 ">Currenrtly unavailable.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default MySavedRecipes;
