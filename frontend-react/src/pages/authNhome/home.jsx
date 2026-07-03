import { useNavigate } from "react-router-dom";
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

  const method = "get";
  const url = `${serverURL}/recipe/api/all`;

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

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", fetchData);
  return (
    <>
      {/* <TopBar /> */}
      {/* <div className="flex mt-(--top-bar-height)"> */}
      {/* <LeftSideBar /> */}
      <div className="w-auto mt-(--top-bar-height) ml-(--left-side-bar) pt-5">
        {/* <Navbar />
          <div className="m-4"></div> */}
        {/* creating grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {data?.map((i) => (
            // for each record creating card
            <div
              key={i.recipe_id}
              className="aspect-5/4  md:rounded-3xl  hover:cursor-pointer hover:ring-8 lg:hover:ring-15 hover:ring-green-100 transition"
            >
              {/*  within card creating 2 sections: one for image and second one for info */}
              <div
                className="h-[70%] bg-gray-300 md:rounded-t-3xl"
                onClick={() => navigate(`/recipe/${i.recipe_id}`)}
              ></div>
              <div className=" flex h-[30%] px-2">
                <div
                  className="flex aspect-square w-10 h-10 rounded-full bg-amber-200 items-center justify-center mt-2 mr-2"
                  onClick={() => navigate(`/recipesBy/${i.user_id}`)}
                >
                  {i.username.slice(0, 2).toUpperCase() ?? getInitials(i.display_name)}
                </div>
                <div className="m-2 w-full">
                  <p
                    className="text-xl font-bold leading-5 hover:cursor-pointer"
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    {i.name}
                  </p>
                  <p
                    className="text-sm font-semibold leading-6 text-gray-600 "
                    onClick={() => navigate(`/recipe/${i.recipe_id}`)}
                  >
                    portion : {i.portion_size}
                  </p>

                  <p className="leading-3" onClick={() => navigate(`/recipesBy/${i.user_id}`)}>
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
