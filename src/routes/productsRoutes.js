const express = require("express");
const router = express.Router();
const { getPedidos, createPedido, getProducts, createProducts, deleteProduct} = require("../controllers/productsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProducts);
router.post("/:id", authMiddleware, deleteProduct);

module.exports = router;