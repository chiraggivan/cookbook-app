import { Modal, Button, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Input from "./input";
import DropdownArray from "./dropdownArray";
import { useEffect, useState } from "react";

export default function EditBaseValuesModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  OKtext,
  OKtextIcon,
  cancelText,
  quantityValue,
  unitValue,
  baseUnits,
  priceValue,
  compUid,
  ingUid,
}) {
  const [updateQuantity, setUpdateQuantity] = useState(quantityValue);
  const [updateUnit, setUpdateUnit] = useState(unitValue);
  const [updatePrice, setUpdatePrice] = useState(priceValue);
  const [disableButton, setDisbleButton] = useState(false);

  // ----------------------- verify data before activating update button -----------------------------
  useEffect(() => {
    if (!Number(updatePrice) || !Number(updateQuantity) || !updateUnit) {
      setDisbleButton(true);
    } else {
      setDisbleButton(false);
    }
  }, [updatePrice, updateQuantity, updateUnit]);

  // ------------------------ function to validate INPUT for number Allowing [0123456789.] ----------------------
  function validateInput(updateInputField, InputField, value, maxDecimals, maxLength) {
    // Define a regex for one optional decimal with up to maxDecimals digits
    const regex = new RegExp(`^\\d+(\\.\\d{0,${maxDecimals}})?$`);

    // Check the length and zeroes
    if ((regex.test(value) || value.length === 0) && value.length <= maxLength + 1) {
      // get the input field
      const checkInputField = InputField;

      // dis allow continous zeros
      if (checkInputField === "0" && value === "00") {
        return;
      }

      // if everything fine then update the input field
      updateInputField(value);
    }
  }

  return (
    <Modal size="md" show={isOpen} onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          {/* <HiOutlineExclamationCircle className="mx-auto mb-4 h-18 w-18 text-red-600" /> */}
          <div className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{message}</div>
          {/* 1st row of modal */}
          <div className="flex justify-between space-x-5">
            {/* Quantity */}
            <div className="flex flex-1 items-center justify-end">
              <span className="text-xs sm:text-md">Quantity:</span>
              <span>
                <Input
                  className="ml-1 text-sm max-w-18 h-8 rounded border border-gray-400"
                  value={updateQuantity}
                  onChange={(e) => {
                    validateInput(setUpdateQuantity, updateQuantity, e.target.value, 3, 5);
                  }}
                />
              </span>
            </div>

            {/* Units */}
            <div className="flex flex-1 items-center justify-center">
              <span className="text-xs sm:text-md">Unit:</span>
              <span>
                <DropdownArray
                  key={updateUnit ?? ""}
                  className="flex w-full ml-1 rounded border border-gray-400 text-sm h-8 py-0  pl-1"
                  options={baseUnits}
                  value={updateUnit ?? ""}
                  onChange={(e) => {
                    setUpdateUnit(e.target.value);
                  }}
                />
              </span>
            </div>
          </div>

          {/* 2nd row of modal */}
          <div className="flex justify-between space-x-5 mt-2">
            {/* Price */}
            <div className="flex flex-1 items-center justify-end">
              <span className="text-xs sm:text-md">Price:</span>
              <span>
                <Input
                  className="ml-1 max-w-18 h-8 rounded border border-gray-400"
                  value={updatePrice}
                  onChange={(e) => validateInput(setUpdatePrice, updatePrice, e.target.value, 2, 5)}
                />
              </span>
            </div>
            {/* empty for aligning input fields */}
            <div className="flex flex-1"></div>
          </div>

          <div className="flex justify-center mt-5 gap-4">
            <Button
              className={`${disableButton ? "bg-blue-300" : "bg-blue-900 hover:cursor-pointer"}`}
              color="dark"
              disabled={disableButton}
              onClick={() => onConfirm(compUid, ingUid, updateQuantity, updateUnit, updatePrice)}
            >
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
