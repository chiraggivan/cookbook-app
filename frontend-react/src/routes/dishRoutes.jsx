import { Route } from "react-router-dom";

import MyDishes from "../pages/dish/myDishes";
import DishDetails from "../pages/dish/dishDetails";

export const DishRoutes = (
  <>
    <Route path="/myDishes" element={<MyDishes />} />
    <Route path="/dish/:id" element={<DishDetails />} />
  </>
);
