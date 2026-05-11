import { Route } from "react-router-dom";
import AdminAllIngredients from "../../pages/admin/ingredient/allIngredients";
import AdminIngredientDetails from "../../pages/admin/ingredient/ingredientDetails";
import AddNewIngredient from "../../pages/admin/ingredient/createIngredient";
// import

export const IngredientRoutes = (
  <>
    <Route path="/admin/ingredients/all" element={<AdminAllIngredients />} />
    <Route path="/admin/ingredient-details/:id" element={<AdminIngredientDetails />} />
    <Route path="/admin/ingredients/new" element={<AddNewIngredient />} />
  </>
);
