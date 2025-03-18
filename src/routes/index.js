const express = require("express");
const router = express.Router();

const usuariosRoutes = require("./usuariosRoutes");
const pedidosRoutes = require("./pedidosRoutes");
const mesasRoutes = require("./mesasRoutes");

router.use("/usuarios", usuariosRoutes);
router.use("/pedidos", pedidosRoutes);
router.use("/mesas", mesasRoutes);

module.exports = router;
