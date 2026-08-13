// import Button from "../../components/button";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { capitaliseWords } from "../../utils/appUtils";
import { HiPrinter, HiTrash } from "react-icons/hi";
import ConfirmModal from "../../components/confirmModal";
import { useState } from "react";
import { GiHotMeal, GiHotSpices, GiMeal } from "react-icons/gi";
import { SlOptionsVertical } from "react-icons/sl";

function DishDetailsPage({ id, data, ingsDiv, navigate, handleDelete }) {
  const token = localStorage.getItem("token");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="flex flex-col px-2 w-full max-w-xl mx-auto  mt-4">
        {/* Dish name header  and option button*/}
        <div className="flex">
          {/* Dish name header */}
          <div className="flex flex-1 mr-auto text-3xl font-semibold">
            {capitaliseWords(data?.dish?.recipe_name)}
          </div>

          {/* option button */}
          <div className="flex w-10 h-10  text-app-primary hover:bg-gray-300 rounded-full transition duration-300">
            {
              // top-1/2 -translate-y-1/2
            }

            <Dropdown
              className=""
              label=""
              dismissOnClick={false}
              renderTrigger={() => (
                <span className="flex w-full h-full items-center justify-center ">
                  <SlOptionsVertical className="w-6 h-6 " />
                </span>
              )}
            >
              <DropdownItem className="flex gap-2 text-gray-300 hover:bg-white hover:cursor-default">
                <HiPrinter className="w-4 h-4" /> Print
              </DropdownItem>

              <DropdownItem
                className="flex gap-2 text-sm text-app-danger"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                <HiTrash className=" w-4 h-4" />
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* dish description + image */}
        <div className="flex flex-col-reverse mt-3 md:w-full md:flex-row md:justify-between">
          <div className="">
            <p>Portion size: {data?.dish?.portion_size}</p>

            <p>Meal type: {data?.dish?.meal}</p>
            <p>Cost: £ {data?.dish?.total_cost}</p>
            <p>
              Prepared: {data?.dish?.preparation_date} for {data?.dish?.meal}
            </p>
          </div>
          <div className="flex aspect-video bg-gray-200 rounded-lg md:h-35">
            {/* <GiMeal className="flex mx-auto w-auto h-full justify-center" /> */}
            {data?.dish?.image_url && !imageError ? (
              <img
                className="object-cover rounded-md"
                src={data?.dish?.image_url}
                alt="Recipe Image"
                onError={() => setImageError(true)}
              />
            ) : (
              <GiMeal className="flex mx-auto w-auto h-full justify-center bg-gray-200" />
            )}
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
          {/* <div className="items-start ">
            <Button
              className="cursor-pointer w-38"
              color="red"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <HiTrash className="mr-2 w-5 h-5" />
              Delete Dish
            </Button>
          </div> */}
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
