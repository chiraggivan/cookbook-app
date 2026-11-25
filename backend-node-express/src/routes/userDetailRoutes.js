const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const readUserDetailController = require("../controllers/userDetail/readUserDetailController");
const updtUserDetailController = require("../controllers/userDetail/updateUserDetailController");
const authToken = require("../middleware/authenticateToken");

// Read apis
router.get("/profile", authToken, authController.profile);
router.get("/userDetailsForSettings/:user_id", authToken, readUserDetailController.userSettings);
router.get("/userDetailsForSettings/country/countryList", authToken, authController.countryList);
router.get("/userDetailsForSettings/language/languageList", authToken, authController.languageList);

// Update api
router.get(
  "/userDetailsForSettings/updateCountry/:id",
  authToken,
  updtUserDetailController.updateUserCountry,
);
router.get(
  "/userDetailsForSettings/updateName/:name",
  authToken,
  updtUserDetailController.updateDisplayName,
);
router.post(
  "/userDetailsForSettings/updateLanguage/:id",
  authToken,
  updtUserDetailController.updateUserPreferredLanguage,
);

module.exports = router;
