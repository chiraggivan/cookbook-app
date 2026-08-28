import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import api from "../../api/axios";
import { getInitials } from "../../utils/appUtils";
import Input from "../../components/input";
import { HiSearch } from "react-icons/hi";
import { GiHotMeal } from "react-icons/gi";
import { useState } from "react";
import { Spinner } from "flowbite-react";

function UserRecipes() {
  const { id } = useParams();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [searchedUserInfo, setSearchedUserInfo] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 3;
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollwindowPercent = 99;
  const [searchRecipe, setSearchRecipe] = useState("");
  const [imageError, setImageError] = useState(false);
  const [wasSearchedBefore, setWasSearchedBefore] = useState(false);
  const [toggleAPIcall, setToggleAPIcall] = useState(false);

  if (!user) {
    console.log("user not stored in localStorage");
    return <h3>user info not found locally</h3>;
  }

  //-------------------- is searchedUser same as logged in user ---------------------------
  useEffect(() => {
    if (parseInt(id) === parseInt(user.user_id)) {
      navigate("/MyRecipes", { replace: true });
    }
  });

  const { token, loading: authHookLoading, isAuthenticated } = useAuth();

  // ------------------------------ Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `/recipe/api/user/${id}`;

  // ----------------- call the backend api for the first time to get user recipes --------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (page === 1) {
          setIsLoading(true);
        }
        if (page > 1) {
          setIsLoadingMore(true);
        }

        // const res = await axios[method](url, config);
        const res = await api[method](url, { params: { q: searchRecipe, page, limit } });
        // console.log("res is :", res);
        setSearchedUserInfo(res?.data?.data?.userInfo);
        if (page === 1) {
          setRecipeData(res?.data?.data?.userRecipes);
        } else {
          setRecipeData((prev) => [...prev, ...res?.data?.data?.userRecipes]);
        }
        setHasMore(res?.data?.hasMore || false);

        // making sure that search button doesnt call api if search is empty for the previous api call
        if (!searchRecipe) {
          setWasSearchedBefore(false);
        }
      } catch (err) {
        console.log("error while fetching searched dish list with axios is :", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchData();
  }, [toggleAPIcall]);

  // -------------------------------- scroll listener -----------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
      // console.log("scroll % :", scrollPercentage);
      if (scrollPercentage >= scrollwindowPercent && hasMore && !isLoadingMore) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoadingMore]);

  // ------- to fetch more recipes for infinite scroll as page changes due above scroll listener
  useEffect(() => {
    if (!token) {
      return;
    }

    setToggleAPIcall((prev) => !prev);
  }, [page]);

  // ------------------- search button result of user's recipe -----------------------
  const searchUserRecipe = () => {
    const string = searchRecipe.trim().replace(/\s+/g, " ").toLowerCase();

    if (string.length === 0 && !wasSearchedBefore) {
      return;
    }

    setPage(1);
    setWasSearchedBefore(true);
    setToggleAPIcall((prev) => !prev);
  };

  // ----------------------- loading (spinner) screen ---------------------------
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
  // console.log("searchRecipe is :", searchRecipe);
  // console.log("recipeData is :", recipeData);
  // console.log("searchedUserInfo is:", searchedUserInfo);
  // console.log("has more recipe in db is :", hasMore);
  // console.log("isLoadingMore is :", isLoadingMore);

  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5">
        {/*header and search */}
        <div className="flex flex-col pb-5 lg:flex-row lg:items-end sticky top-0 z-8 bg-white">
          <div className="flex items-center justify-center">
            <div className="flex shrink-0 items-center justify-center w-40 h-40 rounded-full  bg-amber-200 text-8xl">
              {searchedUserInfo?.picture_url ? (
                <img
                  className="rounded-full aspect-square"
                  src={searchedUserInfo?.picture_url}
                  alt={getInitials(
                    searchedUserInfo?.username ??
                      searchedUserInfo?.display_name ??
                      searchedUserInfo?.email,
                  )}
                />
              ) : (
                getInitials(
                  searchedUserInfo?.username ??
                    searchedUserInfo?.display_name ??
                    searchedUserInfo?.email,
                )
              )}
            </div>
            {searchedUserInfo && (
              <div className=" px-2">
                <p className="text-5xl mb-2">
                  {searchedUserInfo?.username?.charAt(0).toUpperCase() +
                    searchedUserInfo?.username?.slice(1)}
                </p>
                <p className="text-1xl px-1">@{searchedUserInfo.username}</p>
                <p className="text-1xl mb-2 px-1 text-gray-400">More about me</p>
              </div>
            )}
          </div>

          {/*  search user's recipe section */}
          <div className="py-2 lg:py-0 lg:pl-40">
            <div className="flex items-center justify-center">
              <div className="flex w-80">
                <Input
                  className="flex-1 border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                          focus:border-2 h-10 w-full placeholder:text-gray-400"
                  placeholder={`Search recipe by ${searchedUserInfo?.username}`}
                  onChange={(e) => setSearchRecipe(e.target.value)}
                  value={searchRecipe}
                />
                <button
                  className="flex text-xl rounded-r-md border-hidden bg-gray-200 text-gray-700 h-10 px-4 items-center 
                                              hover:ring-2 hover:ring-gray-600 hover:cursor-pointer"
                  onClick={searchUserRecipe}
                >
                  <HiSearch className="" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* line . divider */}
        <div className="flex items-center my-2">
          <div className="grow border-t border-gray-300"></div>
        </div>

        {/* recipe list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4  p-4">
          {recipeData?.map((i) => (
            <div
              key={i.recipe_id}
              className="flex h-36 rounded-r-2xl shadow-sm
                        hover:cursor-pointer hover:ring-10 hover:ring-green-100 hover:bg-green-100 transition duration-500"
              onClick={() => navigate(`/recipe/${i.recipe_id}`)}
            >
              <div className="h-full aspect-square min-w-36 rounded overflow-hidden">
                {i.image_url && !imageError ? (
                  <img
                    className="h-full object-cover md:rounded-md"
                    src={i.image_url}
                    alt="Recipe Image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <GiHotMeal className="h-full w-full bg-gray-200" />
                )}
              </div>

              <div className="p-3">
                <p className="text-xl font-bold line-clamp-2 leading-[1.3] hover:cursor-pointer">
                  {i.name}
                </p>
                <p className="text-sm line-clamp-1 font-semibold text-gray-600">
                  portion : {i.portion_size}
                </p>
                <p className="text-sm line-clamp-3 font-semibold text-gray-600">
                  Description : <span className="font-normal">{i.description}</span>{" "}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* spinner again for infinite scroll */}
        {hasMore && (
          <div className="flex w-full h-20 items-center justify-center">
            <Spinner
              theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
              color="default"
              aria-label="Loading"
              size="xl"
            />
          </div>
        )}
      </div>

      {/* empty spaceso that spinner is visible while fetching new data */}
      {/* <div className="h-20 bg-amber-500"></div> */}
    </>
  );
}

export default UserRecipes;
