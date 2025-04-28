const express = require('express');
const router = express.Router();
const {
    getPedidos,
    createPedido,
    getPedidosByMesa,
    getActiveOrders,
    updateOrderStatus,
    getActiveOrdersByMesa
} = require('../controllers/pedidosController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importar el middleware

router.get('/', authMiddleware, getPedidos);
router.post('/', authMiddleware, createPedido);
router.get('/mesa/numero/:numero_mesa', getPedidosByMesa);

// Chef routes
router.get('/active', authMiddleware, getActiveOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

router.get('/mesa/:numero_mesa/activos', authMiddleware, getActiveOrdersByMesa);

module.exports = router;
