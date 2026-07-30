import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbarOld";
import Button from "../../components/button";
import Input from "../../components/input";
import { HandleDishDelete } from "./utils/handleDishDelete";
import { DishContext } from "../../context/dishContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { HiOutlineSearch } from "react-icons/hi";
import { GiHotMeal } from "react-icons/gi";

function MyDishes() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const { dishes, setDishes, fetchedOnce, setFetchedOnce, setDishDetails } =
  //   useContext(DishContext);
  const [dishes, setDishes] = useState();

  const [fetchLoading, setFetchLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const updated = searchParams.get("changed");
  const id = searchParams.get("id");
  const [searchDish, setSearchDish] = useState("");
  const [displayDishes, setDisplayDishes] = useState();

  // ------------------------------------ Redirect effect ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `${serverURL}/dish/api`;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  // ----------------------------- fetch data from backend only for once --------------------------------
  useEffect(() => {
    // if (!fetchedOnce) {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        if (token) {
          const res = await axios[method](url, config);
          setDishes(res?.data.data);
          // setFetchedOnce(true);
        }
      } catch (err) {
        console.log("error while fetching dish list with axios is :", err.response.message);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
    // }
    setFetchLoading(false);
  }, []);

  //--------------------------- update dish list if changed  ---------------------------------------------
  useEffect(() => {
    if (!id) return;
    setDishes((prev) => prev?.filter((i) => i.dish_id !== Number(id)));
    // setDishDetails((prev) => prev?.filter((i) => i.dish?.dish_id !== Number(id)));
  }, [id]);

  // ----------------------------- update the displayDishes list if searchDish has text --------------------
  // As currently we have useContext and all the dishes are stored and accessed later onwards, we will fetch the
  // searchIng list from the context variable itself.
  useEffect(() => {
    const string = searchDish.trim().replace(/\s+/g, " ").toLowerCase();
    if (!string) {
      setDisplayDishes(dishes);
    } else {
      setDisplayDishes(
        dishes.filter(
          (item) =>
            item.recipe_name.toLowerCase().includes(string) ||
            item.comment?.toLowerCase().includes(string),
        ),
      );
    }
  }, [dishes]);

  // -------------------------- using search button for dishes --------------------------------------------
  // currently the dishes are searched via serachDish string along with api as query, if need to search from context,
  // then remove the comment from "if(!string)" and comment the searchurl and fetchData func.
  const searchDishesButton = () => {
    const string = searchDish.trim().replace(/\s+/g, " ").toLowerCase();

    const searchurl = `${serverURL}/dish/api/?q=${searchDish}`;
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const res = await axios[method](searchurl, config);
        setDishes(res?.data.data);
      } catch (err) {
        console.log(
          "error while fetching searched dish list with axios is :",
          err.response.message,
        );
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();

    // if (!string) {
    //   setDisplayDishes(dishes);
    // } else {
    //   setDisplayDishes(
    //     dishes.filter(
    //       (item) =>
    //         item.recipe_name.toLowerCase().includes(string) ||
    //         item.comment?.toLowerCase().includes(string),
    //     ),
    //   );
    // }
  };

  // -----------------------  show loading while waiting for data to be ready -------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
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

  console.log("dishes :", dishes);
  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col  mt-[calc(var(--top-bar-height)+15px)] md:mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5 ">
        {/* Create header and search bar for your ingredients and a line separator */}
        <div className="flex flex-col sticky z-10 top-[calc(var(--top-bar-height)+28px)] md:top-(--top-bar-height) bg-white">
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
          <div className="flex items-center">
            <div className="grow border-b shadow border-gray-500"></div>
          </div>
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
                <GiHotMeal className=" h-full w-full bg-gray-300" />
              </div>
              {/* details section right */}
              <div className="px-2 pb-2">
                <p className="text-lg font-semibold line-clamp-2 leading-[1.3]">
                  {capitaliseWords(i.recipe_name)}
                </p>
                <p className="leading-5"> Portion: {capitaliseWords(i.portion_size)}</p>
                <p className=" text-sm text-gray-500 line-clamp-1">
                  {i.preparation_date.split("T")[0]} @ {i.time_prepared} for {i.meal}
                </p>
                <p className="text-sm text-gray-500">Costing: £ {i.total_cost}</p>
                <p className="text-sm text-gray-500 font-semibold line-clamp-2">
                  Comment: <span className="italic font-normal">{i.comment}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        {/*<div className=" w-ful h-15 mt-4 bg-amber-200 border-y border-gray-500"></div>
        <div className=" w-ful h-15 bg-amber-400 border-y border-gray-500"></div>
        <h1>Welcome to My Saved Dishes</h1>
        <div className=" w-ful h-15 mt-4 bg-amber-200 border-y border-gray-500"></div>
        <div className=" w-ful h-15 bg-amber-400 border-y border-gray-500"></div>
         
        {dishes?.map((i) => (
          <div key={i.dish_id}>
            <h2 onClick={() => navigate(`/dish/${i.dish_id}`)}>{i.recipe_name}</h2>
            <h4>portion : {i.portion_size}</h4>
            <h4>Date Prepared : {i.preparation_date.split("T")[0]}</h4>
            <h4>Time Prepared : {i.time_prepared}</h4>
            <h4>Cost : £{i.total_cost}</h4>
            <h4>Comment : {i.comment}</h4>
            <h4>Meal Type : {i.meal}</h4>
            <Button children={"Delete"} onClick={(e) => handleDelete(e, i, token, navigate)} />
            <p></p>
          </div>
        ))} */}
      </div>
    </>
  );
}

export default MyDishes;
