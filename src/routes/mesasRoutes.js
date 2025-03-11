const express = require("express");
const router = express.Router();
const { getMesas, updateMesa } = require("../controllers/mesasController");

router.get("/", getMesas);
router.put("/", updateMesa);

module.exports = router;