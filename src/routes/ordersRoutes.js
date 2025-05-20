const express = require('express');
const router = express.Router();
const {
    getPedidos,
    createPedido,
    getPedidosByMesa,
    getActiveOrders,
    updateOrderStatus,
    getActiveOrdersByMesa,
    trueToFalseOrders,
    deleteOrder,
    getTableHistoryForToday,
    getAllOrdersWithDetails
} = require('../controllers/ordersController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas para pedidos
router.get('/', authMiddleware, getPedidos);
router.get('/details', authMiddleware, getAllOrdersWithDetails);
router.post('/', authMiddleware, createPedido);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/mesa/numero/:numero_mesa', authMiddleware, getPedidosByMesa);
router.get('/mesa/:numero_mesa/activos', authMiddleware, getActiveOrdersByMesa);
router.get('/mesa/:numero_mesa/historial-hoy', authMiddleware, getTableHistoryForToday);
router.post('/desactivar', authMiddleware, trueToFalseOrders);

// Rutas para el chef
router.get('/active', authMiddleware, getActiveOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
