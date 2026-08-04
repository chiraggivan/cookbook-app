import { Button, Select, Textarea, TextInput } from "flowbite-react";
import { cupUnits, mainUnits } from "../../utils/ingredientConstant";
import { capitaliseWords, confirmInputNumber, validateInputNumber } from "../../utils/appUtils";
import ConfirmModal from "../../components/confirmModal";
import { HiTrash } from "react-icons/hi";

function CreateUpdateMyIngredientPage({
  mode,
  ingData,
  handleChange,
  //   validateInput,
  //   validateNumber,
  setIngData,
  errorMessage,
  existIngs,
  updateBtn,
  handlesubmit,
  setIsConfirmModalOpen,
  isConfirmModalOpen,
  handleDelete,
  navigate,
}) {
  return (
    <>
      <div className="flex flex-col  mt-(--top-bar-height) md:ml-(--left-side-bar)">
        <div className="flex flex-col w-full max-w-3xl px-1 md:mx-auto ">
          {/* header */}
          <div className="m-2 text-2xl">
            {mode === "edit" && <p>Edit Ingredient: {ingData?.name}</p>}
            {mode === "create" && <p>Add Your Ingredient</p>}
          </div>

          {/* ingredients details with similar ing names */}
          <div className="flex flex-col-reverse border border-gray-300 rounded-2xl lg:flex-row">
            {/* details of ingredients */}
            <div className="flex flex-col p-3 lg:w-2/3">
              {/* new first row */}
              <div className="flex space-x-1">
                <div className="flex flex-col">
                  <div className="flex items-center h-10">Ingredient Name: </div>
                  <div className="flex h-5"></div>
                </div>
                <div className="flex flex-col flex-1 max-w-73">
                  <TextInput
                    className="grow border-gray-300 rounded-lg max-w-105"
                    value={ingData?.name ? ingData?.name : ""}
                    onChange={(e) => {
                      handleChange("name", e.target.value);
                      setIngData((prev) => ({
                        ...prev,
                        errors: { ...prev.errors, name: "" },
                      }));
                    }}
                    error={ingData?.errors?.name}
                  />
                  <div className="text-sm font-semibold text-red-700 h-5  max-w-100">
                    {ingData?.errors?.name ? "*Name Required" : ""}
                  </div>
                </div>
              </div>

              {/* second row */}
              <div className="flex flex-col sm:flex-row max-w-105">
                <div className="flex justify-between mb-1 max-w-105 sm:flex-2">
                  {/* new quantity section */}
                  <div className="flex space-x-1 sm:flex-1">
                    {/* quantity name */}
                    <div className="flex flex-col">
                      <div className="flex items-center h-10 py-1">Quantity:</div>
                      <div className="h-5"></div>
                    </div>
                    {/* qauntity input field and error section*/}
                    <div className="flex flex-col">
                      <div className="py-1">
                        <TextInput
                          className=" border-gray-300 rounded-lg w-16"
                          value={ingData?.display_quantity ? ingData?.display_quantity : ""}
                          onChange={(e) => {
                            // validateInput("display_quantity", e.target.value, 3, 5);
                            setIngData((prev) => ({
                              ...prev,
                              display_quantity: validateInputNumber(
                                ingData,
                                "display_quantity",
                                e.target.value,
                                3,
                                5,
                              ),
                              errors: { ...prev.errors, display_quantity: "" },
                            }));
                          }}
                          onBlur={(e) => {
                            // validateNumber("display_quantity");
                            setIngData((prev) => ({
                              ...prev,
                              display_quantity: Number(e.target.value ?? 0),
                            }));
                          }}
                          error={ingData?.errors?.display_quantity}
                        />
                      </div>
                      <div className="flex justify-start text-xs font-semibold text-red-700 h-5 ">
                        {ingData?.errors?.display_quantity ? "*Required" : ""}
                      </div>
                    </div>
                  </div>

                  {/* new unit section */}
                  <div className="flex space-x-1 sm:flex-1">
                    {/* unit name */}
                    <div className="flex flex-col">
                      <div className="flex items-center h-10">Unit:</div>
                      <div className="h-5"></div>
                    </div>
                    {/* unit dropdown field and error section*/}
                    <div className="flex flex-col">
                      <Select
                        className="w-19"
                        value={ingData?.display_unit}
                        onChange={(e) => {
                          handleChange("display_unit", e.target.value);
                        }}
                        error={ingData?.errors?.display_unit}
                      >
                        <option key="" value="">
                          Select
                        </option>
                        {mainUnits.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                      <div className="flex justify-end text-sm font-semibold  text-red-700 h-5 ">
                        {ingData?.errors?.display_unit ? "*Required" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* price section */}
                <div className="flex flex-col sm:flex-1">
                  <div className="flex items-center space-x-1">
                    <p>Price:</p>
                    <div className="flex flex-col">
                      <TextInput
                        className=" border-gray-300 rounded-lg w-26"
                        value={ingData?.display_price ?? ""}
                        addon="£"
                        onChange={(e) => {
                          setIngData((prev) => ({
                            ...prev,
                            display_price: validateInputNumber(
                              ingData,
                              "display_price",
                              e.target.value,
                              2,
                              5,
                            ),
                            errors: { ...prev.errors, display_price: "" },
                          }));
                        }}
                        onBlur={(e) => {
                          setIngData((prev) => ({
                            ...prev,
                            display_price: Number(e.target.value ?? 0),
                          }));
                        }}
                        error={ingData?.errors?.display_price}
                      />
                      <div className="flex justify-end text-sm font-semibold text-red-700 h-5 pr-2">
                        {ingData?.errors?.display_price ? "*Required" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* description area for why cup details are helpful */}
              <div className="flex flex-col text-sm text-gray-500">
                <div className="flex text-justify mb-2">
                  Cup weight is optional, but providing it allows the app to generate additional
                  ingredient units - such as cup, tablespoon, and teaspoon - used in creating
                  recipes. This is most useful for ingredients like grains, flour, powders, etc.,
                  that are commonly measured in cup, tablespoon, teaspoon, etc.
                </div>
                <div className="italic mb-2">
                  * If an ingredient isn’t typically measured in cups, tablespoons or teaspoons, you
                  can safely leave this blank.
                </div>
              </div>

              {/* third row */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between max-w-104 space-x-6">
                  <div className="flex items-center justify-start space-x-1">
                    <p>Cup Weight:</p>
                    <TextInput
                      className=" border-gray-300 rounded-lg w-15 sm:w-25 "
                      value={ingData?.cup_weight !== "null" ? ingData?.cup_weight : ""}
                      onChange={(e) => {
                        setIngData((prev) => ({
                          ...prev,
                          cup_weight: validateInputNumber(
                            ingData,
                            "cup_weight",
                            e.target.value,
                            3,
                            4,
                          ),
                          errors: { ...prev.errors, cup_weight: "" },
                        }));
                      }}
                      onBlur={(e) => {
                        setIngData((prev) => ({
                          ...prev,
                          cup_weight: Number(e.target.value) !== 0 ? Number(e.target.value) : "",
                        }));
                      }}
                      error={ingData?.errors?.cup_weight}
                      // rightIcon={FaWeightScale}
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <p>Cup Unit:</p>
                    <Select
                      className="w-19 min-w-19"
                      value={ingData?.cup_unit}
                      onChange={(e) => {
                        handleChange("cup_unit", e.target.value);
                        setIngData((prev) => ({
                          ...prev,
                          errors: { ...prev.errors, cup_unit: "" },
                        }));
                      }}
                      error={ingData?.errors?.cup_unit}
                    >
                      <option key="" value="">
                        Select
                      </option>
                      {cupUnits.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex text-sm font-semibold text-red-700 h-5 ">
                  {ingData?.errors?.cup_weight ?? ingData?.errors?.cup_unit}
                </div>
              </div>

              {/* common errorMessage */}
              <div>
                {errorMessage && (
                  <p className="flex text-sm font-semibold text-red-700 h-5">{errorMessage}</p>
                )}
              </div>
            </div>

            {/* similar items list */}
            <div className="flex flex-col lg:w-1/3 lg:border-l lg:border-gray-300">
              <div className="mt-1 mx-auto">
                <p className="text-sm text-gray-500">Similar Ingredient Names</p>
              </div>
              {/* Line Separator */}
              <div className="flex items-center mt-1">
                <div className="grow border-t border-gray-300"></div>
              </div>
              {/* list of similar ing names */}
              <Textarea
                className="w-full h-full rounded-none resize-none border-hidden text-gray-500 bg-gray-100 text-sm  lg:h-full"
                value={existIngs}
                placeholder=""
                rows={6}
                readOnly
              />
            </div>
          </div>

          {/* buttons for update, delete and cancel */}
          <div className="flex justify-between my-3">
            <div
              className={
                mode === "edit" ? "flex gap-x-2 lg:gap-x-6" : "flex w-full justify-between"
              }
            >
              {/* update button */}
              {mode === "edit" && (
                <div>
                  <Button
                    className={updateBtn ? "cursor-pointer text-gray-300" : "cursor-pointer"}
                    color="alternative"
                    disabled={updateBtn}
                    onClick={handlesubmit}
                  >
                    Update
                  </Button>
                </div>
              )}

              {/* Create button */}
              {mode === "create" && (
                <div>
                  <Button className={"cursor-pointer"} color="alternative" onClick={handlesubmit}>
                    Save
                  </Button>
                </div>
              )}

              {/* cancel button */}
              <div>
                <Button className="cursor-pointer" color="dark" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </div>
            {/* delete button */}
            {mode === "edit" && (
              <div>
                <Button className="cursor-pointer" color="red" onClick={setIsConfirmModalOpen}>
                  Delete
                </Button>
              </div>
            )}
          </div>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
        {isConfirmModalOpen && (
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleDelete}
            title={"Delete"}
            message={`Are you sure. delete - ${capitaliseWords(ingData.name)} ?`}
            OKtext={"Delete"}
            OKtextIcon={HiTrash}
            cancelText={"No, Are you crazy"}
          />
        )}
      </div>
    </>
  );
}

export default CreateUpdateMyIngredientPage;
