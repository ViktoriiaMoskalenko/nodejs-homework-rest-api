const express = require("express");

const {
  register,
  login,
  logout,
  current,
  subscription,
} = require("../../controllers/auth");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, register);

router.post("/login", jsonParser, login);

router.post("/logout", authMiddleware, logout);

router.get("/current", authMiddleware, current);

router.patch("/", authMiddleware, subscription);

module.exports = router;
