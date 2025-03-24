const express = require("express");
const router = express.Router();
const { getPedidos, createPedido, getProducts, createProducts} = require("../controllers/productsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProducts);

module.exports = router;