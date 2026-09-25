import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const NewPassword = () => {
  const [pwd, setPwd] = useState("");
  const [rePwd, setRePwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [disableBtn, setDisableBtn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pwdupdtdSuccess, setPwdupdtdSuccess] = useState(false);
  const [emailOption, setEmailOption] = useState(false);
  const [newLinkSent, setNewLinkSent] = useState(false);
  const navigate = useNavigate();

  // Get token from URL
  // const params = new URLSearchParams(window.location.search);
  // const token = params.get("t");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t");

  // check link validity and update useState to show screen accordingly
  useEffect(() => {
    const url = `/auth/api/checkPasswordResetLink?t=${token}`;
    const verifyLink = async () => {
      try {
        setLoading(true);
        const res = await api.get(url);
        console.log("res is:", res);
        if (res.data?.success) {
          return;
        }
        // if success is false check message
        // if - No token found in db
        if (res.data?.message === "no token") {
          console.log("within no token");
          setEmailOption(true);
          return;
        }
        // if token found BUT it was expired and it resent email
        if (res.data?.message === "email sent") {
          setNewLinkSent(true);
          return;
        }
        // if token found BUT FAILED to resend email
        if (res.data?.message === "email failed") {
          setErrMsg(
            "Link expired but failed to resend new link. Try again later or try again with forgot password",
          );
          return;
        }
      } catch (error) {
        console.log("Error while checking the link validity :", error);
        setErrMsg("Something went wrong. Try after sometime.");
      } finally {
        setLoading(false);
      }
    };

    verifyLink();
  }, []);

  //   activate submit button logic
  useEffect(() => {
    if (pwd.trim().length > 0 && rePwd.trim().length > 0) {
      setDisableBtn(false);
    } else {
      setDisableBtn(true);
    }
  }, [pwd, rePwd]);

  // sumbit button
  const handleSubmit = (e) => {
    e.preventDefault();

    // check password is valid
    if (pwd.length < 8 || rePwd.length < 8) {
      setErrMsg("Passwords must be 8 characters long.");
      return;
    }

    if (pwd !== rePwd) {
      setErrMsg("Passwords did not matched.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(pwd)) {
      setErrMsg(
        "Password should have 1 Upper, 1 Lower, 1 number and 1 Special character from _$#*&%@",
      );
      return;
    }

    // Passord validation check , now prepare to send password as body
    const url = `/auth/api/updatePassword`;
    const method = "post";
    const body = { token: token, newPassword: pwd };

    const updatePassword = async () => {
      try {
        setLoading(true);
        // return;
        const res = await api[method](url, body);
        console.log("res is :", res);
        if (res.data.success === false) {
          if (res.data.message === "no user") {
            // console.log("reached here");
            setEmailOption(true);
            return;
          } else {
            setErrMsg(res.data.message);
            return;
          }
        } else if (res.data.success) {
          if (res.data.message === "password updated") {
            setPwdupdtdSuccess(true);
            return;
          } else if (res.data.message === "Email sent") {
            setNewLinkSent(true);
            return;
          }
        }
        // const message = res.data?.message;
      } catch (error) {
        console.log("Error during newPassword update :", error);
        setErrMsg("Something went wrong. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    updatePassword();
  };

  // show the different info once the password has been updated
  if (pwdupdtdSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {/* Success icon */}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Password Updated Successfully
          </h2>

          {/* Information */}
          <p className="mb-6 text-sm leading-6 text-gray-600">
            Your password has been updated successfully. You can now sign in using your new
            password.
          </p>

          {/* Login button */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // show different page for new link sent to change the password in email
  if (newLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {/* Expired link icon */}
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
                d="M12 8v4m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71-3l-8.82-15a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">Password Reset Link Expired</h2>

          {/* Information */}
          <p className="text-sm leading-6 text-gray-600">
            This password reset link has expired. Please check your email for the new password reset
            link and change your password within{" "}
            <span className="font-bold text-black">1 hour.</span>
          </p>
        </div>
      </div>
    );
  }
  // show page for writing email to get reset password link
  if (emailOption) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Heading */}
          <h2 className="mb-3 text-center text-2xl font-semibold text-gray-900">
            Forgot Password?
          </h2>

          {/* Information */}
          <p className="mb-6 text-center text-sm leading-6 text-gray-600">
            This password reset link is no longer valid. Please request a new link on registered
            <span className="font-bold text-black"> email</span> address by giving
            <span className="font-bold text-black"> username/Email</span> and change your password
            within <span className="font-bold text-black">1 hour.</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username / Email */}
            <div className="mb-6">
              <label
                htmlFor="usernameOrEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Username or Email
              </label>

              <input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter username or email"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    );
  }

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

  // console.log("pwdupdtdSuccess :", pwdupdtdSuccess, " newLinkSent :", newLinkSent);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-3 text-center text-2xl font-semibold text-gray-900">Reset Password</h2>

        <p className="mb-6 text-center text-sm leading-6 text-gray-600">
          Enter your new password below. Make sure your new password is secure and that you remember
          it.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-4">
            <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              onChange={(e) => {
                setPwd(e.target.value);
                setErrMsg("");
              }}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              onChange={(e) => {
                setRePwd(e.target.value);
                setErrMsg("");
              }}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={disableBtn}
            className={
              disableBtn
                ? "w-full rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-medium text-white "
                : "w-full rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-4 "
            }
          >
            Reset Password
          </button>

          {/* error line */}
          {errMsg && <div className="mt-1 text-xs text-red-500">{errMsg}</div>}
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
