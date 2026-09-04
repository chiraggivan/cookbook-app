// import Button from "../../../components/button";
import Dropdown from "../../../components/dropdown";
import DropdownArray from "../../../components/dropdownArray";
import Input from "../../../components/input";
// import Textarea from "../../../components/textarea";
import { Button, Textarea } from "flowbite-react";
import { cupUnits, mainUnits } from "../../../utils/ingredientConstant";
import { validateInput } from "../../../utils/appUtils";

function EditIngPage({
  ingData,
  handleChange,
  setIngName,
  setIngForm,
  selectedMainUnit,
  setSelectedMainUnit,
  selectedCupUnit,
  setSelectedCupUnit,
  existIngs,
  updateBtn,
  handlesubmit,
  errorMessage,
  setErrorMessage,
  navigate,
  validateInput,
  validateNumber,
}) {
  // console.log("cupUnits :", cupUnits);
  // console.log("mainUnits :", mainUnits);
  // console.log("selectedCupUnit :", selectedCupUnit);
  // console.log("selectedMainUnit :", selectedMainUnit);
  // console.log("updpateBtn in page is:", updateBtn);
  return (
    <>
      {/* header */}
      <div className=" bg-red-400">
        <div className="flex text-3xl font-semibold mt-2 mx-25 h-12 items-center">
          Edit Ingredient
        </div>
      </div>

      {/* ingredient Details */}
      <div className="flex flex-col mt-4 mx-25">
        {/* Name and ID */}
        <div className="flex p-2 my-2 font-semibold">
          <div className="flex-1 text-lg items-center">
            <div className="flex items-end">
              {/* <p>Name: </p> */}
              <p className="italic font-thin text-4xl pl-2 mb-px">{ingData?.name}</p>
              {/* <div className="ml-2">
                <Input
                  className="rounded-xl border-gray-400 bg-gray-50 focus:bg-white"
                  value={ingData?.name ? ingData?.name : ""}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                    setIngName(e.target.value);
                  }}
                  error={ingData?.errors?.name}
                />
              </div> */}
            </div>
          </div>
          <div className="flex-1 text-2xl">
            Ingredient ID:{" "}
            <span className=" px-2 rounded-xl bg-gray-100 font-normal">
              {ingData?.ingredient_id}
            </span>
          </div>
        </div>

        {/* ingredient form */}
        <div className="flex p-2 my-2 font-semibold">
          <div className="flex items-center">
            <p>Form: </p>
            <div className="ml-2">
              <Input
                className="rounded-xl border-gray-400 bg-gray-50 focus:bg-white"
                value={ingData?.form ? ingData?.form : ""}
                onChange={(e) => {
                  handleChange("form", e.target.value);
                  setIngForm(e.target.value);
                  setErrorMessage("");
                }}
                error={ingData?.errors?.form}
              />
            </div>
          </div>
        </div>

        {/* Display details  */}
        <div className="flex flex-col p-2 my-2 font-semibold">
          {/* header  */}
          <div className=""></div>
          {/* details of display values */}
          <div className="flex">
            {/* display quantity */}
            <div className="flex-1 text-lg items-center">
              <div className="flex items-center">
                <div className="flex min-w-38 justify-end pr-2">Display Quantity:</div>
                <Input
                  className="rounded-xl max-w-25 border-gray-400 bg-gray-50 focus:bg-white"
                  value={ingData?.display_quantity ? ingData?.display_quantity : ""}
                  onChange={(e) => {
                    validateInput("display_quantity", e.target.value, 3, 5);
                  }}
                  onBlur={() => validateNumber("display_quantity")}
                  error={ingData?.errors?.display_quantity}
                />
              </div>
            </div>

            {/* display unit */}
            <div className="flex-1 text-lg items-center">
              <div className="flex items-center">
                <div className="flex justify-end px-2">Display Unit:</div>
                <DropdownArray
                  className="rounded-xl max-w-25 border-gray-400 bg-gray-50"
                  options={mainUnits}
                  value={selectedMainUnit ? selectedMainUnit : ""}
                  onChange={(e) => {
                    handleChange("display_unit", e.target.value);
                    setSelectedMainUnit(e.target.value);
                  }}
                  error={ingData?.errors?.display_unit}
                />
              </div>
            </div>

            {/* display price */}
            <div className="flex-1 text-lg items-center">
              <div className="flex items-center">
                <div className="flex min-w-36 justify-end pr-2">Display Price:</div>
                <Input
                  className="rounded-xl max-w-25 border-gray-400 bg-gray-50 focus:bg-white"
                  value={ingData?.display_price ? ingData?.display_price : ""}
                  onChange={(e) => validateInput("display_price", e.target.value, 2, 5)}
                  onBlur={() => validateNumber("display_price")}
                  error={ingData?.errors?.display_price}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cup details and existing ingredients */}
        <div className="flex flex-col p-2 mt-2 font-semibold">
          {/* details of Cup values */}
          <div className="flex">
            <div className="flex-1 text-lg items-center">
              <div className="flex items-center">
                <div className="flex min-w-36 justify-end pr-2">Cup Weight:</div>
                <Input
                  className="rounded-xl max-w-25 border-gray-400 bg-gray-50 focus:bg-white"
                  value={ingData?.cup_weight ? ingData?.cup_weight : ""}
                  onChange={(e) => {
                    validateInput("cup_weight", e.target.value, 3, 5);
                    setErrorMessage("");
                  }}
                  onBlur={() => validateNumber("cup_weight")}
                  error={ingData?.errors?.cup_weight}
                />
              </div>
            </div>
            <div className="flex-1 text-lg items-center">
              <div className="flex items-center">
                <div className="flex justify-end pr-2">Cup Unit:</div>
                <DropdownArray
                  className="rounded-xl max-w-25 border-gray-400 bg-gray-50"
                  options={cupUnits}
                  value={selectedCupUnit ? selectedCupUnit : ""}
                  onChange={(e) => {
                    handleChange("cup_unit", e.target.value);
                    setSelectedCupUnit(e.target.value);
                    setErrorMessage("");
                  }}
                  error={ingData?.errors?.cup_unit}
                />
              </div>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Cup notes and exisiting ing */}
          <div className="flex justify-between space-x-2">
            {/* text for reason to give cup weight */}
            <div className="flex-1 max-w-200 mt-2 rounded-xl border-2 border-gray-400 p-3">
              <div className="font-normal mb-2">
                <span className="font-semibold">Cup weight</span> and{" "}
                <span className="font-semibold">Cup Unit</span> are optional, but providing it
                allows the app to generate additional ingredient units (such as cup, tablespoon, and
                teaspoon) when creating recipes. This is most useful for ingredients like grains,
                flour, powders, etc., that are commonly measured in cup, tablespoon, teaspoon, etc.
              </div>
              <div className="italic font-normal">
                {" "}
                * If an ingredient isn’t typically measured in cups, tablespoons or teaspoons, you
                can safely leave this blank.
              </div>
            </div>
            {/* existing ingredient textarea */}
            <div className="flex w-100 flex-col h-45 mt-2 bg-gray-200 rounded-lg">
              <div className="text-center mt-1">Existing Ingredients </div>

              {/* line divider */}
              <div className="border-t mt-1 border-gray-400"></div>

              <Textarea
                className="h-full resize-none border-0 w-100 bg-gray-200"
                value={existIngs}
                placeholder=""
                rows={4}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* notes section */}
        <div className="max-w-sm p-2 mt-2 font-semibold">
          Note: <span className="italic font-normal"></span>
          <Textarea
            className="h-30 resize-none w-100 rounded-lg p-2 bg-gray-50 border-gray-400 focus:bg-white"
            placeholder=""
            rows={4}
            value={ingData?.notes ? ingData?.notes : ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            error={ingData?.errors?.notes}
          />
        </div>

        {/* global error message above buttons */}
        <div className="px-2 h-6 items-center text-end">
          {errorMessage && <p className="text-sm font-semibold text-red-500">{errorMessage}</p>}
        </div>

        {/* buttons -Back -Edit */}
        <div className="flex justify-between ">
          <div className="">
            <Button
              className="hover:cursor-pointer"
              color={"alternative"}
              disabled={updateBtn}
              onClick={() => navigate(-1)}
            >
              {" "}
              Cancel
            </Button>
          </div>
          <div className="">
            <Button
              className={updateBtn ? "hover:cursor-pointer" : "bg-gray-400"}
              color={"dark"}
              onClick={handlesubmit}
            >
              Save Edits
            </Button>
          </div>
        </div>

        {/* Record details */}
        <div className="flex flex-col p-2 mt-2 mb-10 rounded-xl bg-gray-100">
          {/* header */}
          <div className="text-lg font-semibold">Record Details</div>

          {/* line divider */}
          <div className="grow border-t items-center border-gray-400 py-1"></div>

          {/* details of record */}
          <div className="flex py-1">
            <div className="flex-1 font-semibold">
              Submitted By:{" "}
              <span className="italic font-normal">{ingData?.submitted_by ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              Approved Status:{" "}
              <span className="italic font-normal"> {ingData?.approval_status ?? "-"}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 font-semibold">
              Approved By: <span className="italic font-normal">{ingData?.approved_by ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              Approved Date:{" "}
              <span className="italic font-normal">{ingData?.approval_date ?? "-"}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 font-semibold">
              Created at: <span className="italic font-normal">{ingData?.created_at ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              End date: <span className="italic font-normal">{ingData?.end_date ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditIngPage;
