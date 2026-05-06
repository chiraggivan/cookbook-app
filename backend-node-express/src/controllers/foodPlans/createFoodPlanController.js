const db = require("../../config/database");

const {
  meals,
  total_weeks,
  normalisePlan,
  validateFoodPlan,
} = require("../../utils/foodPlanUtils"); // use by create_food_plan function

// mostly not used any more.
exports.create_food_plan = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step
    const data = req.body;

    // ----------------------------- normalize and validate data ---------------------------

    const foodPlan = normalisePlan(data);
    const { error, recipeIds } = validateFoodPlan(data, meals);
    if (error) {
      res.json({
        success: false,
        message: `found errors in validation of create food plan -- ${error}`,
        foodPlan,
      });
    }

    return res.json({
      success: true,
      message: `recipeIds found. API not completed as its not required as of now.`,
      recipeIds,
    });

    //  --------------------------- connect db and verify data --------------------------
    // # connect to db

    // FINAL response
    res.json({
      success: true,
      message: `ingredients found`,
      data,
    });
  } catch (err) {
    console.error("Error in createFoodPlanController - (create_food_plan) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// this is to create food_plan_id for user once.
exports.create_food_plan_id = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // --------------------------- connect db and verify data --------------------------

    //  check user is valid and active (user might have old token)
    const [userRow] = await db.query(
      `SELECT display_name FROM users WHERE user_id = ? AND is_active = 1`,
      [user.id],
    );
    if (userRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  check if there is already food_plan_id assigned to the user
    const [planRow] = await db.query(
      "SELECT food_plan_id, user_id, is_active FROM food_plans WHERE user_id = ?",
      [user.id],
    );
    if (planRow.length !== 0) {
      const userActive = planRow[0].is_active;

      // if user found check if that food plan id is active or not
      if (userActive) {
        return res.status(404).json({
          success: false,
          message: `food plan already exist. Cant create new food plan.`,
        });
      } else {
        const [result] = await db.query(
          `UPDATE food_plans
          SET is_active = 1, updated_at = CURRENT_TIMESTAMP
          WHERE food_plan_id = ? AND user_id = ? `,
          [planRow[0].food_plan_id, user.id],
        );
        return res.json({
          success: true,
          message: `food plan is active now.`,
        });
      }
    }

    //  ------------------ Inserting data in db  ------------------------

    // inserting data in food plan table. (as only one table is being used for DML, can do without conn getconnection())
    const [result] = await db.query(
      `INSERT INTO food_plans (user_id, total_weeks)
        VALUES (?,?) `,
      [user.id, total_weeks],
    );

    // FINAL response
    res.json({
      success: true,
      message: `new food plan id (${result.insertId}) created for user - ${user.id}.`,
      data,
    });
  } catch (err) {
    console.error("Error in createFoodPlanController - (create_food_plan_id) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};

// check if user has plan id in food_plan table
exports.check_user_has_plan = async (req, res) => {
  try {
    const user = req.user; // as we are doing authenticateToken with this api, user is attached with req in previous step

    // check if there is already food_plan_id assigned to the user
    const [planRow] = await db.query(
      `SELECT food_plan_id from food_plans WHERE user_id = ? AND is_active = 1`,
      [user.id],
    );
    if (planRow.length === 0) {
      return res.json({
        success: true,
        message: `user doesnt have food plan yet.`,
        userExist: false,
      });
    }
    // FINAL response
    res.json({
      success: true,
      message: `user has a food plan`,
      userExist: true,
      plan_id: planRow[0].food_plan_id,
    });
  } catch (err) {
    console.error("Error in createFoodPlanController - (check_user_has_plan) is : ", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
  }
};
