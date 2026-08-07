import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
import Button from "../../components/button";
import Input from "../../components/input";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import { getInitials } from "../../utils/appUtils";
import { FaSearchengin } from "react-icons/fa6";
import { GiHotMeal } from "react-icons/gi";

function MyRecipes() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  // console.log("user is :", user);
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myRecipes, setMyRecipes, fetchedOnce, setFetchedOnce } = useContext(MyRecipeContext);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchRecipe, setSearchRecipe] = useState("");
  const [displayRecipes, setDisplayRecipes] = useState();

  const imageBaseURL = "/uploadedImages/";
  const [imageError, setImageError] = useState(false);

  //-------------------------------- Redirect to home if token not found -----------------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);
  //-------------------------------- Redirect to home if token not found -----------------------------------
  // useEffect(() => {
  //   if (!authHookLoading && (!token || !isAuthenticated)) {
  //     navigate("/login");
  //   }
  // }, [authHookLoading, token, isAuthenticated, navigate]);

  // ------------------- fetch the data by giving url, method and body(if required) -------------------------
  const method = "get";
  const url = `${serverURL}/recipe/api/my`;

  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            // console.log("res : ", res);
            const refinedMyRecipes = res?.data.data.map(({ username, user_id, ...rest }) => rest);
            setMyRecipes(refinedMyRecipes);
            setFetchedOnce(true);
          }
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

  // ----------------------------- update the display recipe list if search has text --------------------
  // As currently we have useContext and all the dishes are stored and accessed later onwards, we will fetch the
  // searchIng list from the context variable itself.
  useEffect(() => {
    const string = searchRecipe.trim().replace(/\s+/g, " ").toLowerCase();
    if (!string) {
      setDisplayRecipes(myRecipes);
    } else {
      setDisplayRecipes(
        myRecipes.filter(
          (item) =>
            item.name.toLowerCase().includes(string) ||
            item.description?.toLowerCase().includes(string) ||
            item.portion_size?.toLowerCase().includes(string),
        ),
      );
    }
  }, [searchRecipe, myRecipes]);

  // ------------------------------ creating variable to store which recipe have images and valid --------
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (recipeId) => {
    setFailedImages((prev) => ({
      ...prev,
      [recipeId]: true,
    }));
  };

  // -------------------------- using search button for dishes --------------------------------------------
  // currently the recipes are auto searched when typed, if search button should only give result,
  // then remove the "searchRecipes" variable from the above useEffect
  const searchRecipeButton = () => {
    const string = searchRecipe.trim().replace(/\s+/g, " ").toLowerCase();
    if (!string) {
      setDisplayRecipes(myRecipes);
    } else {
      setDisplayRecipes(
        myRecipes.filter(
          (item) =>
            item.name.toLowerCase().includes(string) ||
            item.description?.toLowerCase().includes(string) ||
            item.portion_size?.toLowerCase().includes(string),
        ),
      );
    }
  };

  // ------------------------------------------- loading screen ----------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", data);
  // console.log("myRecipes before return html :", myRecipes);
  // console.log("searchRecipe", searchRecipe);
  // console.log("displayRecipes :", displayRecipes);
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
                  onClick={searchRecipeButton}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4  p-4">
          {displayRecipes?.map((i) => (
            <div
              key={i.recipe_id}
              className="flex h-40 rounded-r-2xl shadow-sm
                        hover:cursor-pointer hover:ring-10 hover:ring-amber-100 hover:bg-amber-100 transition duration-500"
              onClick={() => navigate(`/recipe/${i.recipe_id}`)}
            >
              <div className="h-full aspect-5/4 bg-gray-400 rounded">
                {failedImages[i.recipe_id] || !i?.image_url ? (
                  <GiHotMeal className="h-full w-full bg-gray-200" />
                ) : (
                  <img
                    className="h-full w-full md:rounded-md"
                    src={i?.image_url}
                    alt="Recipe Image"
                    onError={() => handleImageError(i.recipe_id)}
                  />
                )}
              </div>

              <div className="p-3">
                <p className="text-xl font-bold line-clamp-2 leading-[1.3] hover:cursor-pointer">
                  {i.name}
                </p>
                <p className="text-sm line-clamp-1 font-semibold text-gray-600 ">
                  portion : {i.portion_size}
                </p>
                <p className=" text-sm line-clamp-3 font-semibold text-gray-600  ">
                  Description : <span className=" font-normal">{i.description}</span>{" "}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* </div> */}
    </>
  );
}

export default MyRecipes;
