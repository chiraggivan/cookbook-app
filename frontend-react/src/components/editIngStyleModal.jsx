import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Input from "./input";
import DropdownArray from "./dropdownArray";
import { useEffect, useState } from "react";
import { FaBalanceScaleRight } from "react-icons/fa";
import { BiSolidEditAlt } from "react-icons/bi";
import { capitaliseWords } from "../utils/appUtils";

export default function EditIngStyleModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  ingName,
  prepStyle,
  placeholder,
  OKtext,
  OKtextIcon,
  cancelText,
  quantityValue,
  unitValue,
  baseUnits,
  priceValue,
  compUid,
  ingUid,
  currencySymbol,
}) {
  const [newStyle, setNewStyle] = useState(prepStyle);

  // --------------- onSubmit logic ------------------
  const handleSubmit = () => {
    onConfirm(compUid, ingUid, newStyle);
  };

  return (
    <Modal size="md" show={isOpen} onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          {/* Icon at the top */}
          <BiSolidEditAlt className="mx-auto mb-4 h-18 w-18 text-gray-700" />

          {/*  Message */}
          <div className="mb-5 text-start text-lg font-normal text-gray-700 dark:text-gray-400">
            {message} <span className="font-semibold">{capitaliseWords(ingName)}</span>
          </div>

          {/* 1st row of modal */}
          <div className="flex text-start">
            <input
              className=" h-10 px-2 text-sm w-full rounded-lg border border-gray-400 placeholder:text-gray-400"
              value={newStyle}
              placeholder={placeholder}
              maxLength={18}
              onChange={(e) => {
                setNewStyle(e.target.value);
              }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex justify-center mt-5 gap-4">
            {/* Ok Button */}
            <Button
              type="button"
              className={"bg-blue-900 hover:cursor-pointer"}
              color="dark"
              onClick={handleSubmit}
            >
              <OKtextIcon className=" h-5 w-5 mr-2" />
              {OKtext}
            </Button>

            {/* Cancel Button */}
            <Button className="hover:cursor-pointer" color="alternative" onClick={onClose}>
              {cancelText}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
