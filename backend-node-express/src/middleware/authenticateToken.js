const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // console.log("request in authToken:", req);
  const authHeader = req.headers.authorization;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // const decoded = jwt.decode(token);
  // console.log("token has :", decoded);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid or Expired token" });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
