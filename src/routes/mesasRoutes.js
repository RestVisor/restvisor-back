const express = require("express");
const router = express.Router();
const { getMesas, updateMesa, createMesa } = require("../controllers/mesasController");
const authMiddleware = require("../middlewares/authMiddleware"); // Importar el middleware

router.get("/", authMiddleware, getMesas);
router.put("/", authMiddleware, updateMesa);
router.post("/", authMiddleware, createMesa);

module.exports = router;