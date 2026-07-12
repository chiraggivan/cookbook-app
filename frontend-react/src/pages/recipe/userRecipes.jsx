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

function UserRecipes() {
  const { id } = useParams();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const navigate = useNavigate();

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
  // console.log("data before return html : ", data);
  return (
    <>
      <div className="w-auto mt-(--top-bar-height) ml-(--left-side-bar) pt-5">
        <div
          className="flex flex-col items-start mb-4 h-60 
                    lg:flex-row  lg:justify-between lg:h-40"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex shrink-0 items-center justify-center w-40 h-40 rounded-full pb-3 bg-amber-200 text-8xl">
              {getInitials(data?.userInfo.username)}
            </div>
            <div className=" px-2">
              <p className="text-5xl mb-2">
                {data?.userInfo.username.charAt(0).toUpperCase() + data?.userInfo.username.slice(1)}
              </p>
              <p className="text-1xl px-1">@{data?.userInfo.username}</p>
              <p className="text-1xl mb-2 px-1 text-gray-400">More about me</p>
            </div>
          </div>
          <div
            className="w-full flex flex-col h-60 
                      lg:h-40 lg:item-end lg:justify-end lg:w-50% "
          >
            <div>
              <div className="flex mt-4 lg:mt-0 lg:pr-88 lg:justify-end">
                Search {data?.userInfo.username}'s Recipe
              </div>
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
          {data?.userRecipes.map((i) => (
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
