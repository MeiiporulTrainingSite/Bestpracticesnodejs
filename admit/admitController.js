// const asyncHandler = require('express-async-handler');
// const moment = require('moment')
// const Patient = require('../admit/admitModel')
// const Bed = require('../bed/bedModel')
// const { validationResult } = require('express-validator');


// const logger = require('../utils/logger'); // Assuming the logger is defined in a separate file


// const generateRandomString = (length) => {
//     const characters = 'ABCDEF1234';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
//   };
  
//   // Function to generate a unique patient ID using only a short random string
//   const generatePatientID = () => `PAT-${generateRandomString(4)}`; // Adjust the length as needed
  
//   // Function to calculate the risk score based on medical acuity
//   function calculateRiskScore(medicalAcuity) {
//     switch (medicalAcuity) {
//       case "Critical":
//         return 0.85;
//       case "Moderate":
//         return 0.65;
//       case "Stable":
//         return 0.45;
//       default:
//         return 0.1; // Default risk score for unknown or unassigned medical acuity
//     }
//   }
    
//   // Function to calculate infection rate
//   async function calculateInfectionRate() {
//     try {
//       const totalAdmittedPatients = await Patient.countDocuments();
//       const infectedPatients = await Patient.countDocuments({ infectionStatus: 'infected' });
//       if (totalAdmittedPatients === 0) {
//         return 0;
//       }
//       return (infectedPatients / totalAdmittedPatients) * 100;
//     } catch (error) {
//       console.error('Failed to calculate infection rate', error);
//       throw error;
//     }
//   }
  
//   // Global variable to store readmitted patient contact numbers
//   const readmittedPatients = new Set();
  
 
// // POST endpoint to admit a patient with readmission rate calculation
// const admitPatient = asyncHandler(async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//   }

//   const {
//       patientName, age, gender, contactno, wardId, wardName, bedNumber, medicalAcuity,
//       admittingDoctors, admissionDate, admissionTime, assignedNurse, tasks,
//       address, abhaNo, infectionStatus,
//   } = req.body;
//   //console.log("Request Payload:", req.body); // Log the request payload

//   // Calculate risk score based on medical acuity
//   const riskScore = calculateRiskScore(medicalAcuity);

//   // Ensure admissionDate is today or in the future
//   const now = moment().startOf('day');
//   const selectedDate = moment(admissionDate, 'DD-MM-YYYY').startOf('day');

//   if (!selectedDate.isValid() || selectedDate.isBefore(now)) {
//       const error = new Error("Admission date must be a valid date and today or a future date");
//       return next({ statusCode: 400, message: "Invalid admission date" }); // Pass error to next middleware with status code 404
//   }

//   // Check if the patient has been readmitted based on contact number
//   const readmitted = readmittedPatients.has(contactno);

//   // Automatically generate a unique patient ID
//   const patientId = generatePatientID();

//   // Create a new Patient document with readmission flag
//   const newPatient = new Patient({
//       patientName, age, gender, contactno, wardId, patientId, wardName, bedNumber,
//       medicalAcuity, admittingDoctors, admissionDate, admissionTime,
//       assignedNurse, abhaNo, address, tasks, riskScore, infectionStatus, readmitted,
//   });

//   // Check if the specified ward and bed exist
//   const bed = await Bed.findOne({
//       'wards.wardId': wardId,
//       'wards.beds.bedNumber': bedNumber
//   });
//   if (!bed) {
//       const error = new Error("Ward or bed does not exist");
//       logger.error('Ward or bed does not exist', { error: error.message }); // Log the error
//       return next({ statusCode: 404, message: "Ward or bed does not exist" }); // Pass error to next middleware with status code 404
//   }
//   // Check if the bed is available
//   const selectedBed = bed.wards.find(wardItem => wardItem.wardId === wardId).beds.find(bedItem => bedItem.bedNumber === bedNumber);

//   if (selectedBed.status === 'occupied') {
//       const error = new Error("Selected bed is already occupied.");
//       return next({ statusCode: 404, message: "Selected bed is already occupied" }); // Pass error to next middleware with status code 404
//   }

//   // Save the patient
//   const savedPatient = await newPatient.save();

//   // Mark the bed as occupied in the bed collection
//   selectedBed.status = 'occupied';
//   selectedBed.patientId = patientId;

//   // Save changes to the bed data
//   await bed.save();

//   // Add the contact number to the readmittedPatients set
//   readmittedPatients.add(contactno);

