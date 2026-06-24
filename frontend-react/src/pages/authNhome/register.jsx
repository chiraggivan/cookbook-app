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

  // validate name is there and not larger than 30 char
  const checkName = (val) => {
    if (!val || val.length > 30) {
      setNameMsg("Name should be less than 30 chars.");
    }
  };

  // validate username is there and not less than 3 or more than 20 chars and are within the allowed chars
  const checkUsername = async (val) => {
    if (!val || val.length < 3 || val.length > 20 || !/^[a-zA-Z0-9]+$/.test(val)) {
      setUserScss(false);
      setUserMsg(
        "Be atleast 3 characters long, not more than 20 chars and can only have alpha numeric values.",
      );
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

  // validate if the email is in valid format
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

  //  validate if password has 1 upper case, 1 lowercase , 1 digit and 1 symbol and len is 8 chars
  const checkPassword = (pass, repass) => {
    if (pass.length < 8) {
      setPwdMsg("Passwords must be 8 characters long.");
    }

    if (pass !== repass) {
      setPwdMsg("Passwords did not matched.");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(password)) {
      setPwdMsg(
        "Password should have 1 Upper, 1 Lower, 1 number and 1 Special character from _$#*&%@",
      );
    }
  };

  // re render logic when useState value changes
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

  //  handle the submit button function
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
      <div className="min-h-screen flex items-start justify-center bg-gray-50 ">
        <div className="w-full max-w-2xl rounded-2xl border-2 mt-8 lg:p-8 shadow-lg bg-white border-gray-400 p-8">
          <h1 className="text-3xl font-bold text-center mb-4">Registration</h1>

          {/* Line separator */}
          <div className="flex items-center mb-4">
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* Form  */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Name:</label>

                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-md
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
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
              <div>
                {nameMsg && (
                  <div className="flex items-center">
                    <label className="w-1/5 text-sm text-right font-medium mb-1"></label>
                    <p className="w-full pt-2 text-red-400 font-bold text-sm px-2">{nameMsg}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Email:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-md
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
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
              <div>
                {emailMsg && (
                  <div className="flex items-center">
                    <label className="w-1/5 text-sm text-right font-medium mb-1"></label>
                    <p className="w-full pt-2 text-red-400 font-bold text-sm px-2">{emailMsg}</p>
                  </div>
                )}
              </div>
            </div>
            {/* {emailMsg && <h4 style={{ color: "red" }}>{emailMsg}</h4>} */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Username:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-md
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
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
              <div>
                <div>
                  {userMsg && userScss === false && (
                    <div className="flex items-center">
                      <label className="w-1/5 text-sm text-right font-medium mb-1"></label>
                      <p className="w-full pt-2 text-red-400 font-bold text-sm px-2">{userMsg}</p>
                    </div>
                  )}
                </div>
                <div>
                  {userMsg && userScss === true && (
                    <div className="flex items-center">
                      <label className="w-1/5 text-sm text-right font-medium mb-1"></label>
                      <p className="w-full pt-2 text-green-400 font-bold text-sm px-2">{userMsg}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* {userMsg && userScss === false && <h4 style={{ color: "red" }}>{userMsg}</h4>}
            {userMsg && userScss === true && <h4 style={{ color: "green" }}>{userMsg}</h4>} */}

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Password:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-md
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    e.preventDefault();
                    setPassword(e.target.value);
                    setPwdMsg("");
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">
                  Re-type Password:
                </label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-md
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
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
              <div>
                {pwdMsg && (
                  <div className="flex items-center">
                    <label className="w-1/5 text-sm text-right font-medium mb-1"></label>
                    <p className="w-full text-red-400 font-bold text-sm px-2">{pwdMsg}</p>
                  </div>
                )}
              </div>
            </div>
            {/* {pwdMsg && <h4 style={{ color: "red" }}>{pwdMsg}</h4>} */}

            <div className="flex justify-between mt-10">
              <button
                className="w-1/3 p-4 text-white shadow-md font-bold bg-blue-400 rounded-lg hover:bg-blue-600 hover:cursor-pointer"
                type="submit"
                disabled={disableRegisterBtn}
              >
                Register
              </button>

              <button
                className="p-4  text-gray-600 shadow-md font-bold bg-gray-200 rounded-lg hover:bg-gray-400 hover:cursor-pointer"
                onClick={() => navigate(-1)}
              >
                Login
              </button>
            </div>

            {errMsg && <p className="w-full text-red-400 font-bold text-sm px-2">{errMsg}</p>}
          </form>
        </div>
      </div>
    </>
  );
}

export default register;
