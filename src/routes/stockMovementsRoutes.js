const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware"); 
const {
    getAllStockMovements,
    getStockMovementById,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
} = require('../controllers/stockMovementsController');

router.get('/', authMiddleware, getAllStockMovements);
router.get('/:id', authMiddleware, getStockMovementById);
router.post('/', authMiddleware, createStockMovement);
router.put('/:id', authMiddleware, updateStockMovement);
router.delete('/:id', authMiddleware, deleteStockMovement);

module.exports = router;
