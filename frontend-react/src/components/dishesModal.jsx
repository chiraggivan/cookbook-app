import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";

export default function DishesModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  //   message,
  OKtext,
  cancelText,
}) {
  const now = new Date();
  const currentDate = now.toLocaleDateString();
  const currentTime = now.toLocaleTimeString();
  console.log("date and time is :", currentDate, " ", currentTime);

  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col md:flex-row">
          <div className="flex">
            <div>Prepared Date: </div>
            <input
              type="date"
              className="border p-2 rounded"
              placeholder="dd/mm/yyyy"
              value={currentDate}
            />
          </div>
          <div className="flex">
            <div>Time Date: </div>
            <input type="time" className=" px-2" placeholder="" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          {cancelText}
        </Button>
        <Button color="success" onClick={onConfirm}>
          {OKtext}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
