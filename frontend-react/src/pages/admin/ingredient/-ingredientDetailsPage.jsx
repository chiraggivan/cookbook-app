import { Textarea, TextInput } from "flowbite-react";
// import Button from "../../../components/button";
import { Button } from "flowbite-react";

function IngDetailsPage({ id, ingDetail, navigate, ...props }) {
  return (
    <>
      {/* header */}
      <div className=" bg-gray-200">
        <div className="flex text-3xl font-semibold mt-10 mx-25 h-12 items-center">
          Ingredient Details
        </div>
      </div>

      {/* ingredient Details */}
      <div className="flex flex-col mt-4 mx-25">
        {/* Name and ID */}
        <div className="flex p-2 my-2 font-semibold">
          <div className="flex-1 text-2xl">
            Name: <span className=" font-normal">{ingDetail?.name}</span>
          </div>
          <div className="flex-1 text-2xl">
            Ingredient ID: <span className=" font-normal">{ingDetail?.ingredient_id}</span>
          </div>
        </div>

        {/* Calculated Details */}
        <div className="flex flex-col p-2 my-2 rounded-xl bg-gray-100 font-semibold">
          {/* header for calc details */}
          <div className="font-normal text-lg">
            Details of calcuated values which are used as reference to generate different units
          </div>

          {/* line divider */}
          <div className="grow border-t items-center border-gray-400 py-1"></div>

          {/* details of calc  */}
          <div className="flex">
            <div className="flex-1 text-xl">
              Calc Quantity: <span className=" font-normal">1</span>
            </div>
            <div className="flex-1 text-xl">
              Calc Unit: <span className=" font-normal">{ingDetail?.base_unit}</span>
            </div>
            <div className="flex-1 text-xl">
              Calc Price: <span className=" font-normal">{ingDetail?.default_price}</span>
            </div>
          </div>
        </div>

        {/* Display details  */}
        <div className="flex flex-col p-2 my-2 font-semibold">
          {/* header  */}
          <div className=""></div>
          {/* details of display values */}
          <div className="flex">
            <div className="flex-1 text-xl">
              Display Quantity:{" "}
              <span className=" font-normal">{Number(ingDetail?.display_quantity)}</span>
            </div>
            <div className="flex-1 text-xl">
              Display Unit: <span className=" font-normal">{ingDetail?.display_unit}</span>
            </div>
            <div className="flex-1 text-xl">
              Display Price: <span className=" font-normal">{ingDetail?.display_price}</span>
            </div>
          </div>
        </div>

        {/* Cup details */}
        <div className="flex flex-col p-2 my-2 font-semibold">
          {/* header  */}
          <div className=""></div>
          {/* details of display values */}
          <div className="flex">
            <div className="flex-1 text-xl">
              Cup weight:{" "}
              <span className=" font-normal">
                {ingDetail?.cup_weight ? Number(ingDetail?.cup_weight) : "-"}
              </span>
            </div>
            <div className="flex-1 text-xl">
              Cup Unit: <span className=" font-normal">{ingDetail?.cup_unit ?? "-"}</span>
            </div>
            {/* text for reason to give cup weight */}
            {/* <div className="flex-1 rounded-xl border-2 border-gray-400 p-3">
              <div className="font-normal mb-2">
                Cup weight is optional, but providing it allows the app to generate additional
                ingredient units (such as cup, tablespoon, and teaspoon) when creating recipes. This
                is most useful for ingredients like grains, flour, powders, etc., that are commonly
                measured in cup, tablespoon, teaspoon, etc.
              </div>
              <div className="italic font-normal">
                {" "}
                * If an ingredient isn’t typically measured in cups, tablespoons or teaspoons, you
                can safely leave this blank.
              </div>
            </div> */}
          </div>
        </div>

        {/* notes section */}
        <div className="max-w-sm p-2 my-2 font-semibold">
          Note: <span className="italic font-normal">{ingDetail?.notes ?? "-"}</span>
          {/* <Textarea className="h-30 resize-none " /> */}
        </div>

        {/* buttons -Back -Edit */}
        <div className="flex justify-between ">
          <div className="">
            <Button className="hover:cursor-pointer" color={"alternative"}>
              {" "}
              Cancel
            </Button>
          </div>
          <div className="">
            <Button
              className="hover:cursor-pointer"
              color={"dark"}
              onClick={() => navigate(`/admin/ingredients/edit/${id}`)}
            >
              Edit Details
            </Button>
          </div>
        </div>

        {/* Record details */}
        <div className="flex flex-col p-2 mt-2 rounded-xl bg-gray-100">
          {/* header */}
          <div className="text-lg font-semibold">Record Details</div>

          {/* line divider */}
          <div className="grow border-t items-center border-gray-400 py-1"></div>

          {/* details of record */}
          <div className="flex py-1">
            <div className="flex-1 font-semibold">
              Submitted By:{" "}
              <span className="italic font-normal">{ingDetail?.submitted_by ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              Approved Status:{" "}
              <span className="italic font-normal"> {ingDetail?.approval_status ?? "-"}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 font-semibold">
              Approved By:{" "}
              <span className="italic font-normal">{ingDetail?.approved_by ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              Approved Date:{" "}
              <span className="italic font-normal">{ingDetail?.approval_date ?? "-"}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 font-semibold">
              Created at: <span className="italic font-normal">{ingDetail?.created_at ?? "-"}</span>
            </div>
            <div className="flex-1 font-semibold">
              End date: <span className="italic font-normal">{ingDetail?.end_date ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>

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
