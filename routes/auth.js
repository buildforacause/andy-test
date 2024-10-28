const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");

router.post("/isadmin", authController.isAdmin);
router.post("/signup", authController.postSignup);
router.post("/signup/influencer", authController.postSignupInfluencer);
router.post("/delete/influencer", authController.postDeleteUser);
router.post("/signin", authController.postSignin);
router.post("/user", loginCheck, isAuth, isAdmin, authController.allUser);
router.post("/emailverification",authController.emailVerification);
router.post("/resetpassword",authController.resetPassword);

module.exports = router;
