import { Route } from "react-router-dom";
import Login from "../pages/authNhome/login";
import Home from "../pages/authNhome/home";
import Register from "../pages/authNhome/register";
import MainLayout from "../components/mainLayout";

export const AuthNhomeRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
    <Route path="/register" element={<Register />} />
  </>
);
