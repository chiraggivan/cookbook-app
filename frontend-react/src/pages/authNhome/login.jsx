import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import ax from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await ax.post("http://localhost:5001/auth/api/login", {
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
