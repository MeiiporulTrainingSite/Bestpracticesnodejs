// const asyncHandler = require('express-async-handler');
// const Discharged = require('../discharge/dischargeModel')
// const Patient = require('../admit/admitModel');
// const {validationResult} = require('express-validator')


// const Bed = require('../bed/bedModel')

// const logger = require('../utils/logger'); // Assuming the logger is defined in a separate file
// //Generate Unique Patient Id Function for Admit Patient
// // Function to discharge a patient

// // Function to generate a random alphanumeric string of a given length
// const generateDischargeString = (length) => {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// // Function to generate a unique discharge ID using only a short random string
// const generateDischargeId = () => `Dsh-${generateDischargeString(4)}`; // Adjust the length as needed


// // Function to discharge a patient
// const dischargePatient = asyncHandler(async (req, res) => {

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//   }

//   const {
//     patientId,
//     patientName,
//     medicalAcuity,
//     age,
//     gender,
//     admissionDate,
//     wardId,
//     bedNumber,
//     dischargeReasons,
//     dischargeDate,
//     dischargeTime
//   } = req.body;

//   // Automatically generate a unique discharge ID
//   const dischargeId = generateDischargeId();

//   // Find the bed within the ward
//   const bedData = await Bed.findOne({ 'wards.wardId': wardId });

//   if (!bedData) {
//     logger.error('Ward not found.');
//     return res.status(404).json({ error: 'Ward not found.' });
//   }

//   // Find the specific bed within the ward
//   const selectedBed = bedData.wards
//     .find((w) => w.wardId === wardId)
//     .beds.find((b) => b.bedNumber === bedNumber);

//   // Logging for debugging
//   logger.debug('Bed Data:', bedData);
//   logger.debug('Selected Bed:', selectedBed);

//   // Check if patient is occupying the bed and is not already discharged
//   if (selectedBed && selectedBed.status === 'occupied' && selectedBed.patientId === patientId) {
//     // Check if patient is already discharged
//     const isAlreadyDischarged = await Discharged.exists({ patientId });

//     if (isAlreadyDischarged) {
//       logger.error('Patient is already discharged.');
//       return res.status(400).json({ error: 'Patient is already discharged.' });
//     }

//     // Update bed record
//     selectedBed.status = 'available';
//     selectedBed.patientId = '';
//      selectedBed.patientName = '';
//      selectedBed.age = '';
//     // selectedBed.contactno = '';
//      selectedBed.gender = '';
//      selectedBed.medicalAcuity = '';

//     // Save the updated bed record
//     await bedData.save();

//     // Calculate mortality rate (example calculation, adjust as needed)
//     const totalBedsInWard = bedData.wards.reduce((total, ward) => total + ward.beds.length, 0);
//     const dischargedRecords = await Discharged.find({ 'dischargeReasons': 'died' });
//     const totalDiedCases = dischargedRecords.length;
//     const mortalityRate = (totalDiedCases / totalBedsInWard) * 100;

//     // Delete patient record from the patients collection
//     await Patient.deleteOne({ patientId });

//     // Log the calculated mortality rate
//     logger.info( mortalityRate);

//     // Create a discharged record with all the data fields
//     const discharged = new Discharged({
//       dischargeId,
//       patientName,
//       age,
//       gender,
//       medicalAcuity,
//       admissionDate,
//       wardId,
//       bedNumber,
//       dischargeReasons,
//       dischargeDate,
//       dischargeTime,
//       mortalityRate,
//     });

//     // Save the discharged record
//     await discharged.save();

//     logger.info('Patient discharged and bed record updated successfully.');
//     res.status(200).json({ message: 'Patient discharged and bed record updated successfully.', mortalityRate });
//   } else {
//     logger.error('Patient is not occupying the bed or already discharged.');
//     res.status(400).json({ error: 'Patient is not occupying the bed or already discharged.' });
//   }
// });

// //discharge get:
// const dischargeGets = asyncHandler(async (req, res) => {
//   const DischargeBeds = await Discharged.find();
//   if (DischargeBeds.length > 0) {
//       res.json(DischargeBeds);
//   } else if (DischargeBeds.length === 0) {
//       res.status(404);
//       throw new Error("Invalid Patient Not Found");
//   }
// });


