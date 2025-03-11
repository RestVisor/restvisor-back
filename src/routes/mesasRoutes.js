const express = require("express");
const router = express.Router();
const { getMesas, updateMesa, createMesa } = require("../controllers/mesasController");

router.get("/", getMesas);
router.put("/", updateMesa);
router.post("/", createMesa);

module.exports = router;