import { Route } from "react-router-dom";

import MyDishes from "../pages/dish/myDishes";
import DishDetails from "../pages/dish/dishDetails";
import MainLayout from "../components/mainLayout";

export const DishRoutes = (
  <>
    <Route
      path="/myDishes"
      element={
        <MainLayout>
          <MyDishes />
        </MainLayout>
      }
    />
    <Route
      path="/dish/:id"
      element={
        <MainLayout>
          <DishDetails />
        </MainLayout>
      }
    />
  </>
);
