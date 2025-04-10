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

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    const { error } = await sql.from("products").update({ name, description, price, category }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Product updated successfully" });
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    // Intentar eliminar el producto
    const { error } = await sql.from("products").delete().eq("id", id);
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Product deleted successfully" });
};

module.exports = { getProducts, createProducts, updateProduct, deleteProduct };