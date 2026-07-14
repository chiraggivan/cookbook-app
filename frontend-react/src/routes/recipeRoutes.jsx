import { Route } from "react-router-dom";
import RecipeDetails from "../pages/recipe/recipeDetails";
import MyRecipes from "../pages/recipe/myRecipes";
import UserRecipes from "../pages/recipe/userRecipes";
import NewRecipe from "../pages/recipe/newRecipe2";
import EditRecipe from "../pages/recipe/editRecipe";
import MainLayout from "../components/mainLayout";

export const RecipeRoutes = (
  <>
    <Route
      path="/recipe/:id"
      element={
        <MainLayout>
          <RecipeDetails />
        </MainLayout>
      }
    />
    <Route
      path="/MyRecipes"
      element={
        <MainLayout>
          <MyRecipes />
        </MainLayout>
      }
    />
    <Route
      path="/recipesBy/:id"
      element={
        <MainLayout>
          <UserRecipes />
        </MainLayout>
      }
    />
    <Route
      path="/recipe/new"
      element={
        <MainLayout>
          <NewRecipe />
        </MainLayout>
      }
    />
    <Route
      path="/recipe/edit/:id"
      element={
        <MainLayout>
          <EditRecipe />
        </MainLayout>
      }
    />
  </>
);
