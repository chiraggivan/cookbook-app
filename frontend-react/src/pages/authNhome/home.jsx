import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/button";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import { serverURL, getInitials } from "../../utils/appUtils";
import Navbar from "../../components/navbarOld";

function Home() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRecipe = searchParams.get("q");

  const method = "get";
  let url;
  if (searchRecipe) {
    url = `${serverURL}/recipe/api/all/?q=${searchRecipe}`;
  } else {
    url = `${serverURL}/recipe/api/all`;
  }

  // Redirect effects
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

  // function to get the first to characters of display_name(one from first name and one from last name)
  // const getInitials = (name) => {
  //   const nameArray = name.split(" ");
  //   if (nameArray.length === 1) {
  //     return nameArray[0].slice(0, 2).toUpperCase();
  //   } else {
  //     const initials = nameArray[0].charAt(0) + nameArray[1].charAt(0);
  //     return initials.toUpperCase();
  //   }
  //   return "CH";
  // };

  // console.log("searchRecipe is :", searchRecipe);
  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", fetchData);
  return (
    <>
      {/*TopBar and LeftSideBar are added automatically thru 
      routes with the help of MainLayout component */}

      <div className="mt-(--top-bar-height)  md:ml-(--left-side-bar) md:p-5">
        {/* creating grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {data?.map((i) => (
            // for each record creating card
            <div
              key={i.recipe_id}
              className=" md:rounded-3xl  hover:cursor-pointer hover:ring-10 hover:bg-amber-100  hover:ring-amber-100 transition duration-500"
            >
              {/*  within card creating 2 sections: one for image and second one for info */}
              <div
                className="aspect-video bg-gray-300 md:rounded-t-3xl"
                onClick={() => navigate(`/recipe/${i.recipe_id}`)}
              ></div>

              <div className=" flex">
                <div className="px-1 py-2">
                  <div
                    className="p-2 flex aspect-square w-10 h-10 rounded-full bg-amber-200 items-center justify-center"
                    onClick={() => navigate(`/recipesBy/${i.user_id}`)}
                  >
                    {i.username.slice(0, 2).toUpperCase() ?? getInitials(i.display_name)}
                  </div>
                </div>

                <div className="mx-1 my-2 w-full">
                  <div
                    className="text-xl font-bold line-clamp-2 leading-[1.3] hover:cursor-pointer"
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    {i.name}
                  </div>
                  <p
                    className="text-sm line-clamp-1 font-semibold text-gray-600 "
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    portion : {i.portion_size}
                  </p>

                  <p
                    className="text-sm line-clamp-1 font-semibold text-gray-600 "
                    onClick={() => navigate(`/recipesBy/${i.user_id}`)}
                  >
                    by : {i.user_id}
                  </p>
                  <p></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* </div> */}
    </>
  );
}

export default Home;
