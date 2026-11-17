const { getAlternativeNamesForIngredients } = require("../services/addIngAltNames");
const cron = require("node-cron");

// schedule find alternative names in different language for every hr at 15th min
try {
  cron.schedule("*/5 * * * *", async () => {
    // console.log("TEST : Calling gemini AI to fetch alternative names of ingredients...");

    try {
      await getAlternativeNamesForIngredients();
      //   console.log("TEST : Successfully created alternative names of ingredient(s)");
    } catch (error) {
      console.error("fetching Alternative names of ingredient failed:", error);
    }
  });
} catch (error) {
  console.log("Error during cron operation of ingAltNamesCrons :", error);
}
console.log("loaded cron for every hour at 15th min");
