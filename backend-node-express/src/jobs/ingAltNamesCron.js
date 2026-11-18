const { getAlternativeNamesForIngredients } = require("../services/addIngAltNames");
const cron = require("node-cron");

// schedule find alternative names in different language for every hr at 15th min
try {
  const task = cron.schedule("*/15 * * * *", async () => {
    console.log("CRON CALLBACK START:", new Date().toISOString());

    try {
      await getAlternativeNamesForIngredients();
    } catch (error) {
      console.error("Cron error:", error);
    }
  });

  task.on("execution:missed", (ctx) => {
    console.log("CRON MISSED:", {
      scheduledTime: ctx.date,
      actualTime: new Date().toISOString(),
    });
  });

  task.on("execution:started", () => {
    console.log("CRON EXECUTION STARTED:", new Date().toISOString());
  });

  task.on("execution:finished", () => {
    console.log("CRON EXECUTION FINISHED:", new Date().toISOString());
  });

  task.on("execution:failed", (ctx) => {
    console.log("CRON EXECUTION FAILED:", ctx.execution?.error);
  });

  task.on("execution:overlap", () => {
    console.log("CRON EXECUTION OVERLAP");
  });

  console.log("Next scheduled run:", task.getNextRun());
  // cron.schedule("*/1 * * * *", async () => {
  //   console.log(`cron schedule triggered at....... ${new Date().toISOString()}`);
  //   // console.log("TEST : Calling gemini AI to fetch alternative names of ingredients...");

  //   try {
  //     await getAlternativeNamesForIngredients();
  //     //   console.log("TEST : Successfully created alternative names of ingredient(s)");
  //   } catch (error) {
  //     console.error("fetching Alternative names of ingredient failed:", error);
  //   }
  // });
} catch (error) {
  console.log("Error during cron operation of ingAltNamesCrons :", error);
}
console.log("loaded cron for every 15th min");
