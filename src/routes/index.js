const express = require("express");
const router = express.Router();

const usuariosRoutes = require("./usuariosRoutes");
const pedidosRoutes = require("./pedidosRoutes");
const mesasRoutes = require("./mesasRoutes");
const productsRoutes = require("./productsRoutes");

router.use("/usuarios", usuariosRoutes);
router.use("/orders", pedidosRoutes);
router.use("/tables", mesasRoutes);
router.use("/products", productsRoutes);

module.exports = router;
