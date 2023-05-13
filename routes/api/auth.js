const express = require("express");

const {
  register,
  login,
  logout,
  current,
  subscription,
  avatar,
  avatarUpload,
  verify,
  resendVerificationEmail,
} = require("../../controllers/auth");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, register);

router.post("/login", jsonParser, login);

router.post("/logout", authMiddleware, logout);

router.get("/current", authMiddleware, current);

router.patch("/", authMiddleware, subscription);

router.patch("/avatars", authMiddleware, avatarUpload, avatar);

router.get("/verify/:verificationToken", verify);

router.post("/verify", jsonParser, resendVerificationEmail);

module.exports = router;
