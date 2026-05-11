import { Routes, Route } from "react-router-dom";

import { RecipeRoutes } from "./routes/recipeRoutes";
import { AuthNhomeRoutes } from "./routes/authNhomeRoutes";
import { DishRoutes } from "./routes/dishRoutes";
import { IngredientRoutes } from "./routes/admin/ingredientRoutes";
import { UserIngredientRoutes } from "./routes/userIngredientRoutes";

function App() {
  return (
    <Routes>
      {AuthNhomeRoutes}
      {RecipeRoutes}
      {DishRoutes}
      {IngredientRoutes}
      {UserIngredientRoutes}
    </Routes>
  );
}

export default App;
