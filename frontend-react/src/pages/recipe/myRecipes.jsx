import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";

function MyRecipes() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const method = "get";
  const url = `http://localhost:5001/recipe/api/my`;

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
  // console.log("data before return html : ", fetchData);
  return (
    <>
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
