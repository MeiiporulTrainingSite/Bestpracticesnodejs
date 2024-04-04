// nurseRoutes.js

const express = require('express');
const router = express.Router();
const { registerNurse,registerAndGenerateToken, validateToken } = require('../nursesignup/nurseController');

// Register route
router.post('/reg',registerNurse)
router.post('/loginnurse', registerAndGenerateToken);

// Protected route - requires valid token
router.get('/protected', validateToken, (req, res) => {
    // If the token is valid, send back a success message
    res.status(200).json({ message: 'Protected route accessed successfully' });
});

module.exports = router;
