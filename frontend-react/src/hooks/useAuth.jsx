import { useEffect, useState } from "react";

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setisAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      setisAuthenticated(true);
    }
    setLoading(false);
  }, []);

  return { token, loading, isAuthenticated };
};

export default useAuth;
