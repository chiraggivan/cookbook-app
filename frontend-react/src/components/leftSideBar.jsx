import { Link } from "react-router-dom";

function LeftSideBar() {
  return (
    <>
      <div className="fixed top-(--top-bar-height) left-0  w-(--left-side-bar)  text-gray-800 min-h-screen p-4">
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
    </>
  );
}

export default LeftSideBar;
