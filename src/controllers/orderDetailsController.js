const { sql } = require("../config/db");

const getDetailOrderByOrderId = async (req, res) => {
    const { pedido_id } = req.params;
    const { data, error } = await sql.from("order_details").select("*").eq("pedido_id", pedido_id);  // Filtras por el ID

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(data);
};

const createDetailOrder = async (req, res) => {
    console.log(req.body);
    const { id, pedido_id, producto_id, cantidad } = req.body;
    const { data, error } = await sql.from("order_details").insert([{ id, pedido_id, producto_id, cantidad }]);
    if (error) return res.status(500).json({ error: error.message });

    const { data: productData, error: productError } = await sql.from("products").select("stock").eq("id", producto_id).single();
    if (productError) return res.status(500).json({ error: productError.message });

    const nuevoStock = productData.stock - cantidad;
    if (nuevoStock < 0) return res.status(400).json({ error: "No hay suficiente stock disponible" });

    const { error: updateError } = await sql.from("products").update({ stock: nuevoStock }).eq("id", producto_id);
    if (updateError) return res.status(500).json({ error: updateError.message });

    res.json(data);
    console.log("Successfully created detail pedido");
};

module.exports = { getDetailOrderByOrderId, createDetailOrder };