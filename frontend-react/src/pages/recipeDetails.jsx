import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import useFetch from "../hooks/useFetch";

function RecipeDetails() {
  const { id } = useParams();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const method = "get";
  const url = `http://localhost:5001/recipe/api/${id}`;

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
  console.log("data is :", data);
  return (
    <div>
      <p></p>
      <h1>{data?.recipe[0].name}</h1>
      <h3>{data?.recipe[0].portion_size}</h3>
      <h3>{data?.recipe[0].description}</h3>
      <h5>{data?.recipe[0].privacy}</h5>

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
              <td>{i.name}</td>
              <td>{i.quantity}</td>
              <td>{i.unit_name}</td>
              <td>{i.price}</td>
              <td>{i.base_quantity}</td>
              <td>{i.unit}</td>
              <td>{i.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
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
      </table>
    </div>
  );
}

export default RecipeDetails;
