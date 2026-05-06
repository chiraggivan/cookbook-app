import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ax from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await ax.post("http://localhost:5001/auth/api/login", {
        username: username,
        password: password,
      });
      console.log("response is : ", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/");
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
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
