import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";
import { Spinner } from "flowbite-react";

const ReVerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resend, setResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get email from URL
  // const params = new URLSearchParams(window.location.search);
  // const email = params.get("email");
  // console.log("within reVerifyEmail page, email: ", email);

  // Get email from location state
  const email = location.state?.email;
  if (!email) {
    console.log("no email found");
    return;
  }

  // onclick of resend
  useEffect(() => {
    if (resend) {
      const reVerifyEmail = async () => {
        try {
          // Call backend for the new token
          const res = await api.get(`/auth/api/reVerifyEmail?q=${email}`);
          const msg = res?.data?.message;
          navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
        } catch (error) {
          console.log("Error in VerifyingUserEmail: ", error);
          setStatus("error");
        }
      };

      reVerifyEmail();
    }
  }, [resend]);

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
    // <div>
    //   <h2>
    //     Verification email was sent during registration. Please check spam folder if not found.
    //   </h2>
    //   <p>
    //     For new verification email, click{" "}
    //     <span
    //       className="text-app-primary hover:cursor-pointer"
    //       onClick={() => {
    //         setResend(true);
    //         setLoading(true);
    //       }}
    //     >
    //       here.
    //     </span>{" "}
    //     or go to login page.
    //   </p>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm border border-gray-200">
        {/* Email icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
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
              d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-2xl font-semibold text-gray-900">Verify your email</h2>

        {/* Message */}
        <p className="mb-3 text-sm leading-6 text-gray-600">
          We sent a verification email to your registered email address when you created your
          account.
        </p>

        <p className="mb-6 text-sm leading-6 text-gray-600">
          Please check your inbox and your <strong>spam or junk folder</strong>.
        </p>

        {/* Resend section */}
        <div className="rounded-lg bg-green-50 p-4">
          <p className="mb-3 text-sm text-gray-600">Didn't receive the email?</p>

          <button
            type="button"
            onClick={() => setResend(true)}
            className="font-medium text-green-600 hover:text-green-700 hover:underline"
          >
            Resend verification email
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
};

export default ReVerifyEmail;
