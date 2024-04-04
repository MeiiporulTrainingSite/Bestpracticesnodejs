const express = require('express');
const router = express.Router();
const { transferPatient,transferGet } = require('./transferController');

/**
 * @swagger
 * /tpsss:
 *   post:
 *     summary: Transfer a patient between beds
 *     description: Transfer a patient from a current bed to a specified transfer bed within the same or different ward.
 *     tags: [Transfers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentWardId:
 *                 type: string
 *                 description: The ID of the current ward.
 *               currentBedNumber:
 *                 type: string
 *                 description: The number of the current bed.
 *               patientName:
 *                 type: string
 *                 description: The name of the patient.
 *               age:
 *                 type: integer
 *                 description: The age of the patient.
 *               gender:
 *                 type: string
 *                 description: The gender of the patient.
 *              
 *               patientId:
 *                 type: string
 *                 description: The ID of the patient.
 *               transferWardId:
 *                 type: string
 *                 description: The ID of the ward to transfer the patient to.
 *               transferBedNumber:
 *                 type: string
 *                 description: The number of the bed to transfer the patient to.
 *               medicalAcuity:
 *                 type: string
 *                 description: The medical acuity of the patient.
 *               transferReasons:
 *                 type: string
 *                 description: The reason for the patient transfer.
 *     responses:
 *       '200':
 *         description: Successfully transferred patient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Patient transfer successful. Transfer bed marked as occupied.
 *       '400':
 *         description: Bad request. Invalid request body or parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Current bed is already available.
 *       '404':
 *         description: Transfer bed is not available.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Transfer bed is not available.
 *       '500':
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error performing bed action.
 */


const { transferPatientValidationRules } = require('./transferValidator');
//transfer router:
router.post('/tpsss', transferPatientValidationRules(),transferPatient);
//transfer Get:
router.get('/transferGet', transferGet)
module.exports = router;
