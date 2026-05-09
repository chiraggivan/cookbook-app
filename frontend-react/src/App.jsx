import { Routes, Route } from "react-router-dom";

import { RecipeRoutes } from "./routes/recipeRoutes";
import { AuthNhomeRoutes } from "./routes/authNhomeRoutes";
import { DishRoutes } from "./routes/dishRoutes";

function App() {
  return (
    <Routes>
      {AuthNhomeRoutes}
      {RecipeRoutes}
      {DishRoutes}
    </Routes>
  );
}

export default App;
