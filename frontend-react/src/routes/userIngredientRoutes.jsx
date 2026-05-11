import { Route } from "react-router-dom";
import MyIngredients from "../pages/userIngredient/myIngredients";

export const UserIngredientRoutes = (
  <>
    <Route path="/myIngredients" element={<MyIngredients />} />
    {/* <Route path="/MyRecipes" element={<MyRecipes />} />
    <Route path="/recipesBy/:id" element={<UserRecipes />} /> */}
  </>
);
