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
    const { id, pedido_id, producto_id, cantidad } = req.body;

    try {
        // Verificar que el producto existe y obtener su stock actual
        const { data: productData, error: productError } = await sql
            .from("products")
            .select("stock, name")
            .eq("id", producto_id)
            .single();

        if (productError) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Verificar que hay suficiente stock
        if (productData.stock < cantidad) {
            return res.status(400).json({
                error: "Stock insuficiente",
                stockDisponible: productData.stock,
                cantidadSolicitada: cantidad
            });
        }

        // Iniciar una transacción para asegurar la consistencia de los datos
        const { data: orderDetail, error: orderError } = await sql
            .from("order_details")
            .insert([{ id, pedido_id, producto_id, cantidad }]);

        if (orderError) {
            return res.status(500).json({ error: "Error al crear el detalle del pedido" });
        }

        // Actualizar el stock del producto
        const nuevoStock = productData.stock - cantidad;
        const { error: updateError } = await sql
            .from("products")
            .update({ stock: nuevoStock })
            .eq("id", producto_id);

        if (updateError) {
            return res.status(500).json({ error: "Error al actualizar el stock" });
        }

        // Registrar el movimiento de stock
        const { error: movementError } = await sql
            .from("stock_movements")
            .insert([{
                product_id: producto_id,
                product_name: productData.name,
                quantity: cantidad,
                type: "out",
                notes: `Venta en pedido ${pedido_id}`
            }]);

        if (movementError) {
            console.error("Error al registrar el movimiento de stock:", movementError);
            // No devolvemos error aquí ya que la operación principal fue exitosa
        }

        res.json({
            message: "Detalle de pedido creado exitosamente",
            orderDetail,
            stockActualizado: nuevoStock
        });

    } catch (error) {
        console.error("Error en createDetailOrder:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getDetailOrderByOrderId, createDetailOrder };