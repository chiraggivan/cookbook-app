import { Route } from "react-router-dom";
import RecipeDetails from "../pages/recipe/recipeDetails";
import MyRecipes from "../pages/recipe/myRecipes";
import UserRecipes from "../pages/recipe/userRecipes";

export const RecipeRoutes = (
  <>
    <Route path="/recipe/:id" element={<RecipeDetails />} />
    <Route path="/MyRecipes" element={<MyRecipes />} />
    <Route path="/recipesBy/:id" element={<UserRecipes />} />
  </>
);
