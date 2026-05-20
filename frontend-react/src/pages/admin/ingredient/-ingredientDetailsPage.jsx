import Button from "../../../components/button";

function IngDetailsPage({ id, ingDetail, navigate, ...props }) {
  return (
    <>
      <p>Ingredient Details</p>
      <h1>{ingDetail?.name}</h1>
      <h3>Quantity: {Number(ingDetail?.display_quantity)}</h3>
      <h3>Unit: {ingDetail?.display_unit}</h3>
      <h3>Cost : £ {Number(ingDetail?.display_price)}</h3>
      <h3>Submitted by: {ingDetail?.submitted_by}</h3>
      <h3>Approved by: {ingDetail?.approved_by}</h3>
      <h3>Approval date:{ingDetail?.approval_date} </h3>
      <h3>Note: {ingDetail?.notes}</h3>
      <h3>Cup Weight: {ingDetail?.cup_weight}</h3>
      <h3>Cup Unit: {ingDetail?.cup_unit}</h3>

      <Button children={`Back`} onClick={() => navigate(-1)} />
      <Button
        children={`Edit Ingredient`}
        onClick={() => navigate(`/admin/ingredients/edit/${id}`)}
      />
    </>
  );
}

export default IngDetailsPage;
