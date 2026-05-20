import { Navigate } from "react-router-dom";
import Button from "../../../components/button";

function AllIngsSection({ navigate, data, ...pros }) {
  // const navigate = Navigate();
  return (
    <>
      <Button
        children={"Create New"}
        onClick={() => {
          navigate("/admin/ingredients/new");
        }}
      />
      <table>
        <thead>
          <tr>
            <th>Ing. Id</th>
            <th>name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Price</th>
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
              <td>{Number(i.display_quantity)}</td>
              <td>{i.display_unit}</td>
              <td>{Number(i.display_price)}</td>
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

export default AllIngsSection;
