import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/button";
import Navbar from "../../components/navbar";
import { serverURL } from "../../utils/appUtils";

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

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", fetchData);
  return (
    <>
      <Navbar />
      <h1>Welcome to Home</h1>
      <h2>All the recipes are :</h2>
      <Button children={"Add Recipe"} onClick={() => navigate("/recipe/new")} />

      {data?.map((i) => (
        <div key={i.recipe_id}>
          {/* <h6>{i.recipe_id}</h6> */}
          <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
          <h4>portion : {i.portion_size}</h4>
          <h4>Desription : {i.description}</h4>
          <h4 onClick={() => navigate(`/recipesBy/${i.user_id}`)}>by : {i.user_id}</h4>
          <p></p>
        </div>
      ))}
    </>
  );
}

export default Home;
