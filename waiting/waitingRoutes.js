
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const {addWaitingEntry,PriorityUpdate,BedAssignUpdate,WaitGet,deleteWaitingPatient,getAvailableBeds}=require('../waiting/waitingController')


//waiting:
router.post('/waitingentry1',addWaitingEntry)
//Priority
router.put('/pro',PriorityUpdate)

//Bedassign
router.put('/assignbedss',BedAssignUpdate)

//WaitGet
router.get('/Waiting',WaitGet)
router.get('/avabeds1',getAvailableBeds)
router.delete('/deletewait/:patientId', asyncHandler(deleteWaitingPatient));

module.exports = router;