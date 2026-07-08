import { Modal, Button, ModalHeader, ModalBody, ModalFooter, Datepicker } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function DishesModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  //   message,
  OKtext,
  OKtextIcon,
  cancelText,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [customMsg, setCustomMsg] = useState("");
  const now = new Date();

  // default select the current date as preparation date
  useEffect(() => {
    setSelectedDate(now.toISOString().split("T")[0]);
  }, []);

  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader className="m-2">{title}</ModalHeader>
      <ModalBody>
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

          {/* <div className="flex">
            <div>Time Date: </div>
            <input type="time" className=" px-2 text-amber-200" placeholder="" />
          </div> */}
        </div>
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
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          className="border"
          color="success"
          onClick={() => onConfirm({ date: selectedDate, comment: customMsg })}
        >
          <OKtextIcon className="mr-2 w-5 h-5" />
          {OKtext}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
