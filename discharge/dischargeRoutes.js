const express = require('express');
const router = express.Router();
const { dischargePatient,dischargeGets } = require('./dischargeController');

/**
 * @swagger
 * /distaa:
 *   post:
 *     summary: Discharge a patient
 *     description: Discharge a patient from a bed in a ward.
 *     tags: [Discharge]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: The ID of the patient to discharge.
 *               patientName:
 *                 type: string
 *                 description: The name of the patient.
 *               medicalAcuity:
 *                 type: string
 *                 description: The medical acuity of the patient.
 *               age:
 *                 type: integer
 *                 description: The age of the patient.
 *               gender:
 *                 type: string
 *                 description: The gender of the patient.
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: The date of admission.
 *               wardId:
 *                 type: string
 *                 description: The ID of the ward.
 *               bedNumber:
 *                 type: string
 *                 description: The number of the bed.
 *               dischargeReasons:
 *                 type: string
 *                 description: The reason for discharge.
 *               dischargeDate:
 *                 type: string
 *                 format: date
 *                 description: The date of discharge.
 *               dischargeTime:
 *                 type: string
 *                 format: time
 *                 description: The time of discharge.
 *     responses:
 *       '200':
 *         description: Patient discharged successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Patient discharged and bed record updated successfully.
 *                 mortalityRate:
 *                   type: number
 *                   format: float
 *                   example: 3.45
 *       '400':
 *         description: Bad request. Patient is already discharged.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Patient is already discharged.
 *       '404':
 *         description: Ward or bed not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ward not found.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error discharging patient and updating bed record.
 */
const { dischargePatientValidationRules } = require('./dischargeValidator')

//discharge:
router.post('/distaa',dischargePatientValidationRules(),dischargePatient);
//Get discharge
router.get('/disGet',dischargeGets)
module.exports=router;