import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils/appUtils";
import Input from "./input";
import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlinePlus } from "react-icons/hi";
import { BsPlusCircleDotted } from "react-icons/bs";

function TopBar() {
  const user = JSON.parse(localStorage.getItem("user")) ?? "";
  const navigate = new useNavigate();
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-(--top-bar-height) ">
      <div className="flex flex-col w-full bg-white md:flex-row md:justify-between">
        <div className="flex w-full md:w-auto">
          {/* hamburger */}
          <div className="block pl-2 min-w-10 min-h-10 md:hidden">
            <GiHamburgerMenu className="h-full w-full" />
          </div>

          {/* logo section */}
          <div
            className=" flex flex-1 font-extrabold text-2xl tracking-tighter  px-4 py-2 items-center justify-center md:flex-none md:justify-start"
            onClick={() => navigate("/")}
          >
            eatReci
          </div>

          {/* counter space for hamburger */}
          <div className="block pr-2 min-w-10 min-h-10 md:hidden">
            <BsPlusCircleDotted className="h-full w-full" onClick={() => navigate("/recipe/new")} />
          </div>
        </div>

        <div className="">
          {/* search section */}
          <div className="flex items-center justify-center w-full p-2">
            <input
              value={searchInput}
              className="border rounded-l-full border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 h-10 w-100 px-4 pb-1 m-1"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              className="border text-xl rounded-r-full border-hidden bg-gray-200 text-gray-700 h-10 px-4 pb-1 m-1 
                            hover:cursor-pointer hover:ring-2 hover:ring-gray-600"
              onClick={() =>
                navigate(`/?q=${searchInput.trim().replace(/\s+/g, " ").toLowerCase()}`)
              }
            >
              search
            </button>
          </div>
        </div>

        {/* account section */}
        <div className="hidden md:flex items-center justify-end w-[25%] pr-1 pl-1 py-2 md:pr-4">
          <button
            onClick={() => navigate("/recipe/new")}
            className="h-8  rounded-full  border-hidden px-3 pb-1 mr-1 cursor-pointer text-gray-800 bg-gray-200 text-xl hover:bg-gray-300 transition "
          >
            + Create
          </button>
          <div className="flex w-9 h-9 rounded-full bg-blue-400 items-center justify-center">
            {getInitials(user?.username)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
