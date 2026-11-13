import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import api from "../../api/axios";
import useFetch from "../../hooks/useFetch";
// import Button from "../../components/button";
// import Navbar from "../../components/navbarOld";
import Input from "../../components/input";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { capitaliseWords, serverURL, windowScrollPercentage } from "../../utils/appUtils";
import { Button, Spinner } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { TbBowlSpoonFilled } from "react-icons/tb";
import { FaCarrot } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import EmptyResponsePage from "../../components/emptyResponsePage";
import { GoDash } from "react-icons/go";

function MyIngredients() {
  const user = JSON.parse(localStorage.getItem("user"));
  const currencySymbol = user.currency_symbol || "£";
  const navigate = useNavigate();
  const { myIngredients, setMyIngredients, fetchedOnce, setFetchedOnce } =
    useContext(MyIngredientContext);
  const [ingredientList, setIngredientList] = useState();
  const [hasNoIngredient, setHasNoIngredient] = useState(false);
  const [hasNoSearchedIng, setHasNoSearchIng] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");

  const limit = 5;
  const scrollwindowPercent = 99;
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const srchBtnPrsd = useRef(false);

  const [parent] = useAutoAnimate();

  const method = "get";
  const url = `/useringredient/api/list`;

  // ----------------------------- fetch data from backend  -------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // for initial load - as no search button is pressed and page is 1
        if (pageNo === 1 && searchText === "" && !srchBtnPrsd.current) {
          setIsLoading(true);
        }

        // for search button pressed with no text in it and for page no 1.
        if (pageNo === 1 && searchText === "" && srchBtnPrsd.current) {
          setIsLoadingMore(true);
        }

        // spinner for any other page
        if (pageNo > 1) {
          setIsLoadingMore(true);
        }

        const res = await api[method](url, { params: { q: searchText, pageNo, limit } });
        setHasMore(res?.data?.hasMore);
        if (pageNo === 1) {
          setIngredientList(res?.data?.data);
          // check if user ingredients exists, if not then flag the pageNo with setHasNoIngredient to show relevant display
          if (res.data?.data.length === 0 && searchText.length === 0) {
            setHasNoIngredient(true);
          } else if (res.data?.data?.length === 0 && searchText.length !== 0) {
            setHasNoSearchIng(true);
          } else if (res.data?.data?.length !== 0 && searchText.length !== 0) {
            setHasNoSearchIng(false);
          } else if (res.data?.data?.length !== 0 && searchText.length === 0) {
            setHasNoSearchIng(false);
          }
        } else {
          setIngredientList((prev) => [...prev, ...res?.data?.data]);
        }
      } catch (err) {
        console.log("error while fetching my ingredients list with axios is :", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchData();
  }, [pageNo, searchText]);

  // -------------------------------- scroll listener -----------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = windowScrollPercentage();
      if (scrollPercentage >= scrollwindowPercent && hasMore && !isLoadingMore) {
        setPageNo((prev) => prev + 1);
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
    srchBtnPrsd.current = true;
    setSearchText(stringText);
    setPageNo(1);
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
  // console.log("ingredient list :", ingredientList);
  // console.log("hasMore :", hasMore);
  // console.log("page no :", pageNo);
  // console.log("srch btn prsd:", srchBtnPrsd.current);

  return (
    <>
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5 ">
        {/* Check if the data is empty and show the pageNo accordingly */}
        {hasNoIngredient ? (
          <EmptyResponsePage
            title={"No Ingredient Created Yet"}
            message={
              <>
                Add your first <span className="font-bold text-gray-800">custom ingredient</span> to
                start using it in your recipes.
              </>
            }
            urlPath={"/myIngredient/new"}
            imageSrc={"/images/no_ingredient_yet.png"}
            ButtonText={"Add first custom ingredient"}
            ButtonIcon={IoMdAdd}
            hideSecondButton={true}
          />
        ) : (
          <>
            {/* Create header and search bar for your ingredients and a line separator */}
            <div className="flex flex-col sticky z-8 top-(--top-bar-height) bg-white shadow-md mb-3">
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
                            lg:items-start  lg:w-1/3 lg:mr-5"
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
                      placeholder={"Search Your Ingredient"}
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

            {/* check if search text is there and no data found */}
            {searchText && hasNoSearchedIng ? (
              <EmptyResponsePage
                title={"No results found!"}
                message={
                  <>
                    We couldn't find any of your ingredient matching{" "}
                    <span className="font-semibold text-black">'{searchText}'</span>. Try a
                    different search.
                  </>
                }
                urlPath={"/"}
                imageSrc={"/images/no_search_recipe_found2.png"}
                ButtonText={""}
                ButtonIcon={null}
                hideSecondButton={true}
                hideFirstButton={true}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8 mb-5">
                {ingredientList?.map((i) => (
                  <div
                    key={i.user_ingredient_id}
                    className="flex shadow-md rounded-xl mx-2 p-2 border border-gray-400"
                  >
                    {/* image section - left */}
                    <div className="aspect-square border-0 rounded-r-lg bg-gray-100 ">
                      <FaCarrot className="p-[30%] h-full w-full text-orange-400" />
                    </div>

                    {/* details section right */}
                    <div className="w-full px-2">
                      {/* ing name PLUS edit button */}
                      <div className="flex justify-between items-center">
                        <h2 className="text-md sm:text-lg font-semibold line-clamp-2">
                          {capitaliseWords(i.name)}
                        </h2>

                        {/* edit button */}
                        <Button
                          className=" rounded-full border-gray-400 cursor-pointer bg-gray-200 text-xs sm:text-lg"
                          color="dark"
                          outline
                          onClick={() => navigate("/myIngredient/edit", { state: { data: i } })}
                        >
                          Edit
                        </Button>
                      </div>

                      {/* price per unit */}
                      <p className="text-gray-500 italic text-sm sm:text-lg line-clamp-1">
                        {currencySymbol} {i.display_price} for {i.display_quantity}{" "}
                        {i.display_unit}{" "}
                      </p>

                      {/* cup weight info */}
                      <div className="flex items-center line-clamp-2">
                        <TbBowlSpoonFilled className="text-gray-500" />
                        <p className="flex items-center px-1 text-xs sm:text-sm text-gray-500">
                          <span className="font-semibold ">Cup Weight : </span>{" "}
                          {i.cup_weight ? (
                            <span className="ml-2">{i.cup_weight}</span>
                          ) : (
                            <GoDash className="ml-2" />
                          )}{" "}
                          {i.cup_unit}
                        </p>
                      </div>

                      <p className="px-1 mb-1 text-md text-gray-500  line-clamp-1">{i.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* show all your custom ingredients */}
          </>
        )}
      </div>
    </>
  );
}

export default MyIngredients;
