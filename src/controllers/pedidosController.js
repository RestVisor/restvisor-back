const { sql } = require("../config/db");

const getPedidos = async (req, res) => {
    const { data, error } = await sql.from("orders").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

const getPedidosByMesa = async (req, res) => {
    const { mesa_id } = req.params;

    try {
        // Primero obtenemos todos los pedidos de la mesa
        const { data: pedidos, error: pedidosError } = await sql
            .from("orders")
            .select(`
                *,
                order_details (
                    *,
                    products (*)
                )
            `)
            .eq("tableNumber", mesa_id);

        if (pedidosError) throw pedidosError;

        if (!pedidos || pedidos.length === 0) {
            return res.status(404).json({
                mensaje: `No se encontraron pedidos para la mesa ${mesa_id}`
            });
        }

        res.json({
            mensaje: "Pedidos encontrados",
            mesa_id,
            pedidos
        });

    } catch (error) {
        console.error('Error al obtener pedidos de la mesa:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            mensaje: 'No se pudieron obtener los pedidos de la mesa'
        });
    }
};

const createPedido = async (req, res) => {
    const { id, tableNumber, status, created_at } = req.body;
    const { data, error } = await sql.from("orders").insert([{ id, tableNumber, status, created_at }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
    console.log("Successfully created pedido");
};

module.exports = { getPedidos, createPedido, getPedidosByMesa };