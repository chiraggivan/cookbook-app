import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import useFetch from "../hooks/useFetch";

function Home() {
  const { token, loading: authHookLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const method = "get";
  const url = `http://localhost:5001/recipe/api/all`;

  // Redirect effect
  useEffect(() => {
    if (!authHookLoading && (!token || !isAuthenticated)) {
      navigate("/login");
    }
  }, [authHookLoading, token, isAuthenticated, navigate]);

  // //
  // useEffect(() => {
  //   if (!token) return;

  //   const fetchData = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5001/recipe/api/all", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       // if (res?.data?.success) {
  //       const newData = res.data;
  //       setData(newData);
  //       // }

  //       // console.log("data res : ", newData);
  //     } catch (err) {
  //       console.log("Error received in home.jsx :", err);
  //     }
  //   };
  //   fetchData();
  // }, [token]);

  const { success, data, message, loading, error } = useFetch(
    token ? url : null,
    token,
    method,
    null,
  );
  // console.log("data before return html : ", fetchData);
  return (
    <>
      <h1>Welcome to Home</h1>
      <h2>All the recipes are :</h2>

      {data?.map((i) => (
        <div key={i.recipe_id}>
          <h6>{i.recipe_id}</h6>
          <h2 onClick={() => navigate(`/recipe/${i.recipe_id}`)}>{i.name}</h2>
          <h4>portion : {i.portion_size}</h4>
          <h4>Desription : {i.description}</h4>
          <h4>by : {i.user_id}</h4>
          <p></p>
        </div>
      ))}
    </>
  );
}

export default Home;
