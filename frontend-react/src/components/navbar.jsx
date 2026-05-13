import { useNavigate } from "react-router-dom";

function Navbar() {
  const role = JSON.parse(localStorage.getItem("user")).role;
  const navigate = useNavigate();
  return (
    <>
      <h1>Navigation Bar...</h1>
      <div>
        <span onClick={() => navigate("/")}>Home\</span>
        <span onClick={() => navigate("/MyRecipes")}>My Recipes\</span>
        <span onClick={() => navigate("/")}>Food Plan\</span>
        <span onClick={() => navigate("/myDishes")}>Dish Created\</span>
        <span onClick={() => navigate("/myIngredients")}>My Ingredients</span>
      </div>
      {role && role === "admin" && (
        <div>
          <span onClick={() => navigate("/admin/ingredients/all")}>Ingredients\</span>
          <span>Recipes\</span>
          <span>Users\</span>
          <span>Dishes\</span>
        </div>
      )}
    </>
  );
}

export default Navbar;
