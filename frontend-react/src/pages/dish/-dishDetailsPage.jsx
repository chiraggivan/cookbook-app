import Button from "../../components/button";

function DishDetailsPage({ id, data, tableRows, navigate, handleDelete }) {
  const token = localStorage.getItem("token");
  return (
    <>
      <p></p>
      <h1>{data?.dish?.recipe_name}</h1>
      <h3>Portion size: {data?.dish?.portion_size}</h3>
      <h3>Comment: {data?.dish?.comment}</h3>
      <h5>Meal type: {data?.dish?.meal}</h5>
      <h3>Cost : £ {data?.dish?.total_cost}</h3>
      <h4>
        Prepared on : {data?.dish?.preparation_date} @ {data?.dish?.time_prepared}
      </h4>

      <Button children={"Delete Dish"} onClick={(e) => handleDelete(e, id, token, navigate)} />
      <table>
        <thead>
          <tr>
            <th>ingredient name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>price</th>
            <th>Base Quantity</th>
            <th>Base Unit</th>
            <th>Base Price</th>
            <th>Ing Source</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
      {/* <table>
        <thead>
          <tr>
            <th>Sr-No.</th>
            <th>Steps Description</th>
          </tr>
        </thead>
        <tbody>
          {data?.steps.map((s) => (
            <tr key={s.step_order}>
              <td>{s.step_order}</td>
              <td>{s.step_text}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  );
}

export default DishDetailsPage;
