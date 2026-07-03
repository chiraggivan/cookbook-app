import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
import Button from "../../components/button";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import { getInitials } from "../../utils/appUtils";

function MyRecipes() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  // console.log("user is :", user);
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myRecipes, setMyRecipes, fetchedOnce, setFetchedOnce } = useContext(MyRecipeContext);
  const [fetchLoading, setFetchLoading] = useState(true);

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

  // ------------------------------------------- loading screen ----------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", data);
  // console.log("myRecipes before return html :", myRecipes);
  return (
    <>
      {/* <TopBar />
      <div className="flex mt-(--top-bar-height)">
        <LeftSideBar /> */}
      <div className="flex flex-col w-auto mt-(--top-bar-height) ml-(--left-side-bar) pt-5">
        <div
          className="flex flex-col items-start mb-4 h-60 
                    lg:flex-row  lg:justify-between lg:h-40"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex shrink-0 items-center justify-center w-40 h-40 rounded-full pb-3 bg-amber-200 text-8xl">
              {getInitials(user.username)}
            </div>
            <div className=" px-2">
              <p className="text-5xl mb-2">
                {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
              </p>
              <p className="text-1xl px-1">@{user.username}</p>
              <p className="text-1xl mb-2 px-1 text-gray-400">More about me</p>
            </div>
          </div>
          <div
            className="w-full flex flex-col h-60 
                      lg:h-40 lg:item-end lg:justify-end lg:w-50% "
          >
            <div>
              <div className="flex mt-4 lg:mt-0 lg:pr-88 lg:justify-end">Search Your Recipe </div>
              <div className="flex items-end justify-end w-full py-2">
                <input
                  className="border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                          focus:ring-2 focus:ring-green-300 h-10 w-full lg:w-100 px-2 pb-1"
                />
                <button className=" text-xl rounded-r-md border-hidden bg-gray-200 text-gray-700 h-10 px-4 pb-1 hover:ring-2 hover:ring-gray-600">
                  search
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-6  my-4">
          {myRecipes?.map((i) => (
            <div
              key={i.recipe_id}
              className="flex aspect-5/2 rounded-r-2xl  md:sm:aspect-5/1.5 lg:aspect-5/2 xl:sm:aspect-5/1.5 shadow
                            md:rounded-r-3xl hover:cursor-pointer md:hover:ring-6 hover:ring-green-200
                             transition"
              onClick={() => navigate(`/recipe/${i.recipe_id}`)}
            >
              <div className="w-[40%] shrink-0 h-full bg-gray-400"></div>
              <div className="w-[60%] p-3">
                <p
                  className="text-1xl font-bold tracking-tight hover:underline 
                                line-clamp-2"
                >
                  {i.name}
                </p>
                <p className="truncate">portion : {i.portion_size}</p>
                <p className=" line-clamp-2">
                  Description : <span className=" text-gray-600">{i.description}</span>{" "}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* {myRecipes?.map((i) => (
            <div key={i.recipe_id}>
              <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
              <h4>portion : {i.portion_size}</h4>
              <h4>Desription : {i.description}</h4>
              <p></p>
            </div>
          ))} */}
      </div>
      {/* </div> */}
    </>
  );
}

export default MyRecipes;
