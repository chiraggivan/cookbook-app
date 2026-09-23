import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";
import { Spinner } from "flowbite-react";

const VerifyUserEmail = () => {
  const [loading, setLoading] = useState(true);
  const [xprdToken, setXprdToken] = useState(false);
  const [resend, setResend] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("t");
  if (!token) {
    return (
      <div>
        <h2 className="text-2xl mt-5 ml-5">No token found!</h2>
      </div>
    );
  }

  // fetch the token from url and call backend with the same token to verify it via parameter.
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Call backend with the token
        if (token) {
          const res = await api.get(`/auth/api/verifyingUserEmail?t=${token}`);
          if (res.data?.success === false) {
            setLoading(false);
            setXprdToken(true);
            return;
          }
          const msg = res?.data?.message;
          navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
        }
      } catch (error) {
        setLoading(false);
        setErrMsg("Something went wrong while verifying email. Try again later");
        console.log("Error in VerifyingUserEmail: ", error);
      }
    };

    verifyEmail();
  }, []);

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

  // page for exipred token
  if (xprdToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm border border-gray-200">
          {/* warning icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v4m0 4h.01M10.29 3.86L2.82 17a2 2 0 001.74 3h14.88a2 2 0 001.74-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">Verification link expired</h2>

          {/* Message */}
          <p className="mb-3 text-sm leading-6 text-gray-600">
            Your email verification link has expired.
          </p>

          <p className="mb-6 text-sm leading-6 text-gray-600">
            Please verify your email within <strong>1 hour</strong> of receiving the verification
            email.
          </p>

          {/* Resend section */}
          <div className="rounded-lg bg-green-50 p-4">
            <p className="mb-3 text-sm text-gray-600">
              {" "}
              Would you like us to send you a new verification link?
            </p>

            <button
              type="button"
              onClick={() => setResend(true)}
              className="font-medium text-green-600 hover:text-green-700 hover:underline"
            >
              Send me a new verification link
            </button>
          </div>

          {/* Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  console.log("xprdToken is :", xprdToken);
  return (
    <div>
      <h2 className="text-2xl">Email verification failed</h2>
      {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
    </div>
  );
};

export default VerifyUserEmail;