// module.exports = { dischargePatient, dischargeGets };


const asyncHandler = require('express-async-handler');
const Discharged = require('../discharge/dischargeModel')
const Patient = require('../admit/admitModel');
const {validationResult} = require('express-validator')


const Bed = require('../bed/bedModel')

const logger = require('../utils/logger'); // Assuming the logger is defined in a separate file
//Generate Unique Patient Id Function for Admit Patient
// Function to discharge a patient

// Function to generate a random alphanumeric string of a given length
const generateDischargeString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Function to generate a unique discharge ID using only a short random string
const generateDischargeId = () => `Dsh-${generateDischargeString(4)}`; // Adjust the length as needed


// Function to discharge a patient
const dischargePatient = asyncHandler(async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const {
    patientId,
    patientName,
    medicalAcuity,
    age,
    gender,
    admissionDate,
    wardId,
    bedNumber,
    dischargeReasons,
    dischargeDate,
    dischargeTime
  } = req.body;

  // Automatically generate a unique discharge ID
  const dischargeId = generateDischargeId();

  // Find the bed within the ward
  const bedData = await Bed.findOne({ 'wards.wardId': wardId });

  if (!bedData) {
    logger.error('Ward not found.');
    return res.status(404).json({ error: 'Ward not found.' });
  }

  // Find the specific bed within the ward
  const selectedBed = bedData.wards
    .find((w) => w.wardId === wardId)
    .beds.find((b) => b.bedNumber === bedNumber);

  // Logging for debugging
  logger.debug('Bed Data:', bedData);
  logger.debug('Selected Bed:', selectedBed);

  // Check if patient is occupying the bed and is not already discharged
  if (selectedBed && selectedBed.status === 'occupied' && selectedBed.patientId === patientId) {
    // Check if patient is already discharged
    const isAlreadyDischarged = await Discharged.exists({ patientId });

    if (isAlreadyDischarged) {
      logger.error('Patient is already discharged.');
      return res.status(400).json({ error: 'Patient is already discharged.' });
    }

    // Update bed record
    selectedBed.status = 'available';
    selectedBed.patientId = '';
    selectedBed.patientName = '';
    selectedBed.age = '';
    selectedBed.gender = '';
    selectedBed.medicalAcuity = '';
    selectedBed.admissionDate = '';

    // Save the updated bed record
    await bedData.save();

    // Calculate mortality rate (example calculation, adjust as needed)
    const totalBedsInWard = bedData.wards.reduce((total, ward) => total + ward.beds.length, 0);
    const dischargedRecords = await Discharged.find({ 'dischargeReasons': 'died' });
    const totalDiedCases = dischargedRecords.length;
    const mortalityRate = (totalDiedCases / totalBedsInWard) * 100;

    // Delete patient record from the patients collection
    await Patient.deleteOne({ patientId });

    // Log the calculated mortality rate
    logger.info('Calculated Mortality Rate:', mortalityRate);

    // Create a discharged record with all the data fields
    const discharged = new Discharged({
      dischargeId,
      patientName,
      age,
      gender,
      medicalAcuity,
      admissionDate,
      wardId,
      bedNumber,
      dischargeReasons,
      dischargeDate,
      dischargeTime,
      mortalityRate,
    });

    // Save the discharged record
    await discharged.save();

    logger.info('Patient discharged and bed record updated successfully.');
    res.status(200).json({ message: 'Patient discharged and bed record updated successfully.', mortalityRate });
  } else {
    logger.error('Patient is not occupying the bed or already discharged.');
    res.status(400).json({ error: 'Patient is not occupying the bed or already discharged.' });
  }
});


//discharge get:
const dischargeGets = asyncHandler(async (req, res) => {
  const DischargeBeds = await Discharged.find();
  if (DischargeBeds.length > 0) {
      res.json(DischargeBeds);
  } else if (DischargeBeds.length === 0) {
      res.status(404);
      throw new Error("Invalid Patient Not Found");
  }
});
module.exports = { dischargePatient, dischargeGets };
