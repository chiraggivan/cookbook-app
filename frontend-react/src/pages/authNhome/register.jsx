import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../utils/appUtils";
import Dropdown from "../../components/dropdown";
import { Spinner } from "flowbite-react";

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
  const [countryList, setCountryList] = useState([]);
  const [countrySelect, setCountrySelect] = useState(0);
  const [cntryErrMsg, setCntryErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [disableRegisterBtn, setDisableRegisterBtn] = useState(true);

  // fetch the country list for user to select it from
  useEffect(() => {
    const url = `${serverURL}/auth/api/countryList`;
    const method = "get";

    const fetchCountry = async () => {
      try {
        const res = await axios[method](url);
        // console.log("res is :", res);
        const cntryList = res?.data?.data;
        // temporary give UK as default country (182) if available in list
        cntryList.map((i) => (i.country_id === 182 ? setCountrySelect(182) : i));
        setCountryList(cntryList);
      } catch (error) {
        console.log("Error in Register.jsx while fetching country list", error);
      }
    };
    fetchCountry();
  }, []);

  // validate name is there and not larger than 30 char
  const checkName = (val) => {
    if (!val || val.length < 2 || val.length > 30) {
      setNameMsg("Name should be more than 2 and less than 30 chars.");
    }
  };

  // validate username is there and not less than 5 or more than 20 chars and are within the allowed chars
  const checkUsername = async (val) => {
    if (!val || val.length < 5 || val.length > 20 || !/^[a-zA-Z0-9]+$/.test(val)) {
      setUserScss(false);
      setUserMsg(
        "must be atleast 5 characters long, no spaces, not more than 20 chars and can only have alpha numeric values.",
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
    // needs to check the includes of [@ .]
    if (!val || !val.includes("@") || !val.includes(".")) {
      // as this is run onBlur, possible user will comeout of the field without any text
      return;
    }

    const url = `${serverURL}/auth/api/checkemail/${val}`;
    const method = "get";
    try {
      const res = await axios[method](url);
      // console.log("res :", res);
      if (res.data.success === true) {
        setEmailMsg("");
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
    if (name) {
      checkName(name);
    }
    // checkName(name);
    checkEmail(email); // Doing this as browser may prompt user to select default saved values which will not trigger emailCheck func
    if (
      name !== "" &&
      nameMsg === "" &&
      email !== "" &&
      emailMsg === "" &&
      username !== "" &&
      userScss === true &&
      password !== "" &&
      rePassword !== "" &&
      password === rePassword &&
      pwdMsg === "" &&
      countrySelect !== 0
    ) {
      setDisableRegisterBtn(false);
    } else {
      setDisableRegisterBtn(true);
    }
  }, [
    name,
    nameMsg,
    email,
    emailMsg,
    username,
    userScss,
    password,
    rePassword,
    pwdMsg,
    countrySelect,
  ]);

  //  handle the submit button function
  const handleSubmit = async (e) => {
    e.preventDefault();

    //NEED TO REMOVE IT LATER ------- temp option for complusory UK selection----------------------------
    // if (countrySelect === 0) {
    //   setCountrySelect(182);
    // }

    const userData = {
      name: name,
      email: email,
      username: username,
      password: password,
      country: countrySelect,
    };

    // console.log("userData :", userData);
    // return;

    const url = `${serverURL}/auth/api/register`;
    const method = "post";
    try {
      setLoading(true);
      const res = await axios[method](url, userData);
      // console.log("res :", res.data);
      // return;
      const msg = `To verify email sent on: ${email}.`;
      navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
    } catch (err) {
      console.log("Error during register is :", err.response.data.message);
      setErrMsg(err.response.data.message);
    } finally {
      setLoading(false);
    }

    // return;
  };

  // console.log("disableRegisterBtn :", disableRegisterBtn);
  // console.log("Country list is :", countryList);
  // console.log(" Country select is :", countrySelect);

  // Spinner for loading screen
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner
          theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
          color="default"
          aria-label="Loading"
          size="xl"
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-start justify-center bg-gray-50 ">
        <div className="w-full max-w-xl rounded-2xl border-2 mt-8 lg:p-8 shadow-lg bg-white border-gray-400 p-8">
          <h1 className="text-3xl font-bold text-center mb-4">Registration</h1>

          {/* Line separator */}
          <div className="flex items-center mb-4">
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* Form  */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* name section */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Name:</label>

                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm
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

            {/* email section */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Email:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm
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

            {/* username section */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Username:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm
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

            {/* Password section */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Password:</label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    e.preventDefault();
                    setPassword(e.target.value);
                    setPwdMsg("");
                    setErrMsg("");
                  }}
                />
              </div>
            </div>

            {/* Re-type Password section */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">
                  Re-type Password:
                </label>
                <input
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
                  type="password"
                  value={rePassword}
                  onChange={(e) => {
                    e.preventDefault();
                    setRePassword(e.target.value);
                    setPwdMsg("");
                    setErrMsg("");
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

            {/* Select country section */}
            {/* <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <label className="w-1/5 text-sm text-right font-medium mb-1">Country:</label>
                {countryList && (
                  <Dropdown
                    key={countryList?.country_id}
                    className="flex rounded w-14 min-w-38 text-sm h-7.5 pl-1 pr-7 py-0"
                    options={countryList}
                    optionValueText={"country_id"}
                    optionText={"name"}
                    value={countrySelect}
                    onChange={(e) => {
                      setCntryErrMsg("");
                      setCountrySelect(Number(e.target.value));
                    }}
                    error={cntryErrMsg}
                  />
                )}
              </div>
              <div className=""></div>
            </div> */}

            {/* Register /Login button */}
            <div className="flex justify-between mt-10">
              <button
                className={
                  !disableRegisterBtn
                    ? `w-1/3 p-4 text-white shadow-md font-bold bg-blue-400  hover:bg-blue-600  hover:cursor-pointer rounded-lg`
                    : "w-1/3 p-4 text-white shadow-md font-bold rounded-lg bg-gray-400 hover:cursor-default"
                }
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
