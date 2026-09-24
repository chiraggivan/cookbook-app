require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const {
  normaliseNewUserData,
  validateNewUserData,
} = require("./authNhome/utils/normaliseNvalidateUserData");

const { emailVerification, passwordResetEmailer } = require("../utils/emailServiceUtils");

// basic login with username/email and password
exports.login = async (req, res) => {
  //  return;
  try {
    const { username, password } = req.body;

    // check both username and password are there
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username & password are required",
      });
    }

    // get user info from db with the username specified
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.display_name, u.password, u.picture_url, u.email, u.email_verified,
          u.role, u.country_id , c.name as country_name, c.country_code as country_code, c.currency_id,
          cu.symbol as currency_symbol
      FROM users u JOIN countries c 
      ON u.country_id = c.country_id
      JOIN currencies cu
      ON cu.currency_id = c.currency_id
      WHERE u.username = ? AND u.is_active = 1`,
      [username],
    );
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "No such active User found",
      });
    }
    const user = rows[0];
    const dbUserPwd = user.password;

    // compare the password with bcrypt
    const isValidPwd = await bcrypt.compare(password, dbUserPwd);
    if (!isValidPwd) {
      return res.status(401).json({
        success: false,
        message: "Username and password does not match",
      });
    }

    // Check if user email is verified
    // if (!user.email_verified) {
    //   return res.json({
    //     success: false,
    //     message: "unverified",
    //     email: user.email,
    //   });
    // }

    // create token with user details to be sent as response
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role: user.role,
        country: user.country_id,
        currency: user.currency_symbol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        display_name: user.display_name,
        picture_url: user.picture_url,
        country: user.country_name,
        currency_id: user.currency_id,
        currency_symbol: user.currency_symbol,
      },
    });
  } catch (error) {
    console.error("Error in authController is : ", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// check if username is already present in db during registration
exports.checkUsername = async (req, res) => {
  const val = req.params.uname;

  // check if val is empty
  if (!val) {
    return res.json({
      success: false,
      message: "No username to check",
    });
  }

  // check if username is already present in db
  const [result] = await db.query(`SELECT 1 FROM users WHERE username = LOWER(?)`, [val]);
  if (result.length === 0) {
    return res.json({
      success: true,
      message: "Username available",
    });
  } else {
    return res.json({
      success: false,
      message: "Unavailable username.",
    });
  }
};

// check if email is already present in db during registration
exports.checkEmail = async (req, res) => {
  const val = req.params.email;

  // if empty val
  if (!val) {
    return res.json({
      success: false,
      message: "No email address provided.",
    });
  }

  // check if email is already present in db
  const [result] = await db.query(`SELECT 1 FROM users WHERE email = ?`, [val]);
  if (result.length === 0) {
    return res.json({
      success: true,
      message: "Email Available",
    });
  } else {
    return res.json({
      success: false,
      message: "Email already in use for another account.",
    });
  }
};

// register the new user
exports.register = async (req, res) => {
  const userData = req.body;

  // ----------------------- normalise and validate data -------------------------------
  const data = normaliseNewUserData(userData);
  const error = validateNewUserData(data);

  if (error) {
    return res.status(400).json({
      success: false,
      message: `Error while validating user data during registration : ${error}`,
    });
  }

  // return res.json({
  //   success: true,
  //   message: `everyhing fine , about to call procedure with data `,
  //   data,
  // });
  // ------------------------ hash the password before sending to procedure -----------------------------

  const hashedPassword = await bcrypt.hash(data.password, 10); // 10 is the number of salt rounds
  data.password = hashedPassword;

  const stringData = JSON.stringify(data);
  // console.log("stringData :", stringData);

  // -------------------- start the connection and call procedure to add new user --------------------
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query = `CALL create_new_user(?)`;
    const queryValues = [stringData];
    const [result] = await conn.query(query, queryValues);
    // console.log("result is :", result[0]);

    // create/fetch data to store in email_verification_token table
    const user_id = result[0][0].user_id;
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date(Date.now() + 3600000);

    //------------------------- inserting verifyToken in email_verification_token table -------------------------------
    const tokenQuery = `INSERT INTO email_verification_tokens(user_id, token, expires_at)
                          VALUES (?, ?,?)`;
    const [EVTresult] = await conn.query(tokenQuery, [user_id, verifyToken, expiryTime]);
    await conn.commit();

    //------------------- call the function to start nodemailer and send email having token, and email id ----------
    // const emailSent = await emailVerification(data.name, data.email, verifyToken, );
    res.json({
      success: true,
      message: `New user created as : ${userData.username}`,
    });
  } catch (err) {
    await conn.rollback();
    console.log("Error in authController - register :", err);
    return res.status(400).json({
      success: false,
      message: err.sqlMessage,
    });
  } finally {
    await conn.release();
  }
};

// country list data while registration or updation of user account
exports.countryList = async (req, res) => {
  try {
    const cntryQuery = `SELECT country_id, name FROM countries WHERE is_active = 1`;
    const [result] = await db.query(cntryQuery, []);
    // console.log("result is: ", result);

    return res.json({
      success: true,
      message: `Got the list of countries for user to select from`,
      data: result,
    });
  } catch (error) {
    console.log("error in AuthController during countryList", error);
  }
};

// verifying user email  via link provided to user
exports.verifyUser = async (req, res) => {
  const token = req.query.t;
  const currentDate = new Date();

  // check token
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token not found",
    });
  }

  try {
    const [evtResult] = await db.query(
      `SELECT 
        evt.user_id, 
        u.email,      
        CASE 
          WHEN evt.expires_at < ? THEN TRUE
          WHEN evt.expires_at > ? THEN FALSE
        END AS has_expired
      FROM email_verification_tokens evt JOIN users u ON evt.user_id = u.user_id 
      WHERE evt.token = ?`,
      [currentDate, currentDate, token],
    );

    if (evtResult.length === 0) {
      // console.log("no user  found ");
      return res.json({
        success: false,
        message: "No such token found",
        tokenNotFound: true,
      });
    }

    // if token valid
    const user_id = evtResult[0].user_id;
    const email = evtResult[0].email;
    const has_expired = evtResult[0].has_expired;
    // console.log("has exipred :", has_expired);

    // check has token expired
    if (has_expired) {
      return res.json({
        success: false,
        message: "Token expired",
        email,
      });
    }

    // activate the user within the user table
    const updtQuery = `UPDATE users SET email_verified = 1 where user_id = ?`;
    const [userResult] = await db.query(updtQuery, [user_id]);
    res.json({
      success: true,
      message: "Email verified for the user.Can signin with username",
    });
  } catch (error) {
    console.log("Error in authController while verifyUser :", error);
  }
};

// resend new verifying link to user when token found in evt but expired
// and email found thru token supplied and used to resend new verification link
exports.reVerifyEmail = async (req, res) => {
  const email = req.query.q;

  try {
    const [userResult] = await db.query(
      `SELECT user_id, display_name 
      FROM users 
      WHERE email = ? AND email_verified = 0`,
      [email],
    );

    if (userResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No such user found",
      });
    }

    const user_id = userResult[0].user_id;
    const name = userResult[0].display_name;
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date(Date.now() + 3600000);

    //------------------------- inserting/updating verifyToken in email_verification_token table -------------------------------
    const [result] = await db.query(
      `SELECT user_id 
      FROM email_verification_tokens
      WHERE user_id = ?
      `,
      [user_id],
    );

    if (result.length) {
      const tokenQuery = `UPDATE email_verification_tokens SET token = ?, expires_at = ? WHERE user_id = ?`;
      const [EVTresult] = await db.query(tokenQuery, [verifyToken, expiryTime, user_id]);
    } else {
      const tokenQuery = `INSERT INTO email_verification_tokens(user_id, token, expires_at)
                          VALUES (?, ?,?)`;
      const [EVTresult] = await db.query(tokenQuery, [user_id, verifyToken, expiryTime]);
    }

    //------------------- call the function to start nodemailer and send email having token, and email id ----------
    const emailSent = await emailVerification(name, email, verifyToken);
    return res.json({
      success: true,
      message: `Resent verification on: ${email}`,
    });
    console.log("after response has sent");
  } catch (error) {
    console.log("Error in AuthController for reVerifyEmail : ", error);
  }
};

// check new email sent by user to resend verification email due
// to token no available in evt due to updation or deletion of the row in evt
exports.newEmailForReverification = async (req, res) => {
  const email = req.query.q;
  const finalMsg = "Request Submitted. Check email.";

  try {
    const [userResult] = await db.query(
      `SELECT user_id, display_name
      FROM users 
      WHERE email = ? AND email_verified = 0`,
      [email],
    );

    // irrespective of user found or not we will send same message
    if (userResult.length === 0) {
      return res.json({
        success: false,
        message: finalMsg,
      });
    }

    const user_id = userResult[0].user_id;
    const name = userResult[0].display_name;
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date(Date.now() + 3600000);

    //------------------------- inserting/updating verifyToken in email_verification_token table -------------------------------
    const [result] = await db.query(
      `SELECT user_id 
      FROM email_verification_tokens
      WHERE user_id = ?
      `,
      [user_id],
    );

    if (result.length) {
      const tokenQuery = `UPDATE email_verification_tokens SET token = ?, expires_at = ? WHERE user_id = ?`;
      const [EVTresult] = await db.query(tokenQuery, [verifyToken, expiryTime, user_id]);
    } else {
      const tokenQuery = `INSERT INTO email_verification_tokens(user_id, token, expires_at)
                          VALUES (?, ?,?)`;
      const [EVTresult] = await db.query(tokenQuery, [user_id, verifyToken, expiryTime]);
    }

    //------------------- call the function to start nodemailer and send email having token, and email id ----------
    const emailSent = await emailVerification(name, email, verifyToken);
    return res.json({
      success: true,
      message: finalMsg,
    });
  } catch (error) {
    console.log("Error in AuthController for reVerifyEmail : ", error);
  }
};

// Check the username / email for password reset link
exports.pswdResetEmail = async (req, res) => {
  const userText = req.query.q;
  const finalMsg = "Check email for link";

  try {
    const userQery = `
    SELECT user_id, email, email_verified
    FROM users 
    WHERE (username = ? OR email = ?) AND is_active = 1`;
    const [userResult] = await db.query(userQery, [userText, userText]);

    // if no active user found, send generic message
    if (userResult.length === 0) {
      return res.json({
        success: true,
        message: finalMsg,
      });
    }

    const user = userResult[0];
    const user_id = user.user_id;
    const email = user.email;
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date(Date.now() + 3600000);
    // console.log("user is:", user);
    if (user.email_verified) {
      //------------------------- inserting/updating verifyToken in password_reset_tokens table -------------------------------
      const [result] = await db.query(
        `SELECT user_id 
      FROM password_reset_tokens
      WHERE user_id = ?
      `,
        [user_id],
      );

      if (result.length) {
        const tokenQuery = `UPDATE password_reset_tokens SET token = ?, expires_at = ? WHERE user_id = ?`;
        const [EVTresult] = await db.query(tokenQuery, [verifyToken, expiryTime, user_id]);
      } else {
        const tokenQuery = `INSERT INTO password_reset_tokens(user_id, token, expires_at)
                          VALUES (?, ?,?)`;
        const [EVTresult] = await db.query(tokenQuery, [user_id, verifyToken, expiryTime]);
      }

      //------------------- call the function to start nodemailer and send email having token, and email id ----------

      const emailSent = await passwordResetEmailer(email, verifyToken);
      // console.log("reached here too");
      if (emailSent.success) {
        return res.json({
          success: true,
          message: finalMsg,
        });
      } else {
        return res.json({
          success: false,
          message: emailSent.message,
        });
      }
    } else {
      // if email not verified then send them to the email verification page
    }
  } catch (error) {
    console.log("Error in authController - pswdResetEmail :", error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong. Try after sometime.",
    });
  }
};

// update password for user
exports.updatePassword = async (req, res) => {
  const body = req.body;
  // console.log("body is :", body);
  const token = body.token;
  const new_password = body.newPassword;

  // validate password
  if (
    !new_password ||
    typeof new_password !== "string" ||
    new_password.length < 8 ||
    new_password.length > 50 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_$#*&%@])[a-zA-Z0-9_$#*&%@]+$/.test(new_password)
  ) {
    return res.json({
      success: false,
      reason: "password",
      message:
        "Invalid password: min 8 characters and max 50 with min 1 uppercase, 1 lowercase, 1 number and any of these special charaacter",
    });
  }

  // validate token with password_reset_token table
  const currentDate = new Date();
  const prtQuery = `
    SELECT prt.user_id, u.email,
      CASE 
        WHEN prt.expires_at < ? THEN TRUE
        WHEN prt.expires_at > ? THEN FALSE
      END AS has_expired
    FROM password_reset_tokens prt JOIN users u ON prt.user_id = u.user_id
    WHERE token = ?`;
  try {
    const [prtResult] = await db.query(prtQuery, [currentDate, currentDate, token]);
    // console.log("prtresult", prtResult.length);
    // check if user_id found or not
    if (prtResult.length === 0) {
      return res.json({
        success: false,
        message: "no user",
      });
    } else {
      // found user_id but is token valid or not?
      const result = prtResult[0];
      const user_id = result.user_id;
      const email = result.email;
      if (result.has_expired) {
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const expiryTime = new Date(Date.now() + 3600000);
        //------------------------- inserting/updating verifyToken in password_reset_tokens table -------------------------------
        const tokenQuery = `UPDATE password_reset_tokens SET token = ?, expires_at = ? WHERE user_id = ?`;
        const [PRTresult] = await db.query(tokenQuery, [verifyToken, expiryTime, user_id]);

        //------------------- call the function to start nodemailer and send email having token, and email id ----------
        const emailSent = await passwordResetEmailer(email, verifyToken);
        // console.log("reached here too");
        if (emailSent.success) {
          return res.json({
            success: true,
            message: emailSent.message,
          });
        } else {
          return res.json({
            success: false,
            message: emailSent.message,
          });
        }
      } else {
        // udpate password
        const hashedPassword = await bcrypt.hash(new_password, 10); // 10 is the number of salt rounds

        // save in users table
        try {
          const uptQuery = `UPDATE users SET password = ? WHERE user_id = ?`;
          await db.query(uptQuery, [hashedPassword, user_id]);
          console.log("about to res to fe");
          return res.json({
            success: true,
            message: "password updated",
          });
        } catch (error) {
          console.log("Error in authController while updating in users table :", error);
          return res.status(400).json({
            success: false,
            message: "Server Error. Please try later.",
          });
        }
      }
    }
  } catch (error) {
    console.log("Error in authContoller during updatePassword :", error);
    return res.status(400).json({
      success: false,
      message: "Server Error. Please try later.",
    });
  }
};

exports.profile = (req, res) => {
  console.log(req.header);
  res.json({
    success: true,
    user: req.user,
  });
};

// google login
exports.googleSignin = async (req, res) => {
  const token = req.body;

  // if no token found
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "no body found in the request",
    });
  }

  // Initialize the OAuth2 client with your client ID and Client Secret
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");

  try {
    // Get the tokens from Google with the help of code value from frontend
    const { tokens } = await client.getToken(req.body.code);

    // Verify the id_token received within the tokens with the help of obj of OAuth2Client and verifyIdToken func
    const user = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    // get the payload from the above obj. payload will contain all the user details needed to check or store in db
    const payload = user.getPayload();

    // retreive imp data from payload
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const fullName = payload.name;
    const imgUrl = payload.picture;
    const google_sub = payload.sub;
    const email = payload.email;
    const email_verified = payload.email_verified;

    // check if user emailId exists to login directly or create new user and login after that
    const [userResult] = await db.query(
      `SELECT u.user_id, u.username, u.display_name, u.picture_url, u.email, u.email_verified, u.is_active,
              u.role, u.country_id , c.name as country_name, c.country_code as country_code, c.currency_id,
              cu.symbol as currency_symbol
          FROM users u JOIN countries c 
          ON u.country_id = c.country_id
          JOIN currencies cu
          ON cu.currency_id = c.currency_id
          WHERE u.email = ?    
      `,
      [email],
    );
    // SELECT u.user_id, u.username, u.display_name, u.role, u.country_id, u.picture_url, u.email, u.google_sub, u.is_active
    // FROM users u WHERE u.email = ?

    if (userResult.length != 0) {
      const user = userResult[0];

      //  check if the user is active in our app
      if (!user.is_active) {
        return res
          .status(400)
          .json({ success: false, message: "User is not active. Contact the support team." });
      }

      const [userUpdt] = await db.query(
        `UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP, picture_url = ?, display_name = ?
        WHERE email = ?`,
        [imgUrl, fullName, email],
      );

      // create token with user details to be sent as response
      const token = jwt.sign(
        {
          id: user.user_id,
          username: user.username ?? user.email,
          role: user.role,
          country: user.country_id,
          currency: user.currency_symbol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      //  send response to frontend
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          display_name: user.display_name,
          picture_url: user.picture_url,
          country: user.country_name,
          currency_id: user.currency_id,
          currency_symbol: user.currency_symbol,
        },
      });
    } else {
      // create new user
      try {
        // get the country id of UK as default country for new user(use can change country later via account option)
        const [cntryResult] = await db.query(
          `SELECT country_id FROM countries WHERE name = 'United Kingdom' AND is_active = 1`,
          [],
        );
        const country_id = cntryResult[0].country_id;
        console.log("country id to be added in case of google signing is :", country_id);
        const [result] = await db.query(
          ` INSERT INTO users ( display_name, picture_url, email, email_verified, google_sub, role, country_id, last_login_at )
          VALUES (?, ?, ?, 1, ?, 'user', ?, CURRENT_TIMESTAMP)
        `,
          [fullName, imgUrl, email, google_sub, country_id],
        );
        // console.log("inserted new user with id :", result.insertId);
        const [users] = await db.query(
          `
          SELECT u.user_id, u.username, u.display_name, u.picture_url, u.email, u.email_verified,
              u.role, u.country_id , c.name as country_name, c.country_code as country_code, c.currency_id,
              cu.symbol as currency_symbol
          FROM users u JOIN countries c 
          ON u.country_id = c.country_id
          JOIN currencies cu
          ON cu.currency_id = c.currency_id
          WHERE u.user_id = ? AND u.is_active = 1
          `,
          [result.insertId],
        );
        // SELECT user_id, display_name, role, picture_url, google_sub
        // FROM users WHERE user_id = ? AND is_active = 1
        const user = users[0];
        // console.log("new user details :", user);
        // create token with user details to be sent as response
        const token = jwt.sign(
          {
            id: user.user_id,
            username: user.username,
            role: user.role,
            country: user.country_id,
            currency: user.currency_symbol,
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" },
        );

        //  send response to frontend
        return res.json({
          success: true,
          message: "Login successful",
          token,
          user1: {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            display_name: user.display_name,
            picture_url: user.picture_url,
            country: user.country_name,
            currency_id: user.currency_id,
            currency_symbol: user.currency_symbol,
          },
        });
        //  user: {
        //   user_id: user.user_id,
        //   username: user.username ?? user.display_name,
        //   role: user.role,
        //   picture_url: user.picture_url,
        //   country: user.country_name,
        //   currency_id: user.currency_id,
        //   currency_symbol: user.currency_symbol,
        // },
      } catch (error) {
        console.log("error found while creating new user with google signin :", error);
        return res
          .status(400)
          .json({ success: false, message: "something went wrong while creating new user" });
      }
    }

    // return res.json({ success: true, user: payload });
  } catch (error) {
    console.log("something went wrong", error);
    return res.status(400).json({ success: false, message: "something went wrong" });
  }

  return res.json({
    success: true,
    message: "from backend in googleSignin",
  });
};
