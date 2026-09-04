import { Navigate } from "react-router-dom";
// import Button from "../../../components/button";
import { Button, TextInput, Pagination } from "flowbite-react";
import SearchBar from "../../../components/searchBar";

function AllIngsSection({
  navigate,
  data,
  currentPage,
  perPage,
  onPageChange,
  totalPages,
  setSearchIng,
  searchIng,
  ...pros
}) {
  // console.log("data in allIngsSection :", data);
  return (
    <>
      <div className="hidden lg:flex lg:flex-col">
        {/* Header + search + add Ingredient Button */}
        <div className="flex items-center justify-between p-3">
          {/* Header */}
          <div className="px-15  text-3xl font-semibold"> All Ingredients</div>

          {/* search ingredient */}
          <div>
            <SearchBar
              value={searchIng}
              placeholder={"ingredient name......."}
              onChange={(e) => setSearchIng(e.target.value)}
            />
          </div>

          {/* add new ingredient button */}
          <div className="px-15">
            <Button
              className="hover:cursor-pointer"
              color="dark"
              onClick={() => {
                navigate("/admin/ingredients/new");
              }}
            >
              Add new ingredient
            </Button>
          </div>
        </div>

        {/* pagination */}
        <div className="flex my-1 overflow-x-auto sm:justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>

        {data && (
          <>
            {/* table of ingredient list */}
            <div className="mx-10 mt-5">
              <table>
                <thead className="text-sm font-semibold">
                  <tr className="">
                    <th className="px-2">
                      <div className="py-5 text-end">No.</div>
                    </th>
                    <th className="px-2 text-start">Name</th>
                    <th className="px-2">Calc Qnty</th>
                    <th className="px-2">Calc Unit</th>
                    <th className="px-2">Calc Price</th>
                    <th className="px-2">Cup weight</th>
                    <th className="px-2">Cup Unit</th>
                    <th className="px-2">Display Quantity</th>
                    <th className="px-2">Display Unit</th>
                    <th className="px-2">Display Price</th>
                    <th className="px-2">submitted By</th>
                    <th className="px-2">Approved By</th>
                    <th className="px-2">Approval Date</th>
                    <th className="px-2">Note</th>
                    <th className="px-2">End Date</th>
                    <th className="px-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.ingredients.map((i, index) => (
                    <tr className={index % 2 === 0 ? "bg-gray-50" : ""} key={i.ingredient_id}>
                      <td className="px-2 text-right min-w-10">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td
                        className="px-2 min-w-sm max-w-sm text-gray-700"
                        onClick={() => navigate(`/admin/ingredient-details/${i.ingredient_id}`)}
                      >
                        <div className="flex min-h-7 items-center hover:text-gray-900 hover:text-lg hover:font-semibold hover:cursor-pointer">
                          {i.form ? i.name + " (" + i.form + ")" : i.name}
                        </div>
                      </td>
                      <td className="px-2 text-end">{1}</td>
                      <td className="px-2">{i.base_unit}</td>
                      <td className="px-2 text-center">{Number(i.default_price)}</td>
                      <td className="px-2 text-end">{i.cup_weight ? Number(i.cup_weight) : ""}</td>
                      <td className="px-2">{i.cup_unit}</td>
                      <td className="px-2 text-end">{Number(i.display_quantity)}</td>
                      <td className="px-2">{i.display_unit}</td>
                      <td className="px-2 text-center">{Number(i.display_price)}</td>
                      <td className="px-2 text-center">{i.submitted_by}</td>
                      <td className="px-2 text-center">{i.approved_by}</td>
                      <td className="px-2">{i.approval_date}</td>
                      <td className="px-2">{i.notes}</td>
                      <td className="px-2">{i.end_date}</td>
                      <td className="px-2">{i.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* pagination */}
        <div className="flex my-5 overflow-x-auto sm:justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </>
  );
}

export default AllIngsSection;
