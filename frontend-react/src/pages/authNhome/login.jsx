import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ax from "axios";
import { serverURL } from "../../utils/appUtils";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  // const location = useLocation();
  // const exipred = new URLSearchParams(location.search).get("expired");
  // const errorMessage = new URLSearchParams(location.search).get("msg");
  const [searchParams] = useSearchParams();
  const expired = searchParams.get("expired");
  const errorMessage = searchParams.get("msg");

  const message = expired ? errorMessage : null;
  // const message = location.state?.message;

  // submit button function
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await ax.post(`${serverURL}/auth/api/login`, {
        username: username,
        password: password,
      });
      console.log("response is : ", res.data);
      if (res.data.success === true) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
        return;
      } else {
        const errMessage = res.data.message;
        navigate("/login", { state: { message: errMessage } });
      }
    } catch (err) {
      if (
        err.response.status === 401 &&
        err.response.data.message === "Username and password does not match"
      ) {
        navigate(`/login?expired=true&msg=${err.response.data.message}`);
        return;
      }
      console.log("Error in Login.jsx is : ", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
