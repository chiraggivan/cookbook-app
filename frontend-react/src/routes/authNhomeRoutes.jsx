import { Route } from "react-router-dom";
import Login from "../pages/authNhome/login";
import Home from "../pages/authNhome/home";

export const AuthNhomeRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Home />} />
  </>
);
