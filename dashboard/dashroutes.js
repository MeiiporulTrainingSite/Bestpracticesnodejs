const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken'); // Import verifyToken middleware
const { validateToken } = require('../nursesignup/nurseController'); // Import validateToken middleware

const { paagHandler, wardOccup, availablebed,bedAvailabilityBoard,getAdmissionDischarge}=require('../dashboard/dashFirst')
const {patientCare,patientCarealert}=require('../dashboard/dashFirst')
const {Dash7,Dash8,Dash9,Dash10,Dash11,Dash12}=require('../dashboard/dashLast');

//dashboard2:
router.get('/wardoccupancys',wardOccup)

//dashboard3:
router.get('/realtimeavail',availablebed)

//dashboard4:

router.get('/paaG', paagHandler)

//dashbpard 5:
router.get('/admdis', getAdmissionDischarge)
//dashboard 6:
router.get('/patientCareDashboard', validateToken, patientCare);
router.get('/patientCare', patientCare);

router.get('/patientCarealert', patientCarealert);

//router.get('/patientCareDashboard', patientCare)
//dashboard 1:
router.get('/availbilityboard', bedAvailabilityBoard)
//Dash 7:
router.get('/riskGet', Dash7)

//dashboard 8:
router.get('/bedturnaroundtimes', Dash8)
//dashboard 9:
router.get('/:wardId/statistics',Dash9)
//Dashboard 10:
router.get('/patientflow',Dash10)

//dash11:
router.get('/patient',Dash11)
//dashboard 12:
router.get('/paces',Dash12)

module.exports = router;
