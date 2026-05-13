import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import Input from "../../components/input";
import Textarea from "../../components/textarea";
import Toggle from "../../components/toggle";
import Card from "../../components/card";
import Table from "../../components/table";
import Dropdown from "../../components/dropdown";
import Navbar from "../../components/navbar";

function NewRecipe() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectUnit, setSelectUnit] = useState("");
  const [selectBaseUnit, setSelectBaseUnit] = useState("");

  // call useAuth hook to check if token is available in localstorage
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if token not found
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  //
  //   const method = "get";
  //   const url = `http://localhost:5001/recipe/api/my`;
  //   const { success, data, message, loading, error } = useFetch(
  //     token ? url : null,
  //     token,
  //     method,
  //     null,
  //   );

  //   if (loading) {
  //     return <h1> Page Loading .............</h1>;
  //   }
  // console.log("data before return html : ", data);
  return (
    <>
      <Navbar />
      <h1>Welcome to Create Recipes</h1>
      <Input label={"Recipe name: "} type="text" placeholder={"Name of the recipe...."} />
      <Input label={"Portion of: "} type="text" placeholder={"eg. 2 person, 1kg, 750ml, etc."} />
      <Textarea label={"Description"} placeholder="description of your recipe..." rows={10} />
      <Toggle
        title="privacy"
        checked={isPrivate}
        onText="Private"
        offText="Public"
        onChange={(e) => setIsPrivate(e.target.checked)}
      />
      <Card>
        <h2>Ingredients</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>Base quantity</th>
              <th>Base Unit</th>
              <th>Base price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input type={"text"} placeholder={"milk, blue cheese, etc.."} />
              </td>
              <td>
                <Input type={"number"} />
              </td>
              <td>
                <Dropdown
                  options={["a", "b", "c"]}
                  value={selectUnit}
                  onChange={(e) => setSelectUnit(e.target.value)}
                />
              </td>
              <td></td>
              <td>
                <Input type={"number"} />
              </td>
              <td>
                <Dropdown
                  options={["a", "b", "c"]}
                  value={selectBaseUnit}
                  onChange={(e) => setSelectBaseUnit(e.target.value)}
                />
              </td>
              <td>
                <Input type={"number"} />
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </>
  );
}

export default NewRecipe;
