const jwt = require("jsonwebtoken");
const db = require("../config/database");

exports.login = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const [rows] = await db.query("SELECT user_id, username, role FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

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

exports.profile = (req, res) => {
  console.log(req.header);
  res.json({
    success: true,
    user: req.user,
  });
};
