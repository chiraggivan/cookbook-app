import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  OKtext,
  cancelText,
}) {
  return (
    <Modal size="lg" show={isOpen} onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
        {message}
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
