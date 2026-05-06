import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ax from "axios";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
      }

      try {
        const res = await ax.get("http://localhost:5001/recipe/api/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("data res : ", res.data);
      } catch (err) {
        console.log("Error received in home.jsx :", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Welcome to Home</h1>
    </div>
  );
}

export default Home;
