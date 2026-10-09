import { Routes, Route } from "react-router-dom";

import { RecipeRoutes } from "./routes/recipeRoutes";
import { AuthNhomeRoutes } from "./routes/authNhomeRoutes";
import { DishRoutes } from "./routes/dishRoutes";
import { IngredientRoutes } from "./routes/admin/ingredientRoutes";
import { UserIngredientRoutes } from "./routes/userIngredientRoutes";
import { FoodPlanRoutes } from "./routes/foodPlanRoutes";
import { DashboardRoutes } from "./routes/dashboardRoutes";

function App() {
  return (
    <Routes>
      {AuthNhomeRoutes}
      {RecipeRoutes}
      {DishRoutes}
      {IngredientRoutes}
      {UserIngredientRoutes}
      {FoodPlanRoutes}
      {DashboardRoutes}
    </Routes>
  );
}

export default App;
