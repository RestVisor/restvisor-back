const express = require("express");
const router = express.Router();
const { getProducts, createProducts, deleteProduct } = require("../controllers/productsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProducts);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;