const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // console.log("request in authToken:", req);
  const authHeader = req.headers.authorization;
  const token = req.headers.authorization?.split(" ")[1];
  const code = "authentication";

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // const decoded = jwt.decode(token);
  // console.log("token has :", decoded);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error from authenticateToken :", err);
      if (err.name === "TokenExipredError") {
        return res.status(401).json({
          success: false,
          code,
          message: "Session expired. PLease login again.",
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

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
