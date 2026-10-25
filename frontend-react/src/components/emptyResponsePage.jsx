import { BsCursorFill } from "react-icons/bs";

import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function EmptyResponsePage({
  title = "Oops! Page empty.",
  message = "No data arrived to be displayed.",
  urlPath = "/",
  imageSrc = "",
  ButtonText = "Ok",
  ButtonIcon = BsCursorFill,
  hideButton = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 text-7xl">
        <img
          className="max-h-50 max-w-50 md:max-h-75 md:max-w-75"
          src={imageSrc}
          alt="Empty Page"
        />
      </div>

      <h2 className="mb-4 text-xl md:text-2xl font-semibold text-gray-800">{title}</h2>

      <p className="mb-8 max-w-md text-base leading-7 text-gray-500">{message}</p>

      <button
        onClick={() => navigate(urlPath)}
        className="flex items-center rounded-full bg-app-primary opacity-100 px-8 py-3 text-white transition hover:opacity-90 hover:cursor-pointer"
      >
        {ButtonIcon && <ButtonIcon className="mr-3 h-6 w-6 mb-1" />}
        {ButtonText}
      </button>

      <button
        hidden={hideButton}
        onClick={() => navigate(-1)}
        className="flex items-center mt-5 font-medium text-gray-500 hover:text-gray-800 hover:cursor-pointer"
      >
        <FaArrowLeft className="mr-3" /> Go Back
      </button>
    </div>
  );
}
