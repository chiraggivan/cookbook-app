import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/button";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import Navbar from "../../components/navbarOld";
import { Dropdown, DropdownItem, Spinner } from "flowbite-react";
import {
  serverURL,
  showTokenErrMsgOnScreen,
  JWTunverifiedMsg,
  getInitials,
} from "../../utils/appUtils";
import { GiHotMeal } from "react-icons/gi";
import { useSearch } from "../../context/globalSearchContext";
import { SlOptionsVertical } from "react-icons/sl";
import { MdOutlineEditNote, MdOutlineMenuBook } from "react-icons/md";

function Home() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  // const searchRecipe = searchParams.get("q");
  const { searchRecipe } = useSearch();
  const [data, setData] = useState();
  const [page, setPage] = useState(1);
  const limit = 10;
  const scrollwindowPercent = 99;
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const imageBaseURL = "/uploadedImages/";
  const [imageError, setImageError] = useState(false);

  const method = "get";
  const url = `${serverURL}/recipe/api/all`;

  const config = {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: searchRecipe || undefined,
      page,
      limit,
    },
  };

  // Redirect effects
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  //  verify token (valid or expired) and search recipe
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const res = await axios[method](url, config);
          if (page === 1) {
            setData(res?.data?.data);
          } else {
            setData((prev) => [...prev, ...res?.data?.data]);
          }
          setHasMore(res?.data?.hasMore ?? false);
        } catch (err) {
          // console.log("Error while fetching all recipes", err);
          if (err.response?.data.message === JWTunverifiedMsg) {
            localStorage.removeItem("token");
            navigate(`/login?errMsg=${showTokenErrMsgOnScreen}`);
          }
        } finally {
          setIsLoading(false);
          setImageError(false);
        }
      }
    };
    fetchData();
  }, [token]);

  // for search recipe state change
  useEffect(() => {
    setData([]);
    setPage(1);
  }, [searchRecipe]);

  // --------------------------- scroll listener --------------------------------
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

  // ---------- to fetch more recipes for infinite scroll as page changes due above scroll listener
  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoadingMore(true);
        const res = await axios[method](url, config);
        if (page === 1) {
          setData(res?.data.data);
        } else {
          setData((prev) => [...prev, ...res?.data.data]);
        }
        setHasMore(res?.data.hasMore ?? false);
      } catch (err) {
        console.log("Error while fetching all recipes", err);
        if (err.response?.data.message === JWTunverifiedMsg) {
          localStorage.removeItem("token");
          navigate(`/login?errMsg=${showTokenErrMsgOnScreen}`);
        }
      } finally {
        setIsLoadingMore(false);
        setImageError(false);
      }
    };
    fetchData();
  }, [page, searchRecipe]);

  // ------------------------------ creating variable to store which recipe have images and valid --------
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (recipeId) => {
    setFailedImages((prev) => ({
      ...prev,
      [recipeId]: true,
    }));
  };

  // console.log("data is :", data);

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
  // console.log("page no. ", page);
  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}

      <div className="mt-(--top-bar-height)  md:ml-(--left-side-bar) md:p-5 ">
        {/* creating grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 ">
          {data?.map((i) => (
            // for each record creating card
            <div
              key={i.recipe_id}
              className=" md:rounded-xl  hover:cursor-pointer hover:ring-10 hover:bg-amber-100  hover:ring-amber-100 transition duration-500"
            >
              {/*  within card creating 2 sections: one for image and second one for info */}
              <div
                className="aspect-video md:rounded-t-xl"
                onClick={() => navigate(`/recipe/${i.recipe_id}`)}
              >
                {failedImages[i.recipe_id] || !i?.image_url ? (
                  <GiHotMeal className="h-full w-full bg-gray-200 md:rounded-xl" />
                ) : (
                  <img
                    className="h-full w-full md:rounded-xl"
                    src={i?.image_url}
                    alt="Recipe Image"
                    onError={() => handleImageError(i.recipe_id)}
                  />
                )}
              </div>

              <div className=" flex rounded-b-3xl">
                {/* profile image of recipe creator */}
                <div className="px-1 py-2">
                  <div
                    className="flex aspect-square w-10 h-10 rounded-full bg-amber-200 items-center justify-center"
                    onClick={() => navigate(`/recipesBy/${i.user_id}`)}
                  >
                    {i.picture_url ? (
                      <img
                        className="rounded-full aspect-square"
                        src={i.picture_url}
                        alt={getInitials(i.username ?? i.display_name ?? i.email)}
                      />
                    ) : (
                      <div className="p-1">
                        {getInitials(i.username ?? i.display_name ?? i.email)}
                      </div>
                    )}
                  </div>
                </div>

                {/* details of recipe */}
                <div className="mx-1 my-2 w-full">
                  <div
                    className="text-xl font-bold line-clamp-2 leading-[1.3] hover:cursor-pointer"
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    {i.name}
                  </div>
                  <p
                    className="text-sm line-clamp-1 font-semibold text-gray-600 "
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    portion : {i.portion_size}
                  </p>

                  <p
                    className="text-sm line-clamp-1 font-semibold text-gray-600 "
                    onClick={() => navigate(`/recipesBy/${i.user_id}`)}
                  >
                    by : {i.username ?? i.display_name ?? i.email}
                  </p>
                  <p></p>
                </div>

                {/* option button */}
                <div className="flex w-10 h-8 mt-2 mr-2 min-w-8 hover:bg-gray-300 rounded-full transition duration-300">
                  {
                    // top-1/2 -translate-y-1/2
                  }

                  <Dropdown
                    className=""
                    label=""
                    dismissOnClick={false}
                    renderTrigger={() => (
                      <span className="flex w-full h-full items-center justify-center ">
                        <SlOptionsVertical className="w-6 h-6 " />
                      </span>
                    )}
                  >
                    <DropdownItem
                      className="flex gap-2"
                      onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                    >
                      <MdOutlineMenuBook className="w-4 h-4" /> Open
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            </div>
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

export default Home;
