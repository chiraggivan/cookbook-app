import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbarOld";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";
import { DishContext } from "../../context/dishContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { HiOutlineSearch } from "react-icons/hi";
import { GiHotMeal } from "react-icons/gi";

function MyDishes() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { dishes, setDishes, fetchedOnce, setFetchedOnce, setDishDetails } =
    useContext(DishContext);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const updated = searchParams.get("changed");
  const id = searchParams.get("id");

  // ------------------------------------ Redirect effect ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `${serverURL}/dish/api/`;

  // ----------------------------- fetch data from backend only for once --------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            setDishes(res?.data.data);
            setFetchedOnce(true);
          }
        } catch (err) {
          console.log("error while fetching dish list with axios is :", err.response.message);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
    setFetchLoading(false);
  }, []);

  //--------------------------- update dish list if changed  ---------------------------------------------
  useEffect(() => {
    if (!id) return;
    setDishes((prev) => prev?.filter((i) => i.dish_id !== Number(id)));
    setDishDetails((prev) => prev?.filter((i) => i.dish?.dish_id !== Number(id)));
  }, [id]);

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

  return (
    <>
      <div className="flex flex-col  mt-(--top-bar-height) ml-(--left-side-bar) pt-5 ">
        {/* Create header and search bar for your ingredients and a line separator */}
        <div className="flex flex-col sticky z-10 top-(--top-bar-height) bg-white">
          {/* Header of the page with search bar */}
          <div className="flex flex-col my-3 items-center lg:items-start lg:flex-row lg:justify-between">
            <div className="text-2xl font-semibold">Your Saved Dishes</div>
            {/* search bar */}
            <div className="flex w-full items-end max-w-80">
              {/* search input */}
              <input
                className="border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                                    focus:ring-2 focus:ring-gray-300 h-10 w-full lg:w-100 px-2 pb-1"
              />
              {/* search button */}
              <button className=" text-xl cursor-pointer rounded-r-md border-r border-t border-b border-gray-400 bg-gray-200 text-gray-700 h-10 px-4 ">
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
        <div className="grid grid-cols-1 mt-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
          {dishes?.map((i) => (
            <div
              className="flex m-2 shadow-md border-gray-400  cursor-pointer"
              onClick={() => navigate(`/dish/${i.dish_id}`)}
            >
              {/* image section - left */}
              <div className="min-w-45 min-h-45 max-w-45 max-h-45 border-0 ">
                <GiHotMeal className=" h-full w-full rounded-r-xl bg-gray-300" />
              </div>
              {/* details section right */}
              <div className="px-2 pb-2" key={i.user_ingredient_id}>
                <p className="text-lg font-semibold">{capitaliseWords(i.recipe_name)}</p>
                <p>
                  <span className="text-sm font-semibold">Portion : </span>
                  {capitaliseWords(i.portion_size)}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Prepared on : </span>
                  {i.preparation_date.split("T")[0]} @ {i.time_prepared} for {i.meal}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Costing : </span> £ {i.total_cost}
                </p>
                <p className="text-sm text-gray-500 font-semibold">
                  Comment : <span className="italic font-normal">{i.comment}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className=" w-ful h-15 mt-4 bg-amber-200 border-y border-gray-500"></div>
        <div className=" w-ful h-15 bg-amber-400 border-y border-gray-500"></div>
        <h1>Welcome to My Saved Dishes</h1>

        {dishes?.map((i) => (
          <div key={i.dish_id}>
            {/* <h6>{i.recipe_id}</h6> */}
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
        ))}
      </div>
    </>
  );
}

export default MyDishes;
