import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbar";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";
import Button from "../../components/button";

function MyRecipes() {
  const token = localStorage.getItem("token");
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
  // const { success, data, message, loading, error } = useFetch(
  //   token ? url : null,
  //   token,
  //   method,
  //   null,
  // );

  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            // console.log("res : ", res);
            setMyRecipes(res?.data.data);
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
      <Navbar />
      <h1>Welcome to My Recipes</h1>
      <Button children={"Add New Recipe"} onClick={() => navigate("/recipe/new")} />

      {myRecipes?.map((i) => (
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
