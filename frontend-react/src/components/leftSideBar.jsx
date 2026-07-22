import { Link } from "react-router-dom";

function LeftSideBar() {
  const role = JSON.parse(localStorage.getItem("user")).role;

  return (
    <>
      <div className="fixed top-(--top-bar-height) left-0   w-(--left-side-bar)  text-gray-800 h-[calc(100vh-var(--top-bar-height))] p-4">
        <div className="flex flex-col justify-between h-full">
          <div>
            <ul className="space-y-6">
              <li>
                <Link
                  to="/"
                  className="block font-medium text-gray-700 hover:text-blue-400 transition duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/MyRecipes"
                  className="block font-medium text-gray-700 hover:text-blue-400 transition duration-200"
                >
                  My Recipes
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="block font-medium text-gray-700 hover:text-blue-400 transition duration-200"
                >
                  Food Plan
                </Link>
              </li>
              <li>
                <Link
                  to="/myDishes"
                  className="block font-medium text-gray-700 hover:text-blue-400 transition duration-200"
                >
                  Dishes Made
                </Link>
              </li>

              <li>
                <Link
                  to="/myIngredients"
                  className="block font-medium text-gray-700 hover:text-blue-400 transition duration-200"
                >
                  My Ingredients
                </Link>
              </li>
            </ul>
          </div>
          {role && role === "admin" && (
            <div className="mb-10">
              <Link
                to="/admin/ingredients/all"
                className="block font-medium text-gray-700 hover:text-red-400 transition duration-200"
              >
                Admin Screen
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LeftSideBar;
