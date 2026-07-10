import { Route } from "react-router-dom";
import MyIngredients from "../pages/userIngredient/myIngredients";
import EditIngredient from "../pages/userIngredient/editMyIngredient";
import AddIngredient from "../pages/userIngredient/createMyIngredient";
import MainLayout from "../components/mainLayout";

export const UserIngredientRoutes = (
  <>
    <Route
      path="/myIngredients"
      element={
        <MainLayout>
          <MyIngredients />
        </MainLayout>
      }
    />
    <Route
      path="/myIngredient/edit"
      element={
        <MainLayout>
          <EditIngredient />
        </MainLayout>
      }
    />
    <Route
      path="/myIngredient/new"
      element={
        <MainLayout>
          <AddIngredient />
        </MainLayout>
      }
    />
  </>
);
