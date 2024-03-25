const asyncHandler = require('express-async-handler');
const Patient = require('../admit/admitModel');
const logger = require('../utils/logger');
const Bed = require('../bed/bedModel');

// Update patient information
const updatePatient = asyncHandler(async (req, res) => {
  const {
    patientName, patientId, contactno, medicalAcuity,
    admittingDoctors,age
  } = req.body;

  const existingPatient = await Patient.findOne({ patientId });

  if (!existingPatient) {
    return res.status(404).json({ error: 'Patient not found.' });
  }

  // Update patient information
  existingPatient.patientName = patientName;
  existingPatient.contactno = contactno;
  existingPatient.medicalAcuity = medicalAcuity;
  existingPatient.admittingDoctors = admittingDoctors;

  existingPatient.age = age;

  const updatedPatient = await existingPatient.save();

  res.json(updatedPatient);
});


//deleten wait:
// Delete patient by patientId
const deletePatient = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
  
    // Find the patient by patientId
    const existingPatient = await Patient.findOne({ patientId });
  
    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
  
    // Find the bed associated with the patient
    const bed = await Bed.findOne({
      'wards.wardId': existingPatient.wardId,
      'wards.beds.bedNumber': existingPatient.bedNumber
    });
  
    if (!bed) {
      return res.status(500).json({ error: 'Internal server error - Bed not found for patient.' });
    }
  
    // Mark the bed as available
    const selectedWard = bed.wards.find(wardItem => wardItem.wardId === existingPatient.wardId);
    const selectedBed = selectedWard.beds.find(bedItem => bedItem.bedNumber === existingPatient.bedNumber);
  
    if (!selectedBed) {
      return res.status(500).json({ error: 'Internal server error - Bed not found for patient.' });
    }
  
    selectedBed.status = 'available';
    selectedBed.patientId = '';
  
    // Save changes to the bed data
    await bed.save();
  
    // Remove the patient from the database
    await existingPatient.deleteOne();
  
    res.json({ message: 'Patient deleted successfully.' });
  });

module.exports = { updatePatient,deletePatient };
