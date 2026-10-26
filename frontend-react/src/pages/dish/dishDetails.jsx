import { useNavigate, useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../components/navbarOld";
import Button from "../../components/button";
import api from "../../api/axios";
import { HandleDishDelete } from "./utils/handleDishDelete";
import DishDetailsPage from "./-dishDetailsPage";
import { DishContext } from "../../context/dishContext";
import { capitaliseWords, serverURL } from "../../utils/appUtils";
import formattedDate from "../../utils/formattedDate";
import NotFoundPage from "../../components/notFoundPage";
import { Spinner } from "flowbite-react";

function DishDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const { token: authToken, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { dishDetails, setDishDetails } = useContext(DishContext);
  const [isDetailNotFound, setIsDetailNotFound] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState();
  const [foundDish, setFoundDish] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  let tableRows = [];
  let ingsDiv = [];

  //----------------------------- delete button function ------------------------------------------------------
  const handleDelete = async (e, id, token, navigate) => {
    e.preventDefault();

    try {
      await HandleDishDelete({ id, token, navigate });
      return;
    } catch (err) {
      console.log("catch block Failed to delete item", err);
      // WINDOW ALERT Condition for Demo account
      if (err.response?.status === 403 && err.response?.data?.role === "demo") {
        window.alert(err.response.data?.message || "forbidden to do this.");
        return;
      }
      // console.log(err.response?.foundDish?.message);
      // alert(err.response?.foundDish?.message);
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
  // below variable used during useContext
  const searchDish = dishDetails?.find((d) => d.dish.dish_id === Number(id));
  // ------------------ fetch data from backend only for once if not found in context ---------------------
  useEffect(() => {
    setFoundDish(searchDish);
  }, [dishDetails]);

  useEffect(() => {
    if (!searchDish) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          if (token) {
            const res = await api[method](url);
            console.log("res is :", res);
            setFoundDish(res?.data?.data);
            // setDishDetails((prev) => [...prev, res?.data?.data]);
            setCurrencySymbol(res?.data?.data?.dish?.currency_symbol);
          }
        } catch (err) {
          console.log("error while fetching dish details with axios is :", err.response);
          // Check if dish detail requested for exist. If not then show relevant screen via setIsDetailNotFound
          if (err.response?.status === 404) {
            setIsDetailNotFound(true);
            return;
          }
        } finally {
          setFetchLoading(false);
        }
      };

      fetchData();
    }
  }, []);

  // ------------------------------ Loading screen ---------------------------------
  if (fetchLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner
          theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
          color="default"
          aria-label="Loading"
          size="xl"
        />
      </div>
    );
  }

  //---------------- Create html for table with components and ingredients rows ---------------------------------
  if (foundDish) {
    // console.log("date in found dish is :", foundDish.dish.preparation_date);
    // console.log("type of date is :", typeof foundDish.dish.preparation_date);
    foundDish.dish.preparation_date = formattedDate(foundDish.dish.preparation_date);
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
          <div className="flex p-1 justify-between max-w-xl mx-auto font-semibold bg-gray-300 px-2">
            {comp_text}
          </div>,
        );
      } else if (u !== 0) {
        ingsDiv.push(
          <div className="flex p-1 justify-between max-w-xl mx-auto font-semibold bg-gray-300 px-2">
            {comp_text}
          </div>,
        );
      }

      compIngs.forEach((i, index) => {
        ingsDiv.push(
          <div
            className={
              index % 2 === 0
                ? "flex flex-col max-w-xl mx-auto bg-gray-100"
                : "flex flex-col max-w-xl mx-auto"
            }
          >
            <div className="flex p-1 justify-between  ">
              <div className="flex">
                <div className="flex min-w-8 text-md items-start justify-end mr-1">
                  {i.quantity}
                </div>
                <div className="flex min-w-12 text-md items-start justify-start mr-1">
                  {capitaliseWords(i.unit_name)}
                </div>
                <div className="flex text-md items-start justify-start mr-2">
                  {capitaliseWords(i.ingredient_name)}
                </div>
              </div>
              <div className="flex flex-col min-w-15 my-0.5">
                <div className="flex w-full text-md justify-end mr-1">
                  {currencySymbol} {i.cost.toFixed(3)}
                </div>
                <div className="flex w-full text-sm justify-end mr-1 text-gray-500">
                  {currencySymbol} {i.base_price}/{Number(i.base_quantity)} {i.base_unit}
                </div>
              </div>
            </div>
          </div>,
        );
      });
      // for (const i of compIngs) {
      //   ingsDiv.push(
      //     <div className="flex flex-col max-w-xl mx-auto">
      //       <div className="flex p-1 justify-between  ">
      //         <div className="flex">
      //           <div className="flex min-w-8 text-md items-start justify-end mr-1">
      //             {i.quantity}
      //           </div>
      //           <div className="flex min-w-12 text-md items-start justify-center mr-1">
      //             {capitaliseWords(i.unit_name)}
      //           </div>
      //           <div className="flex min-w-20 text-md items-start justify-start mr-2">
      //             {capitaliseWords(i.ingredient_name)}
      //           </div>
      //         </div>
      //         <div className="flex flex-col my-0.5">
      //           <div className="flex min-w-7 text-md justify-end mr-1">£ {i.cost}</div>
      //           <div className="flex min-w-7 text-sm justify-end mr-1 text-gray-500">
      //             £{i.base_price}/{i.base_unit}
      //           </div>
      //         </div>
      //       </div>
      //     </div>,
      //   );
      // }
    }
  }

  // console.log("dishD before jsx: ", foundDish);
  // console.log("ingDiv : ", ingsDiv);
  return (
    <>
      <div className="flex flex-col mt-[calc(var(--top-bar-height)+15px)] md:mt-(--top-bar-height) md:ml-(--left-side-bar)">
        {isDetailNotFound ? (
          <NotFoundPage />
        ) : (
          <>
            <DishDetailsPage
              id={id}
              data={foundDish}
              navigate={navigate}
              // tableRows={tableRows}
              ingsDiv={ingsDiv}
              handleDelete={handleDelete}
            />
          </>
        )}
      </div>
    </>
  );
}

export default DishDetails;
