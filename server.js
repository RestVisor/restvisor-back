require('dotenv').config();
const express = require('express');
const cors = require('cors');
const corsOptions = require('./src/config/cors');
const app = express();
const routes = require('./src/routes');

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api', routes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);

    // Handle JWT errors
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

    // Handle other errors
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
