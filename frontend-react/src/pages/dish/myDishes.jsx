import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";
import { DishContext } from "../../context/dishContext";

function MyDishes() {
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { dishes, setDishes, fetchedOnce, setFetchedOnce, setDishDetails } =
    useContext(DishContext);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const updated = searchParams.get("changed");
  const id = searchParams.get("id");

  // ------------------------------------ Redirect effect ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `http://localhost:5001/dish/api/`;

  // ----------------------------- fetch data from backend only for once --------------------------------
  useEffect(() => {
    if (!fetchedOnce) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            setDishes(res?.data.data);
            setFetchedOnce(true);
          }
        } catch (err) {
          console.log("error while fetching dish list with axios is :", err.response.message);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
    setFetchLoading(false);
  }, []);

  //--------------------------- update dish list if changed  ---------------------------------------------
  useEffect(() => {
    if (!id) return;
    setDishes((prev) => prev?.filter((i) => i.dish_id !== Number(id)));
    setDishDetails((prev) => prev?.filter((i) => i.dish?.dish_id !== Number(id)));
  }, [id]);

  // -----------------------  show loading while waiting for data to be ready -------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  //-------------------------------- delete button function ---------------------------------------------
  const handleDelete = async (e, dish, token, navigate) => {
    e.preventDefault();

    if (
      window.confirm(
        `Are you sure you want to delete this recipe - ${dish.recipe_name}, prepared on ${dish.preparation_date.split("T")[0]}`,
      )
    ) {
      try {
        await HandleDishDelete({ id: dish.dish_id, token, navigate });
      } catch (err) {
        console.log("Failed to delete item", err);
        console.log(err.response?.data?.message);
        alert("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <h1>Welcome to My Saved Dishes</h1>

      {dishes?.map((i) => (
        <div key={i.dish_id}>
          {/* <h6>{i.recipe_id}</h6> */}
          <h2 onClick={() => navigate(`/dish/${i.dish_id}`)}>{i.recipe_name}</h2>
          <h4>portion : {i.portion_size}</h4>
          <h4>Date Prepared : {i.preparation_date.split("T")[0]}</h4>
          <h4>Time Prepared : {i.time_prepared}</h4>
          <h4>Cost : £{i.total_cost}</h4>
          <h4>Comment : {i.comment}</h4>
          <h4>Meal Type : {i.meal}</h4>
          <Button children={"Delete"} onClick={(e) => handleDelete(e, i, token, navigate)} />
          <p></p>
        </div>
      ))}
    </>
  );
}

export default MyDishes;
