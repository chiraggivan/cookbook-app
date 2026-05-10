import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";

function RecipeDetails() {
  const { id } = useParams();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  let tableRows = [];

  // delete button function
  const handleDelete = async (e) => {
    e.preventDefault();

    if (window.confirm(`Are you sure you want to delete this recipe - ${data?.recipe[0].name}`)) {
      const deleteurl = `http://localhost:5001/recipe/api/delete/${id}`;

      try {
        const res = await axios.delete(deleteurl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("response after delete recipe is : ", res);
        if (res?.data?.success === true) {
          alert(res?.data?.message);
          navigate("/MyRecipes");
          console.log(res?.data?.message);
          return;
        } else {
          alert(res?.data?.message);
          console.log(res?.data?.message);
          return;
        }
      } catch (err) {
        console.log(err.response?.data?.message);
        alert(err.response?.data?.message);
        return;
      }
    } else {
      console.log("cancelled");
    }
  };

  // create dish button function
  const handleCreateDish = async (e) => {
    e.preventDefault();

    if (window.confirm(`Save - ${data?.recipe[0].name} as dish`)) {
      console.log("id b4 createDishurl :", id);
      const createDishurl = ``;
    } else {
      console.log("cancelled");
    }
  };

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // fetch the data by giving url, method and body(if required) with the help of useFetch HOOK
  const method = "get";
  const url = `http://localhost:5001/recipe/api/${id}`;
  const body = null;
  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    body ? body : null,
  );

  // get the total cost of recipe
  // useEffect(() => {
  //   if (!data) {
  //     return;
  //   }
  //   let totalCost = 0;
  //   data?.ingredients.map((i) => (totalCost += i.price));
  // }, [data]);

  const totalCost =
    Math.ceil(data?.ingredients?.reduce((sum, i) => sum + i.price, 0) * 100) / 100 || 0;

  const url2 = `http://localhost:5001/recipe/api/last-record/${id}`;
  const method2 = "get";
  const {
    success: s2,
    data: d2,
    message: m2,
    loading: l2,
    error: e2,
  } = useFetch(token ? url2 : null, token, method2, null);

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  // console.log("data is :", data);

  // Create html for table with components and ingredients rows
  if (data) {
    const recipeData = data?.ingredients;

    const uniqueComp = [...new Set(recipeData.map((i) => i.component_display_order))].sort(
      (a, b) => a - b,
    );
    console.log("unique comps are:", uniqueComp);

    for (const u of uniqueComp) {
      const compIngs = recipeData
        .filter((i) => i.component_display_order === u)
        .sort((a, b) => a.ingredient_display_order - b.ingredient_display_order);
      const comp_text = compIngs[0].component_text;
      if (u === 0 && comp_text === "") {
        // console.log("first component text is empty");
      } else if (u === 0 && comp_text !== "") {
        tableRows.push(
          <tr colSpan={7}>
            <td>{comp_text}</td>
          </tr>,
        );
      } else if (u !== 0) {
        tableRows.push(
          <tr colSpan={8}>
            <td>{comp_text}</td>
          </tr>,
        );
      }

      for (const i of compIngs) {
        tableRows.push(
          <tr key={i.ingredient_display_order}>
            <td>{i.name}</td>
            <td>{i.quantity}</td>
            <td>{i.unit_name}</td>
            <td>{i.price}</td>
            <td>{i.base_quantity}</td>
            <td>{i.unit}</td>
            <td>{i.cost}</td>
            <td>{i.ingredient_source}</td>
          </tr>,
        );
      }
    }
  }

  // console.log("table rows :", tableRows);
  return (
    <div>
      <p></p>
      <h1>{data?.recipe[0].name}</h1>
      <h3>{data?.recipe[0].portion_size}</h3>
      <h3>{data?.recipe[0].description}</h3>
      <h5>{data?.recipe[0].privacy}</h5>
      <h3>£ {totalCost}</h3>
      <button onClick={handleCreateDish}>create dish</button>
      <h4>
        Last Prepared on : {d2?.date_prepared} @ {d2?.time_prepared}
      </h4>
      <button>Edit</button>
      <button onClick={handleDelete}>Delete</button>
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
            <th>Ing. Source</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
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
