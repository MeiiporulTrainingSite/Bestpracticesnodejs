const express = require('express');
const router = express.Router();

const { admitPatient, patientGets  } = require('./admitController');
const { updatePatient, deletePatient } = require('./landingAdmit');

// Update patient information
/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         doorno:
 *           type: string
 *           description: The door number of the address.
 *         streetname:
 *           type: string
 *           description: The street name of the address.
 *         district:
 *           type: string
 *           description: The district of the address.
 *         state:
 *           type: string
 *           description: The state of the address.
 *         country:
 *           type: string
 *           description: The country of the address.
 *         pincode:
 *           type: string
 *           description: The pin code of the address.
 *
 *     Task:
 *       type: object
 *       properties:
 *         taskType:
 *           type: string
 *           description: The type of task.
 *         description:
 *           type: string
 *           description: The description of the task.
 *
 *     Patient:
 *       type: object
 *       properties:
 *         patientName:
 *           type: string
 *           description: The name of the patient.
 *         age:
 *           type: integer
 *           description: The age of the patient.
 *         gender:
 *           type: string
 *           description: The gender of the patient.
 *         contactno:
 *           type: string
 *           description: The contact number of the patient.
 *         wardId:
 *           type: string
 *           description: The ID of the ward.
 *         wardName:
 *           type: string
 *           description: The name of the ward.
 *         bedNumber:
 *           type: string
 *           description: The number of the bed.
 *         medicalAcuity:
 *           type: string
 *           description: The medical acuity of the patient (Critical, Moderate, Stable).
 *         admittingDoctors:
 *           type: string
 *           description: The name of the admitting doctor.
 *         admissionDate:
 *           type: string
 *           format: date
 *           description: The date of admission (DD-MM-YYYY).
 *         admissionTime:
 *           type: string
 *           format: time
 *           description: The time of admission (HH:MM).
 *         assignedNurse:
 *           type: string
 *           description: The name of the assigned nurse.
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: The tasks assigned to the patient.
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         abhaNo:
 *           type: string
 *           description: The ABHA number of the patient.
 *         infectionStatus:
 *           type: string
 *           description: The infection status of the patient.
 *       required:
 *         - patientName
 *         - age
 *         - gender
 *         - contactno
 *         - wardId
 *         - wardName
 *         - bedNumber
 *         - medicalAcuity
 *         - admittingDoctors
 *         - admissionDate
 *         - admissionTime
 *         - assignedNurse
 *         - address
 *         - abhaNo
 *         - infectionStatus
 */

/**
 * @swagger
 * /admitpt:
 *   post:
 *     summary: Admit a patient
 *     description: Add a new patient to the system and update bed status.
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       '201':
 *         description: Successfully admitted patient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *                 infectionRate:
 *                   type: number
 *                   description: The current infection rate.
 *       '400':
 *         description: Invalid request body or parameters.
 *       '500':
 *         description: Server error.
 */

//Generate Unique Patient Id Function for Admit Patient

const admitPatientValidationRules = require('./admitValidator'); // Import default export


// POST endpoint to admit patients with validation
router.post('/admitpt', admitPatientValidationRules(), admitPatient);

// GET endpoint to get all admitted patients
router.get('/patientGet', patientGets);
router.put('/updatept', updatePatient);
router.delete('/deletept/:patientId', deletePatient)


module.exports = router;
