// import Button from "../../components/button";
import { Button } from "flowbite-react";
import { capitaliseWords } from "../../utils/appUtils";
import { HiTrash } from "react-icons/hi";
import ConfirmModal from "../../components/confirmModal";
import { useState } from "react";

function DishDetailsPage({ id, data, tableRows, ingsDiv, navigate, handleDelete }) {
  const token = localStorage.getItem("token");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  return (
    <>
      <div className="flex px-2 flex-col mt-4">
        {/* Dish name header */}
        <div className="text-3xl font-semibold">{capitaliseWords(data?.dish?.recipe_name)}</div>
        {/* dish description header */}
        <div className="flex flex-col-reverse mt-3 md:flex-row md:justify-between">
          <div className="">
            <p>Portion size: {data?.dish?.portion_size}</p>

            <p>Meal type: {data?.dish?.meal}</p>
            <p>Cost : £ {data?.dish?.total_cost}</p>
            <h4>
              Prepared on : {data?.dish?.preparation_date} @ {data?.dish?.time_prepared}
            </h4>
          </div>
          <div className="flex mx-auto w-40 h-40 bg-amber-200 md:items-end md:mx-0"></div>
        </div>
        {/* comment and delete button  */}
        <div className="flex flex-col my-2 md:flex-row md:mx-auto md:min-w-xl">
          <div className="flex w-full justify-between">
            {/* comment */}
            <div className="flex items-center max-w-md mb-2 md:mb-0 lg:max-w-lg">
              <p className=" ">
                <span className="text-lg font-bold">Comment:</span> {data?.dish?.comment}
              </p>
            </div>
            {/* delete button */}
            <div className="items-start">
              <Button
                className="cursor-pointer"
                color="red"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                <HiTrash className="mr-2 w-5 h-5" />
                Delete Dish
              </Button>
            </div>
          </div>
        </div>
        <div className="">{ingsDiv}</div>
      </div>

      <h1>{data?.dish?.recipe_name}</h1>
      <h3>Portion size: {data?.dish?.portion_size}</h3>
      <h3>Comment: {data?.dish?.comment}</h3>
      <h5>Meal type: {data?.dish?.meal}</h5>
      <h3>Cost : £ {data?.dish?.total_cost}</h3>
      <h4>
        Prepared on : {data?.dish?.preparation_date} @ {data?.dish?.time_prepared}
      </h4>

      <Button children={"Delete Dish"} onClick={(e) => handleDelete(e, id, token, navigate)} />
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
            <th>Ing Source</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
      {/* <table>
        <thead>
          <tr>
            <th>Sr-No.</th>
            <th>Steps Description</th>
          </tr>
        </thead>
        <tbody>
          {data?.steps.map((s) => (
            <tr key={s.step_order}>
              <td>{s.step_order}</td>
              <td>{s.step_text}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={(e) => handleDelete(e, id, token, navigate)}
          title={"Delete Dish"}
          message={`Are you sure to delete - ${capitaliseWords(data?.dish?.recipe_name)} ?`}
          OKtext={"Delete"}
          OKtextIcon={HiTrash}
          cancelText={"No, Are you crazy"}
        />
      )}
    </>
  );
}

export default DishDetailsPage;
