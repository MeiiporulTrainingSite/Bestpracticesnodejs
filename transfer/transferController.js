const asyncHandler = require('express-async-handler');
const Transfer = require('../transfer/transferModel');
const Bed = require('../bed/bedModel');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// Function to generate a random alphanumeric string of a given length
const generateRandomStrings = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Function to generate a unique patient ID using only a short random string
const generateTransID = () => `TAT-${generateRandomStrings(4)}`; // Adjust the length as needed

const transferPatient = asyncHandler(async (req, res, next) => {

const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}

 const {
    currentWardId,
    currentBedNumber,
    patientName,
    age,
    gender,
    patientId,
    transferWardId,
    transferBedNumber,
    medicalAcuity,
    transferReasons,
  } = req.body;

  // Automatically generate a unique patient ID
  const transferId = generateTransID();

  // Find the current bed within the current ward
  const currentBed = await Bed.findOne({
    'wards.wardId': currentWardId,
    'wards.beds.bedNumber': currentBedNumber,
  });

  if (!currentBed) {
      const error = new Error("Current bed does not exist in the selected ward");
      return next({ statusCode: 400, message: 'Current bed does not exist in the selected ward.' });
  }

  // Check if the current bed is occupied
  const currentBedIndex = currentBed.wards[0].beds.findIndex(
    (bed) => bed.bedNumber === currentBedNumber && bed.status === 'occupied'
  );

  if (currentBedIndex === -1) {
      const error = new Error("Current bed is already available");
      return next({ statusCode: 400, message: "Current bed is already available" });
  }

  // Find the transfer bed within the transfer ward
  const transferBed = await Bed.findOne({
    'wards.wardId': transferWardId,
    'wards.beds.bedNumber': transferBedNumber,
    'wards.beds.status': 'available',
  });

  if (!transferBed) {
      const error = new Error("Transfer bed not found or not available.");
      return next({ statusCode: 404, message: "Transfer bed not found or not available." });
  }

  // Update the current bed to available
  currentBed.wards[0].beds[currentBedIndex].status = 'available';
  currentBed.wards[0].beds[currentBedIndex].patientId = '';
  currentBed.wards[0].beds[currentBedIndex].patientName = '';
  currentBed.wards[0].beds[currentBedIndex].age = '';
  currentBed.wards[0].beds[currentBedIndex].gender = '';
  currentBed.wards[0].beds[currentBedIndex].medicalAcuity = '';



  // Find the index of the transfer bed within the transfer ward
  const transferBedIndex = transferBed.wards[0].beds.findIndex(
    (bed) => bed.bedNumber === transferBedNumber && bed.status === 'available'
  );

  if (transferBedIndex === -1) {
      const error = new Error("Transfer bed is not available");
      return next({ statusCode: 404, message: "Transfer bed is not available" });
  }

  // Update the transfer bed to occupied with patient information
  transferBed.wards[0].beds[transferBedIndex].status = 'occupied';
  transferBed.wards[0].beds[transferBedIndex].patientId = patientId;
  transferBed.wards[0].beds[transferBedIndex].patientName = patientName;
  transferBed.wards[0].beds[transferBedIndex].age = age;
  transferBed.wards[0].beds[transferBedIndex].medicalAcuity = medicalAcuity;
  transferBed.wards[0].beds[transferBedIndex].gender = gender;


  // Save changes to the database
  await currentBed.save();
  await transferBed.save();

  // Save transfer information to Transfer collection
  const transfer = new Transfer({
    patientName,
    age,
    gender,
    patientId,
    transferId,
    currentWardId,
    currentBedNumber,
    transferWardId,
    transferBedNumber,
    medicalAcuity,
    transferReasons,
  });

  await transfer.save();

  logger.info('Patient transfer successful. Transfer bed marked as occupied.');
  res.status(200).json({ message: 'Patient transfer successful. Transfer bed marked as occupied.' });
});

//get transfer:
const transferGet = asyncHandler(async (req, res) => { 
const transferBeds = await Transfer.find();
if (transferBeds.length > 0) {
    res.json(transferBeds);
} else if (transferBeds.length === 0) {
    res.status(404);
    throw new Error("Invalid Patient Not Found");
}
});

module.exports = { transferPatient, transferGet };
