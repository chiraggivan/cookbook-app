import Button from "../../../components/button";
import Dropdown from "../../../components/dropdown";
import Input from "../../../components/input";
import Textarea from "../../../components/textarea";
import { cupUnits, mainUnits } from "../../../utils/ingredientConstant";

function EditIngPage({
  ingData,
  handleChange,
  setIngName,
  refQ,
  setRefQ,
  selectedMainUnit,
  setSelectedMainUnit,
  selectedCupUnit,
  setSelectedCupUnit,
  existIngs,
  updateBtn,
  handlesubmit,
  errorMessage,
  navigate,
}) {
  return (
    <>
      <h1>Edit Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        value={ingData?.name ? ingData?.name : ""}
        onChange={(e) => {
          handleChange("name", e.target.value);
          setIngName(e.target.value);
        }}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        value={refQ}
        onChange={(e) => {
          setRefQ(e.target.value);
          handleChange("ref_quantity", Number(e.target.value));
        }}
        error={ingData?.errors?.reference_quantity}
      />
      <Dropdown
        title={"Unit :"}
        options={mainUnits}
        value={selectedMainUnit ? selectedMainUnit : ""}
        onChange={(e) => {
          handleChange("base_unit", e.target.value);
          setSelectedMainUnit(e.target.value);
        }}
        error={ingData?.errors?.reference_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        value={ingData?.default_price ? ingData?.default_price : 0}
        placeholder={"0.00"}
        onChange={(e) => handleChange("default_price", Number(e.target.value))}
        error={ingData?.errors?.default_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        value={ingData?.cup_weight ? ingData?.cup_weight : ""}
        onChange={(e) => handleChange("cup_weight", Number(e.target.value))}
        error={ingData?.errors?.cup_equivalent_weight}
      />
      <Dropdown
        title={"Cup Unit :"}
        options={cupUnits}
        value={selectedCupUnit ? selectedCupUnit : ""}
        onChange={(e) => {
          handleChange("cup_unit", e.target.value);
          setSelectedCupUnit(e.target.value);
        }}
        error={ingData?.errors?.cup_unit}
      />

      <Textarea
        label={"Notes :"}
        placeholder=""
        rows={4}
        value={ingData?.notes ? ingData?.notes : ""}
        onChange={(e) => handleChange("notes", e.target.value)}
        error={ingData?.errors?.notes}
      />
      <Textarea
        title={"Existing Ingredients :"}
        value={existIngs}
        placeholder=""
        rows={4}
        readOnly
      />
      <Button
        children={"Update Ingredient"}
        type="button"
        disabled={updateBtn}
        onClick={handlesubmit}
      />
      <Button children={`Cancel`} onClick={() => navigate(-1)} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default EditIngPage;
