const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("./src/config/cloudinary");

const app = require("./src/app.js");

const db = require("./src/config/database.js");
const { cloudinary_js_config } = require("./src/config/cloudinary.js");

// for cron job of currency xchange rate
require("./src/jobs/currencyRateCron.js");
// require("./src/jobs/ingAltNamesCron.js");

const PORT = process.env.PORT || 5001;

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed - server.js:", err);
    process.exit(1);
  });

// for testing NOT REQUIRED
// setInterval(() => {
//   console.log(`SERVER ALIVE: ${new Date().toISOString()}`);
// }, 60 * 1000);

// const { monitorEventLoopDelay } = require("node:perf_hooks");

// const histogram = monitorEventLoopDelay({
//   resolution: 20,
// });

// histogram.enable();

// setInterval(() => {
//   console.log("Event Loop Delay:", {
//     mean: (histogram.mean / 1e6).toFixed(2) + " ms",
//     max: (histogram.max / 1e6).toFixed(2) + " ms",
//   });

//   histogram.reset();
// }, 60000);

// console.log("Node timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);

// TZ=UTC node server.js
