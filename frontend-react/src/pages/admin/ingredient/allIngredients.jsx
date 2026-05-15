import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../../components/navbar";
import Button from "../../../components/button";
import AllIngsSection from "./-allIngredientsPage";

function AdminAllIngredients() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user")).role;

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);
  // For this page role should be Admin
  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate(`/login?expired=true&msg=${"Not authorised. login with admin credientials"}`);
  }

  const method = "get";
  const url = `http://localhost:5001/ingredient/api/all`;

  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  //   console.log("data before return html : ", data);
  return (
    <>
      <Navbar />
      <AllIngsSection navigate={navigate} data={data} />
    </>
  );
}

export default AdminAllIngredients;
