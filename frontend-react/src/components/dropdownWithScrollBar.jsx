import { useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

const DropdownWithScrollBar = ({
  title,
  options,
  value,
  optionValueText,
  optionText,
  onChange,
  placeholder = "Select",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option[optionValueText] === value);
  //   console.log("selectedOption :", selectedOption);

  return (
    <div className="relative w-full text-gray-800">
      {title && (
        <div className="pb-1 text-gray-700">
          <label className="font-semibold">{title}</label>
        </div>
      )}

      {/* First div: Dropdown button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full border border-slate-300 rounded-lg p-3 cursor-pointer bg-white justify-between "
      >
        <div> {selectedOption ? selectedOption[optionText] : placeholder}</div>
        <div className="flex items-center ">
          <FaAngleDown />
        </div>
      </div>

      {/* Second div: Scrollable options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                onChange(option[optionValueText]);
                setIsOpen(false);
              }}
              className="p-1 cursor-pointer hover:bg-slate-100 border-b border-slate-100"
            >
              {option[optionText]}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-normal px-2">{error}</p>}
    </div>
  );
};

export default DropdownWithScrollBar;
