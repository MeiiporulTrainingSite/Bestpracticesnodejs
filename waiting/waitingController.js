const asyncHandler = require('express-async-handler');
const Waiting = require('../waiting/waitingModel');
const Patient = require('../admit/admitModel');
const Bed = require('../bed/bedModel');
const moment = require('moment');
const logger = require('../utils/logger');

const generateRandomString = (length) => {
    const characters = 'ABCDEF1234';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const genPatientID = () => `PAT-${generateRandomString(4)}`;

const addWaitingEntry = asyncHandler(async (req, res, next) => {
  const { patientName, contactno, medicalAcuity, admittingDoctors, wardId, wardName, priority, age, gender, admissionDate, admissionTime, assignedNurse, address, tasks, abhaNo } = req.body;

  // Ensure admissionDate is today or in the future
  const now = moment().startOf('day');
  const selectedDate = moment(admissionDate, 'DD-MM-YYYY').startOf('day');

  if (!selectedDate.isValid() || selectedDate.isBefore(now)) {
      const error = new Error("Admission date must be a valid date and today or a future date");
      error.statusCode = 400; // Set the status code on the error object
      return next({message: "Invalid admission date" });
  }

  try {
      const patientId = genPatientID();

      const newEntry = {
          WaitlistEntryfields: [{
              patientName,
              patientId,
              contactno,
              medicalAcuity,
              wardId,
              wardName,
              priority,
              age,
              gender,
              admittingDoctors,
              admissionDate,
              admissionTime,
              assignedNurse,
              address,
              tasks,
              abhaNo
          }]
      };

      const createdEntry = await Waiting.create(newEntry);

      const newPatient = {
          patientName,
          patientId,
          contactno,
          age,
          gender,
          wardId,
          priority,
          wardName,
          admittingDoctors,
          admissionDate,
          admissionTime,
          assignedNurse,
          address,
          tasks,
          abhaNo
      };

      const createdPatient = await Patient.create(newPatient);
      logger.info('New entry created in waiting list', { patientId });
      res.status(201).json({ createdEntry });
  } catch (error) {
      logger.error('Failed to create entry in waiting list', { error: error.message });
      next(error); // Pass the error to the Express error-handling middleware
  }
});



//Priority Update
const PriorityUpdate = asyncHandler(async(req,res)=>{

    const{patientId,priority} = req.body
    const wait = await Waiting.findOneAndUpdate({ 'WaitlistEntryfields.patientId': patientId },{$set:{'WaitlistEntryfields.$.priority': priority }});

    if (!wait) {
      const error = new Error("Patient not found in the waiting list.")
      res.status(400)
      throw error
    }

    res.json({ message: 'Priority assigned successfully.'});

})




//Bed Assign with Ward
//New Bed assign
const BedAssignUpdate = asyncHandler(async (req, res) => {
  const { bedNumber, patientId, wardName, wardType } = req.body;

  if (!patientId || !bedNumber || !wardName || !wardType) {
    const error = new Error("PatientId, bedNumber, wardName, and wardType are required");
    res.status(400);
    throw error;
  }

  try {
    // Find the bed in the Bed collection
    const existingBed = await Bed.findOne({ 'wards.beds.bedNumber': bedNumber });

    if (!existingBed) {
      // Create a new record if the bed doesn't exist
      const newBed = new Bed({
        wards: [{
          beds: [{
            bedNumber,
            status: 'occupied',
            patientId
          }]
        }]
      });

      // Save the newBed
      await newBed.save();

      // Update the bedNumber, wardName, and wardType in the Patient collection
      await Patient.updateOne({ patientId }, { $set: { bedNumber, wardName, wardType, status: 'occupied' } });

      // Update the bedNumber, wardName, wardType, and status in the Waiting collection
      await Waiting.updateOne({ 'WaitlistEntryfields.patientId': patientId }, { $set: { 'WaitlistEntryfields.$.bedNumber': bedNumber, 'WaitlistEntryfields.$.wardName': wardName, 'WaitlistEntryfields.$.wardType': wardType, 'WaitlistEntryfields.$.status': 'assigned' } });

      return res.json({ message: 'Bed assignment updated successfully.' });
    }

    // Check if the bed is available
    const availableBed = existingBed.wards.some((ward) => {
      return ward.beds.some((bed) => bed.bedNumber === bedNumber && bed.status === 'available');
    });

    if (!availableBed) {
      return res.status(400).json({ message: 'Bed is already occupied.' });
    }

    // Update existing record
    existingBed.wards.forEach((ward) => {
      const bedToUpdate = ward.beds.find((bed) => bed.bedNumber === bedNumber && bed.status === 'available');
      if (bedToUpdate) {
        bedToUpdate.status = 'occupied';
        bedToUpdate.patientId = patientId;
      }
    });

    // Save the changes to the existingBed
    await existingBed.save();

    // Update the bedNumber, wardName, and wardType in the Patient collection
    await Patient.updateOne({ patientId }, { $set: { bedNumber, wardName, wardType, status: 'occupied' } });

    // Update the bedNumber, wardName, wardType, and status in the Waiting collection
    await Waiting.updateOne({ 'WaitlistEntryfields.patientId': patientId }, { $set: { 'WaitlistEntryfields.$.bedNumber': bedNumber, 'WaitlistEntryfields.$.wardName': wardName, 'WaitlistEntryfields.$.wardType': wardType, 'WaitlistEntryfields.$.status': 'assigned' } });

    res.json({ message: 'Bed assignment updated successfully.' });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

//Wait Get
const WaitGet = asyncHandler(async(req,res)=>{
   const wait = await Waiting.find({},'-_id WaitlistEntryfields.patientName WaitlistEntryfields.patientId WaitlistEntryfields.age WaitlistEntryfields.gender WaitlistEntryfields.priority WaitlistEntryfields.admittingDoctors WaitlistEntryfields.admissionDate')
   
   if (wait.length > 0) {
    res.json(wait);
} else if (wait.length === 0) {
    res.status(404);
    throw new Error("Invalid Patient Not Found");
}
})
//landing edit:
const deleteWaitingPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Find the patient in the Waitinglist collection
    const waitingPatient = await Waiting.findOne({ 'WaitlistEntryfields.patientId': patientId });

    if (!waitingPatient) {
      return res.status(404).json({ error: 'Patient not found in the waiting list.' });
    }

    // Delete the patient from the Waitinglist collection
    await Waiting.deleteOne({ 'WaitlistEntryfields.patientId': patientId });

    // Delete the patient from the Patient collection
    await Patient.deleteOne({ patientId });

    res.status(200).json({ message: 'Patient deleted successfully.' });
  } catch (err) {
    next(err); // Pass any errors to the global error handler
  }
};

//

const getAvailableBeds = asyncHandler(async (req, res) => {
  const availableWards = await Bed.find({ 'wards.beds.status': 'available' });

  if (!availableWards || availableWards.length === 0) {
      return res.status(404).json({ message: 'No available beds found.' });
  }

  const BedAvailability = [];

  availableWards.forEach((wardDocument) => {
      wardDocument.wards.forEach((ward) => {
          const wardName = ward.wardName; // Access wardName directly
          const availableCount = ward.beds.filter((bed) => bed.status === 'available').map((bed) => ({ bedNumber: bed.bedNumber }));

          BedAvailability.push({ ward: wardName, availableBeds: availableCount });
      });
  });

  res.json({ BedAvailability });
});

module.exports = { addWaitingEntry,PriorityUpdate,BedAssignUpdate,WaitGet,deleteWaitingPatient,getAvailableBeds};
