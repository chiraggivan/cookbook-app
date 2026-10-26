const db = require("../../config/database");

exports.get_user_bookmarked_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // fetch list of bookmarks for user
    const query = `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.privacy, u.username, u.display_name, u.email, r.image_url 
                  FROM recipes r 
                      JOIN user_saved_recipes usr ON r.recipe_id = usr.recipe_id
                      JOIN users u ON u.user_id = r.user_id
                      WHERE usr.user_id = ?`;

    const [result] = await db.query(query, [user.id]);

    console.log("result :", result);

    // if no bookmarks found
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookmarks found",
      });
    }

    // FINAL response
    res.json({
      success: true,
      message: "Bookmarked recipe successfully.",
      data: result,
    });
  } catch (err) {
    console.log("Error in createUsrSvdRcpCntrllr - during bookmark a recipe :", err);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try later.",
    });
  }
};
