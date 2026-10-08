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
          message: "Invalid session. PLease login again.",
        });
      }

      return res.status(401).json({
        success: false,
        code,
        message: "Invalid or Expired token.",
      });
    }

    // if token valid , check if user(user_id within token) is active before going to controller
    const [result] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired token.",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
