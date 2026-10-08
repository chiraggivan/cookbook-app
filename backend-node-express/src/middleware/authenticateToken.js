const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authenticateToken = (req, res, next) => {
  // console.log("request in authToken:", req);
  const authHeader = req.headers.authorization;
  const token = req.headers.authorization?.split(" ")[1];
  const code = "authentication";

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  // const decoded = jwt.decode(token);
  // console.log("token has :", decoded);

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      // If error in verify token
      // console.log("Error from authenticateToken :", Object.getOwnPropertyNames(err));
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code,
          message: "Session expired. Please login again.",
        });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          code,
          message: "Invalid session. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        code,
        message: "Invalid or Expired token.",
      });
    }

    // if token valid , check if user(user_id within token) is active before going to controller
    const [result] = await db.query(`SELECT is_active FROM users WHERE user_id = ?`, [user.id]);

    // If token available with user details but no user_id found in table (Next to impossible scenario)
    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired token.",
      });
    }

    // if token available with user details but is_active is 0 then tell user to contact customer service to resolve issue
    if (result[0].is_active === 0) {
      return res.status(401).json({
        success: false,
        message: "User access is restricted. Please contact customer support.",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
