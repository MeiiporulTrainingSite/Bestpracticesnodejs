const express = require('express');
const router = express.Router();


const { addBeds, bedGet,getBedStatusPerWard ,getOccupancyTrends} = require('./bedController');

/**
 * @swagger
 * tags:
 *   name: Beds
 *   description: API endpoints for managing beds
 */

/**
 * @swagger
 * /addbeds:
 *   post:
 *     summary: Add beds to a ward
 *     description: Add a specified number of beds to a ward.
 *     tags: [Beds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wardName:
 *                 type: string
 *                 description: The name of the ward.
 *               wardId:
 *                 type: string
 *                 description: The ID of the ward.
 *               wardType:
 *                 type: string
 *                 description: The type of the ward.
 *               bedNumber:
 *                 type: integer
 *                 description: The number of beds to add.
 *     responses:
 *       '200':
 *         description: Successfully added beds to the ward.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Added number of beds to the specified ward successfully
 *       '400':
 *         description: Invalid request body or parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid bed count
 *       '500':
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to add beds to the ward
 */

// POST endpoint to add beds
router.post('/addbeds', addBeds);

// GET endpoint to get all beds
router.get('/bedGet', bedGet);

router.get('/bed1d', getBedStatusPerWard);
//router.get('/occupancytrends',getOccupancyTrends);
router.get('/occupancytrends',getOccupancyTrends);


module.exports = router;

