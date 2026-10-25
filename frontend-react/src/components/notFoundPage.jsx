import { FaArrowLeft } from "react-icons/fa6";
import { IoMdHome } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage({
  title = "Oops! Page not found.",
  message = "The page you are looking for might have been removed, had its name changed, be private, or you may have entered an incorrect link.",
  homePath = "/",
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 text-7xl">
        <img
          className="max-h-50 max-w-50 md:max-h-75 md:max-w-75"
          src="/images/confused_pot.png"
          alt="Page not found"
        />
      </div>

      <h1 className="mb-2 text-5xl md:text-7xl font-bold font-[Arial] text-gray-700">404</h1>

      <h2 className="mb-4 text-xl md:text-2xl font-semibold text-gray-800">{title}</h2>

      <p className="mb-8 max-w-md text-base leading-7 text-gray-500">{message}</p>

      <button
        onClick={() => navigate(homePath)}
        className="flex items-center rounded-full bg-app-primary opacity-100 px-8 py-3  text-white transition hover:opacity-90 hover:cursor-pointer"
      >
        <IoMdHome className="mr-3 h-6 w-6 mb-1" /> Go to Homepage
      </button>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center mt-5 font-medium text-gray-500 hover:text-gray-800 hover:cursor-pointer"
      >
        <FaArrowLeft className="mr-3" /> Go Back
      </button>
    </div>
  );
}
