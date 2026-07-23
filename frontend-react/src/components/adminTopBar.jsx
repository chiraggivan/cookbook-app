import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function AdminTopBar() {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex items-center justify-start">
        <div
          className=" flex font-extrabold text-2xl tracking-tighter items-center justify-start w-[15%] px-4 py-2 hover:cursor-default"
          onClick={() => navigate("/")}
        >
          eatReci
        </div>
        <div className="flex text-lg text-gray-700">
          <div className="w-30 text-center hover:scale-110 ">
            <Link
              to="/admin/ingredients/all"
              className=" hover:text-black hover:font-semibold transition duration-200"
            >
              Ingredients
            </Link>
          </div>
          <div className="w-30 text-center hover:scale-110 ">
            <Link to="/" className=" hover:text-black hover:font-semibold transition duration-200">
              Recipes
            </Link>
          </div>
          <div className="w-30 text-center hover:scale-110 ">
            <Link to="/" className=" hover:text-black hover:font-semibold transition duration-200">
              Users
            </Link>
          </div>
          <div className="w-30 text-center hover:scale-110 ">
            <Link to="/" className=" hover:text-black hover:font-semibold transition duration-200">
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
