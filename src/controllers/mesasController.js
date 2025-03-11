const { sql } = require("../config/db");

const getMesas = async (req, res) => {
    const { data, error } = await sql.from("mesas").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const updateMesa = async (req, res) => {
    const { id, estado } = req.body;
    const { data, error } = await sql.from("mesas").update({ estado }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

module.exports = { getMesas, updateMesa };