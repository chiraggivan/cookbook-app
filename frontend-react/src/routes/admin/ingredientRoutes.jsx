import { Route } from "react-router-dom";
import AdminAllIngredients from "../../pages/admin/ingredient/allIngredients";
import AdminIngredientDetails from "../../pages/admin/ingredient/ingredientDetails";
import AddNewIngredient from "../../pages/admin/ingredient/createIngredient";
import EditIngredient from "../../pages/admin/ingredient/editIngredient";
// import

export const IngredientRoutes = (
  <>
    <Route path="/admin/ingredients/all" element={<AdminAllIngredients />} />
    <Route path="/admin/ingredient-details/:id" element={<AdminIngredientDetails />} />
    <Route path="/admin/ingredients/new" element={<AddNewIngredient />} />
    <Route path="/admin/ingredients/edit/:id" element={<EditIngredient />} />
  </>
);
