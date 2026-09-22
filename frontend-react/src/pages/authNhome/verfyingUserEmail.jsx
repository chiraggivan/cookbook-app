import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";

const VerifyUserEmail = () => {
  const [status, setStatus] = useState("verifying");
  const navigate = useNavigate();
  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("t");

  if (!token) {
    setStatus("error");
    return;
  }

  // fetch the token from url and call backend with the same token to verify it via parameter.
  useEffect(() => {
    console.log("token is :", token);

    const verifyEmail = async () => {
      try {
        // Call backend with the token
        const res = await api.get(`/auth/api/verifyingUserEmail?t=${token}`);
        const msg = res?.data?.message;
        setStatus("success");
        navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
      } catch (error) {
        console.log("Error in VerifyingUserEmail: ", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  //   spinner view while verifying
  if (status === "verifying") {
    return (
      <div>
        <p>Verifying your email...</p>

        {/* Your spinner can go here */}
        <div>Loading...</div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div>
        <h2>Email verified successfully!</h2>
        <p>You can now log in to your account.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Email verification failed</h2>
      <p>The verification link may be invalid or expired.</p>
    </div>
  );
};

export default VerifyUserEmail;
