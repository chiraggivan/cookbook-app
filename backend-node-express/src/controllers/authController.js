require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const {
  normaliseNewUserData,
  validateNewUserData,
} = require("./authNhome/utils/normaliseNvalidateUserData");

//
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
      "SELECT user_id, username, password, role FROM users WHERE username = ? AND is_active = 1",
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

    // create token with user details to be sent as response
    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role },
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
  // console.log("in backend and data is :", userData);
  // ----------------------- normalise and validate data -------------------------------
  const data = normaliseNewUserData(userData);
  const error = validateNewUserData(data);

  if (error) {
    return res.status(400).json({
      success: false,
      message: `Error while validating : ${error}`,
    });
  }
  // ------------------------ hash the password before sending to procedure -----------------------------

  const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the number of salt rounds
  userData.password = hashedPassword;
  const stringData = JSON.stringify(userData);
  // console.log("stringData :", stringData);
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query = `CALL create_new_user(?)`;
    const queryValues = [stringData];
    const [result] = await conn.query(query, queryValues);
    await conn.commit();
    res.json({
      success: true,
      message: `New user created with username : ${userData.username}`,
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
  console.log("token is :", token);
  // if no token found
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "no body found in the request",
    });
  }

  // Initialize the OAuth2 client with your client ID and Client Secret
  const client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    "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",
    "postmessage",
  );
  // console.log("client :", client);
  console.log("reached here ");
  try {
    // Get the tokens from Google with the help of code value from frontend
    const { tokens } = await client.getToken(req.body.code);
    console.log("tokens are :", tokens);
    // Verify the id_token recieved within the tokens with the help of obj of OAuth2Client and verifyIdToken func
    const user = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    // get the payload from the above obj. payload will contain all the user details needed to check or store in db
    const payload = user.getPayload();
    // console.log("payload is :", payload);

    // retreive imp data from payload
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const fullName = payload.name;
    const imgUrl = payload.picture;
    const google_sub = payload.sub;
    const email = payload.email;
    const email_verified = payload.email_verified;
    console.log("reached here");
    // check if user emailId exists to login directly or create new user and login after that
    const [userResult] = await db.query(
      `
        SELECT user_id, display_name, role, picture_url, google_sub 
        FROM users WHERE email = ? and is_active = 1      
      `,
      [email],
    );
    console.log("userResult :", userResult[0]);
    if (userResult.length != 0) {
      const user = userResult[0];
      console.log("first");
      const [userUpdt] = await db.query(
        `UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP, picture_url = ?, display_name = ?
        WHERE email = ?`,
        [imgUrl, fullName, email],
      );

      console.log("first");
      // create token with user details to be sent as response
      const token = jwt.sign(
        {
          id: user.user_id,
          username: user.username ?? user.email,
          name: user.display_name,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );
      console.log("second");
      //  send response to frontend
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          user_id: user.user_id,
          username: user.username ?? user.display_name,
          role: user.role,
        },
      });
    }

    // return res.json({ success: true, user: payload });
  } catch (error) {
    console.log("something went wrong");
    return res.status(400).json({ success: true, message: "something went wrong" });
  }

  return res.json({
    success: true,
    message: "from backend in googleSignin",
  });
};
