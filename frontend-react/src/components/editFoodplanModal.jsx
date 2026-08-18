import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import Input from "../components/input";
function EditFoodplanModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  OKtext,
  OKtextIcon,
  cancelText,
  meals,
  selectedMeal,
  setSelectedMeal,
}) {
  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader className="">{title}</ModalHeader>
      <ModalBody>
        <div className="flex w-full">
          <div className="flex flex-1 flex-col">
            <div className="flex">
              <div className="flex items-center">Meal</div>
              <div className="">
                <Input className="w-15 border-gray-300 rounded h-7 ml-1" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm">Recipe:</div>
              <div className="">
                <Input className="rounded border-gray-300 w-30 h-8 text-sm" />
              </div>
            </div>
          </div>
          <div className="mx-1 border-l border-gray-400"></div>
          <div className="flex flex-1 justify-center">window</div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex justify-between w-full text-sm">
          <div className="px-3 py-1 bg-app-primary rounded text-white">Save</div>
          <div
            className="flex py-1 justify-end bg-gray-200 rounded px-3 hover:cursor-pointer hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </div>
        </div>
      </ModalFooter>
      {/* <ModalFooter>
        <Button
          className="border"
          color="success"
          onClick={() => onConfirm({ date: selectedDate, comment: customMsg, meal: selectedMeal })}
        >
          <OKtextIcon className="mr-2 w-5 h-5" />
          {OKtext}
        </Button>
        <Button color="gray" onClick={onClose}>
          {cancelText}
        </Button>
      </ModalFooter> */}
    </Modal>
  );
}

export default EditFoodplanModal;
