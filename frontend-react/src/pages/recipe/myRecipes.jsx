import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import api from "../../api/axios";
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
import { MdOutlineEditNote } from "react-icons/md";
import { Spinner } from "flowbite-react";
import EmptyResponsePage from "../../components/emptyResponsePage";

function MyRecipes() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  // const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    myRecipesCntxt,
    setMyRecipesCntxt,
    hasMoreMyRecipesCntxt,
    setHasMoreMyRecipesCntxt,
    pageNoMyRecipesCntxt,
    setPageNoMyRecipesCntxt,
  } = useContext(MyRecipeContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchRecipe, setSearchRecipe] = useState("");
  const searchText = searchRecipe.trim().replace(/\s+/g, " ");
  const [srchBtnToggle, setSrchBtnToggle] = useState(false);
  const [srchTxtToggle, setSrchTxtToggle] = useState(false);
  const [hasNoRecipe, setHasNoRecipe] = useState(null);
  const limit = 4;
  const scrollwindowPercent = 99;

  // initialise main list variable with the myRecipesCntxt value
  const [mainList, setMainList] = useState(myRecipesCntxt);

  //  variable for infinite scroll with out search text
  const [pageChanged, setPageChanged] = useState(false);

  // variables for search criteria infinite scroll
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  // const [searchPageChanged, setSearchPageChanged] = useState(false);

  //-------------------------------- initialise url, method and config -----------------------------------
  // useEffect(() => {
  //   if (!authHookLoading && (!token || !isAuthenticated)) {
  //     navigate("/login");
  //   }
  // }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------- fetch the data by giving url, method and body(if required) -------------------------
  const method = "get";
  const url = `/recipe/api/my`;

  const [counter, setCounter] = useState(1);
  // -------------------- fetch data from backend on every page number change as well -------------------------------------
  useEffect(() => {
    console.log("counter : ", counter);
    console.log("searchPage :", searchPage);
    setCounter((prev) => prev + 1);
    // Run the api IF  1)mainList from myRecipeCntxt is empty OR 2)pageChanged via scrolling  OR 3) search text
    if (mainList.length === 0 || pageChanged || searchText !== "") {
      const fetchData = async () => {
        let pageNo = 1;

        // which page no and SPINNER to load
        if (searchText) {
          pageNo = searchPage;
          setIsLoadingMore(true);
          // return;
        } else {
          pageNo = pageNoMyRecipesCntxt;
          // spinner for WITHOUT search text
          if (pageNoMyRecipesCntxt === 1) {
            setIsLoading(true);
          } else {
            setIsLoadingMore(true);
          }
        }

        // starting to call API
        try {
          const res = await api[method](url, {
            params: {
              q: searchText || undefined,
              page: pageNo,
              limit,
            },
          });

          if (searchText) {
            setSearchHasMore(res?.data?.hasMore);
            // console.log("searchHasMore:", res?.data?.hasMore);
            if (searchPage === 1) {
              setMainList(res?.data?.data);
            } else {
              setMainList((prev) => [...prev, ...res?.data?.data]);
            }
          } else {
            setHasMoreMyRecipesCntxt(res?.data?.hasMore);
            const refinedMyRecipes = res?.data?.data.map(({ username, user_id, ...rest }) => rest);

            if (pageNoMyRecipesCntxt === 1) {
              setMainList(refinedMyRecipes);
              setMyRecipesCntxt(refinedMyRecipes);
              // check if recipes exists without search text, if not then flag the page with setHasNoRecipe to show relevant display
              if (!searchRecipe) {
                setHasNoRecipe(refinedMyRecipes.length === 0);
              }
            } else {
              setMainList((prev) => [...prev, ...refinedMyRecipes]);
              setMyRecipesCntxt((prev) => [...prev, ...refinedMyRecipes]);
            }
          }
        } catch (err) {
          console.log("error while fetching my ingredients list with axios is :", err);
        } finally {
          setIsLoading(false);
          setIsLoadingMore(false);
          setPageChanged(false);
        }
      };
      fetchData();
    } else {
      // as isLoading is true while rendering the page
      setIsLoading(false);
    }
  }, [pageNoMyRecipesCntxt, srchTxtToggle, searchPage]);

  // -------------------------------- scroll listener for My recipe page without search text--------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
      // console.log("scroll % :", scrollPercentage);
      if (!searchText) {
        if (scrollPercentage >= scrollwindowPercent && hasMoreMyRecipesCntxt && !isLoadingMore) {
          setPageChanged(true);
          setPageNoMyRecipesCntxt((prev) => prev + 1);
        }
      } else {
        // for search window scroll
        if (scrollPercentage >= scrollwindowPercent && searchHasMore && !isLoadingMore) {
          setSearchPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMoreMyRecipesCntxt, isLoadingMore, searchHasMore, searchText]);

  // ---------------------------- Sreached button pressed -----------------------------
  useEffect(() => {
    // const searchText = searchRecipe.trim().replace(/\s+/g, " ");
    if (searchText === "") {
      setMainList(myRecipesCntxt);
    } else {
      setSrchTxtToggle((prev) => !prev);
    }
  }, [srchBtnToggle]);

  // ------------------------------ creating variable to store which recipe have image and is valid --------
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

  // console.log("pageNoMyRecipesCntxt :", pageNoMyRecipesCntxt);
  // console.log("hasMoreMyRecipesCntxt :", hasMoreMyRecipesCntxt);
  // console.log("searchPage :", searchPage);
  // console.log("searchHasMore :", searchHasMore);
  // console.log("isLoadingMore :", isLoadingMore);
  // console.log("data before return html : ", data);
  // console.log("myRecipesCntxt before return html :", myRecipesCntxt);
  // console.log("searchRecipe", searchRecipe);
  // console.log("myRecipeList :", myRecipeList);
  // console.log("isLoading", isLoading);
  // console.log("has more :", hasMoreMyRecipesCntxt, " and page is :", pageNoMyRecipesCntxt);

  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5">
        {/* Check if the data is empty and show the page accordingly */}
        {hasNoRecipe ? (
          <EmptyResponsePage
            title={"No Recipes Yet"}
            message={
              "You haven't created any recipes yet. Start by adding first recipe and build your own collection."
            }
            urlPath={"/recipe/new"}
            imageSrc={"/images/no_recipe_yet.png"}
            ButtonText={"Create your first recipe"}
            ButtonIcon={MdOutlineEditNote}
            hideSecondButton={true}
          />
        ) : (
          <>
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
                        setSrchBtnToggle((prev) => !prev);
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
              {mainList?.map((i) => (
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
                              Description :{" "}
                              <span className=" font-normal">{i.description}</span>{" "}
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
          </>
        )}
      </div>

      {/* </div> */}
    </>
  );
}

export default MyRecipes;
