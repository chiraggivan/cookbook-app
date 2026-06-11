import { useNavigate } from "react-router-dom";

function Navbar() {
  const role = JSON.parse(localStorage.getItem("user")).role;
  const navigate = useNavigate();
  return (
    <>
      <nav className="navbar flex justify-between h-16 items-center bg-gray-100">
        <ul className="commonMenu flex ">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/MyRecipes")}>My Recipes</li>
          <li onClick={() => navigate("/")}>Food Plan</li>
          <li onClick={() => navigate("/myDishes")}>Dish Created</li>
          <li onClick={() => navigate("/myIngredients")}>My Ingredients</li>
        </ul>
        {role && role === "admin" && (
          <ul className=" adminMenu flex">
            <li onClick={() => navigate("/admin/ingredients/all")}>Ingredients</li>
            <li>Recipes</li>
            <li>Users</li>
            <li>Dishes</li>
          </ul>
        )}
      </nav>
    </>
  );
}

export default Navbar;
