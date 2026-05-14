import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";
import DishDetailsPage from "./-dishDetailsPage";

function DishDetails() {
  const { id } = useParams();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  let tableRows = [];

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // fetch the data by giving url, method and body(if required) with the help of useFetch HOOK
  const method = "get";
  const url = `http://localhost:5001/dish/api/${id}`;
  const body = null;
  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    body ? body : null,
  );

  if (loading) {
    return <h1> Page Loading ........</h1>;
  }

  // Create html for table with components and ingredients rows
  if (data) {
    const recipeData = data?.ingredients;

    const uniqueComp = [...new Set(recipeData.map((i) => i.component_display_order))].sort(
      (a, b) => a - b,
    );
    // console.log("unique comps are:", uniqueComp);

    for (const u of uniqueComp) {
      const compIngs = recipeData
        .filter((i) => i.component_display_order === u)
        .sort((a, b) => a.ingredient_display_order - b.ingredient_display_order);

      const comp_text = compIngs[0].component_text; // find the first ing for the component and get the component_text
      if (u === 0 && comp_text === "") {
        // console.log("first component text is empty");
      } else if (u === 0 && comp_text !== "") {
        tableRows.push(
          <tr colSpan={8}>
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
            <td>{i.ingredient_name}</td>
            <td>{i.quantity}</td>
            <td>{i.unit_name}</td>
            <td>{i.cost}</td>
            <td>{1}</td>
            <td>{i.base_unit}</td>
            <td>{i.base_price}</td>
            <td>{i.ingredient_source}</td>
          </tr>,
        );
      }
    }
  }

  // delete button function
  const handleDelete = async (e, id, token, navigate) => {
    e.preventDefault();

    if (
      window.confirm(
        `Are you sure you want to delete this recipe - ${data?.dish.recipe_name}, prepared on ${data?.dish.preparation_date}`,
      )
    ) {
      try {
        await HandleDishDelete({ id, token, navigate });
        navigate("/myDishes");
      } catch (err) {
        console.log("Failed to delete item", err);
        console.log(err.response?.data?.message);
        alert(err.response?.data?.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <DishDetailsPage
        id={id}
        data={data}
        navigate={navigate}
        tableRows={tableRows}
        handleDelete={handleDelete}
      />
    </>
  );
}

export default DishDetails;
