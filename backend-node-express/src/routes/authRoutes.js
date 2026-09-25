const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authenticateToken");

// All authentication routes will go here
router.post("/login", authController.login);
router.get("/profile", authenticateToken, authController.profile);
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

module.exports = router;
