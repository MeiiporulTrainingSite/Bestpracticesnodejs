
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const {addWaitingEntry,PriorityUpdate,BedAssignUpdate,WaitGet,deleteWaitingPatient}=require('../waiting/waitingController')


//waiting:
router.post('/waitingentry1',addWaitingEntry)
//Priority
router.put('/pro',PriorityUpdate)

//Bedassign
router.put('/assignbedss',BedAssignUpdate)

//WaitGet
router.get('/Waiting',WaitGet)
router.delete('/deletewait/:patientId', asyncHandler(deleteWaitingPatient));

module.exports = router;