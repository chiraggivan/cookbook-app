import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";

function AdminAllIngredients() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user")).role;

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated) && role !== "admin") {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

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
  console.log("data before return html : ", data);
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Ing. Id</th>
            <th>name</th>
            <th>Price</th>
            <th>Base Unit</th>
            <th>Note</th>
            <th>submitted by</th>
            <th>Approved by</th>
            <th>Approval Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.ingredients.map((i) => (
            <tr key={i.ingredient_id}>
              <td>{i.ingredient_id}</td>
              <td onClick={() => navigate(`/admin/ingredient-details/${i.ingredient_id}`)}>
                {i.name}
              </td>
              <td>{i.default_price}</td>
              <td>{i.base_unit}</td>
              <td>{i.notes}</td>
              <td>{i.submitted_by}</td>
              <td>{i.approved_by}</td>
              <td>{i.approval_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default AdminAllIngredients;
