const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const mesasRoutes = require('./mesasRoutes');
const productsRoutes = require('./productsRoutes');
const orderDetailRoutes = require('./orderDetailsRoutes');

router.use('/users', userRoutes);
router.use('/orders', pedidosRoutes);
router.use('/tables', mesasRoutes);
router.use('/products', productsRoutes);
router.use('/orderDetails', orderDetailRoutes);

module.exports = router;
