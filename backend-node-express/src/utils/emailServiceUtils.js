require("dotenv").config();
const nodemailer = require("nodemailer");
const MAILTRAP_USER = process.env.MAILTRAP_USER;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;
const FRONTEND_BASEURL = process.env.FRONTEND_BASEURL;

const emailVerification = async (email_to, token) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  const verificationUrl = `${FRONTEND_BASEURL}/verifyUserEmail/?t=${token}`;
  const mailOptions = {
    from: "no-reply@eatreci.com",
    to: email_to,
    subject: "eatReci : Verify your email",
    html: `
    <p>Please verify your email by clicking the link below:</p>
    <p>
      <a href="${verificationUrl}">Verify your email</a>
    </p>
  `,
  };

  const info = await transporter.sendMail(mailOptions);
};

const passwordResetEmailer = async (email_to, token) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  const verificationUrl = `${FRONTEND_BASEURL}/resetPassword/?t=${token}`;
  const mailOptions = {
    from: "no-reply@eatreci.com",
    to: email_to,
    subject: "eatReci : Reset your account password",
    html: `
    <p>Please click the link below and update your password as instructed:</p>
    <p>
      <a href="${verificationUrl}">Verify your email</a>
    </p>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "email sent" };
  } catch (error) {
    console.log("Error sending email during password reset :", error);
    return { success: false, message: "Server Error. Please try later." };
  }
};

module.exports = { emailVerification, passwordResetEmailer };
