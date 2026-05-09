import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

function MyDishes() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect effect
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

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data before return html : ", fetchData);
  return (
    <>
      <h1>Welcome to My Saved Dishes</h1>

      {data?.map((i) => (
        <div key={i.dish_id}>
          {/* <h6>{i.recipe_id}</h6> */}
          <h2 onClick={() => navigate(`/dish/${i.dish_id}`)}>{i.recipe_name}</h2>
          <h4>portion : {i.portion_size}</h4>
          <h4>Date Prepared : {i.preparation_date.split("T")[0]}</h4>
          <h4>Time Prepared : {i.time_prepared}</h4>
          <h4>Cost : £{i.total_cost}</h4>
          <h4>Comment : {i.comment}</h4>
          <h4>Meal Type : {i.meal}</h4>
          <p></p>
        </div>
      ))}
    </>
  );
}

export default MyDishes;
