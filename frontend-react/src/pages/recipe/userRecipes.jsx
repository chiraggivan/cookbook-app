import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { serverURL } from "../../utils/appUtils";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import { getInitials } from "../../utils/appUtils";
import Input from "../../components/input";
import { HiSearch } from "react-icons/hi";
import { GiHotMeal } from "react-icons/gi";
import { useState } from "react";

function UserRecipes() {
  const { id } = useParams();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  if (!user) {
    console.log("user not stored in localStorage");
    return <h3>user info not found locally</h3>;
  }

  useEffect(() => {
    if (parseInt(id) === parseInt(user.user_id)) {
      navigate("/MyRecipes", { replace: true });
    }
  });

  const { token, loading: authHookLoading, isAuthenticated } = useAuth();

  const method = "get";
  const url = `${serverURL}/recipe/api/user/${id}`;

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  console.log("data before return html : ", data);
  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}
      <div className="flex flex-col w-auto mt-(--top-bar-height) md:ml-(--left-side-bar) pt-5">
        {/*header and search */}
        <div className="flex flex-col pb-5 lg:flex-row lg:items-end sticky top-0 z-8 bg-white">
          <div className="flex items-center justify-center">
            <div className="flex shrink-0 items-center justify-center w-40 h-40 rounded-full  bg-amber-200 text-8xl">
              {data?.userInfo.picture_url ? (
                <img
                  className="rounded-full aspect-square"
                  src={data?.userInfo.picture_url}
                  alt={getInitials(
                    data?.userInfo.username ?? data?.userInfo.display_name ?? data?.userInfo.email,
                  )}
                />
              ) : (
                getInitials(
                  data?.userInfo.username ?? data?.userInfo.display_name ?? data?.userInfo.email,
                )
              )}
            </div>
            {data?.userInfo && (
              <div className=" px-2">
                <p className="text-5xl mb-2">
                  {data?.userInfo.username.charAt(0).toUpperCase() +
                    data?.userInfo.username.slice(1)}
                </p>
                <p className="text-1xl px-1">@{data?.userInfo.username}</p>
                <p className="text-1xl mb-2 px-1 text-gray-400">More about me</p>
              </div>
            )}
          </div>

          <div className="py-2 lg:py-0 lg:pl-40">
            <div className="flex items-center justify-center">
              <div className="flex w-80">
                <Input
                  className="flex-1 border-t border-l border-b rounded-l-md border-gray-400 focus:outline-none 
                          focus:border-2 h-10 w-full placeholder:text-gray-400"
                  placeholder={`Search recipe by ${data?.userInfo?.username}`}
                />
                <button
                  className="flex text-xl rounded-r-md border-hidden bg-gray-200 text-gray-700 h-10 px-4 items-center 
                                              hover:ring-2 hover:ring-gray-600 hover:cursor-pointer"
                  // onClick={searchRecipeButton}
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
          {data?.userRecipes.map((i) => (
            <div
              key={i.recipe_id}
              className="flex h-40 rounded-r-2xl shadow-sm
                        hover:cursor-pointer hover:ring-10 hover:ring-green-100 hover:bg-green-100 transition duration-500"
              onClick={() => navigate(`/recipe/${i.recipe_id}`)}
            >
              <div className="h-full aspect-5/4 rounded overflow-hidden">
                {i.image_url && !imageError ? (
                  <img
                    className="h-full w-full object-cover md:rounded-md"
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

        <h1>Welcome to {data?.userInfo.username}'s Recipes</h1>

        {data?.userRecipes.map((i) => (
          <div key={i.recipe_id}>
            <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
            <h4>portion : {i.portion_size}</h4>
            <h4>Desription : {i.description}</h4>
          </div>
        ))}
      </div>
    </>
  );
}

export default UserRecipes;
