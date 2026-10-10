import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../../api/axios";

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
  const [isLoading, setIsLoading] = useState(true);

  const method = "get";
  const url = `/weeklyDashboard/api/getWeeklyDashboard/${weekNo}/${planId}`;

  //   initial fetch
  useEffect(() => {
    try {
      setIsLoading(true);
      const fetchData = async () => {
        const res = await api[method](url);
        console.log("response from bckend is :", res);
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

  //   console.log("params are :", params);
  //   console.log("week no is :", weekNo);
  //   console.log("plan no is :", planId);
  return <>Entered in dashboard</>;
}

export default WeeklyDashboard;
