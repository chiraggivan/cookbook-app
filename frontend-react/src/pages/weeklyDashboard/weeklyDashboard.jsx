import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Pie,
  PieChart,
  Legend,
  Sector,
} from "recharts";

function WeeklyDashboard() {
  const params = useParams();
  const weekNo = Number(params.weekNo);
  const planId = Number(params.planId);
  const [aggData, setAggData] = useState({});
  const [recipeData, setRecipeData] = useState([]);
  const [mealData, setMealData] = useState([]);
  const [ingData, setIngData] = useState([]);
  const [dayData, setDayData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dashData, setDashData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const currencySymbol = user.currency_symbol;

  const [totalMeals, setTotalMeals] = useState(0);
  const isScrnBlwMd = window.innerWidth < 768; // used for converting Mon to M
  const isScrnBlwLg = window.innerWidth < 1024; // used for converting Monday to Mon

  const COLOURS = ["#68ba52", "#facc15", "#60a5fa", "#d44f24"]; // different coolours for pie chart

  const method = "get";
  const url = `/weeklyDashboard/api/getWeeklyDashboard/${weekNo}/${planId}`;

  //   initial fetch
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const res = await api[method](url);
        console.log("response from bckend is :", res);
        setAggData(res?.data?.data?.aggData);
        setWeeklyData(res?.data?.data?.weeklyData);
        setDayData(res?.data?.data?.dayCostList);
        setMealData(res?.data?.data?.mealCostList);
        setRecipeData(res?.data?.data?.recipeCostList);
        setIngData(res?.data?.data?.ingredientCostList);
        setDashData(res?.data?.data?.dashData);
      } catch (error) {
        console.log("Error during weeklyDashboard page :", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // update totalMeals based on mealData
  useEffect(() => {
    setTotalMeals(mealData.length);
  }, [mealData]);

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
  // console.log("isScrnBlwMd :", isScrnBlwMd);
  // console.log("totalMeals :", totalMeals);

  return (
    <>
      <div className="flex flex-col max-w-5xl mx-auto bg-gray-50">
        {/* Heading of Dashboard */}
        <div className="mt-2 ml-2 text-3xl font-bold text-gray-800">Dashboard</div>

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
                  <span className="hidden md:inline">Total </span> Ingrdients
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
        <div className="flex flex-col mx-2 gap-2 md:gap-1 md:flex-row">
          {/* ingredient list */}
          <div className="flex md:flex-6 bg-white pb-1 rounded-md">
            <div className="flex flex-col w-full">
              {/* Ing Div header */}
              <div className="flex items-center justify-center text-center my-3 font-bold">
                Ingredients list ({ingData?.length || 0})
              </div>
              {/* Ing Table header */}
              <div className="flex gap-0 md:mx-3 text-sm text-gray-800 font-bold bg-gray-200 rounded-t-md ">
                <div className="p-1 flex flex-1  items-center ">#</div>
                <div className="p-1 flex flex-3  items-center">Name</div>
                <div className="p-1 flex flex-5  items-center">Quantity</div>
                <div className="p-1 flex flex-2  items-center text-center justify-end">
                  Cost ({currencySymbol})
                </div>
                <div className="p-1 flex flex-3  items-center text-center  justify-end">
                  Priced At ({currencySymbol})
                </div>
              </div>
              {/* Ing table content */}
              <div className="max-h-60 overflow-y-auto scrollbar-none md:scrollbar-thin">
                {ingData &&
                  ingData.map((i, index) => (
                    <div
                      key={index + 1}
                      className={
                        index % 2 === 0
                          ? "flex gap-0 md:mx-3 text-xs"
                          : "flex gap-0 md:mx-3 text-xs bg-gray-100"
                      }
                    >
                      <div className="mx-1 py-1 flex flex-1 items-center">{index + 1}</div>
                      <div className="mr-1 py-1 flex flex-3 items-center">{i.name}</div>
                      <div className="mx-1 py-1 flex flex-5 items-center">{i.easy_quantity}</div>
                      <div className="mx-1 py-1 flex flex-2 items-center justify-end">
                        {i.cost > 100
                          ? Math.ceil(i.cost)
                          : i.cost - Math.floor(i.cost)
                            ? i.cost.toFixed(2)
                            : i.cost}
                      </div>
                      <div className="mx-1 py-1 flex flex-3 items-center justify-end">
                        {i.display_price > 100
                          ? Math.ceil(i.display_price)
                          : i.display_price - Math.floor(i.display_price)
                            ? i.display_price.toFixed(2)
                            : i.display_price}
                        /{i.display_quantity === 1 ? "" : i.display_quantity}
                        {i.display_unit === "l" ? "litre" : i.display_unit}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* recipes list */}
          <div className="flex mt-5 md:mt-0 md:flex-4 bg-white rounded-md">
            <div className="flex flex-col w-full">
              {/* Recipe Div Header */}
              <div className="flex items-center justify-center text-center my-3 font-bold">
                Recipes ({recipeData?.length || 0})
              </div>
              {/* Recipe Table header */}
              <div className="flex gap-0 md:mx-3 text-sm text-gray-800 font-bold bg-gray-200 rounded-t-md">
                <div className="p-1 flex flex-1 items-center ">#</div>
                <div className="p-1 flex flex-5 items-center">Name</div>
                <div className="p-1 flex flex-2 items-center justify-end">
                  Cost ({currencySymbol})
                </div>
              </div>
              {/* Recipe table content */}
              <div className="max-h-60 overflow-y-auto scrollbar-none md:scrollbar-thin">
                {recipeData &&
                  recipeData.map((i, rdindex) => (
                    <div
                      key={rdindex + 1}
                      className={
                        rdindex % 2 === 0
                          ? "flex gap-0 md:mx-3 text-xs"
                          : "flex gap-0 md:mx-3 text-xs bg-gray-100"
                      }
                    >
                      <div className="p-1 flex flex-1 items-center">{rdindex + 1}</div>
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

        {/* Dashboard for weekly data and  charts for meals price and day price */}
        <div className="flex flex-col-reverse my-2 mx-2 gap-2 md:gap-1 md:flex-row">
          {/* weekly meals data */}
          <div className="flex md:flex-7 md:h-70 bg-white pb-1 rounded-md min-w-50">
            <div className="flex flex-col w-full h-full">
              {/* header */}
              <div className="flex p-1 w-full text-center items-center justify-center font-bold">
                Week Details
              </div>

              {/* table for week details */}
              <div className="flex-1 bg-white overflow-y-auto scrollbar-none ">
                {weeklyData &&
                  weeklyData.map((i, windex) => {
                    return (
                      <div
                        key={windex}
                        className="flex my-1 "
                        style={{ height: 25 * i.meals.length }}
                      >
                        {/* day cloumn */}
                        <div className="flex flex-1 min-w-15 items-center justify-center text-center rounded-l-md bg-gray-600 text-white">
                          {isScrnBlwLg ? i.name.slice(0, 3) : i.name}
                        </div>

                        {/* meal column */}
                        <div className="flex flex-col flex-1 pl-1 text-xs border-y border-gray-700">
                          {i.meals.map((m, mindex) => {
                            return (
                              <>
                                <div key={mindex} className="mt-0.5 flex-1 whitespace-nowrap">
                                  {m.name} {m.recipes.length > 0 ? `(${m.recipes.length})` : ""}
                                </div>
                                {mindex < i.meals.length - 1 ? (
                                  <div className="border-b border-gray-300 w-full"></div>
                                ) : (
                                  ""
                                )}
                              </>
                            );
                          })}
                          <div className=""></div>
                        </div>

                        {/* recipe column */}
                        <div className="flex flex-col flex-6 md:flex-4 border-y border-gray-700 min-w-20">
                          {i.meals.map((m, mrindex) => {
                            return (
                              // first creating div for meal type
                              <>
                                <div key={mrindex} className="mt-0.5 flex-1 min-w-0 ">
                                  {/* second - create div as flex for row to have all recipe in same line for one meal*/}
                                  <div className="flex w-full overflow-x-auto scrollbar-none h-full items-center">
                                    {m.recipes.length > 0 ? (
                                      m.recipes.map((r, rindex) => {
                                        return (
                                          <div
                                            key={rindex}
                                            className="shrink-0 whitespace-nowrap text-xs bg-green-100 rounded-full px-1 mx-1"
                                          >
                                            {r.recipe_name}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="flex w-full shrink-0 whitespace-nowrap text-xs rounded-full px-1 mx-1 items-center justify-center">
                                        -
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {mrindex < i.meals.length - 1 ? (
                                  <div className="border-b border-gray-300 w-full"></div>
                                ) : (
                                  ""
                                )}
                              </>
                            );
                          })}
                        </div>

                        {/* meal cost colum */}
                        <div className="flex flex-col flex-1 text-xs border-y border-r rounded-r border-gray-700">
                          {i.meals.map((m, mcindex) => {
                            return (
                              <>
                                <div
                                  key={mcindex}
                                  className=" mt-0.5 pr-1 flex flex-1 justify-end min-w-16"
                                  style={{ paddingRight: m.cost === 0 ? "30px" : "4px" }}
                                >
                                  {m.cost > 0 ? `${currencySymbol} ${m.cost.toFixed(2)}` : "-"}
                                </div>
                                {mcindex < i.meals.length - 1 ? (
                                  <div className="border-b border-gray-300 w-full"></div>
                                ) : (
                                  ""
                                )}
                              </>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* meals and days chart sections */}
          <div className="flex md:flex-3 h-140 md:h-70 ">
            <div className="flex flex-col gap-2 h-full w-full">
              {/* meals chart section*/}
              <div className="flex flex-1 flex-col w-full bg-white pb-1 rounded-md">
                {/* meals chart Heading */}
                <div className="flex items-center justify-center text-center my-1 font-bold">
                  Meal Cost Breakdown
                </div>
                {/* meals chart */}
                <div className="flex-1 w-full ">
                  {mealData && (
                    <ResponsiveContainer className="w-full h-full text-xs">
                      {/* <ResponsiveContainer width="100%" height="100%"> */}
                      <PieChart>
                        <Pie
                          data={mealData}
                          dataKey="meal_cost"
                          nameKey="meal_type"
                          cx="50%"
                          cy="50%"
                          outerRadius="90%"
                          labelLine={(props) => {
                            const { points } = props;
                            const [start, end] = points;

                            const factor = 0.9; // 50% of the original line length
                            const x = start.x + (end.x - start.x) * factor;
                            const y = start.y; // + (end.y - start.y) * factor;

                            return (
                              <path
                                d={`M ${start.x},${start.y} L ${x},${y}`}
                                stroke="#999"
                                fill="none"
                              />
                            );
                          }}
                          label={(props) => {
                            const { cx, cy, midAngle, outerRadius, name, value } = props;
                            const RADIAN = Math.PI / 180;
                            const x = cx + (outerRadius + 24) * Math.cos(-midAngle * RADIAN);
                            const y = cy + (outerRadius + 2) * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                fontSize={11}
                              >
                                {`${value}`}
                              </text>
                            );
                          }}
                          // label
                          shape={(props) => (
                            <Sector {...props} fill={COLOURS[props.index % COLOURS.length]} />
                          )}
                        ></Pie>
                        <Tooltip />
                        <Legend
                          content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-3">
                              {payload.map((entry, plindex) => (
                                <div key={entry.value} className="flex items-center gap-1 text-xs">
                                  <span
                                    className="inline-block w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: COLOURS[plindex % COLOURS.length] }}
                                  />
                                  {entry.value}
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* days chart section*/}
              <div className="flex flex-1 flex-col w-full bg-white pb-1 rounded-md">
                {/* days chart Heading */}
                <div className="flex items-center justify-center text-center my-1 font-bold">
                  Day Cost Breakdown
                </div>
                {/* days chart */}
                <div className="flex-1 w-full ">
                  <ResponsiveContainer className="w-full h-full text-xs">
                    <BarChart data={dayData}>
                      <XAxis
                        dataKey="name"
                        tickFormatter={(name) => (isScrnBlwMd ? name : name.slice(0, 1))}
                      />
                      <YAxis domain={[0, (max) => Math.ceil(max * 1.18)]} />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#68ba52">
                        <LabelList
                          dataKey="cost"
                          position="top"
                          formatter={(value) => Math.ceil(Number(value))}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=""></div>
      </div>
    </>
  );
}

export default WeeklyDashboard;
