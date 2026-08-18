import { useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useSearch } from "../context/globalSearchContext";

function LeftSideBar() {
  const navigate = new useNavigate();
  const role = JSON.parse(localStorage.getItem("user"))?.role ?? "";
  const { setSearchRecipe, setSearchInput } = useSearch();
  useEffect(() => {
    if (!role) {
      navigate("/login");
      return;
    }
  }, []);

  return (
    <>
      <div className="fixed top-(--top-bar-height) left-0   w-(--left-side-bar)  text-gray-800 h-[calc(100vh-var(--top-bar-height))] p-4 z-10 bg-white">
        <div className="flex flex-col justify-between h-full">
          <div>
            <ul className="space-y-6">
              <li>
                <NavLink
                  to="/"
                  onClick={() => {
                    setSearchRecipe("");
                    setSearchInput("");
                  }}
                  className={({ isActive }) =>
                    `block font-medium transition duration-200 ${
                      isActive ? "text-app-primary" : "text-gray-700 hover:text-app-primary"
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/MyRecipes"
                  className={({ isActive }) =>
                    `block font-medium transition duration-200 ${
                      isActive ? "text-app-primary" : "text-gray-700 hover:text-app-primary "
                    }`
                  }
                >
                  My Recipes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/foodplan"
                  className={({ isActive }) =>
                    `block font-medium transition duration-200 ${
                      isActive ? "text-gray-700" : "text-gray-700 hover:text-app-primary"
                    }`
                  }
                >
                  Food Plan
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/myDishes"
                  className={({ isActive }) =>
                    `block font-medium transition duration-200 ${
                      isActive ? "text-app-primary" : "text-gray-700 hover:text-app-primary"
                    }`
                  }
                >
                  Dishes Made
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/myIngredients"
                  className={({ isActive }) =>
                    `block font-medium transition duration-200 ${
                      isActive ? "text-app-primary" : "text-gray-700 hover:text-app-primary"
                    }`
                  }
                >
                  My Ingredients
                </NavLink>
              </li>
            </ul>
          </div>
          {role && role === "admin" && (
            <div className="mb-10">
              <Link
                to="/admin/ingredients/all"
                className={({ isActive }) =>
                  `block font-medium transition duration-200 ${
                    isActive ? "text-app-primary" : "text-gray-700 hover:text-app-primary"
                  }`
                }
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
