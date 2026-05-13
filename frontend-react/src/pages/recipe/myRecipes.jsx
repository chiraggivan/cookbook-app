import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbar";

function MyRecipes() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if token not found
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // fetch the data by giving url, method and body(if required) with the help of useFetch HOOK
  const method = "get";
  const url = `http://localhost:5001/recipe/api/my`;
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
      <Navbar />
      <h1>Welcome to My Recipes</h1>

      {data?.map((i) => (
        <div key={i.recipe_id}>
          <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
          <h4>portion : {i.portion_size}</h4>
          <h4>Desription : {i.description}</h4>
          <p></p>
        </div>
      ))}
    </>
  );
}

export default MyRecipes;
