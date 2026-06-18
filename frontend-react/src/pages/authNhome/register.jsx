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
  const [nameMsg, setNameMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [userScss, setUserScss] = useState(false);
  // const [emailMsg, setEmailMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const [disableRegisterBtn, setDisableRegisterBtn] = useState(true);

  const checkName = (val) => {
    if (!val || val.length > 30) {
      setNameMsg("Name should be less than 30 chars.");
    }
  };

  const checkUsername = async (val) => {
    if (!val || val.length < 3 || !/^[a-zA-Z0-9]+$/.test(val)) {
      setUserScss(false);
      setUserMsg("Be atleast 3 character long and can only have alpha numeric values.");
      return;
    }

    const url = `${serverURL}/auth/api/checkUsername/${val}`;
    const method = "get";
    try {
      const res = await axios[method](url);
      if (res.data.success === true) {
        setUserScss(true);
        setUserMsg("Username available");
        return;
      } else {
        setUserScss(false);
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
    if (!val || !val.includes("@") || !val.includes(".")) {
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
        // console.log(" res for succes false is : ", res);
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
    if (pass !== repass) {
      setPwdMsg("Passwords did not matched.");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(password)) {
      setPwdMsg(
        "Password should have 1 Upper, 1 Lower, 1 number and 1 Special character : _$#*&%@",
      );
    }
  };

  useEffect(() => {
    if (
      nameMsg === "" &&
      userScss === true &&
      pwdMsg === "" &&
      emailMsg === "" &&
      name !== "" &&
      username !== "" &&
      email !== "" &&
      password !== ""
    ) {
      setDisableRegisterBtn(false);
    } else {
      setDisableRegisterBtn(true);
    }
  }, [nameMsg, userScss, pwdMsg, emailMsg, name, username, email, password]);

  const handleSubmit = async (e) => {
    console.log("registerbtn :", registerBtn);
    console.log(
      "nameMsg: ",
      nameMsg,
      " userScss: ",
      userScss,
      " pwdMsg: ",
      pwdMsg,
      " emailMsg: ",
      emailMsg,
      " name: ",
      name,
      " username: ",
      username,
      " email: ",
      email,
      " password: ",
      password,
    );
    e.preventDefault();
    return;
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
      console.log("res :", res.data.message);
      const msg = `Login again with your username as : ${username}`;
      navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
    } catch (err) {
      console.log("Error during register is :", err.response.data.message);
      setErrMsg(err.response.data.message);
    }

    // return;
  };
  console.log("disableRegisterBtn :", disableRegisterBtn);
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
              setNameMsg("");
            }}
            onBlur={(e) => checkName(e.target.value)}
          />
        </div>
        {nameMsg && <h4 style={{ color: "red" }}>{nameMsg}</h4>}
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
            onBlur={(e) => {
              if (e.target.value.length === 0) {
                setUserScss(false);
                setUserMsg("Username required");
              } else {
                checkUsername(e.target.value);
              }
            }}
          />
        </div>
        {userMsg && userScss === false && <h4 style={{ color: "red" }}>{userMsg}</h4>}
        {userMsg && userScss === true && <h4 style={{ color: "green" }}>{userMsg}</h4>}
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

        <button type="submit" disabled={disableRegisterBtn}>
          Register
        </button>
        {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}
      </form>
    </>
  );
}

export default register;
