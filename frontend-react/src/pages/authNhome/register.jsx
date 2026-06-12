import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../utils/appUtils";

function register() {
  const [usernameAvlbl, setUsernameAvlbl] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const checkUsername = async (val) => {
    if (!val) {
      return;
    }

    const url = `${serverURL}/auth/api/checkid/${val}`;
    const method = "get";
    try {
      const res = await axios[method](url);
      if (res.data.success === true) {
        setUserMsg("Username available");
        return;
      } else {
        setUserMsg(res.data.message);
      }
    } catch (err) {
      console.log("Error while checkUsername in register :", err.response);
      if (err.response.message) {
        setUserMsg(err.response.message);
      }
    }
  };

  const checkEmail = async (val) => {
    if (!val) {
      // as this is run onBlur, possible user will comeout of the field without any text
      return;
    }
    // needs to check the includes of [@ .]

    const url = `${serverURL}/auth/api/checkemail/${val}`;
    const method = "get";
    try {
      const res = await axios[method](url);
      console.log("res :", res);
      if (res.data.success === true) {
        // setUserMsg("Username available");
        return;
      } else {
        // console.log(" res for succes false is :", res);
        setEmailMsg(res.data.message);
      }
    } catch (err) {
      console.log("Error while checkEmail in register :", err.response);
      if (err.response.data.message) {
        setEmailMsg(err.response.data.message);
      }
    }
  };

  const checkPassword = (pass, repass) => {
    if (password !== rePassword) {
      setPwdMsg("Passwords did not matched.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: name,
      email: email,
      username: username,
      password: password,
    };

    console.log("userData :", userData);
    // check length of password, characters that are valid

    const url = `${serverURL}/auth/api/register`;
    const method = "post";
    try {
      const res = await axios[method](url, userData);
      navigate("/login");
    } catch (err) {
      console.log("err is :", err.response.data.message);
      setErrMsg(err.response.data.message);
    }

    // return;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => {
              e.preventDefault();
              setName(e.target.value);
            }}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onFocus={() => setEmailMsg("")}
            onChange={(e) => {
              e.preventDefault();
              setEmail(e.target.value);
            }}
            onBlur={(e) => checkEmail(e.target.value)}
          />
        </div>
        {emailMsg && <h4 style={{ color: "red" }}>{emailMsg}</h4>}
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUserMsg("");
              // setErrMessage("");
            }}
            onBlur={(e) => checkUsername(e.target.value)}
          />
        </div>
        {userMsg && <h4 style={{ color: "red" }}>{userMsg}</h4>}
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              e.preventDefault();
              setPassword(e.target.value);
              setPwdMsg("");
            }}
          />
        </div>
        <div>
          <label>Again Password:</label>
          <input
            type="password"
            value={rePassword}
            onChange={(e) => {
              e.preventDefault();
              setRePassword(e.target.value);
              setPwdMsg("");
            }}
            onBlur={(e) => checkPassword(password, e.target.value)}
          />
        </div>
        {pwdMsg && <h4 style={{ color: "red" }}>{pwdMsg}</h4>}

        <button type="submit">Register</button>
        {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}
      </form>
    </>
  );
}

export default register;
