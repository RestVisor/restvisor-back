const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const pedidosRoutes = require('./ordersRoutes');
const mesasRoutes = require('./tablesRoutes');
const productsRoutes = require('./productsRoutes');
const orderDetailRoutes = require('./orderDetailsRoutes');
const stockMovementsRoutes = require('./stockMovementsRoutes');

// Error handling middleware for JWT validation errors
router.use((err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token format',
            message: 'Please ensure you are properly logged in',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Your session has expired, please log in again',
        });
    }
    next(err);
});

router.use('/users', userRoutes);
router.use('/orders', pedidosRoutes);
router.use('/tables', mesasRoutes);
router.use('/products', productsRoutes);
router.use('/orderDetails', orderDetailRoutes);
router.use('/stock-movements', stockMovementsRoutes);

module.exports = router;
