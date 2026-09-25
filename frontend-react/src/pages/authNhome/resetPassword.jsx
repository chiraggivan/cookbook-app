import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Spinner } from "flowbite-react";

const ResetPassword = () => {
  const [userText, setUserText] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [textFound, setTextFound] = useState(false);

  // activate button with the help of textFound variable
  useEffect(() => {
    if (userText.trim().length !== 0) {
      setTextFound(true);
    }
  }, [userText]);

  //  handle Submit button
  const handleSubmit = () => {
    // basic check of text field
    if (userText.length < 5) {
      setErrMsg("Invalid. Minimum 5 characters required.");
      return;
    }

    // ALL checks done. call api
    const url = `/auth/api/pswdResetEmail?q=${userText}`;

    const sendResetPasswordEmail = async () => {
      try {
        setLoading(true);
        const res = await api.get(url);
        // console.log("res is:", res);
        if (res.success === false) {
          setErrMsg(res.message);
          return;
        }
        const msg = res.data?.message;
        // console.log("msg :", msg);
        navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
      } catch (error) {
        console.log("Error during reset password :", error);
      } finally {
        setLoading(false);
      }
    };

    sendResetPasswordEmail();
  };

  //   console.log("userText", userText);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm border border-gray-200">
        {/* Lock icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v3h8z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-2xl font-semibold text-gray-900">Forgot your password?</h2>

        {/* Information */}
        <p className="mb-6 text-sm leading-6 text-gray-600">
          Enter the username or email address associated with your account. If the account exists,
          we will send you a password reset link by email.
        </p>

        {/* Username / Email */}
        <div className="text-left">
          <label htmlFor="usernameOrEmail" className="mb-2 block text-sm font-medium text-gray-700">
            Username or email address
          </label>

          <input
            id="usernameOrEmail"
            type="text"
            placeholder="Enter username or email"
            onChange={(e) => {
              setErrMsg("");
              setUserText(e.target.value);
            }}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500"
          />
          {errMsg && <div className="mt-1 text-xs text-red-500">{errMsg}</div>}
        </div>

        {/* handle Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!textFound}
          className={
            textFound
              ? "mt-6 w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-300"
              : "mt-6 w-full rounded-lg bg-green-200 px-5 py-2.5 text-sm font-medium text-white"
          }
        >
          Send reset link
        </button>

        {/* Back to login */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 hover:cursor-pointer hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
