import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";

function MyIngredients() {
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
  const url = `http://localhost:5001/useringredient/api/`;
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
      <h1>entered users ingredient page....</h1>
      {data?.map((i) => (
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
        </div>
      ))}
    </>
  );
}

export default MyIngredients;
