const db = require("../../../config/database");

exports.getLastRecordOfRecipeCreated = async (recipeId, userId) => {
  try {
    // check db to get the dish prepared in the past
    const [lastPrepared] = await db.query(
      `SELECT preparation_date, time_prepared, created_at 
        FROM dishes 
        WHERE recipe_id =  ? AND user_id = ? AND is_active = 1 ORDER BY preparation_date DESC, time_prepared DESC LIMIT 1`,
      [recipeId, userId],
    );
    if (lastPrepared.length !== 0) {
      lastPrepared[0].preparation_date = new Date(lastPrepared[0].preparation_date).toISOString();
    }

    let date_prepared;
    let time_prepared;
    let created_at;
    if (lastPrepared.length === 0) {
      last_prepared_date = "";
      last_prepared_time = "";
    } else {
      last_prepared_date = lastPrepared[0].preparation_date.split("T")[0];
      last_prepared_time = lastPrepared[0].time_prepared;
    }

    // return data
    return {
      success: true,
      message: `found last record(even if empty)`,
      data: { last_prepared_date, last_prepared_time },
    };
  } catch (err) {
    console.log("error during getLastRecordOfRecipeCreated :", err);
    return {
      success: false,
      message: `something went wrong while searching for last record`,
      data: null,
    };
  }
};
