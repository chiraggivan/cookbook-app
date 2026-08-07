const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("./src/config/cloudinary");

const app = require("./src/app.js");

const db = require("./src/config/database.js");
const { cloudinary_js_config } = require("./src/config/cloudinary.js");

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
