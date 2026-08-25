import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Spinner } from "flowbite-react";
import { MdEditNote } from "react-icons/md";
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from "flowbite-react";
import EditFoodplanModal from "../../components/editFoodplanModal";

function ViewFoodPlan() {
  //   const token = localStorage.getItem("token");
  const [foodplanData, setFoodplanData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dayData, setDayData] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [fooplanId, setFooplanId] = useState();

  const method = "get";
  const url = `/foodplan/api/view`;

  const dayName = {
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
    7: "SUNDAY",
  };

  //   ----------------------------------------- fetch food plan data via API from backend ----------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api[method](url);
        // console.log("res is :", res);
        setFoodplanData(res.data?.data);
        setFooplanId(res.data?.data.food_plan_id);
      } catch (error) {
        console.log("Error while fetching data in viewFoodPlan page:", error.response);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ----------------------------------------------- handle edited day plan via API ----------------------------------------
  const handleEditedDayPlan = (data) => {
    const editURL = `/foodplan/api/update`;
    const editMethod = `put`;

    console.log("data about to send is :", data);
    // return;
    const submitData = async () => {
      setIsLoading(true);
      try {
        // console.log("data just before api call :", data);
        const res = await api[editMethod](editURL, data);
        console.log("from backend, data is:", res.data);

        // refetch the foodPlan data from backend to get all updated data
        const response = await api[method](url);
        setFoodplanData(response.data?.data);
        setFooplanId(response.data?.data.food_plan_id);
      } catch (error) {
        console.log("Error while saving edited dayplan data in viewFoodPlan page:", error.response);
      } finally {
        setIsLoading(false);
      }
    };
    submitData();
  };

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

  // console.log("foodplanData is :", foodplanData);
  // console.log("dayData is :", dayData);
  // console.log("food plan id is :", fooplanId);

  return (
    <>
      <div className="mt-(--top-bar-height)  md:ml-(--left-side-bar) md:p-5 ">
        {foodplanData?.food_plan?.length > 0 && (
          <Accordion>
            {foodplanData?.food_plan?.map((week) => (
              <AccordionPanel key={week.week_no}>
                <AccordionTitle>Week {week?.week_no}</AccordionTitle>
                <AccordionContent>
                  {week?.weekly_meals.map((day) => (
                    <div key={day.day_no} className="my-5">
                      <div className="flex flex-col border border-app-primary">
                        {/* day name */}
                        <div className="flex py-1 px-2 bg-app-primary text-white font-semibold">
                          {dayName[day.day_no]}
                        </div>
                        {/* day plan section */}
                        <div className="min-h-30">
                          {day.daily_meals.map((meal) => (
                            <div className="">
                              {/* header */}
                              <div className="flex mx-2 text-sm font-semibold">
                                {foodplanData.meals.find((i) => i.meal_id === meal.meal_id).name}
                              </div>
                              {meal.recipes.map((item, index) => (
                                <div className="flex  text-sm">
                                  {/* sr no */}
                                  <div className="flex min-w-5 justify-end bg-amber-50">
                                    {index + 1}.
                                  </div>
                                  {/* recipe name */}
                                  <div className=" flex-1 line-clamp-2">{item.recipe_name}</div>
                                  {/* optional Price */}
                                  {/* <div className="">£ {item.cost}</div> */}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        {/* edit button at the bottom */}
                        <div className="flex p-2 justify-end">
                          <div
                            className="rounded bg-app-primary text-white px-3 py-1 hover:cursor-pointer hover:bg-green-800"
                            onClick={() => {
                              setDayData(day);
                              setWeekData(week);
                              setIsOpen(true);
                            }}
                          >
                            Edit
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionPanel>
            ))}
          </Accordion>
        )}
      </div>
      {isOpen && (
        <EditFoodplanModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleEditedDayPlan}
          title={"Food Planing"}
          OKtext={"save"}
          OKtextIcon={MdEditNote}
          cancelText={"cancel"}
          dayData={dayData}
          weekData={weekData}
          foodplanId={fooplanId}
          meals={foodplanData.meals}
        />
      )}
    </>
  );
}

export default ViewFoodPlan;
