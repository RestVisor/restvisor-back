const { sql } = require("../config/db");

const getPedidos = async (req, res) => {
    const { data, error } = await sql.from("orders").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

const createPedido = async (req, res) => {
    const { id, tableNumber, status, created_at } = req.body;
    const { data, error } = await sql.from("orders").insert([{ id, tableNumber, status, created_at }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
    console.log("Successfully created pedido");
};

module.exports = { getPedidos, createPedido };