import { Route } from "react-router-dom";
import MyIngredients from "../pages/userIngredient/myIngredients";
import EditIngredient from "../pages/userIngredient/editMyIngredient";
import AddIngredient from "../pages/userIngredient/createMyIngredient";

export const UserIngredientRoutes = (
  <>
    <Route path="/myIngredients" element={<MyIngredients />} />
    <Route path="/myIngredient/edit" element={<EditIngredient />} />
    <Route path="/myIngredient/new" element={<AddIngredient />} />
  </>
);
