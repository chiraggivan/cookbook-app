import { Link } from "react-router-dom";

function AdminTopBar() {
  return (
    <>
      <div className="flex items-center justify-start">
        <div className=" flex font-extrabold text-2xl tracking-tighter items-center justify-start w-[15%] px-4 py-2">
          eatReci
        </div>
        <div className="flex text-lg text-gray-700">
          <div className="px-10 hover:scale-110 ">
            <Link to="/" className=" hover:text-black transition duration-200">
              Ingredients
            </Link>
          </div>
          <div className="px-10 hover:scale-110 ">
            <Link to="/" className=" hover:text-black transition duration-200">
              Recipes
            </Link>
          </div>
          <div className="px-10 hover:scale-110 ">
            <Link to="/" className=" hover:text-black transition duration-200">
              Users
            </Link>
          </div>
          <div className="px-10 hover:scale-110 ">
            <Link to="/" className=" hover:text-black transition duration-200">
              Dishes
            </Link>
          </div>
          <div className=""></div>
        </div>
      </div>
    </>
  );
}

export default AdminTopBar;
