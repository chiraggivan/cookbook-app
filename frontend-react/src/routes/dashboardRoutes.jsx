import { Route } from "react-router-dom";
import WeeklyDashboard from "../pages/weeklyDashboard/weeklyDashboard";

export const DashboardRoutes = (
  <>
    <Route path="/dashboard/:weekNo/:planId" element={<WeeklyDashboard />} />
  </>
);
