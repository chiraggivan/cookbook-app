const db = require("../../config/database");
const { normaliseIngredientData, validateIngredients } = require("../../utils/userIngUtils");

exports.create_user_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const ogData = JSON.parse(req.body.data);
    if (!ogData) {
      return res.status(500).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // ----------------- normalise and validate the data --------------------
    const data = normaliseIngredientData(ogData);
    const error = validateIngredients(data);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Error while validating user ingredient details : ${error} .`,
      });
    }
    console.log(" normalisation and validation done for data. Now starting with image file.");
    // Read & save image file
    const image_file = req.file;

    // check if file is really jpeg or png and not some malicious file
    if (image_file && !["image/jpeg", "image/png"].includes(image_file.mimetype)) {
      return res.status(400).json({ error: "Invalid image type" });
    }

    if (image_file) {
      //   console.log("image found with data");

      // generate unique filename
      const path = require("path");
      const { v4: uuidv4 } = require("uuid");

      const ext = path.extname(image_file.originalname);
      const unique_filename = `${uuidv4().replace(/-/g, "")}${ext}`;
      const save_path = path.join("static/images/user_ingredients", unique_filename);

      console.log("ext is :", ext);
      console.log("unique_filename : ", unique_filename);
      console.log("save_path :", save_path);

      // file already saved via middleware (e.g., multer)
      data["image_path"] = `ingredients/${unique_filename}`;
    } else {
      console.log("no image came with data");
      data["image_path"] = null;
    }

    // ----------------- Checking with db ------------------------

    // Validate user_id exists
    const [userRow] = await db.query(`SELECT 1 FROM users WHERE user_id = ? AND is_active = 1`, [
      user.id,
    ]);
    if (userRow.length === 0) {
      return res.status(500).json({
        success: false,
        message: "User not found or not active.",
      });
    }

    // Validate if ingredient NAME already present in MAIN ingredients table
    const [ingRow] = await db.query(`SELECT 1 FROM ingredients WHERE name = ? and is_active = 1`, [
      data.name,
    ]);
    if (ingRow.length !== 0) {
      return res.status(500).json({
        success: false,
        message: `${data.name} - already exists in general ingredients.`,
      });
    }

    // validate if ingredient NAME already present in USER ingredients table by same user
    const [row] = await db.query(
      `SELECT 1 FROM user_ingredients WHERE name = ? and submitted_by = ? AND is_active = 1`,
      [data.name, user.id],
    );
    if (row.length !== 0) {
      return res.status(500).json({
        success: false,
        message: `You already have this ingredient (${data.name}).`,
      });
    }

    return res.status(200).json({
      success: true,
      message: " done with noramlisation, validation along with db check",
      data,
      ogData,
    });

    // ------------------------------ Now insert the data thru procedure ------------------------------------------

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(`CALL insert_user_ingredient_plus_units(?,?,?,?,?,?,?,?)`, [
        data.name,
        data.quantity,
        data.unit,
        data.price,
        data.cup_weight,
        data.cup_unit,
        data.notes,
        user.id,
      ]);

      await conn.commit();
    } catch (err) {
      // Rollback EVERYTHING if anything fails
      await conn.rollback();
      console.error("Error in createUserIngController- (create_user_ingredient):", err);

      return res.status(500).json({
        success: false,
        message: "Error while inserting user ingredient in db",
      });
    } finally {
      conn.release();
    }

    //  FINAL response
    res.json({
      success: true,
      message: `user ingredient added.`,
    });
  } catch (err) {
    console.error("Error in createUserIngController - create_user_ingredient is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
