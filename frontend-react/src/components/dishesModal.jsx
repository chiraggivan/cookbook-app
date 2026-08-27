import { Modal, Button, ModalHeader, ModalBody, ModalFooter, Datepicker } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Dropdown from "./dropdown";

export default function DishesModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  //   message,
  OKtext,
  OKtextIcon,
  cancelText,
  meals,
  selectedMeal,
  setSelectedMeal,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [customMsg, setCustomMsg] = useState("");
  const [errMsg, SetErrMsg] = useState("");
  const now = new Date();

  // ------------------- default select the current date as preparation date
  useEffect(() => {
    setSelectedDate(now.toISOString().split("T")[0]);
  }, []);

  // --------- check if all required data is available to run the function for handleCreateDish
  const checDataBeforeSubmission = () => {
    if (!selectedMeal) {
      SetErrMsg("Select the meal");
    } else {
      onConfirm({
        date: selectedDate,
        comment: customMsg,
        meal: Number(selectedMeal),
      });
    }
  };

  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader className="m-2">{title}</ModalHeader>
      <ModalBody className="">
        {/* date picker */}
        <div className="flex flex-col md:flex-row">
          <Datepicker
            theme={{
              popup: { footer: { button: { today: "bg-blue-900" } } }, // Tailwind classes for the button
            }}
            className="mr-3"
            maxDate={now}
            value={now}
            title="Dish created on"
            onChange={(date) => {
              setSelectedDate(date.toISOString().split("T")[0]);
            }}
          />
        </div>

        {/* comment/info section */}
        <div>
          <p className="mt-2">Comment/Message :</p>
          <textarea
            className="h-24 mt-3 px-3 border border-gray-400 rounded-md w-full resize-none placeholder:text-gray-300"
            placeholder="Nanny birthday, XMas Meal, etc. Or Added sugarfree substitute"
            onChange={(e) => {
              setCustomMsg(e.target.value);
            }}
          />
        </div>

        <div className="flex md:flex-col space-x-4">
          {/* meal dropdown */}
          <div>
            <Dropdown
              className=" rounded-md border border-gray-400 mt-2"
              title={"Meal: "}
              options={meals}
              optionValueText={"meal_id"}
              optionText={"name"}
              value={selectedMeal}
              onChange={(e) => {
                SetErrMsg("");
                setSelectedMeal(e.target.value);
              }}
            />
          </div>

          {/* errror Msg section */}
          <div className="flex items-center pt-2 h-12 px-1 text-sm text-app-danger">{errMsg}</div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className="border hover:cursor-pointer hover:bg-gray-200"
          color="success"
          onClick={() => {
            // onConfirm({ date: selectedDate, comment: customMsg, meal: selectedMeal });
            checDataBeforeSubmission();
          }}
        >
          <OKtextIcon className="mr-2 w-5 h-5" />
          {OKtext}
        </Button>
        <Button className="hover:cursor-pointer" color="gray" onClick={onClose}>
          {cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
