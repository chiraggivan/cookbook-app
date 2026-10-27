import { Route } from "react-router-dom";
import MySavedRecipes from "../pages/savedRecipe/mySavedRecipes";
import MainLayout from "../components/mainLayout";

export const SavedRecipeRoutes = (
  <>
    <Route
      path="/mySavedRecipes"
      element={
        <MainLayout>
          <MySavedRecipes />
        </MainLayout>
      }
    />
  </>
);
