const { sql } = require("../config/db");

const getMesas = async (req, res) => {
    const { data, error } = await sql.from("tables").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const updateMesa = async (req, res) => {
    const { id, estado } = req.body;
    const { data, error } = await sql.from("tables").update({ estado }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

// Agregar una nueva mesa
const createMesa = async (req, res) => {
    const { numero, estado } = req.body;

    if (!numero || !estado) {
        return res.status(400).json({ error: "El número y estado de la mesa son obligatorios" });
    }

    const { data, error } = await sql
        .from("tables")
        .insert([{ numero, estado }])
        .select()
        .single();

    if (error) {
        console.error("Error al crear mesa:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Mesa creada con éxito", mesa: data });
};

module.exports = { getMesas, updateMesa, createMesa };