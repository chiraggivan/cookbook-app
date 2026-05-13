import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Button from "../../../components/button";
import Navbar from "../../../components/navbar";

function AdminIngredientDetails() {
  const { id } = useParams();
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user")).role;
  let ingDetail = {};

  // Redirect effect
  // check if token is available
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&msg=${"Token not found. login again"}`);
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);
  // if role is NOT admin then redirect
  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate(`/login?expired=true&msg=${"Not authorised. login with admin credientials"}`);
  }

  const method = "get";
  const url = `http://localhost:5001/ingredient/api/${id}`;

  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );

  if (loading) {
    return <h1> Page Loading .............</h1>;
  }
  if (data) {
    ingDetail = data[0];
  }

  //   console.log("data before return html : ", ingDetail);
  return (
    <>
      <Navbar />
      <p>Ingredient Details</p>
      <h1>{ingDetail?.name}</h1>
      <h3>Unit: {ingDetail?.base_unit}</h3>
      <h3>Cost : £ {ingDetail?.default_price}</h3>
      <h3>Submitted by: {ingDetail?.submitted_by}</h3>
      <h3>Approved by: {ingDetail?.approved_by}</h3>
      <h3>Approval date:{ingDetail?.approval_date} </h3>
      <h3>Note: {ingDetail?.notes}</h3>
      <h3>Cup Weight: {ingDetail?.cup_weight}</h3>
      <h3>Cup Unit: {ingDetail?.cup_unit}</h3>

      <Button
        children={`Edit Ingredient`}
        onClick={() => navigate(`/admin/ingredients/edit/${id}`)}
      />
    </>
  );
}

export default AdminIngredientDetails;
