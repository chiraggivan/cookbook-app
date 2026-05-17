import { useNavigate, useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbar";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";
import DishDetailsPage from "./-dishDetailsPage";
import { DishContext } from "../../context/dishContext";

function DishDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { dishDetails, setDishDetails } = useContext(DishContext);
  const [foundDish, setFoundDish] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  let tableRows = [];

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------- fetch the data by giving url, method and body(if required) with the help of useFetch HOOK
  const method = "get";
  const url = `http://localhost:5001/dish/api/${id}`;
  const body = null;

  // console.log("Data from dishContext for dishDetails is :", dishDetails);
  const searchDish = dishDetails?.find((d) => d.dish.dish_id === Number(id));
  // ------------------ fetch data from backend only for once if not found in context ---------------------
  useEffect(() => {
    setFoundDish(searchDish);
  }, [dishDetails]);

  // setFoundDish(dishDetails?.find((d) => d.dish.dish_id === Number(id)));
  useEffect(() => {
    if (!searchDish) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, { headers: { Authorization: `Bearer ${token}` } });
            setDishDetails((prev) => [...prev, res?.data?.data]);
          }
        } catch (err) {
          console.log("error while fetching dish details with axios is :", err.response);
        } finally {
          setFetchLoading(false);
        }
      };

      fetchData();
    }
    setFetchLoading(false);
  }, []);

  //  initial page loading screen
  if (fetchLoading) {
    return <h1> Page Loading ........</h1>;
  }

  // Create html for table with components and ingredients rows
  if (foundDish) {
    const recipeData = foundDish?.ingredients;

    const uniqueComp = [...new Set(recipeData?.map((i) => i.component_display_order))].sort(
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
        `Are you sure you want to delete this recipe - ${foundDish?.dish.recipe_name}, prepared on ${foundDish?.dish.preparation_date}`,
      )
    ) {
      try {
        await HandleDishDelete({ id, token, navigate });
        return;
      } catch (err) {
        console.log("catch block Failed to delete item", err);
        console.log(err.response?.foundDish?.message);
        alert(err.response?.foundDish?.message);
      }
    }
  };
  // console.log("dishD before jsx: ", foundDish);
  return (
    <>
      <Navbar />
      <DishDetailsPage
        id={id}
        data={foundDish}
        navigate={navigate}
        tableRows={tableRows}
        handleDelete={handleDelete}
      />
    </>
  );
}

export default DishDetails;
