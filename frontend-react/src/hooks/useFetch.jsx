import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function useFetch(url, token, method = "get", body = null) {
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !token) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);

        let res;

        // GET and DELETE usually don't send body
        if (method === "get" || method === "delete") {
          res = await axios[method](url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // POST, PUT, PATCH send body
          res = await axios[method](url, body, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        // check if response success is false from middleware in backend for authenticateToken.js
        if (res.data.success === false && res.data.message === "Invalid or Expired token") {
          const navigate = useNavigate();
          navigate("/login", {
            replace: true,
            state: {
              message: "Login expired. please login again",
            },
          });
        }

        setSuccess(res.data.success);
        setData(res.data.data);
        setMessage(res.data.message);
      } catch (err) {
        setSuccess(false);
        setMessage("Error in useFetch hoook");
        setError(err);
        console.log("Error in useFetch hoook is :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token, method, body]);

  return {
    success,
    data,
    message,
    loading,
    error,
  };
}

export default useFetch;
