import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ax from "axios";
import { serverURL } from "../../utils/appUtils";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const expired = searchParams.get("expired");
  // const errorMessage = searchParams.get("msg");
  const [errMessage, setErrMessage] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  // submit button function
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("user name is :", username, "password is :", password);
    try {
      // check values of username and password
      if (!username || !password) {
        if (!username) {
          setUserMsg("Username required");
        }
        if (!password) {
          setPwdMsg("Password required");
        }
        console.log("username msg :", userMsg, "password msg:", pwdMsg);
        return;
      }
      const res = await ax.post(`${serverURL}/auth/api/login`, {
        username: username,
        password: password,
      });
      console.log("response is : ", res.data);
      // if (res.data.success === true) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
      return;
      // } else {
      //   const errMessage = res.data.message;
      //   navigate("/login", { state: { message: errMessage } });
      // }
    } catch (err) {
      // if (
      //   err.response.status === 401 &&
      //   err.response.data.message === "Username and password does not match"
      // ) {
      // navigate(`/login?expired=true&msg=${err.response.data.message}`);
      setErrMessage(err.response.data.message);
      return;
      // }
      console.log("Error in Login.jsx is : ", err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUserMsg("");
              setErrMessage("");
            }}
          />
        </div>
        {userMsg && <h4 style={{ color: "red" }}>{userMsg}</h4>}
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPwdMsg("");
              setErrMessage("");
            }}
          />
        </div>
        {pwdMsg && <p style={{ color: "red" }}>{pwdMsg}</p>}
        {errMessage && <p style={{ color: "red" }}>{errMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <div>
        <p>
          Create an account
          <span style={{ color: "red" }} onClick={() => navigate("/register")}>
            {" "}
            click here
          </span>
        </p>
      </div>
    </>
  );
}

export default Login;
