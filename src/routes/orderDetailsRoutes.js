const express = require("express");
const router = express.Router();
const { getDetailOrderByOrderId, createDetailOrder } = require("../controllers/orderDetailsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getDetailOrderByOrderId);
router.post("/", authMiddleware, createDetailOrder);

module.exports = router;