const express = require("express");
const router = express.Router();
const { getPedidos, createPedido, getPedidosByMesa } = require("../controllers/pedidosController");
const authMiddleware = require("../middlewares/authMiddleware"); // Importar el middleware

router.get("/", authMiddleware, getPedidos);
router.post("/", authMiddleware, createPedido);
router.get("/mesa/:mesa_id", authMiddleware, getPedidosByMesa);

module.exports = router;