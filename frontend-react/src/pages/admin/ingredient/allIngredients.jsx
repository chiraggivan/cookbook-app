import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import Navbar from "../../../components/navbarOld";
import Button from "../../../components/button";
import AllIngsSection from "./-allIngredientsPage";
import { serverURL } from "../../../utils/appUtils";
import AdminTopBar from "../../../components/adminTopBar";

function AdminAllIngredients() {
  const { token, loading, isAuthenticated } = useAuth();
  // const tokenLocal = localStorage.getItem("token");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState();
  const [message, setMessage] = useState("");
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user"))?.role;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchIng, setSearchIng] = useState("");
  const perPage = 20;
  const onPageChange = (page) => setCurrentPage(page);

  // Redirect effect
  useEffect(() => {
    if (!loading && (!token || !isAuthenticated)) {
      navigate(`/login?expired=true&errMsg=${"User not found. login again"}`);
      return;
    }
  }, [loading, token, isAuthenticated]);

  // For this page role should be Admin
  if (role && role !== "admin") {
    localStorage.removeItem("token");
    navigate(`/login?expired=true&errMsg=${"Not authorised. login with admin credientials"}`);
  }

  const method = "get";
  const url = `${serverURL}/ingredient/api/all?page=${currentPage}&per_page=${perPage}&searchIng=${searchIng}`;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // call the api to get all the ingredient (with offset and per_page as limit)
  useEffect(() => {
    // initial token is null. To stop calling api with null token value
    if (!token) {
      return;
    }
    const fetchIngredients = async () => {
      try {
        const res = await axios[method](url, config);
        setSuccess(res.success);
        setData(res.data.data);
        setMessage(res.message);
      } catch (err) {
        console.log("error in allIngredients.jsx while fetching all ingredient :", err);
      }
    };
    fetchIngredients();
  }, [currentPage, token, searchIng]);

  // whenever data fetched(1st time) or changes again, it will re-save the value of totalPages coming from backend.
  useEffect(() => {
    setTotalPages(data?.total_pages ?? 1);
  }, [data]);

  // loading state render
  if (loading) {
    return <h1> Page Loading .............</h1>;
  }

  // console.log("data before return html : ", data);
  return (
    <>
      <AdminTopBar />
      {/* <Navbar /> */}
      <AllIngsSection
        navigate={navigate}
        data={data}
        onPageChange={onPageChange}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        setSearchIng={setSearchIng}
        searchIng={searchIng}
      />
    </>
  );
}

export default AdminAllIngredients;
