const express = require("express");
const router = express.Router();
const { getPedidos, createPedido } = require("../controllers/pedidosController");

router.get("/", getPedidos);
router.post("/", createPedido);

module.exports = router;