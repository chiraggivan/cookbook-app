import { Routes, Route } from "react-router-dom";
import Login from "./pages/authNhome/login";
import Home from "./pages/authNhome/home";
import RecipeDetails from "./pages/recipe/recipeDetails";
import MyRecipes from "./pages/recipe/myRecipes";
import UserRecipes from "./pages/recipe/userRecipes";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<RecipeDetails />} />
      <Route path="/MyRecipes" element={<MyRecipes />} />
      <Route path="/recipesBy/:id" element={<UserRecipes />} />
    </Routes>
  );
}

export default App;
