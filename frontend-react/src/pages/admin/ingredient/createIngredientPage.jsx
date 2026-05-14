import Button from "../../../components/button";
import Dropdown from "../../../components/dropdown";
import Input from "../../../components/input";
import Textarea from "../../../components/textarea";
import { cupUnits, mainUnits } from "../../../utils/ingredientConstant";

function CreateIngPage({
  ingName,
  ingData,
  handleChange,
  setIngName,
  selectedMainUnit,
  setSelectedMainUnit,
  selectedCupUnit,
  setSelectedCupUnit,
  existIngs,
  createBtn,
  errorMessage,
  handlesubmit,
  navigate,
  ...props
}) {
  return (
    <>
      <h1>Add new Ingredient</h1>
      <Input
        label={"Name : "}
        type={"text"}
        value={ingName}
        onChange={(e) => {
          handleChange("name", e.target.value);
          setIngName(e.target.value);
        }}
        error={ingData?.errors?.name}
      />
      <Input
        label={"Quantity :"}
        type={"number"}
        onChange={(e) => handleChange("reference_quantity", Number(e.target.value))}
        error={ingData?.errors?.reference_quantity}
      />
      <Dropdown
        title={"Unit :"}
        options={mainUnits}
        value={selectedMainUnit}
        onChange={(e) => {
          handleChange("reference_unit", e.target.value);
          setSelectedMainUnit(e.target.value);
        }}
        error={ingData?.errors?.reference_unit}
      />
      <Input
        label={"Price :"}
        type={"number"}
        placeholder={"0.00"}
        onChange={(e) => handleChange("default_price", Number(e.target.value))}
        error={ingData?.errors?.default_price}
      />
      <Input
        label={"Cup Weight :"}
        type={"number"}
        onChange={(e) => handleChange("cup_equivalent_weight", Number(e.target.value))}
        error={ingData?.errors?.cup_equivalent_weight}
      />
      <Dropdown
        title={"Cup Unit :"}
        options={cupUnits}
        value={selectedCupUnit}
        onChange={(e) => {
          handleChange("cup_equivalent_unit", e.target.value);
          setSelectedCupUnit(e.target.value);
        }}
        error={ingData?.errors?.cup_equivalent_unit}
      />

      <Textarea
        label={"Notes :"}
        placeholder=""
        rows={4}
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

      <Button children={"Cancel"} type="button" disabled={createBtn} onClick={() => navigate(-1)} />
      <Button
        children={"Create"}
        type="button"
        disabled={createBtn}
        onClick={() => handlesubmit()}
      />

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default CreateIngPage;
