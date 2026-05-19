import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/button";
import Navbar from "../../components/navbar";
import { MyIngredientContext } from "../../context/myIngredientContext";
import { serverURL } from "../../utils/appUtils";

function MyIngredients() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myIngredients, setMyIngredients, fetchedOnce, setFetchedOnce } =
    useContext(MyIngredientContext);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Redirect to home if token not found
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  //------ fetch the data by giving url, method and body(if required) with the help of useFetch HOOK --------
  const method = "get";
  const url = `${serverURL}/useringredient/api/`;

  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            setMyIngredients(res?.data.data);
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
  //   console.log("data before return html : ", data);
  return (
    <>
      <Navbar />
      <h1>entered users ingredient page....</h1>
      <Button children={"Add New Ingredient"} onClick={() => navigate("/myIngredient/new")} />

      {myIngredients?.map((i) => (
        <div key={i.user_ingredient_id}>
          <h1>{i.name}</h1>
          <h3>Price: £{i.display_price}</h3>
          <h3>
            For: {i.display_quantity}/{i.display_unit}
          </h3>
          <h3>
            Cup Weight: {i.cup_weight ? i.cup_weight : null} {i.cup_unit}
          </h3>
          <h4>{i.notes}</h4>
          <Button
            children={"Edit"}
            onClick={() => navigate("/myIngredient/edit", { state: { data: i } })}
          />
        </div>
      ))}
    </>
  );
}

export default MyIngredients;
