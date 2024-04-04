// validateToken.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Nurse = require('../nursesignup/nurseModel'); // Assuming your model file is named nurseModel.js
const logger = require('../utils/logger');

// Middleware to validate JWT token
const validateToken = asyncHandler(async (req, res, next) => {
    // Check if Authorization header is present
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const nurse = await Nurse.findById(decoded.id);
        if (!nurse) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        req.nurse = nurse; // Attach the nurse object to the request for further use
        next(); // Move to the next middleware
    } catch (error) {
        logger.error('Error validating token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = validateToken;
