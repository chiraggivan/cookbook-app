import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";

function MyDishes() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dishList, setDishList] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const updated = searchParams.get("changed");
  const id = searchParams.get("id");
  console.log("id is: ", id, " and updated is :", updated);

  // ------------------------------------ Redirect effect ----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  const method = "get";
  const url = `http://localhost:5001/dish/api/`;

  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  console.log("success :", success);
  console.log("data :", data);
  console.log("message :", message);
  console.log("loading :", loading);
  console.log("error :", error);
  // setDishList(data);
  //   setFetchLoading(loading);
  // }, [token]);

  // ---------------------------- load dish list when data found -------------------------------------------
  useEffect(() => {
    setDishList(data);
  }, [data]);

  // update dish list if changed
  useEffect(() => {
    setDishList(dishList?.filter((i) => i.dish_id !== Number(id)));
    console.log(" when changed :", dishList);
  }, [id]);

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }

  // console.log("id : ", id);
  // console.log("dishList :", dishList);

  // delete button function
  const handleDelete = async (e, dish, token, navigate) => {
    e.preventDefault();
    console.log("dish: ", dish);
    if (
      window.confirm(
        `Are you sure you want to delete this recipe - ${dish.dish_name}, prepared on ${dish.preparation_date.split("T")[0]}`,
      )
    ) {
      try {
        await HandleDishDelete({ id: dish.dish_id, token, navigate });
        navigate("/myDishes");
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

      {dishList?.map((i) => (
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
//  await handleDelete(itemId); // Call the child function
//      // After success, update your state
//       setItems(items.filter(item => item.id !== itemId));
