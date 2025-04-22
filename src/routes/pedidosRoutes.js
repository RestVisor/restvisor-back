const express = require("express");
const router = express.Router();
const { getPedidos, createPedido, getPedidosByMesa } = require("../controllers/pedidosController");
const authMiddleware = require("../middlewares/authMiddleware"); // Importar el middleware

router.get("/", authMiddleware, getPedidos);
router.post("/", authMiddleware, createPedido);
router.get("/mesa/numero/:numero_mesa", getPedidosByMesa);

module.exports = router;