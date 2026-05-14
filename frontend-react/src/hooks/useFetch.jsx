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
        // console.log("response in useFetch is: ", res);

        setSuccess(res.data.success);
        setData(res.data.data);
        setMessage(res.data.message);
        // In axios every status other than 200-299 will go to  catch block.
        // from here will handle accordingly
      } catch (err) {
        // Handle if backend sends custom data for status 401 along with some data object
        if (
          err.response.status === 401 &&
          err.response.data.message === "Invalid or Expired token"
        ) {
          localStorage.removeItem("token");
          navigate(`/login?expired=true&msg=${err.response.data.message}`);
          return;
        }
        setSuccess(false);
        setMessage("Error in useFetch hoook");
        setError(err);
        console.log("Error in useFetch hoook is :", err.response.data);
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
