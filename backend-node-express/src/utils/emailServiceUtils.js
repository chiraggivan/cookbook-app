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

module.exports = { emailVerification };
