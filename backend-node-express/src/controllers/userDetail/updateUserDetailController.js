const db = require("../../config/database");
const jwt = require("jsonwebtoken");

// Update user's country
exports.updateUserCountry = async (req, res) => {
  try {
    const user = req.user;
    const newCntryId = Number(req.params.id);

    //   check if newCtryId is number and int more than 0
    if (!newCntryId || newCntryId < 0 || !Number.isInteger(newCntryId)) {
      return res.status(400).json({
        success: false,
        message: "Not a proper format for country id",
      });
    }
    //   if country id is same(from token and url params) then no need to update in db, rather send success message
    if (newCntryId === user.country_id) {
      return res.status(400).json({
        success: false,
        message: "No need to change.",
      });
    }

    // -------- check if newCntryId is valid in db-------------------
    try {
      const query = `SELECT name FROM countries 
                    WHERE country_id = ? AND is_active = 1`;
      const [result] = await db.query(query, [newCntryId]);

      if (result.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No such country exists.",
        });
      }
    } catch (error) {
      console.log("Error in updtUsrDtlsCntrllr - update country :", error);
      return res.status(400).json({
        success: false,
        message: "Server Error",
      });
    }

    // BREAK POINT
    //   return res.json({
    //     success: true,
    //     message: "Break point test",
    //   });
    // ---------------- update user's country and create new token and user json to be send to frontend ------------
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const query = `UPDATE users SET country_id = ? WHERE user_id = ? AND is_active = 1`;
      await conn.query(query, [newCntryId, user.id]);

      // fetch the new data for user
      const [userResult] = await conn.query(
        `SELECT u.user_id, u.username, u.display_name, u.picture_url, u.email, u.email_verified,
              u.role, u.country_id , c.name as country_name, c.country_code, c.currency_id,
              cu.symbol as currency_symbol
        FROM users u 
            JOIN countries c ON u.country_id = c.country_id
            JOIN currencies cu ON cu.currency_id = c.currency_id
        WHERE u.user_id = ? AND u.is_active = 1`,
        [user.id],
      );
      const userDetails = userResult[0];

      //   console.log("new country is :", userDetails.country_name);
      // create token with user details to be sent as response
      const token = jwt.sign(
        {
          id: userDetails.user_id,
          username: userDetails.username,
          role: userDetails.role,
          country_id: userDetails.country_id,
          country_name: userDetails.country_name,
          currency_id: userDetails.currency_id,
          currency_symbol: userDetails.currency_symbol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      await conn.commit();
      // Final json to frontend
      res.json({
        success: true,
        message: "Country update successful",
        token,
        user: {
          user_id: userDetails.user_id,
          username: userDetails.username,
          role: userDetails.role,
          display_name: userDetails.display_name,
          picture_url: userDetails.picture_url,
          country_id: userDetails.country_id,
          country_name: userDetails.country_name,
          currency_id: userDetails.currency_id,
          currency_symbol: userDetails.currency_symbol,
        },
      });
    } catch (error) {
      await conn.rollback();
      console.log("Error with db transaction :", error);
      return res.status(400).json({
        success: false,
        message: "Something went wrong during updation.",
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.log("Error in updtUsrDtlsCntrllr :", error);
    return res.status(400).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update user's Display Name of user
exports.updateDisplayName = async (req, res) => {
  try {
    const user = req.user;
    const newName = req.params.name.trim().replace(/\s+/g, " ");

    // console.log("user :", user);
    console.log("newName :", newName);
    console.log("name length is:", newName.length);

    //   check if newName is not empty
    if (!newName || newName.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name missing",
      });
    }

    //   if newName is same then no need to update in db
    if (newName === user.display_name) {
      return res.json({
        success: false,
        message: "Same as old name. No need to change.",
      });
    }

    // ---------- normalise and validate newName -------------------
    // as only one variable is to be checked, and normalisation done during
    // initialising newName variable above, just validate the length of string
    if (newName.length > 25) {
      return res.status(400).json({
        success: false,
        message: "Name length should be less than 25",
      });
    }

    // BREAK POINT
    // return res.json({
    //   success: false, // success = true with status(200) will look for user and token data in frontend
    //   message: "Break point test",
    // });
    // ---------------- update user's country and create new token and user json to be send to frontend ------------
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const query = `UPDATE users SET display_name = ? WHERE user_id = ? AND is_active = 1`;
      await conn.query(query, [newName, user.id]);

      // fetch the new data for user
      const [userResult] = await conn.query(
        `SELECT u.user_id, u.username, u.display_name, u.picture_url, u.email, u.email_verified,
              u.role, u.country_id , c.name as country_name, c.country_code, c.currency_id,
              cu.symbol as currency_symbol
        FROM users u 
            JOIN countries c ON u.country_id = c.country_id
            JOIN currencies cu ON cu.currency_id = c.currency_id
        WHERE u.user_id = ? AND u.is_active = 1`,
        [user.id],
      );
      const userDetails = userResult[0];

      //   console.log("new country is :", userDetails.country_name);
      // create token with user details to be sent as response
      const token = jwt.sign(
        {
          id: userDetails.user_id,
          username: userDetails.username,
          role: userDetails.role,
          country_id: userDetails.country_id,
          country_name: userDetails.country_name,
          currency_id: userDetails.currency_id,
          currency_symbol: userDetails.currency_symbol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      await conn.commit();
      // Final json to frontend
      res.json({
        success: true,
        message: "Display Name update successful",
        token,
        user: {
          user_id: userDetails.user_id,
          username: userDetails.username,
          role: userDetails.role,
          display_name: userDetails.display_name,
          picture_url: userDetails.picture_url,
          country_id: userDetails.country_id,
          country_name: userDetails.country_name,
          currency_id: userDetails.currency_id,
          currency_symbol: userDetails.currency_symbol,
        },
      });
    } catch (error) {
      await conn.rollback();
      console.log("Error in updtUsrDtlsCntrllr - updtDisplayName with db transaction :", error);
      return res.status(400).json({
        success: false,
        message: "Something went wrong during  name updation.",
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.log("Error in updtUsrDtlsCntrllr during updateDisplayName :", error);
    return res.status(400).json({
      success: false,
      message: "Server Error",
    });
  }
};
