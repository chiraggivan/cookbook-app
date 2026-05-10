import { Routes, Route } from "react-router-dom";

import { RecipeRoutes } from "./routes/recipeRoutes";
import { AuthNhomeRoutes } from "./routes/authNhomeRoutes";
import { DishRoutes } from "./routes/dishRoutes";
import { IngredientRoutes } from "./routes/admin/ingredientRoutes";

function App() {
  return (
    <Routes>
      {AuthNhomeRoutes}
      {RecipeRoutes}
      {DishRoutes}
      {IngredientRoutes}
    </Routes>
  );
}

export default App;
