import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import useFetch from "../../hooks/useFetch";
import Navbar from "../../components/navbar";
import { MyRecipeContext } from "../../context/myRecipeContext";
import { serverURL } from "../../utils/appUtils";

function RecipeDetails() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { myRecipes, setMyRecipes, recipeDetails, setRecipeDetails } = useContext(MyRecipeContext);
  // const [details4Dish, setDetails4Dish] = useState({});
  const [foundRecipeDetails, setFoundRecipeDetails] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  let tableRows = [];
  const details4Dish = {};
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  //----------------------------------- delete button function -------------------------------------------------
  const handleDelete = async (e) => {
    e.preventDefault();

    if (
      window.confirm(
        `Are you sure you want to delete this recipe - ${foundRecipeDetails?.recipe.name}`,
      )
    ) {
      const deleteurl = `${serverURL}/recipe/api/delete/${id}`;
      try {
        const res = await axios.delete(deleteurl, config);
        if (res?.data?.success === true) {
          alert(res?.data?.message);
          // edit context variables as well
          const x = recipeDetails.filter((i) => i.recipe.recipe_id !== Number(id));
          setRecipeDetails(x);
          const y = myRecipes.filter((i) => i.recipe_id !== Number(id));
          setMyRecipes(y);
          // ---------------------------
          navigate("/MyRecipes");
          return;
        } else {
          alert(res?.data?.message);
          // console.log(res?.data?.message);
          return;
        }
      } catch (err) {
        // console.log(err.response?.data?.message);
        alert(err.response?.data?.message);
        return;
      }
    } else {
      console.log("cancelled");
    }
  };

  // ------------------------------------- create DISH button function  ----------------------------------------
  const handleCreateDish = async (e) => {
    e.preventDefault();
    // console.log("details4Dish :", details4Dish);
    // adding current date and time in recipe to create dish date and time
    const now = new Date();
    const currentData = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];
    details4Dish.preparation_date = currentData;
    details4Dish.time_prepared = currentTime;

    if (window.confirm(`Save - ${foundRecipeDetails?.recipe.name} as dish  prepared now.`)) {
      const createURL = `${serverURL}/dish/api/create`;

      try {
        const res = await axios.post(createURL, details4Dish, config);
        if (res?.data?.success === true) {
          alert(res?.data?.message);
          // update the recipeDetails Context (cache) on local machine
          const updatedDetails = recipeDetails.map((i) =>
            i.recipe.recipe_id === Number(id)
              ? {
                  ...i,
                  recipe: {
                    ...i.recipe,
                    date_prepared: currentData,
                    time_prepared: currentTime,
                  },
                }
              : i,
          );
          setRecipeDetails(updatedDetails);

          // navigate(`/recipe/`);
          return;
        } else {
          alert(res?.data?.message);
          console.log(res?.data?.message);
          return;
        }
      } catch (err) {
        console.log("response message for dish created button:", err.response);
        console.log(err.response?.data?.message);
        alert(err.response?.data?.message);
        return;
      }
    } else {
      console.log("cancelled");
    }
  };

  //----------------------------------------- Redirect effect --------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------- fetch the data by giving url, method and body(if required) -------------------------------------
  const method = "get";
  const url = `${serverURL}/recipe/api/${id}`;
  const body = null;

  const searchMyRecipes = recipeDetails?.find((d) => d.recipe.recipe_id === Number(id));
  // ----------------------------- fetch data from backend only for once -------------------------------------
  useEffect(() => {
    setFoundRecipeDetails(searchMyRecipes);
  }, [recipeDetails]);

  useEffect(() => {
    if (!searchMyRecipes) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await axios[method](url, config);
            const tempRecipe = res?.data?.data;

            // adding last prepared timings in recipe section of details
            const url2 = `${serverURL}/recipe/api/last-record/${id}`;
            const res2 = await axios.get(url2, config);

            if (tempRecipe && tempRecipe.recipe) {
              tempRecipe.recipe.date_prepared = res2.data.data.date_prepared;
              tempRecipe.recipe.time_prepared = res2.data.data.time_prepared;
            }

            setRecipeDetails((prev) => [...prev, tempRecipe]);
          }
        } catch (err) {
          console.log("error while fetching reicpe details with axios is :", err.response);
        } finally {
          setFetchLoading(false);
        }
      };

      fetchData();
    }
    setFetchLoading(false);
  }, []);

  //-------------------------------------- get the total cost of recipe -----------------------------------
  const totalCost =
    Math.ceil(foundRecipeDetails?.ingredients?.reduce((sum, i) => sum + i.price, 0) * 100) / 100 ||
    0;

  // ------------------------------  initial page loading screen -------------------------------------------
  if (fetchLoading) {
    return <h1> Page Loading .............</h1>;
  }

  // ------------------------ Create html for table with components and ingredients rows -------------------
  if (foundRecipeDetails) {
    // below variable to create data for dish creation api
    details4Dish.recipe_id = foundRecipeDetails.recipe.recipe_id;
    details4Dish.recipe_name = foundRecipeDetails.recipe.name;
    details4Dish.portion_size = foundRecipeDetails.recipe.portion_size;
    details4Dish.total_cost = totalCost;
    details4Dish.meal = "lunch";
    details4Dish.recipe_by = foundRecipeDetails.recipe.user_id;
    details4Dish.comment = " nothing much";
    details4Dish.components = [];
    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    const recipeData = foundRecipeDetails?.ingredients;

    const uniqueComp = [...new Set(recipeData?.map((i) => i.component_display_order))].sort(
      (a, b) => a - b,
    );
    // console.log("unique comps are:", uniqueComp);

    for (const u of uniqueComp) {
      const compIngs = recipeData
        .filter((i) => i.component_display_order === u)
        .sort((a, b) => a.ingredient_display_order - b.ingredient_display_order);
      const comp_text = compIngs[0].component_text;
      //-----------------Below for create dish-----------------------------------------
      const comps = {};
      comps.component_text = comp_text;
      comps.display_order = u;
      comps.ingredients = [];
      //-----------------Above for create dish-----------------------------------------

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
            <td>{i.name}</td>
            <td>{i.quantity}</td>
            <td>{i.unit_name}</td>
            <td>{Number(i.price.toFixed(3))}</td>
            <td>{i.base_quantity}</td>
            <td>{i.unit}</td>
            <td>{i.cost}</td>
            <td>{i.ingredient_source}</td>
          </tr>,
        );
        // --------------Below for create dish---------------------------
        const ings = {};
        ings.base_price = i.cost;
        ings.ingredient_id = i.ingredient_id;
        ings.name = i.name;
        ings.cost = i.price;
        ings.quantity = i.quantity;
        ings.base_unit = i.unit;
        ings.unit_id = i.unit_id;
        ings.unit_name = i.unit_name;
        ings.display_order = i.ingredient_display_order;
        ings.ingredient_source = i.ingredient_source;
        comps.ingredients.push(ings);
        // --------------Above for create dish---------------------------
      }
      details4Dish.components.push(comps);
    }
  }

  // console.log("table rows :", tableRows);
  // console.log("data is :", foundRecipeDetails);
  // console.log("details4Dish is :", details4Dish);

  // ---------------------------------------- jsx for the page ------------------------------------------------
  return (
    <div>
      <Navbar />
      <p></p>
      <h1>{foundRecipeDetails?.recipe.name}</h1>
      <h3>{foundRecipeDetails?.recipe.portion_size}</h3>
      <h3>{foundRecipeDetails?.recipe.description}</h3>
      <h5>{foundRecipeDetails?.recipe.privacy}</h5>
      <h3>£ {totalCost}</h3>
      <button onClick={handleCreateDish}>create dish</button>
      <h4>
        Last Prepared on : {foundRecipeDetails?.recipe.date_prepared} @{" "}
        {foundRecipeDetails?.recipe.time_prepared}
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
          {foundRecipeDetails?.steps.map((s) => (
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