//   // Calculate infection rate
//   const infectionRate = await calculateInfectionRate();

//   logger.info('Patient admitted successfully'); // Log successful admission

//   res.status(201).json({ patient: savedPatient, infectionRate });
// });


const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Patient = require('../admit/admitModel');
const Bed = require('../bed/bedModel');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger'); // Assuming the logger is defined in a separate file
const { selectFields } = require('express-validator/src/field-selection');

// Function to generate a unique patient ID using only a short random string
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Function to generate a unique patient ID
const generatePatientID = () => `PAT-${generateRandomString(4)}`;

// Function to calculate the risk score based on medical acuity
const calculateRiskScore = (medicalAcuity) => {
    switch (medicalAcuity) {
        case "Critical":
            return 0.85;
        case "Moderate":
            return 0.65;
        case "Stable":
            return 0.45;
        default:
            return 0.1; // Default risk score for unknown or unassigned medical acuity
    }
};

// Function to calculate infection rate
const calculateInfectionRate = async () => {
    try {
        const totalAdmittedPatients = await Patient.countDocuments();
        const infectedPatients = await Patient.countDocuments({ infectionStatus: 'infected' });
        if (totalAdmittedPatients === 0) {
            return 0;
        }
        return (infectedPatients / totalAdmittedPatients) * 100;
    } catch (error) {
        console.error('Failed to calculate infection rate', error);
        throw error;
    }
};

// Global variable to store readmitted patient contact numbers
const readmittedPatients = new Set();

// POST endpoint to admit a patient with readmission rate calculation
const admitPatient = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        patientName, age, gender, contactno, wardId, wardName, bedNumber, medicalAcuity,
        admittingDoctors, admissionDate, admissionTime, assignedNurse, tasks,
        address, abhaNo, infectionStatus,
    } = req.body;

    // Calculate risk score based on medical acuity
    const riskScore = calculateRiskScore(medicalAcuity);

    // Check if the patient has been readmitted based on contact number
    const readmitted = readmittedPatients.has(contactno);

    // Automatically generate a unique patient ID
    const patientId = generatePatientID();

    // Create a new Patient document with readmission flag
    const newPatient = new Patient({
        patientName, age, gender, contactno, wardId, patientId, wardName, bedNumber,
        medicalAcuity, admittingDoctors, admissionDate, admissionTime,
        assignedNurse, abhaNo, address, tasks, riskScore, infectionStatus, readmitted,
    });

    // Check if the specified ward and bed exist
    const bed = await Bed.findOne({
        'wards.wardId': wardId,
        'wards.beds.bedNumber': bedNumber
    });
    if (!bed) {
        const error = new Error("Ward or bed does not exist");
        logger.error('Ward or bed does not exist', { error: error.message }); // Log the error
        return next({ statusCode: 404, message: "Ward or bed does not exist" }); // Pass error to next middleware with status code 404
    }

    // Check if the bed is available
    const selectedBed = bed.wards.find(wardItem => wardItem.wardId === wardId).beds.find(bedItem => bedItem.bedNumber === bedNumber);
    if (selectedBed.status === 'occupied') {
        const error = new Error("Selected bed is already occupied.");
        return next({ statusCode: 404, message: "Selected bed is already occupied" }); // Pass error to next middleware with status code 404
    }

    // Save the patient
    const savedPatient = await newPatient.save();

    // Mark the bed as occupied in the bed collection
    selectedBed.status = 'occupied';
    selectedBed.patientId = patientId;
    selectedBed.patientName=patientName;
    selectedBed.age=age;
    //selectedBed.gender=gender;
    selectedBed.contactno=contactno;
    selectedBed.medicalAcuity=medicalAcuity;
    selectedBed.admissionDate=admissionDate;
    

    // Save changes to the bed data
    await bed.save();

    // Add the contact number to the readmittedPatients set
    readmittedPatients.add(contactno);

    // Calculate infection rate
    const infectionRate = await calculateInfectionRate();

    logger.info('Patient admitted successfully'); // Log successful admission

    res.status(201).json({ patient: savedPatient, infectionRate });
});


//patient get:
const patientGets = asyncHandler(async (req, res) => {
  const PatientBeds = await Patient.find();
  if (PatientBeds.length > 0) {
      res.json(PatientBeds);
  } else if (PatientBeds.length === 0) {
      res.status(404);
      throw new Error("Invalid Patient Not Found");
  }
});

module.exports = { admitPatient,patientGets };