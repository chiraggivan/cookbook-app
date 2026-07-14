import { useNavigate, useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbarOld";
import Button from "../../components/button";
import { HandleDishDelete } from "./utils/handleDishDelete";
import DishDetailsPage from "./-dishDetailsPage";
import { DishContext } from "../../context/dishContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";

function DishDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { dishDetails, setDishDetails } = useContext(DishContext);
  const [foundDish, setFoundDish] = useState();
  const [fetchLoading, setFetchLoading] = useState(true);
  let tableRows = [];
  let ingsDiv = [];

  //----------------------------- delete button function ------------------------------------------------------
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

  // ------------------------------------ Redirect effect -----------------------------------------------------
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // ---------- fetch the data by giving url, method and body(if required) with the help of useFetch HOOK
  const method = "get";
  const url = `${serverURL}/dish/api/${id}`;
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

  //---------------- Create html for table with components and ingredients rows ---------------------------------
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
        ingsDiv.push(
          <div className="flex p-1 justify-between max-w-xl mx-auto font-semibold bg-gray-300 rounded-md px-2">
            {comp_text}
          </div>,
        );
      } else if (u !== 0) {
        ingsDiv.push(
          <div className="flex p-1 justify-between max-w-xl mx-auto font-semibold bg-gray-300 rounded-md px-2">
            {comp_text}
          </div>,
        );
      }

      for (const i of compIngs) {
        ingsDiv.push(
          <div className="flex flex-col max-w-xl mx-auto">
            <div className="flex p-1 justify-between  ">
              <div className="flex">
                <div className="flex min-w-8 text-md items-start justify-end mr-1">
                  {i.quantity}
                </div>
                <div className="flex min-w-12 text-md items-start justify-center mr-1">
                  {capitaliseWords(i.unit_name)}
                </div>
                <div className="flex min-w-20 text-md items-start justify-start mr-2">
                  {capitaliseWords(i.ingredient_name)}
                </div>
              </div>
              <div className="flex flex-col my-0.5">
                <div className="flex min-w-7 text-md justify-end mr-1">£ {i.cost}</div>
                <div className="flex min-w-7 text-sm justify-end mr-1 text-gray-500">
                  £{i.base_price}/{i.base_unit}
                </div>
              </div>
            </div>
            {/* <div className="grow items-center border-t border-gray-400"></div> */}
          </div>,
        );
      }
    }
  }

  // console.log("dishD before jsx: ", foundDish);
  console.log("ingDiv : ", ingsDiv);
  return (
    <>
      <div className="flex flex-col w-auto mt-(--top-bar-height) ml-(--left-side-bar) pt-5">
        <DishDetailsPage
          id={id}
          data={foundDish}
          navigate={navigate}
          // tableRows={tableRows}
          ingsDiv={ingsDiv}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default DishDetails;
