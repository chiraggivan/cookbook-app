import { useState } from "react";

function ToggleSwitchC() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex items-center">
      <div
        onClick={() => setIsOn(!isOn)}
        className="relative inline-flex items-center cursor-pointer w-12 h-6"
      >
        <span
          className={`absolute inset-0 w-full h-full bg-gray-300 rounded-full transition duration-300 ${isOn ? "bg-gray-600" : "bg-gray-300"}`}
        />

        <span
          className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${isOn ? "translate-x-6" : "translate-x-0"}`}
        ></span>
      </div>
      <span className="mr-3">Private</span>
    </div>
  );
}

export default ToggleSwitchC;
