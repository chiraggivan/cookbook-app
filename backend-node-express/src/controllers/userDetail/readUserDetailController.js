const db = require("../../config/database");

// user settings
exports.userSettings = async (req, res) => {
  const user = req.user;
  const url_user_id = Number(req.params.user_id);

  // checking if user from token and thru url are same. Double checking
  if (url_user_id !== user.id) {
    console.log("user id of token and url NOT matched");
    return res.status(400).json({
      success: false,
      message: "User id not matched",
    });
  }

  // BREAK POINT
  // return res.json({
  //   success: true,
  //   message: "Break point test",
  // });

  try {
    const query = `SELECT u.username, u.display_name, u.picture_url, u.email, u.email_verified, u.country_id, 
                          c.name as country_name, crncy.currency_id, crncy.symbol as currency_symbol
                  FROM users u 
                    JOIN countries c ON u.country_id = c.country_id AND c.is_active = 1
                    JOIN currencies crncy ON crncy.currency_id = c.currency_id AND crncy.is_active = 1
                  WHERE u.user_id = ? AND u.is_active = 1`;

    const [result] = await db.query(query, [user.id]);
    if (result.length === 0) {
      console.log("user not found in db");
      return res.status(400).json({
        success: false,
        message: "Server Error. ",
      });
    }

    // Final response
    return res.json({
      success: true,
      message: "Break point test",
      data: result[0],
    });
  } catch (error) {
    console.log("Error  while fetching details of user for setting :", error);
    return res.status(400).json({
      success: false,
      message: "Server Error. ",
    });
  }
};
