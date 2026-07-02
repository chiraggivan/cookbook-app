import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbarOld";
import { serverURL } from "../../utils/appUtils";
import TopBar from "../../components/topBar";
import LeftSideBar from "../../components/leftSideBar";

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
  //   console.log("data before return html : ", data);
  return (
    <>
      <TopBar />
      <div className="flex mt-(--top-bar-height)">
        <LeftSideBar />
        <div className="w-full ml-(--left-side-bar) mt-5">
          <h1>Welcome to {data?.[0].username}'s Recipes</h1>

          {data?.map((i) => (
            <div key={i.recipe_id}>
              <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
              <h4>portion : {i.portion_size}</h4>
              <h4>Desription : {i.description}</h4>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default UserRecipes;
