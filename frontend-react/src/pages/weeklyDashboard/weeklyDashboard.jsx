import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

function WeeklyDashboard() {
  const params = useParams();
  const weekNo = Number(params.weekNo);
  const planId = Number(params.planId);
  const [aggData, setAggData] = useState();
  const [recipeData, setRecipeData] = useState();
  const [mealData, setMealData] = useState();
  const [ingData, setIngData] = useState();
  const [dayData, setDayData] = useState();
  const [weeklyData, setWeeklyData] = useState();
  const [dashData, setDashData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const currencySymbol = user.currency_symbol;

  const method = "get";
  const url = `/weeklyDashboard/api/getWeeklyDashboard/${weekNo}/${planId}`;

  //   initial fetch
  useEffect(() => {
    try {
      setIsLoading(true);
      const fetchData = async () => {
        const res = await api[method](url);
        console.log("response from bckend is :", res);
        setAggData(res?.data?.data?.aggData);
        setWeeklyData(res?.data?.data?.weeklyData);
        setDayData(res?.data?.data?.dayCostList);
        setMealData(res?.data?.data?.mealCostList);
        setRecipeData(res?.data?.data?.recipeCostList);
        setIngData(res?.data?.data?.ingredientCostList);
        setDashData(res?.data?.data?.dashData);
      };

      fetchData();
    } catch (error) {
      console.log("Error during weeklyDashboard page :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------- loading screen ---------------------------------------------------
  if (isLoading) {
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

  // console.log("aggData :", aggData);
  // console.log("dashData :", dashData);
  // console.log("dayCostList :", dayData);
  // console.log("mealCostList :", mealData);
  // console.log("recipeCostList :", recipeData);
  // console.log("ingredientCostList :", ingData);
  // console.log("weeklyData :", weeklyData);

  return (
    <>
      <div className="flex flex-col max-w-5xl mx-auto bg-gray-50">
        {/* Heading of Dashboard */}
        <div className="mt-5 ml-2 text-3xl font-bold text-gray-800">Dashboard</div>
        {/* aggregate details */}
        {aggData && (
          <div className="flex gap-2 mx-2 text-xs md:text-sm text-gray-800">
            <div className="flex flex-1 my-2 p-2 bg-gray-200 rounded-md  items-center justify-center text-center">
              <div className="flex flex-col">
                <div>
                  <span className="hidden md:inline">Total </span> Meals
                </div>
                <div className="font-bold">{aggData?.total_meals}</div>
              </div>
            </div>
            <div className="flex flex-1 my-2 p-2 bg-gray-200 rounded-md  items-center justify-center text-center">
              <div className="flex flex-col">
                <div>
                  <span className="hidden md:inline">Total </span> Recipes
                </div>
                <div className="font-bold">{aggData?.total_recipes}</div>
              </div>
            </div>

            <div className="flex flex-1 my-2 p-2 bg-gray-200 rounded-md  items-center justify-center text-center">
              <div className="flex flex-col">
                <div>
                  <span className="hidden md:inline">Total </span> Meals
                </div>
                <div className="font-bold">{aggData?.total_ingredients}</div>
              </div>
            </div>
            <div className="flex flex-1 my-2 p-2 bg-gray-200 rounded-md  items-center justify-center text-center">
              <div className="flex flex-col">
                <div>
                  <span className="hidden md:inline">Estimated </span> Cost
                </div>
                <div className="font-bold">
                  {currencySymbol} {aggData?.total_cost}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ingredient lists & recipes list */}
        <div className="flex flex-col m-2 gap-2 md:gap-1 md:flex-row">
          <div className="flex md:flex-6 bg-white pb-1 rounded-md">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-center text-center my-3 font-bold">
                Ingredients list ({ingData?.length || 0})
              </div>
              {/* Table header */}
              <div className="flex gap-0 md:mx-3 text-sm font-bold">
                <div className="p-1 flex flex-1 bg-gray-100 items-center rounded-tl-md">#</div>
                <div className="p-1 flex flex-3 bg-gray-100 items-center">Name</div>
                <div className="p-1 flex flex-5 bg-gray-100 items-center">Quantity</div>
                <div className="p-1 flex flex-2 bg-gray-100 items-center text-center">
                  Cost ({currencySymbol})
                </div>
                <div className="p-1 flex flex-3 bg-gray-100 items-center text-center rounded-tr-md">
                  Priced At ({currencySymbol})
                </div>
              </div>
              {/* table content */}
              <div className="max-h-60 overflow-y-auto scrollbar-none md:scrollbar-thin">
                {ingData &&
                  ingData.map((i, index) => (
                    <div
                      key={index + 1}
                      className={
                        index % 2 === 0
                          ? "flex gap-0 md:mx-3 text-xs"
                          : "flex gap-0 md:mx-3 text-xs bg-gray-50"
                      }
                    >
                      <div className="mx-1 py-1 flex flex-1 items-center">{index + 1}</div>
                      <div className="mr-1 py-1 flex flex-3 items-center">{i.name}</div>
                      <div className="mx-1 py-1 flex flex-5 items-center">{i.easy_quantity}</div>
                      <div className="mx-1 py-1 flex flex-2 items-center justify-end">
                        {i.cost.toFixed(2)}
                      </div>
                      <div className="mx-1 py-1 flex flex-3 items-center">
                        {i.ing_price}/{i.base_unit}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex mt-5 md:mt-0 md:flex-4 bg-white rounded-md">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-center text-center my-3 font-bold">
                Recipes ({recipeData?.length || 0})
              </div>
              {/* Table header */}
              <div className="flex gap-0 md:mx-3 text-sm font-bold">
                <div className="p-1 flex flex-1 bg-gray-100 items-center rounded-tl-md">#</div>
                <div className="p-1 flex flex-5 bg-gray-100 items-center">Name</div>
                <div className="p-1 flex flex-2 bg-gray-100 items-center rounded-tr-md justify-end">
                  Cost ({currencySymbol})
                </div>
              </div>
              {/* table content */}
              <div className="max-h-100 overflow-y-auto scrollbar-none md:scrollbar-thin">
                {recipeData &&
                  recipeData.map((i, index) => (
                    <div
                      key={index + 1}
                      className={
                        index % 2 === 0
                          ? "flex gap-0 md:mx-3 text-xs"
                          : "flex gap-0 md:mx-3 text-xs bg-gray-50"
                      }
                    >
                      <div className="p-1 flex flex-1 items-center">{index + 1}</div>
                      <div className="p-1 flex flex-5 items-center">{i.name}</div>
                      <div className="p-1 flex flex-2 items-center justify-end">
                        {i.recipe_cost.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        {/* charts for meals price and day price */}
        <div className="flex flex-col m-2 gap-2 md:gap-1 md:flex-row">
          {/* meal chart div */}
          <div className="flex md:flex-7 bg-white pb-1 rounded-md">
            <div className="flex flex-col w-full">
              {/* meal chart Heading */}
              <div className="flex items-center justify-center text-center my-3 font-bold">
                Meal Cost Breakdown
              </div>
              <div className=" w-full h-60">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#68ba52">
                      <LabelList dataKey="cost" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="flex md:flex-3 bg-white pb-1 rounded-md"></div>
        </div>
        <div className=""></div>
        <div className=""></div>
      </div>
    </>
  );
}

export default WeeklyDashboard;
