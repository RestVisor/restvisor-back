const express = require("express");
const router = express.Router();
const { getPedidos, createPedido, getProducts, createProducts, updateProduct, deleteProduct} = require("../controllers/productsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProducts);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;