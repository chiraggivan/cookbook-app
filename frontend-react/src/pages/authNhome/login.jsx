import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../../utils/appUtils";
import { useGoogleLogin } from "@react-oauth/google";
import { Spinner } from "flowbite-react";
import { useContext } from "react";
import { CurrentUserContext } from "../../context/currentUserContext.jsx";
import { MyRecipeContext } from "../../context/myRecipeContext.jsx";
import { useRef } from "react";
// import {} from "../../../public/videos";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { currentUserId, setCurrentUserId } = useContext(CurrentUserContext);
  const {
    myRecipes,
    recipeDetails,
    fetchedOnce,
    setMyRecipesCntxt,
    setRecipeDetails,
    setFetchedOnce,
  } = useContext(MyRecipeContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get("expired");
  const errorMessage = searchParams.get("errMsg");
  const [successMsg, setSuccessMsg] = useState("");
  if (searchParams.get("successMsg") !== successMsg) {
    setSuccessMsg(searchParams.get("successMsg"));
  }
  const [errMessage, setErrMessage] = useState("");
  const [errGSigninMsg, setErrGSigninMsg] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isPortrait = useRef(null);
  isPortrait.current = window.matchMedia("(orientation: portrait)").matches;

  const [loadMedia, setLoadMedia] = useState(true);

  const method = "post";
  const url = `${serverURL}/auth/api/login`;
  const body = {
    username: username,
    password: password,
  };

  // first thing when login screen loads, reset fetchedOnce, myRecipes and recipeDetails context variables
  useEffect(() => {
    setMyRecipesCntxt([]);
    setRecipeDetails([]);
    setFetchedOnce(false);

    if (errorMessage) {
      setErrMessage(errorMessage);
    }
  }, []);

  // submit button function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // check values of username and password
    if (!username || !password) {
      if (!username) {
        setUserMsg("Username required");
      }
      if (!password) {
        setPwdMsg("Password required");
      }
      // console.log("username msg :", userMsg, "password msg:", pwdMsg);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios[method](url, body);
      // console.log("res for login :", res);
      if (res?.data?.message === "unverified") {
        navigate(`/re-verify-email`, {
          state: { email: res?.data?.email },
        });
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setCurrentUserId(res?.data?.user?.user_id);
      navigate("/");
      return;
    } catch (err) {
      console.log(" response in error is :", err.response);
      setErrMessage(err.response.data.message);
      setIsLoading(false);
      return;
    } finally {
    }
  };

  //  google signin
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log("Token from google oauth is :", tokenResponse);

      // Send tokenResponse.code to your backend
      try {
        const res = await axios.post(`${serverURL}/auth/api/googleSignin`, {
          code: tokenResponse.code,
        });
        // console.log("response is : ", res.data);
        if (!res.data.token || !res.data.user) {
          console.log("token / user was absent. Cant proceed further.");
          return;
        }
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      } catch (error) {
        console.log("error is : ", error.response.data);
        setErrGSigninMsg(error.response.data.message);
        return;
      }
    },
    onError: (errorResponse) => {
      console.log("Oops, something went wrong : ", errorResponse);
      setErrGSigninMsg("Oops, error while google sign in");
    },
    flow: "auth-code",
  });
  const googleSignin = () => {
    googleLogin();
  };

  // console.log("successMsg :", successMsg);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner color="purple" aria-label="Extra large spinner example" size="xl" />
      </div>
    );
  }

  // stop the media after 30 secs
  setTimeout(() => {
    setLoadMedia(false);
  }, 30000);

  return (
    <>
      <div
        className={`min-h-screen flex items-center justify-center bg-slate-50 
          transition-opacity duration-1500 ease-in ${loadMedia ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 m-4">
          {/* logo section */}
          <h1 className=" flex flex-1 font-extrabold text-7xl tracking-tighter  px-4 py-2 items-center justify-center md:flex-none md:justify-start">
            eatReci
          </h1>

          <p className="text-center text-gray-500 mb-2">Sign in to continue</p>
          <form onSubmit={handleSubmit} className="space-y-2 border-0">
            {/* username */}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                placeholder="Enter username"
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUserMsg("");
                  setErrMessage("");
                }}
              />
            </div>
            {userMsg && <p className="text-red-400 font-bold text-sm">* {userMsg}</p>}

            {/* password */}
            <div>
              <label className="block font-medium text-sm mb-2">Password</label>
              <input
                className="px-4 py-1 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:bg-yellow-50"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPwdMsg("");
                  setErrMessage("");
                }}
              />
              <div className="flex w-full">
                <div className="flex flex-1 w-full"></div>
                <div
                  className="pt-1 text-end text-xs text-blue-500 hover:cursor-pointer hover:text-blue-600 hover:underline"
                  onClick={() => navigate("/forgotPassword")}
                >
                  Forgot Password?
                </div>
              </div>
            </div>
            {pwdMsg && <p className="text-red-400 font-bold text-sm">* {pwdMsg}</p>}
            {errMessage && <p className="text-red-400 font-bold text-sm">{errMessage}</p>}

            {/* login button */}
            <button
              type="submit"
              className="w-full bg-blue-400 py-3 rounded-lg text-white font-medium hover:bg-blue-600 hover:cursor-pointer transition"
            >
              Login
            </button>
          </form>
          {successMsg && <p className=" text-green-500 text-sm font-semibold">{successMsg}</p>}

          {/* OR Separator */}
          <div className="flex items-center my-2">
            <div className="grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* Google signin button */}
          <button
            className="w-full flex text-gray-700 items-center justify-center gap-3 
              border border-gray-300 py-3 mb-1 rounded-lg hover:bg-gray-100 hover:cursor-pointer 
              transition"
            onClick={googleSignin}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5 lg:w-8 lg:h-8"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.4 37.5 16 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.6 6.8l6.3 5.2C39.8 36.2 44 30.7 44 24c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </button>
          {errGSigninMsg && <p className="text-red-400 font-bold text-sm">* {errGSigninMsg}</p>}

          {/* OR Separator */}
          <div className="flex items-center my-2">
            <div className="grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          {/* Create a new account line */}
          <div>
            <p>
              To create an account
              <span
                className="text-red-400 font-bold text-sm hover:text-red-600 hover:cursor-pointer"
                onClick={() => navigate("/register")}
              >
                {" "}
                click here
              </span>
            </p>
          </div>
        </div>
      </div>

      {!isPortrait.current && (
        <>
          <div
            className={`absolute top-0 left-0 w-full h-screen z-10 overflow-hidden flex items-center justify-center pt-15 pb-7 bg-gray-600/30 
              transition-opacity duration-500 ease-in-out ${loadMedia ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full object-cover rounded-4xl border-16 border-gray-800"
            >
              <source src="/videos/desktop-video.mp4" type="video/mp4" />
            </video>
            <div
              className="absolute top-3 right-3 border border-gray-600 rounded-full px-4 py-1 text-gray-600 bg-white hover:bg-gray-200 hover:cursor-pointer"
              onClick={() => setLoadMedia(false)}
            >
              SKIP
            </div>
          </div>
        </>
      )}

      {isPortrait.current && (
        <>
          <div
            className={`absolute top-0 left-0 w-screen h-screen z-10 overflow-hidden flex justify-center pt-15 pb-7 bg-gray-600/30 
              transition-opacity duration-500 ease-in-out ${loadMedia ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="flex flex-col gap-3">
              {/* header and skip button */}
              <div className="flex w-full items-center justify-center gap-3 text-gray-700">
                <div className="">Actual application screen</div>
                <div
                  className="border-2 border-gray-600 text-xs rounded-full px-4 py-1 text-gray-600 bg-white hover:bg-gray-200 hover:cursor-pointer"
                  onClick={() => setLoadMedia(false)}
                >
                  SKIP
                </div>
              </div>

              {/* mobile screen */}
              <div className="relative flex-1 pb-5  h-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="flex-1 rounded-4xl border-8 border-gray-800 h-full object-cover"
                >
                  <source src="/videos/mobile-video.mp4" type="video/mp4" />
                </video>

                {/* top black space for camera */}
                <div className="absolute top-4 left-27 h-5 w-18 rounded-full border border-gray-500 bg-gray-800"></div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loadMedia && <></>}
    </>
  );
}

export default Login;
{
  /* header and skip button */
}
<div className="flex items-center gap-3 text-gray-700 mb-3">
  <div className="">Actual application screen</div>
  <div
    className="border-2 border-gray-600 text-xs rounded-full px-4 py-1 text-gray-600 bg-white hover:bg-gray-200 hover:cursor-pointer"
    onClick={() => setLoadMedia(false)}
  >
    SKIP
  </div>
</div>;

{
  /* mobile screen */
}
<div className="relative flex-1  h-full">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="flex-1 rounded-4xl border-8 border-gray-800 h-full object-cover"
  >
    <source src="/videos/mobile-video.mp4" type="video/mp4" />
  </video>
  <div className="absolute top-4 left-27 h-5 w-20 rounded-full bg-gray-800"></div>
</div>;
