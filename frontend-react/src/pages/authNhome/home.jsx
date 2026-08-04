import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/button";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";
import Navbar from "../../components/navbarOld";
import { Spinner } from "flowbite-react";
import {
  serverURL,
  showTokenErrMsgOnScreen,
  JWTunverifiedMsg,
  getInitials,
} from "../../utils/appUtils";

function Home() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRecipe = searchParams.get("q");
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const method = "get";
  let url;
  if (searchRecipe) {
    url = `${serverURL}/recipe/api/all/?q=${searchRecipe}`;
  } else {
    url = `${serverURL}/recipe/api/all`;
  }
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Redirect effects
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  //  verify token (valid or expired)
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const res = await axios[method](url, config);
          setData(res?.data.data);
        } catch (err) {
          // console.log("Error while fetching all recipes", err);
          if (err.response?.data.message === JWTunverifiedMsg) {
            localStorage.removeItem("token");
            navigate(`/login?errMsg=${showTokenErrMsgOnScreen}`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [token, searchRecipe]);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner color="purple" aria-label="Extra large spinner example" size="xl" />
      </div>
    );
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
