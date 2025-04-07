const express = require('express');
const router = express.Router();
const {
    login,
    register,
    validateToken,
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes (no authentication required)
router.post('/login', login);
router.post('/register', register);

// All routes below this line require authentication
router.use(authMiddleware);

// Token validation
router.get('/validate', validateToken);

// User management routes
router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
