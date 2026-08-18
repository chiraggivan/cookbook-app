import { Route } from "react-router-dom";
import ViewFoodPlan from "../pages/foodPlan/viewFoodPlan";
import MainLayout from "../components/mainLayout";

export const FoodPlanRoutes = (
  <>
    <Route
      path="/foodplan"
      element={
        <MainLayout>
          <ViewFoodPlan />
        </MainLayout>
      }
    />
  </>
);
