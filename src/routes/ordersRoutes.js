const express = require('express');
const router = express.Router();
const {
    getPedidos,
    createPedido,
    getPedidosByMesa,
    getActiveOrders,
    updateOrderStatus,
    trueToFalseOrders
} = require('../controllers/ordersController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importar el middleware

router.get('/', authMiddleware, getPedidos);
router.post('/', authMiddleware, createPedido);
router.get('/mesa/numero/:numero_mesa', getPedidosByMesa);
router.post('/desactivar', trueToFalseOrders);
// Chef routes
router.get('/active', authMiddleware, getActiveOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
