require('dotenv').config(); // Load environment variables from .env file

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Nurse = require('../nursesignup/nurseModel'); // Assuming your model file is named nurseModel.js
const logger = require('../utils/logger');



// Controller function to register a nurse
const registerNurse = asyncHandler(async (req, res, next) => {
    const { nurseName, email, password } = req.body;

    if (!nurseName || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        // Check if nurse with provided email already exists
        const nurseExists = await Nurse.findOne({ email });
        if (nurseExists) {
            return res.status(400).json({ error: 'Nurse already exists with this email' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new nurse
        const newNurse = await Nurse.create({
            nurseName,
            email,
            password: hashedPassword
        });

        // Return nurse details
        res.status(201).json({
            id: newNurse._id,
            nurseName: newNurse.nurseName,
            email: newNurse.email
        });
    } catch (error) {
        logger.error('Error registering nurse:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Controller function to log in a nurse and generate JWT token
const registerAndGenerateToken = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if nurse with provided email exists
        const nurse = await Nurse.findOne({ email });
        if (!nurse) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, nurse.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: nurse._id }, process.env.JWT_SECRET, {
            expiresIn: '30d' // Token expires in 30 days
        });

        // Return nurse details and token
        res.json({
            id: nurse._id,
            nurseName: nurse.nurseName,
            email: nurse.email,
            token
        });
    } catch (error) {
        logger.error('Error logging in nurse:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to validate JWT token
// Middleware to validate JWT token
// const validateToken = asyncHandler(async (req, res, next) => {
//     // Check if Authorization header is present
//     const token = req.headers.authorization;
//     if (!token) {
//         return res.status(401).json({ error: 'Unauthorized - Token not provided' });
//     }

//     try {
//         // Verify token
//         const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET); // Remove 'Bearer ' prefix from the token
//         const nurse = await Nurse.findById(decoded.id);
//         if (!nurse) {
//             return res.status(401).json({ error: 'Unauthorized - Invalid token' });
//         }
//         req.nurse = nurse; // Attach the nurse object to the request for further use
//         next(); // Move to the next middleware
//     } catch (error) {
//         logger.error('Error validating token:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });
// Middleware to validate JWT token
const validateToken = asyncHandler(async (req, res, next) => {
    // Check if Authorization header is present
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET); // Remove 'Bearer ' prefix from the token
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


module.exports = {  registerNurse,registerAndGenerateToken,validateToken };
