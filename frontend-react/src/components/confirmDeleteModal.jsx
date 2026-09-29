import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmDeleteModal({
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
          <div className="mb-2 text-lg font-normal text-gray-700 dark:text-gray-400">{message}</div>
          <div className="mb-8 text-sm text-gray-500">
            {" "}
            <span className="text-red-600">Warning:</span> Deleting this ingredient will remove it
            from your active ingredients and will affect recipes that use this ingredient or its
            measurement units.{" "}
            <span className="font-semibold text-gray-700">This action cannot be undone.</span>
          </div>
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
