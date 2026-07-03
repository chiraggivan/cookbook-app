const db = require("../../config/database");
// const { readRecipeDetailsQ } = require("./utils/mysqlQueries");
const { getRecipeDetailsById } = require("./utils/readRecipeDetailsById");

// get all the recipes
exports.get_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    const [result] = await db.query(
      `
        SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username, u.display_name 
        FROM recipes r JOIN users u ON r.user_id = u.user_id
        WHERE r.is_active = TRUE
        AND (r.user_id = ? OR r.privacy = 'public') 
        ORDER BY r.created_at DESC
        `,
      [user.id],
    );

    res.json({
      success: true,
      message: `All recipes found`,
      data: result,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_recipes is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get all the recipe of a certain user
exports.get_user_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const find_user = Number(req.params.q);

    if (!find_user || find_user < 1 || !Number.isInteger(find_user)) {
      return res.status(404).json({
        success: false,
        message: "user not found in params or not defined properly",
      });
    }

    // searched user is same as logged in user
    if (user.id === find_user) {
    }

    // verify user exists
    const [userResult] = await db.query(
      "SELECT display_name, username, email, picture_url, email_verified FROM users WHERE user_id = ? AND is_active = 1",
      [find_user],
    );
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "searched user not found",
      });
    }

    // search list of public recipes of a particular user
    const [finalResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username
            FROM recipes r 
            JOIN users u ON r.user_id = u.user_id
            WHERE r.is_active = TRUE
            AND r.user_id = ?
            AND r.privacy = 'public'
            ORDER BY r.created_at DESC`,
      [find_user],
    );

    const sendData = {};
    sendData.userInfo = userResult[0];
    sendData.userRecipes = finalResult;
    // console.log("sendData :", sendData);
    // response the data
    res.json({
      success: true,
      message: `Recipes found for ${find_user}`,
      data: sendData,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_user_recipes:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get my recipes
exports.get_my_recipes = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // verify user exists
    const [userResult] = await db.query(
      "SELECT username FROM users WHERE user_id = ? AND is_active = 1",
      [user.id],
    );
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: " user not active or not found",
      });
    }

    // find all the recipes of logged in user
    const [finalResult] = await db.query(
      `SELECT r.recipe_id, r.name, r.user_id, r.portion_size, r.description, u.username
        FROM recipes r 
        JOIN users u ON r.user_id = u.user_id
        WHERE r.is_active = TRUE
        AND r.user_id = ? 
        ORDER BY r.created_at DESC`,
      [user.id],
    );

    // response the data back
    res.json({
      success: true,
      message: `Recipes found for user`,
      data: finalResult,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_my_recipes:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// Get a recipe details
exports.get_recipe_details = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipeId = Number(req.params.q);

    //  check if recipeId is negative
    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: "Recipe id must a positive number",
      });
    }

    // get the recipe details data from calling the function
    const { success, message, data } = await getRecipeDetailsById(recipeId, user.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: message,
      });
    }

    // response the data
    res.json({
      success: success,
      message: message,
      data: data,
    });
  } catch (err) {
    console.error("Error in readRecipeController - get_recipe_details:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// get last dish prepared info
exports.get_last_record = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const recipeId = Number(req.params.recipeId);
    if (!recipeId || recipeId < 1 || !Number.isInteger(recipeId)) {
      return res.status(404).json({
        success: false,
        message: `recipeId provided is not defined properly. should be positive integer`,
      });
    }
    // check db to get the dish prepared in the past
    const [lastPrepared] = await db.query(
      `SELECT preparation_date, time_prepared, created_at 
        FROM dishes 
        WHERE recipe_id =  ? AND user_id = ? AND is_active = 1 ORDER BY preparation_date DESC, time_prepared DESC LIMIT 1`,
      [recipeId, user.id],
    );
    if (lastPrepared.length !== 0) {
      lastPrepared[0].preparation_date = new Date(lastPrepared[0].preparation_date).toISOString();
    }
    // console.log("last record : ", lastPrepared);
    let date_prepared;
    let time_prepared;
    let created_at;
    if (lastPrepared.length === 0) {
      date_prepared = "";
      time_prepared = "";
      created_at = "";
    } else {
      date_prepared = lastPrepared[0].preparation_date.split("T")[0];
      time_prepared = lastPrepared[0].time_prepared;
      created_at = lastPrepared[0].created_at;
    }

    // FINAL response
    res.json({
      success: true,
      message: `Recipe last record found.`,
      data: { date_prepared, time_prepared, created_at },
    });
  } catch (err) {
    console.error("Error in createDishController - get_last_record is:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
