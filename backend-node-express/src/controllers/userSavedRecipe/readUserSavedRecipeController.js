const db = require("../../config/database");

exports.get_user_bookmarked_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const searchString = "%" + (req.query.q || "").trim().toLowerCase() + "%";
    const limit = Number(req.query.limit) || 20;
    const queryLimit = limit + 1;
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
    const validCursor = cursor && !isNaN(cursor.getTime()) ? cursor : null;

    // Create dynamic QUERY and its PARAMETERS based on validCursor
    const parameters = validCursor
      ? [user.id, searchString, searchString, searchString, validCursor, queryLimit]
      : [user.id, searchString, searchString, searchString, queryLimit];
    const addCursor = validCursor ? " AND usr.created_at < ?" : "";

    // fetch list of bookmarks for user
    const query = `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.privacy, 
                    u.username, u.display_name, u.email, r.image_url, usr.user_saved_recipe_id AS id, usr.created_at
                  FROM recipes r 
                    JOIN user_saved_recipes usr ON r.recipe_id = usr.recipe_id
                    JOIN users u ON u.user_id = r.user_id AND usr.user_id = ?
                  WHERE (LOWER(r.name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(u.display_name) LIKE ?)  AND r.is_active = 1 ${addCursor}
                  ORDER BY usr.created_at DESC
                  LIMIT ? `;

    const [result] = await db.query(query, parameters);

    const hasMore = result.length > limit;
    const data = result.slice(0, limit);

    // FINAL response
    res.json({
      success: true,
      message: "Bookmarked recipe successfully.",
      data,
      hasMore,
    });
  } catch (err) {
    console.log("Error in createUsrSvdRcpCntrllr - during bookmark a recipe :", err);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try later.",
    });
  }
};
