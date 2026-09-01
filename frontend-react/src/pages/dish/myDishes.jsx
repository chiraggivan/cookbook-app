import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import api from "../../api/axios";
import Input from "../../components/input";
import { HandleDishDelete } from "./utils/handleDishDelete";
import { DishContext } from "../../context/dishContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { HiOutlineSearch } from "react-icons/hi";
import { GiMeal } from "react-icons/gi";
import formattedDate from "../../utils/formattedDate";
import { Spinner } from "flowbite-react";

function MyDishes() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const { dishes, setDishes, fetchedOnce, setFetchedOnce, setDishDetails } =
  //   useContext(DishContext);
  const [dishes, setDishes] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [searchDish, setSearchDish] = useState("");
  // const [displayDishes, setDisplayDishes] = useState();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollwindowPercent = 99;
  const [wasSearchedBefore, setWasSearchedBefore] = useState(false);
  const [toggleAPIcall, setToggleAPIcall] = useState(false);

  const [imageError, setImageError] = useState(false);
  // ------------------------------------ Redirect effect ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `/dish/api`;

  // ----------------------------- fetch data from backend only for once --------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (page === 1) {
          setIsLoading(true);
        }
        if (page > 1) {
          setIsLoadingMore(true);
        }
        const res = await api[method](url, { params: { q: searchDish, page, limit } });
        const tempData = res.data.data;
        const formattedData = tempData.map((i) => ({
          ...i,
          preparation_date: formattedDate(i.preparation_date),
        }));
        if (page === 1) {
          setDishes(formattedData);
        } else {
          setDishes((prev) => [...prev, ...formattedData]);
        }
        setHasMore(res?.data?.hasMore || false);

        // making sure that search button doesnt call api if search is empty for the previous api call
        if (!searchDish) {
          setWasSearchedBefore(false);
        }
      } catch (err) {
        console.log("error while fetching dish list with axios is :", err.response.message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchData();
    // }
    setIsLoading(false);
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

  // -------------------------- using search button for dishes --------------------------------------------
  const searchDishesButton = () => {
    const string = searchDish.trim().replace(/\s+/g, " ").toLowerCase();

    if (string.length === 0 && !wasSearchedBefore) {
      return;
    }

    setPage(1);
    setWasSearchedBefore(true);
    setToggleAPIcall((prev) => !prev);
  };

  // console.log("hasMore is:", hasMore);
  // console.log("wasSearchedBefore is:", wasSearchedBefore);

  // -----------------------  show loading while waiting for data to be ready -------------------------
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

  //-------------------------------- delete button function ---------------------------------------------
  const handleDelete = async (e, dish, token, navigate) => {
    e.preventDefault();

    if (
      window.confirm(
        `Are you sure you want to delete this recipe - ${dish.recipe_name}, prepared on ${dish.preparation_date.split("T")[0]}`,
      )
    ) {
      try {
        await HandleDishDelete({ id: dish.dish_id, token, navigate });
      } catch (err) {
        console.log("Failed to delete item", err);
        console.log(err.response?.data?.message);
        alert("Something went wrong. Please try again later.");
      }
    }
  };

  // console.log("dishes :", dishes);
  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col  mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5 ">
        {/* Create header and search bar for your ingredients and a line separator */}
        <div className="flex flex-col sticky z-9 top-(--top-bar-height) bg-white shadow-md">
          {/* Header of the page with search bar */}
          <div className="flex flex-col m-3 items-center md:items-start md:flex-row md:justify-start">
            <div className="text-2xl font-semibold">Your Saved Dishes</div>

            {/* search bar */}
            <div className="flex w-[80%] md:pl-60 md:mr-2 max-w-140">
              {/* search input */}
              <Input
                value={searchDish}
                className="border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                                    focus:ring-2 focus:ring-gray-300 h-8 w-full lg:w-100 px-2 pb-2 placeholder:text-gray-400"
                onChange={(e) => setSearchDish(e.target.value)}
                placeholder={"search your prepared dish"}
              />
              {/* search button */}
              <button
                className=" text-xl cursor-pointer rounded-r-md border-r border-t border-b border-gray-400 bg-gray-200 text-gray-700 h-8 px-4 "
                onClick={searchDishesButton}
              >
                <HiOutlineSearch />
              </button>
            </div>
          </div>

          {/* Line Separator */}
          {/* <div className="flex items-center">
            <div className="grow border-b shadow border-gray-400"></div>
          </div> */}
        </div>

        {/* show all your saved Dishes*/}
        <div className="grid grid-cols-1 mt-3 lg:grid-cols-2  xl:grid-cols-4 gap-4">
          {dishes?.map((i) => (
            <div
              key={i.user_ingredient_id}
              className="flex m-2 shadow-xs border-gray-400  cursor-pointer rounded hover:ring-10 hover:ring-amber-100 hover:bg-amber-100 transition duration-500"
              onClick={() => navigate(`/dish/${i.dish_id}`)}
            >
              {/* image section - left */}
              <div className="min-w-40 min-h-40 max-w-40 max-h-40 border-0 ">
                {i.image_url && !imageError ? (
                  <img
                    className="h-full w-full object-cover md:rounded-md"
                    src={i.image_url}
                    alt="Recipe Image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <GiMeal className="h-full w-full bg-gray-200" />
                )}
                {/* <GiHotMeal className=" h-full w-full bg-gray-300" /> */}
              </div>
              {/* details section right */}
              <div className="px-2 pb-2">
                <p className="text-lg font-semibold line-clamp-2 leading-[1.3]">
                  {capitaliseWords(i.recipe_name)}
                </p>
                <p className="leading-5"> Portion: {capitaliseWords(i.portion_size)}</p>
                <p className=" text-sm text-gray-500 line-clamp-1">
                  Prepared: {i.preparation_date} for {i.meal}
                </p>
                <p className="text-sm text-gray-500">Costing: £ {i.total_cost}</p>
                <p className="text-sm text-gray-500 font-semibold line-clamp-2">
                  Comment: <span className="italic font-normal">{i.comment}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyDishes;
