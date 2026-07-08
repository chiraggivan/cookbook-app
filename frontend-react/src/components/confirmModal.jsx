import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  OKtext,
  OKtextIcon,
  cancelText,
}) {
  return (
    <Modal size="md" show={isOpen} onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-18 w-18 text-red-600" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{message}</h3>
          <div className="flex justify-center gap-4">
            <Button color="red" onClick={onConfirm}>
              <OKtextIcon className=" h-5 w-5 mr-2" />
              {OKtext}
            </Button>
            <Button color="alternative" onClick={onClose}>
              {cancelText}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
