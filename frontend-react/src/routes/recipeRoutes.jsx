import { Route } from "react-router-dom";
import RecipeDetails from "../pages/recipe/recipeDetails";
import MyRecipes from "../pages/recipe/myRecipes";
import UserRecipes from "../pages/recipe/userRecipes";
import NewRecipe from "../pages/recipe/newRecipe";

export const RecipeRoutes = (
  <>
    <Route path="/recipe/:id" element={<RecipeDetails />} />
    <Route path="/MyRecipes" element={<MyRecipes />} />
    <Route path="/recipesBy/:id" element={<UserRecipes />} />
    <Route path="/recipe/new" element={<NewRecipe />} />
  </>
);
