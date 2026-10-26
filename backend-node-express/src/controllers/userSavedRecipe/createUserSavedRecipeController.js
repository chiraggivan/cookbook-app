const db = require("../../config/database");

exports.bookmark_a_recipe = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const body = req.body;
    const recipe_id = body.recipe_id;

    if (!recipe_id) {
      return res.status(400).json({
        success: false,
        message: "Recipe id missing from body.",
      });
    }

    // As only one value(recipe_id) is coming in body, not need for separate normalisation and validation

    // ------------ check in DB if the recipe id is valid, of different user and public --------------------
    const query = `SELECT r.recipe_id, r.privacy, r.user_id, usr.user_saved_recipe_id 
                    FROM recipes r LEFT JOIN user_saved_recipes usr
                        ON r.recipe_id = usr.recipe_id AND usr.user_id = ?
                    WHERE r.recipe_id = ?`;
    const [result] = await db.query(query, [user.id, recipe_id]);

    // if no such recipe
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No such recipe.",
      });
    }
    // checking privacy and if same as logged in user
    if (result[0].privacy === "private" || result[0].user_id === user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorised.",
      });
    }

    // if user_saved_recipe_id is not null then user and recipe id already book marked . avoid duplicate.
    if (result[0].user_saved_recipe_id !== null) {
      return res.status(409).json({
        success: false,
        message: "Recipe already bookmarked.",
      });
    }
    // BREAK POINT
    // return res.json({
    //   success: true,
    //   message: "Breakpoint reached",
    // });

    // ----------------------------- start inserting in database -------------------------------------------
    const insertQuery = `INSERT INTO user_saved_recipes(user_id, recipe_id)
                        VALUES(?,?)`;
    try {
      await db.query(insertQuery, [user.id, recipe_id]);
      return res.json({
        success: true,
        message: "Recipe Bookmarked Successfully.",
      });
    } catch (err) {
      console.log("Error in create user saved recipe while inserting :", err);
      res.status(500).json({
        success: false,
        message: "Server Error. Please try later.",
      });
    }
  } catch (err) {
    console.log("Error in createUsrSvdRcpCntrllr - during bookmark a recipe :", err);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try later.",
    });
  }
};
