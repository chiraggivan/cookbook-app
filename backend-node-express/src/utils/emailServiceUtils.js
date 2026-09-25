require("dotenv").config();
const nodemailer = require("nodemailer");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FRONTEND_BASEURL = process.env.FRONTEND_BASEURL;

const emailVerification = async (name, email_to, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  const verificationUrl = `${FRONTEND_BASEURL}/verifyUserEmail/?t=${token}`;
  const mailOptions = {
    from: "no-reply@eatreci.com",
    to: email_to,
    subject: "eatReci : Verify your email",
    html: `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #f5f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
          ">

          <!-- Header -->
          <tr>
            <td style="
              background-color: #2f855a;
              padding: 28px 30px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
                font-weight: 600;
              ">
                eatReci
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin: 0 0 20px;
                font-size: 24px;
                font-weight: 600;
                color: #222222;
              ">
                Verify your email address
              </h2>

              <p style="
                margin: 0 0 16px;
                font-size: 16px;
                line-height: 1.6;
              ">
                Hi ${name},
              </p>

              <p style="
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
              ">
                Thanks for creating an account with eatReci.
                Please verify your email address by clicking the button below.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 30px;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #2f855a;">
                    <a href="${verificationUrl}"
                      style="
                        display: inline-block;
                        padding: 14px 28px;
                        font-size: 16px;
                        font-weight: 600;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                      ">
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="
                  background-color: #f0fdf4;
                  border-left: 4px solid #2f855a;
                  margin-bottom: 25px;
                ">
                <tr>
                  <td style="
                    padding: 14px 16px;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #444444;
                  ">
                    <strong>This verification link expires in 1 hour.</strong><br>
                    Please verify your email before the link expires.
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 0 15px;
                font-size: 14px;
                line-height: 1.6;
                color: #666666;
              ">
                If the button above doesn't work, copy and paste the following
                link into your browser:
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 13px;
                line-height: 1.5;
                word-break: break-all;
              ">
                <a href="{{verificationUrl}}"
                  style="color: #2f855a;">
                  ${verificationUrl}
                </a>
              </p>

              <p style="
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                color: #666666;
              ">
                If you didn't create an eatReci account, you can safely ignore
                this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 30px;
              background-color: #f8f9fa;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                color: #888888;
                line-height: 1.5;
              ">
                This is an automated email from eatReci.<br>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
    `,
    // html: `
    // <p>Please verify your email by clicking the link below:</p>
    // <p>
    //   <a href="${verificationUrl}">Verify your email</a>
    // </p>
    // `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "email sent" };
  } catch (error) {
    console.log("Error sending email for verfying user :", error);
    return { success: false, message: "emailer error" };
  }
};

const passwordResetEmailer = async (name, email_to, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  const verificationUrl = `${FRONTEND_BASEURL}/newPassword/?t=${token}`;
  const mailOptions = {
    from: "no-reply@eatreci.com",
    to: email_to,
    subject: "eatReci : Request for change of password",
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="
                max-width: 600px;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
              ">

              <!-- Header -->
              <tr>
                <td style="
                  background-color: #2f855a;
                  padding: 28px 30px;
                  text-align: center;
                ">
                  <h1 style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 600;
                  ">
                    eatReci
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px;">

                  <h2 style="
                    margin: 0 0 20px;
                    font-size: 24px;
                    font-weight: 600;
                    color: #222222;
                  ">
                    Request for password change
                  </h2>

                  <p style="
                    margin: 0 0 16px;
                    font-size: 16px;
                    line-height: 1.6;
                  ">
                    Hi ${name},
                  </p>

                  <p style="
                    margin: 0 0 24px;
                    font-size: 16px;
                    line-height: 1.6;
                  ">
                    We received a request to reset the password for your eatReci
                    account. Click the button below to create a new password.
                  </p>

                  <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1;
                    color: #E63946;
                    padding-bottom: 20px;
                  ">
                    If you didn't requested for password change, you can safely ignore
                    this email.
                  </p>

                  <!-- Button -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 30px;">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #2f855a;">
                        <a href="${verificationUrl}"
                          style="
                            display: inline-block;
                            padding: 14px 28px;
                            font-size: 16px;
                            font-weight: 600;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 6px;
                          ">
                          Change Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="
                      background-color: #f0fdf4;
                      border-left: 4px solid #2f855a;
                      margin-bottom: 25px;
                    ">
                    <tr>
                      <td style="
                        padding: 14px 16px;
                        font-size: 14px;
                        line-height: 1.5;
                        color: #444444;
                      ">
                        <strong>This verification link expires in 1 hour.</strong><br>
                        Please verify your email before the link expires.
                      </td>
                    </tr>
                  </table>

                  <p style="
                    margin: 0 0 15px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #666666;
                  ">
                    If the button above doesn't work, copy and paste the following
                    link into your browser:
                  </p>

                  <p style="
                    margin: 0 0 25px;
                    font-size: 13px;
                    line-height: 1.5;
                    word-break: break-all;
                  ">
                    <a href="{{verificationUrl}}"
                      style="color: #2f855a;">
                      ${verificationUrl}
                    </a>
                  </p>

                  

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="
                  padding: 20px 30px;
                  background-color: #f8f9fa;
                  text-align: center;
                ">
                  <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #888888;
                    line-height: 1.5;
                  ">
                    This is an automated email from eatReci.<br>
                    Please do not reply to this email.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    `,
    //   html: `
    //   <p>Please click the link below and update your password as instructed:</p>
    //   <p>
    //     <a href="${verificationUrl}">Verify your email</a>
    //   </p>
    // `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "email sent" };
  } catch (error) {
    console.log("Error sending email during password reset :", error);
    return { success: false, message: "emailer error" };
  }
};

module.exports = { emailVerification, passwordResetEmailer };
