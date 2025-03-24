const { sql } = require("../config/db");

const getPedidos = async (req, res) => {
    const { data, error } = await sql.from("orders").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const createPedido = async (req, res) => {
    const { mesa_id, productos } = req.body;
    const { data, error } = await sql.from("orders").insert([{ mesa_id, estado: "pendiente" }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

module.exports = { getPedidos, createPedido };