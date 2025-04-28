const { sql } = require('../config/db');

const getPedidos = async (req, res) => {
    const { data, error } = await sql.from('orders').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

const getPedidosByMesa = async (req, res) => {
    const { numero_mesa } = req.params;

    try {
        // Primero obtenemos todos los pedidos de la mesa por su número
        const { data: pedidos, error: pedidosError } = await sql
            .from('orders')
            .select(
                `
                *,
                order_details (
                    *,
                    products (*)
                )
            `,
            )
            .eq('tableNumber', numero_mesa)
            .order('created_at', { ascending: false }); // Ordenamos por fecha de creación, más recientes primero

        if (pedidosError) throw pedidosError;

        if (!pedidos || pedidos.length === 0) {
            return res.status(404).json({
                mensaje: `No se encontraron pedidos para la mesa número ${numero_mesa}`,
            });
        }

        res.json({
            mensaje: 'Pedidos encontrados',
            numero_mesa,
            pedidos,
        });
    } catch (error) {
        console.error('Error al obtener pedidos de la mesa:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            mensaje: 'No se pudieron obtener los pedidos de la mesa',
        });
    }
};

const createPedido = async (req, res) => {
    const { id, tableNumber, status, created_at, active } = req.body;
    const { data, error } = await sql.from('orders').insert([
        {
            id,
            tableNumber,
            status,
            created_at,
            active: active !== undefined ? active : true, // Por defecto, un nuevo pedido estará activo
        },
    ]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
    console.log('Successfully created pedido');
};

// New functions for chef dashboard

// Get all active orders with their details
const getActiveOrders = async (req, res) => {
    try {
        const { data, error } = await sql
            .from('orders')
            .select(
                `
                *,
                tables (numero),
                order_details (
                    *,
                    products (*)
                )
            `,
            )
            .eq('active', true)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching active orders:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch active orders',
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Validate status
        const validStatuses = ['pending', 'en preparación', 'listo', 'entregado'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status value',
                message: `Status must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const { data, error } = await sql.from('orders').update({ status }).eq('id', id).select();

        if (error) throw error;

        if (data && data.length === 0) {
            return res.status(404).json({
                error: 'Order not found',
                message: 'The specified order could not be found',
            });
        }

        // If status is 'entregado', deactivate the order
        if (status === 'entregado') {
            await sql.from('orders').update({ active: false }).eq('id', id);
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order: data[0],
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update order status',
        });
    }
};

const getActiveOrdersByMesa = async (req, res) => {
    const { numero_mesa } = req.params;

    try {
        // Obtenemos todos los pedidos activos de la mesa
        const { data: pedidos, error: pedidosError } = await sql
            .from("orders")
            .select(`
                *,
                order_details (
                    *,
                    products (*)
                )
            `)
            .eq("tableNumber", numero_mesa)
            .eq("active", true)
            .order('created_at', { ascending: false });

        if (pedidosError) throw pedidosError;

        if (!pedidos || pedidos.length === 0) {
            return res.status(404).json({
                error: `No se encontraron pedidos activos para la mesa número ${numero_mesa}`
            });
        }

        // Consolidamos todos los pedidos en uno solo
        const pedidoConsolidado = {
            id: pedidos[0].id, // Usamos el ID del primer pedido
            tableNumber: numero_mesa,
            status: pedidos[0].status,
            created_at: pedidos[0].created_at,
            active: true,
            order_details: []
        };

        // Consolidamos todos los detalles de los pedidos
        pedidos.forEach(pedido => {
            if (pedido.order_details && pedido.order_details.length > 0) {
                pedidoConsolidado.order_details.push(...pedido.order_details);
            }
        });

        // Agrupamos los productos iguales y sumamos sus cantidades
        const productosAgrupados = {};
        pedidoConsolidado.order_details.forEach(detalle => {
            const key = detalle.producto_id;
            if (!productosAgrupados[key]) {
                productosAgrupados[key] = {
                    ...detalle,
                    cantidad: 0
                };
            }
            productosAgrupados[key].cantidad += detalle.cantidad;
        });

        // Convertimos el objeto de productos agrupados de vuelta a array
        pedidoConsolidado.order_details = Object.values(productosAgrupados);

        // Devolvemos directamente el pedido consolidado
        res.json(pedidoConsolidado);

    } catch (error) {
        console.error('Error al obtener pedidos activos de la mesa:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los pedidos activos de la mesa'
        });
    }
};

module.exports = {
    getPedidos,
    createPedido,
    getPedidosByMesa,
    getActiveOrders,
    updateOrderStatus,
    getActiveOrdersByMesa,
};
