const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authToken = require("../middleware/authenticateToken");

// All authentication routes will go here
router.post("/login", authController.login);
router.get("/profile", authToken, authController.profile);
router.get("/checkUsername/:uname", authController.checkUsername);
router.get("/checkemail/:email", authController.checkEmail);
router.post("/register", authController.register);
router.post("/googleSignin", authController.googleSignin);
router.get("/countryList", authController.countryList);
router.get("/verifyingUserEmail", authController.verifyUser);
router.get("/reVerifyEmail", authController.reVerifyEmail);
router.get("/newEmailForReverification", authController.newEmailForReverification);
router.get("/pswdResetEmail", authController.pswdResetEmail);
router.get("/checkPasswordResetLink", authController.chckPwdResetLnk);
router.post("/updatePassword", authController.updatePassword);

// user setting details are to be shown for logged in users only do
// router.get("/userDetailsForSettings/:user_id", authToken, authController.userSettings);
// router.get("/userDetailsForSettings/country/countryList", authToken, authController.countryList);

module.exports = router;
