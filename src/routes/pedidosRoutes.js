const express = require("express");
const router = express.Router();
const { getPedidos, createPedido } = require("../controllers/pedidosController");
const authMiddleware = require("../middlewares/authMiddleware"); // Importar el middleware

router.get("/", authMiddleware, getPedidos);
router.post("/", authMiddleware, createPedido);

module.exports = router;