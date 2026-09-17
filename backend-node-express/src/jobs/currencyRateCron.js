const { getRateOfGBPforCurrencies } = require("../services/currencyCalculator.js");
const cron = require("node-cron");

// schedule currency rate update for every hr
try {
  cron.schedule("0 * * * *", async () => {
    console.log("Running currency rate update...");

    try {
      await getRateOfGBPforCurrencies();
      console.log("Currency rates updated successfully");
    } catch (error) {
      console.error("Currency rate update failed:", error);
    }
  });
} catch (error) {
  console.log("Error during cron operation of currencyRateCron :", error);
}
console.log("loaded cron for every hour");
