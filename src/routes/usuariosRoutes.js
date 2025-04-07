const express = require("express");
const router = express.Router();
const { register, login, validateToken } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/validate", authMiddleware, validateToken);

module.exports = router;
