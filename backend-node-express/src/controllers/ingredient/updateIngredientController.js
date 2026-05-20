const db = require("../../config/database");
const { normaliseIngredientData, validateIngredient } = require("../../utils/ingredientsUtils");

exports.search_ingredients = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;
    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    const q = (req.query.q || "").trim().toLowerCase();
    const ingId = Number(req.query.ingId);
    //  check if ingId is + whole number
    if (!ingId || ingId < 1 || !Number.isInteger(ingId)) {
      return res.status(500).json({
        success: false,
        message: "Ingredient id should be a positive whole Number.",
      });
    }

    // check with db if user is still admin and active as token might be old and not updated
    const [userResult] = await db.query(
      `SELECT role FROM users WHERE user_id = ? AND is_active =1`,
      [user.id],
    );
    if (userResult[0].role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "Not Authorised to search.",
      });
    }

    // if q (query is empty or "") dont run SQL
    if (!q) {
      res.json({
        success: true,
        message: `ingredients list found.`,
        data: [],
      });
    }

    // get the list of all the ingredients having the searched text and ingId
    const [rows] = await db.query(
      `SELECT  i.name
        FROM ingredients i 
        WHERE LOWER(i.name) LIKE ? AND i.ingredient_id != ?
        LIMIT 20`,
      [`%${q}%`, ingId],
    );

    // FINAL response
    res.json({
      success: true,
      message: `ingredients list found.`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in deleteIngredientController -(delete_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

exports.update_ingredient = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const role = user.role;
    const ingId = Number(req.params.ingId);

    //  check is user has admin privilege
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required.",
      });
    }

    //  check if ingId is +ve whole number
    if (!ingId || ingId < 1 || !Number.isInteger(ingId)) {
      return res.status(400).json({
        success: false,
        message: "Ingredient id should be a positive whole Number.",
      });
    }

    // check data is available
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Data not sent with the body.",
      });
    }

    // ----------------- normalise and validate the data --------------------
    const data = normaliseIngredientData(req.body);
    const error = validateIngredient(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Error while validating ingredient details : ${error} .`,
      });
    }
    // ----------------- Checking with db ------------------------

    // check with db if user is still admin and active as token might be old and not updated
    const [userResult] = await db.query(
      `SELECT role FROM users WHERE user_id = ? AND is_active =1`,
      [user.id],
    );
    if (userResult[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised to update ingredients.",
      });
    }

    // get the list of all the ingredients having the searched text but not same ingId
    const [rows] = await db.query(
      `SELECT  i.name
        FROM ingredients i 
        WHERE LOWER(i.name) LIKE ? AND ingredient_id != ?
        LIMIT 20`,
      [data.name, ingId],
    );
    if (rows.length !== 0) {
      return res.status(409).json({
        success: false,
        message: `${data.name} - already exists. Give another name.`,
      });
    }

    // check if ingredient id exists and get all the data of ingredients
    const [ingRow] = await db.query(
      `SELECT name, base_unit, default_price, cup_weight, cup_unit, notes, display_quantity, display_unit, display_price
      FROM ingredients 
      WHERE ingredient_id = ? `,
      [ingId],
    );
    if (ingRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${ingId} -  does not exists.`,
      });
    }
    const previous_ingredient = ingRow[0];

    const previous_data = {};
    previous_data.name = previous_ingredient?.name;
    previous_data.reference_unit = previous_ingredient?.base_unit;
    previous_data.default_price = Number(previous_ingredient?.default_price);
    previous_data.cup_weight = Number(previous_ingredient?.cup_weight);
    previous_data.cup_unit = previous_ingredient?.cup_unit;
    previous_data.display_quantity = Number(previous_ingredient?.display_quantity);
    previous_data.display_unit = previous_ingredient?.display_unit;
    previous_data.display_price = Number(previous_ingredient?.display_price);
    previous_data.notes = previous_ingredient?.notes;

    // normalise new reference unit for comparison
    let new_ref_unit;
    let new_def_price;

    // convert ref unit to basic (kg, l, pc, or bunch) units depending on submitted ref unit
    switch (data?.reference_unit) {
      case "l":
        new_ref_unit = "l";
        new_def_price = data?.display_price / data?.display_quantity;
        break;
      case "ml":
        new_ref_unit = "l";
        new_def_price = (data?.display_price / data?.display_quantity) * 1000;
        break;
      case "fl.oz":
        new_ref_unit = "l";
        new_def_price = (data?.display_price / data?.display_quantity) * 35.1951;
        break;
      case "pint":
        new_ref_unit = "l";
        new_def_price = (data?.display_price / data?.display_quantity) * 1.75975;
        break;
      case "kg":
        new_ref_unit = "kg";
        new_def_price = data?.display_price / data?.display_quantity;
        break;
      case "g":
        new_ref_unit = "kg";
        new_def_price = (data?.display_price / data?.display_quantity) * 1000;
        break;
      case "oz":
        new_ref_unit = "kg";
        new_def_price = (data?.display_price / data?.display_quantity) * 35.274;
        break;
      case "lbs":
        new_ref_unit = "kg";
        new_def_price = (data?.display_price / data?.display_quantity) * 2.20462;
        break;
      case "pc":
        new_ref_unit = "pc";
        new_def_price = data?.display_price / data?.display_quantity;
        break;
      case "bunch":
        new_ref_unit = "bunch";
        new_def_price = data?.display_price / data?.display_quantity;
        break;
      default:
        throw new Error(`Unsupported reference unit: ${data?.reference_unit}`);
    }

    // ------------------------------ Now insert the data thru procedure ------------------------------------------

    //make sure the new data is different from old data before calling procedure
    const oldNotes = previous_data?.notes ?? "";
    const newNotes = data?.notes ?? "";

    const oldCupWeight = previous_data?.cup_weight ?? null;
    const newCupWeight = data?.cup_equivalent_weight ?? null;

    const oldCupUnit = previous_data?.cup_unit ?? null;
    const newCupUnit = data?.cup_equivalent_unit ?? null;

    const oldPrice = Number(previous_data?.default_price);
    const newPrice = Number(new_def_price.toFixed(4));

    const oldDisplayQuantity = Number(previous_data?.display_quantity);
    const newDisplayQuantity = Number(data?.display_quantity);

    const oldDisplayUnit = previous_data?.display_unit;
    const newDisplayUnit = data?.display_unit;

    const oldDisplayPrice = Number(previous_data?.display_price);
    const newDisplayPrice = Number(data?.display_price);

    // helper function
    const isDifferent = (a, b) => a !== b;
    const numDifferent = (a, b) => Number(a) !== Number(b);

    // console.log("previous data :", previous_data);
    // console.log("data :", data);
    const shouldUpdate =
      isDifferent(previous_data?.name, data?.name) ||
      isDifferent(previous_data?.reference_unit, new_ref_unit) ||
      numDifferent(oldPrice, newPrice) ||
      isDifferent(oldNotes, newNotes) ||
      numDifferent(oldCupWeight, newCupWeight) ||
      isDifferent(oldCupUnit, newCupUnit) ||
      numDifferent(oldDisplayQuantity, newDisplayQuantity) ||
      isDifferent(oldDisplayUnit, newDisplayUnit) ||
      numDifferent(oldDisplayPrice, newDisplayPrice);

    // if both - new and old - data are mismatch then call procedure
    if (shouldUpdate) {
      // console.log("data is NOT same. so we need to update ingredients table.");
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [result] = await conn.query(
          `CALL update_ingredient_plus_units(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            ingId,
            data?.name,
            data?.reference_quantity,
            data?.reference_unit,
            data?.default_price,
            data?.cup_equivalent_weight,
            data?.cup_equivalent_unit,
            data?.notes,
            user.id,
            role,
            data?.display_quantity,
            data?.display_unit,
            data?.display_price,
          ],
        );
        await conn.commit();
      } catch (err) {
        // Rollback EVERYTHING if anything fails
        await conn.rollback();
        console.error("Error in updateIngredientController- (update_ingredient):", err);

        return res.status(500).json({
          success: false,
          message: "Error while updating ingredient in db",
        });
      } finally {
        conn.release();
      }
    } else {
      return res.status(200).json({
        success: true,
        message: `Data is same. No need to call db`,
      });
    }

    // FINAL response
    res.json({
      success: true,
      message: `ingredient (${ingId}) Updated.`,
      data: rows,
    });
  } catch (err) {
    console.error("Error in updateIngredientController -(update_ingredient)  is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
