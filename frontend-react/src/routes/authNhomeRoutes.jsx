import { Route } from "react-router-dom";
import Login from "../pages/authNhome/login";
import Home from "../pages/authNhome/home";
import Register from "../pages/authNhome/register";
import VerifyUserEmail from "../pages/authNhome/verfyingUserEmail";
import ReVerifyEmail from "../pages/authNhome/reVerifyEmail";
import ResetPassword from "../pages/authNhome/resetPassword";

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
    <Route path="/verifyUserEmail" element={<VerifyUserEmail />} />
    <Route path="/re-verify-email" element={<ReVerifyEmail />} />
    <Route path="/forgotPassword" element={<ResetPassword />} />
  </>
);
