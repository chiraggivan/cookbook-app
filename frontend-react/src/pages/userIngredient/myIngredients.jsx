import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import api from "../../api/axios";
import useFetch from "../../hooks/useFetch";
// import Button from "../../components/button";
// import Navbar from "../../components/navbarOld";
import Input from "../../components/input";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { Button, Spinner } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { TbBowlSpoonFilled } from "react-icons/tb";
import { FaCarrot } from "react-icons/fa6";

function MyIngredients() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myIngredients, setMyIngredients, fetchedOnce, setFetchedOnce } =
    useContext(MyIngredientContext);
  const [ingredientList, setIngredientList] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [searchIng, setSearchIng] = useState("");
  const [displayIngredients, setDisplayIngredients] = useState();

  const [page, setPage] = useState(1);
  const limit = 3;
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollwindowPercent = 99;
  const [wasSearchedBefore, setWasSearchedBefore] = useState(false);
  const [toggleAPIcall, setToggleAPIcall] = useState(false);

  // Redirect to home if token NOT found
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `/useringredient/api/`;

  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    // if (!fetchedOnce) {
    const fetchData = async () => {
      try {
        if (page === 1) {
          setIsLoading(true);
        }
        if (page > 1) {
          setIsLoadingMore(true);
        }

        const res = await api[method](url, { params: { q: searchIng, page, limit } });

        if (page === 1) {
          setIngredientList(res?.data.data);
        } else {
          setIngredientList((prev) => [...prev, ...res?.data?.data]);
        }
        setHasMore(res?.data?.hasMore || false);
        // making sure that search button doesnt call api if search is empty for the previous api call
        if (!searchIng) {
          setWasSearchedBefore(false);
        }
      } catch (err) {
        console.log("error while fetching my ingredients list with axios is :", err);
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

  // ------- to fetch more recipes for infinite scroll as page changes due above scroll listener------------
  useEffect(() => {
    if (!token) {
      return;
    }

    setToggleAPIcall((prev) => !prev);
  }, [page]);

  // ------------------- search button result of user's recipe -----------------------
  const searchUserIngredient = () => {
    const string = searchIng.trim().replace(/\s+/g, " ").toLowerCase();

    if (string.length === 0 && !wasSearchedBefore) {
      return;
    }

    setPage(1);
    setWasSearchedBefore(true);
    setToggleAPIcall((prev) => !prev);
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
  // console.log("myIngredients before return html : ", myIngredients);
  return (
    <>
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5 ">
        {/* Create header and search bar for your ingredients and a line separator */}
        <div className="flex flex-col sticky z-8 top-(--top-bar-height) bg-white shadow-md">
          {/* header of your custom ingredients & search bar */}
          <div
            className="flex flex-col mb-4 items-center
                    lg:flex-row  lg:justify-between"
          >
            {/* header plus add button */}
            <div className="flex flex-col items-center gap-y-2">
              <p className="text-2xl font-semibold">Your Custom Ingredients</p>
              <div className="">
                <Button
                  className="cursor-pointer"
                  color="dark"
                  onClick={() => navigate("/myIngredient/new")}
                >
                  <span className="text-xl pr-1 pb-1">+</span> Add New
                </Button>
              </div>
            </div>

            {/* search bar for custom ingredients */}
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
                  onChange={(e) => setSearchIng(e.target.value)}
                  placeholder={"Search Your Ingredient"}
                  value={searchIng}
                />
                {/* search button */}
                <button
                  className=" text-xl cursor-pointer rounded-r-md border-r border-t border-b border-gray-400 bg-gray-200 text-gray-700 h-10 px-4 
                              hover:ring-2 hover:ring-gray-600 hover:cursor-pointer"
                  onClick={searchUserIngredient}
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

        {/* show all your custom ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
          {ingredientList?.map((i) => (
            <div
              key={i.user_ingredient_id}
              className="flex shadow-md border-gray-400 rounded-r-xl mt-3
                          hover:ring-10 hover:ring-amber-100 hover:bg-amber-100 transition duration-500"
            >
              {/* image section - left */}
              <div className="h-40 aspect-square border-0 rounded-r-lg bg-gray-100 ">
                <FaCarrot className="p-[30%] h-full w-full text-orange-400" />
              </div>
              {/* details section right */}
              <div className="px-2">
                <p className="text-lg font-semibold line-clamp-1">{capitaliseWords(i.name)}</p>
                <p className="text-gray-500 italic text-md line-clamp-1">
                  £{i.display_price} for {i.display_quantity} {i.display_unit}{" "}
                </p>
                <div className="flex items-center line-clamp-2">
                  <TbBowlSpoonFilled className="text-gray-500" />
                  <p className="px-1 text-md text-gray-500">
                    <span className="font-semibold">Cup Weight : </span>{" "}
                    {i.cup_weight ? i.cup_weight : null} {i.cup_unit}
                  </p>
                </div>

                <p className="px-1 mb-1 text-md text-gray-500  line-clamp-1">{i.notes}</p>
                <div>
                  <Button
                    className="mb-1 cursor-pointer "
                    color="dark"
                    outline
                    onClick={() => navigate("/myIngredient/edit", { state: { data: i } })}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyIngredients;
