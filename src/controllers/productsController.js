const { sql } = require("../config/db");

const getProducts = async (req, res) => {
    const { data, error } = await sql.from("products").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const createProducts = async (req, res) => {
    const { id, name, description, price, category } = req.body;
    const { data, error } = await sql.from("products").insert([{ id, name, description, price, category }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

module.exports = { getProducts, createProducts };