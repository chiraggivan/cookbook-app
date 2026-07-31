import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
// import Button from "../../components/button";
// import Navbar from "../../components/navbarOld";
import Input from "../../components/input";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import { Button } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { TbBowlSpoonFilled } from "react-icons/tb";
import { FaCarrot } from "react-icons/fa6";

function MyIngredients() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myIngredients, setMyIngredients, fetchedOnce, setFetchedOnce } =
    useContext(MyIngredientContext);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchIng, setSearchIng] = useState("");
  const [displayIngredients, setDisplayIngredients] = useState();

  // Redirect to home if token NOT found
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  //------ fetch the data by giving url, method and body(if required) with the help of useFetch HOOK --------
  const method = "get";
  const url = `${serverURL}/useringredient/api/?q=${searchIng}`;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          const res = await axios[method](url, config);
          setMyIngredients(res?.data.data);
          setFetchedOnce(true);
        } catch (err) {
          console.log(
            "error while fetching my ingredients list with axios is :",
            err.response.message,
          );
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
    setFetchLoading(false);
  }, []);

  // ----------------------------- update the displayIngredients list if searchIng has text --------------------
  // As currently we have useContext and all the user_ingredients are stored and accessed later onwards, we will fetch the
  // searchIng list from the context variable itself.
  useEffect(() => {
    const string = searchIng.trim().replace(/\s+/g, " ").toLowerCase();
    // const searchurl = `${serverURL}/useringredient/api/?q=${string}`;
    // const fetchData = async () => {
    //   try {
    //     setFetchLoading(true);
    //     const res = await axios[method](searchurl, config);
    //     setDisplayIngredients(res?.data.data);
    //   } catch (err) {
    //     console.log(
    //       "error while fetching my ingredients list with axios is :",
    //       err.response.message,
    //     );
    //   } finally {
    //     setFetchLoading(false);
    //   }
    // };
    // fetchData();

    if (!string) {
      setDisplayIngredients(myIngredients);
    } else {
      setDisplayIngredients(
        myIngredients.filter((item) => item.name.toLowerCase().includes(string)),
      );
    }
  }, [searchIng, myIngredients]);

  // ------------------------------------------- loading screen ----------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("myIngredients before return html : ", myIngredients);
  return (
    <>
      <div className="flex flex-col w-auto mt-[calc(var(--top-bar-height)+15px)] md:mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5">
        {/* Create header and search bar for your ingredients and a line separator */}
        <div className="flex flex-col sticky z-10 top-[calc(var(--top-bar-height)+40px)] md:top-(--top-bar-height) bg-white">
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
                />
                {/* search button */}
                <button className=" text-xl cursor-pointer rounded-r-md border-r border-t border-b border-gray-400 bg-gray-200 text-gray-700 h-10 px-4 ">
                  <HiOutlineSearch />
                </button>
              </div>
            </div>
          </div>

          {/* Line Separator */}
          <div className="flex items-center mb-2">
            <div className="grow border-t border-gray-300"></div>
          </div>
        </div>

        {/* show all your custom ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
          {displayIngredients?.map((i) => (
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
                  Priced £{i.display_price} for {i.display_quantity} {i.display_unit}{" "}
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

        <h1>entered users ingredient page....</h1>
        <div>
          <Button color="gray" onClick={() => navigate("/myIngredient/new")}>
            Add New Ingredient
          </Button>
        </div>
        {myIngredients?.map((i) => (
          <div key={i.user_ingredient_id}>
            <h1>{i.name}</h1>
            <h3>Price: £{i.display_price}</h3>
            <h3>
              For: {i.display_quantity} {i.display_unit}
            </h3>
            <h3>
              Cup Weight: {i.cup_weight ? i.cup_weight : null} {i.cup_unit}
            </h3>
            <h4>{i.notes}</h4>
            <div>
              <Button
                color="gray"
                onClick={() => navigate("/myIngredient/edit", { state: { data: i } })}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
        <h1>entered users ingredient page....</h1>
        <div>
          <Button color="dark" onClick={() => navigate("/myIngredient/new")}>
            Add New Ingredient
          </Button>
        </div>
        {myIngredients?.map((i) => (
          <div key={i.user_ingredient_id}>
            <h1>{i.name}</h1>
            <h3>Price: £{i.display_price}</h3>
            <h3>
              For: {i.display_quantity} {i.display_unit}
            </h3>
            <h3>
              Cup Weight: {i.cup_weight ? i.cup_weight : null} {i.cup_unit}
            </h3>
            <h4>{i.notes}</h4>
            <div>
              <Button
                color="blue"
                onClick={() => navigate("/myIngredient/edit", { state: { data: i } })}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MyIngredients;
