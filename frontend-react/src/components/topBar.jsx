import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils/appUtils";

function TopBar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="fixed top-0 left-0 w-full h-[var(--top-bar-height)]:">
      <div className="flex w-full bg-white  h-16">
        {/* logo section */}
        <div className=" flex font-extrabold text-2xl tracking-tighter items-center justify-start w-[15%] px-4 py-2">
          eatReci
        </div>
        {/* search section */}
        <div className="flex items-center justify-end w-[60%] py-2">
          <input className="border rounded-l-full border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 h-10 w-100 px-4 pb-1 m-1" />
          <button className="border text-xl rounded-r-full border-hidden bg-gray-200 text-gray-700 h-10 px-4 pb-1 m-1 hover:ring-2 hover:ring-gray-600">
            search
          </button>
        </div>

        {/* account section */}
        <div className="flex items-center justify-end w-[25%] pr-1 pl-1 py-2 md:pr-4">
          <button className="h-8  rounded-full bg-gray-200 text-xl text-gray-700 border-hidden px-3 pb-1 mr-1">
            + Create
          </button>
          <div className="flex w-9 h-9 rounded-full bg-blue-400 items-center justify-center">
            {getInitials(user.username)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
