import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/axios";

const ReVerifyEmail = () => {
  const navigate = useNavigate();
  const [resend, setResend] = useState(false);

  // Get email from URL
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  if (!email) {
    console.log("no email found");
    return;
  }

  // onclick of resend
  if (resend) {
    const reVerifyEmail = async () => {
      try {
        // Call backend with the token
        const res = await api.get(`/auth/api/reVerifyEmail?q=${email}`);
        const msg = res?.data?.message;
        setStatus("success");
        navigate(`/login?successMsg=${encodeURIComponent(msg)}`);
      } catch (error) {
        console.log("Error in VerifyingUserEmail: ", error);
        setStatus("error");
      }
    };

    reVerifyEmail();
  }

  return (
    <div>
      <h2>Verification email already sent. Please check your email.</h2>
      <p>
        For new verification email, click{" "}
        <a href="" onClick={setResend(true)}>
          here.
        </a>
      </p>
    </div>
  );
};

export default ReVerifyEmail;
