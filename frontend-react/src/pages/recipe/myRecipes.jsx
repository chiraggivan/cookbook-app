import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { CurrentUserContext } from "../../context/currentUserContext";
import { JWTunverifiedMsg, serverURL } from "../../utils/appUtils";
import Button from "../../components/button";
import Input from "../../components/input";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import { getInitials } from "../../utils/appUtils";
import { FaSearchengin } from "react-icons/fa6";
import { GiHotMeal } from "react-icons/gi";
import { Spinner } from "flowbite-react";

function MyRecipes() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  // const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    myRecipes,
    setMyRecipes,
    hasMoreMyRecipes,
    setHasMoreMyRecipes,
    pageNoMyRecipes,
    setPageNoMyRecipes,
  } = useContext(MyRecipeContext);
  const { currentUserId } = useContext(CurrentUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRecipe, setSearchRecipe] = useState("");
  const [srchBtnPrssd, setSrchBtnPrssd] = useState(false);
  const [displayRecipes, setDisplayRecipes] = useState();

  const imageBaseURL = "/uploadedImages/";
  const [imageError, setImageError] = useState(false);
  //  variable for infinite scroll with out search text
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageChanged, setPageChanged] = useState(false);
  const limit = 5;
  const scrollwindowPercent = 99;
  // variables for search criteria infinite scroll
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchPageChanged, setSearchPageChanged] = useState(false);

  //-------------------------------- Redirect to home if token not found -----------------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  //-------------------------------- initialise url, method and config -----------------------------------
  // useEffect(() => {
  //   if (!authHookLoading && (!token || !isAuthenticated)) {
  //     navigate("/login");
  //   }
  // }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------- fetch the data by giving url, method and body(if required) -------------------------
  const method = "get";
  const url = `${serverURL}/recipe/api/my`;
  // config for page load / no search text as we are saving in context the result of the response
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: searchRecipe || undefined,
      page: pageNoMyRecipes,
      limit,
    },
  };

  // config for search as searchPage is different and we are not saving the recipe list of searched text in context
  const searchConfig = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: searchRecipe.trim().replace(/\s+/g, " ").toLowerCase(),
      page: searchPage,
      limit,
    },
  };

  // -------------------- fetch data from backend on every page number change as well -------------------------------------
  useEffect(() => {
    // check if context variable myRecipes is empty or pageChanged is true. this
    // useEffects only run on first load(when context variable is empty) and when pageChanged value is true
    if (myRecipes.length === 0 || pageChanged) {
      const fetchData = async () => {
        try {
          if (pageNoMyRecipes === 1) {
            setIsLoading(true);
          } else {
            setIsLoadingMore(true);
          }

          const res = await axios[method](url, config);
          setHasMoreMyRecipes(res?.data?.hasMore);
          const refinedMyRecipes = res?.data.data.map(({ username, user_id, ...rest }) => rest);

          if (pageNoMyRecipes === 1) {
            setMyRecipes(refinedMyRecipes);
            // setDisplayRecipes(refinedMyRecipes);
          } else {
            setMyRecipes((prev) => [...prev, ...refinedMyRecipes]);
            // setDisplayRecipes((prev) => [...prev, ...refinedMyRecipes]);
          }
        } catch (err) {
          console.log(
            "error while fetching my ingredients list with axios is :",
            err.response.message,
          );
        } finally {
          setIsLoading(false);
          setIsLoadingMore(false);
          setPageChanged(false);
        }
      };
      fetchData();
    }
    setIsLoading(false);
    setIsLoadingMore(false);
  }, [pageNoMyRecipes]);

  // -------------------- transfer data from myRecipes context variable to displayRecipes variable ------------------
  useEffect(() => {
    setDisplayRecipes(myRecipes);
  }, [myRecipes]);

  // -------------------------------- scroll listener for My recipe page without search text--------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
      // console.log("scroll % :", scrollPercentage);
      if (scrollPercentage >= scrollwindowPercent && hasMoreMyRecipes && !isLoadingMore) {
        setPageChanged(true);
        setPageNoMyRecipes((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMoreMyRecipes, isLoadingMore]);

  //
  // ---------------------------- Sreached button pressed -----------------------------
  useEffect(() => {
    const searchText = searchRecipe.trim().replace(/\s+/g, " ").toLowerCase();
    if (searchText || searchPageChanged) {
      const fetchData = async () => {
        try {
          if (searchPage === 1) {
            setIsLoading(true);
          } else {
            setIsLoadingMore(true);
          }

          const res = await axios[method](url, searchConfig);
          setSearchHasMore(res?.data?.hasMore);
          const refinedMyRecipes = res?.data.data.map(({ username, user_id, ...rest }) => rest);

          if (searchPage === 1) {
            // setMyRecipes(refinedMyRecipes);
            setDisplayRecipes(refinedMyRecipes);
          } else {
            // setMyRecipes((prev) => [...prev, ...refinedMyRecipes]);
            setDisplayRecipes((prev) => [...prev, ...refinedMyRecipes]);
          }
        } catch (err) {
          console.log(
            "error while fetching my ingredients list with axios is :",
            err.response.message,
          );
        } finally {
          setIsLoading(false);
          setIsLoadingMore(false);
          setPageChanged(false);
        }
      };
      fetchData();
    } else if (searchText === "") {
      setDisplayRecipes(myRecipes);
    }
    setIsLoading(false);
    setIsLoadingMore(false);
  }, [srchBtnPrssd, searchPage]);

  // ---------------------------- scroll listener for searched recipes --------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
      // console.log("scroll % :", scrollPercentage);
      if (scrollPercentage >= scrollwindowPercent && searchHasMore && !isLoadingMore) {
        setSearchPageChanged(true);
        setSearchPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [searchHasMore, isLoadingMore]);

  // ------------------------------ creating variable to store which recipe have images and valid --------
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (recipeId) => {
    setFailedImages((prev) => ({
      ...prev,
      [recipeId]: true,
    }));
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

  // console.log("data before return html : ", data);
  // console.log("myRecipes before return html :", myRecipes);
  // console.log("searchRecipe", searchRecipe);
  // console.log("displayRecipes :", displayRecipes);
  // console.log("has more :", hasMoreMyRecipes, " and page is :", pageNoMyRecipes);

  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5">
        {/*header and search */}
        <div className="sticky top-(--top-bar-height) z-9 bg-white shadow-md">
          <div
            className="flex flex-col items-center pb-5 
                     md:flex-row md:items-end "
          >
            <div className="flex items-center md:flex-1  md:justify-start">
              <div className="text-2xl font-semibold">Your Recipes</div>
            </div>

            {/* search field */}
            <div className="flex md:flex-1">
              <div className="flex">
                <Input
                  value={searchRecipe}
                  className="border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                          focus:border-2 h-10 w-70 placeholder:text-gray-400"
                  onChange={(e) => setSearchRecipe(e.target.value)}
                  placeholder={"search your recipe...."}
                />
                <button
                  className=" text-xl rounded-r-md border-hidden bg-gray-200 text-gray-700 h-10 px-4 pb-1 
                              hover:ring-2 hover:ring-gray-600 hover:cursor-pointer"
                  onClick={() => {
                    setSearchPage(1);
                    // searchRecipeButton();
                    setSrchBtnPrssd((prev) => !prev);
                  }}
                >
                  {" "}
                  <FaSearchengin />
                </button>
              </div>
            </div>
          </div>

          {/* line . divider */}
          {/* <div className="flex items-center mt-2">
            <div className="grow border-t border-gray-300"></div>
          </div> */}
        </div>

        {/* recipe list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8  p-4">
          {displayRecipes?.map((i) => (
            <>
              <div
                key={i.recipe_id}
                onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                className="flex flex-col max-h-40 rounded-r-2xl shadow-md border border-gray-200 justify-between
                        hover:cursor-pointer hover:ring-10 hover:ring-amber-100 hover:bg-amber-100 transition duration-500"
              >
                <div className="text-xl font-bold line-clamp-2 leading-[1.3] hover:cursor-pointer p-1">
                  {i.name}
                </div>
                <div className="">
                  <div className="flex items-center">
                    <div className="grow border-t border-gray-200"></div>
                  </div>
                  <div className="flex h-25 gap-1 ml-1">
                    <div className="flex flex-col flex-1 gap-1 ">
                      <div className="">
                        <p className="text-sm line-clamp-1 font-semibold text-gray-600 mt-1 ">
                          portion : {i.portion_size}
                        </p>
                      </div>
                      <div className="">
                        <p className=" text-sm line-clamp-3 font-semibold text-gray-600  ">
                          Description : <span className=" font-normal">{i.description}</span>{" "}
                        </p>
                      </div>
                    </div>
                    <div className="aspect-video">
                      {failedImages[i.recipe_id] || !i?.image_url ? (
                        <GiHotMeal className="h-full w-full bg-gray-200 rounded-br-2xl" />
                      ) : (
                        <img
                          className="h-full w-full rounded-br-2xl"
                          src={i?.image_url}
                          alt="Recipe Image"
                          onError={() => handleImageError(i.recipe_id)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>

        {/* loading more -spinner */}
        {isLoadingMore && (
          <div className="flex w-full h-30 items-center justify-center">
            <Spinner
              theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
              color="default"
              aria-label="Loading"
              size="xl"
            />
          </div>
        )}

        <div className="h-20"></div>
      </div>

      {/* </div> */}
    </>
  );
}

export default MyRecipes;
