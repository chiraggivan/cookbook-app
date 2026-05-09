import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

function DishDetails() {
  const { id } = useParams();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const method = "get";
  const url = `http://localhost:5001/dish/api/${id}`;

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
      <p></p>
      <h1>{data?.dish.name}</h1>
      <h3>Portion size: {data?.dish.portion_size}</h3>
      <h3>Comment: {data?.dish.comment}</h3>
      <h5>Meal type: {data?.dish.meal}</h5>
      <h3>Cost : £ {data?.dish.total_cost}</h3>
      <h4>
        Prepared on : {data?.dish.preparation_date} @ {data?.dish.time_prepared}
      </h4>

      <button>Delete</button>
      <table>
        <thead>
          <tr>
            <th>ingredient name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>price</th>
            <th>Base Quantity</th>
            <th>Base Unit</th>
            <th>Base Price</th>
          </tr>
        </thead>
        <tbody>
          {data?.ingredients.map((i) => (
            <tr key={i.ingredient_display_order}>
              <td>{i.ingredient_name}</td>
              <td>{i.quantity}</td>
              <td>{i.unit_name}</td>
              <td>{i.cost}</td>
              <td>{i.base_quantity}</td>
              <td>{i.base_unit}</td>
              <td>{i.base_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <table>
        <thead>
          <tr>
            <th>Sr-No.</th>
            <th>Steps Description</th>
          </tr>
        </thead>
        <tbody>
          {data?.steps.map((s) => (
            <tr key={s.step_order}>
              <td>{s.step_order}</td>
              <td>{s.step_text}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  );
}

export default DishDetails;
