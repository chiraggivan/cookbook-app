// import Button from "../../components/button";
import { Button } from "flowbite-react";
import { capitaliseWords } from "../../utils/appUtils";
import { HiTrash } from "react-icons/hi";
import ConfirmModal from "../../components/confirmModal";
import { useState } from "react";
import { GiHotMeal, GiHotSpices, GiMeal } from "react-icons/gi";

function DishDetailsPage({ id, data, ingsDiv, navigate, handleDelete }) {
  const token = localStorage.getItem("token");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  return (
    <>
      <div className="flex px-2 w-full max-w-xl mx-auto flex-col mt-4">
        {/* Dish name header */}
        <div className=" flex mr-auto text-3xl font-semibold">
          {capitaliseWords(data?.dish?.recipe_name)}
        </div>
        {/* dish description + image */}
        <div className="flex flex-col-reverse mt-3 md:w-full md:flex-row md:justify-between">
          <div className="">
            <p>Portion size: {data?.dish?.portion_size}</p>

            <p>Meal type: {data?.dish?.meal}</p>
            <p>Cost : £ {data?.dish?.total_cost}</p>
            <p>
              Prepared on : {data?.dish?.preparation_date} @ {data?.dish?.time_prepared}
            </p>
          </div>
          <div className="flex w-40 h-40 bg-gray-200 rounded-lg md:items-end md:mx-0">
            <GiMeal className="w-full h-full" />
          </div>
        </div>
        {/* comment and delete button  */}
        <div className="flex flex-col mt-3 md:w-full md:flex-row md:space-x-4 md:justify-between ">
          {/* comment */}
          <div className="flex items-center text-justify max-w-md mb-2 md:mb-0 lg:max-w-lg">
            <p className=" ">
              <span className="text-lg font-bold">Comment:</span> {data?.dish?.comment}
            </p>
          </div>
          {/* delete button */}
          <div className="items-start ">
            <Button
              className="cursor-pointer w-38"
              color="red"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <HiTrash className="mr-2 w-5 h-5" />
              Delete Dish
            </Button>
          </div>
        </div>

        {/* Top Line Separator */}
        <div className="my-3 ">
          <div className="grow h-px  bg-gray-300"></div>
        </div>

        {/* ingredients table */}
        <div className="">{ingsDiv}</div>

        {/* Bottom Line Separator */}
        <div className="flex mb-10 items-center">
          <div className="grow h-px bg-gray-300 "></div>
        </div>
      </div>
      {/* modal for delete dish */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={(e) => handleDelete(e, id, token, navigate)}
          title={"Delete Dish"}
          message={`Are you sure to delete - ${capitaliseWords(data?.dish?.recipe_name)} ?`}
          OKtext={"Delete"}
          OKtextIcon={HiTrash}
          cancelText={"Cancel"}
        />
      )}
    </>
  );
}

export default DishDetailsPage;
