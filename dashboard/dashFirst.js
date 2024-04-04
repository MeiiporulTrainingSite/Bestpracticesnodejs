

const asyncHandler = require('express-async-handler');
const Bed = require('../bed/bedModel');
const Patient = require('../admit/admitModel');
const Discharged = require('../discharge/dischargeModel');

const logger = require('../utils/logger');
const moment=require('moment')

//dashboard 1:
//d1:
const bedAvailabilityBoard = async (req, res, next) => {
   try {
       const bedAvailabilityData = await Bed.find();

       if (!bedAvailabilityData || bedAvailabilityData.length === 0) {
           return res.status(404).json({ message: 'No bed availability data found.' });
       }

       const formattedData = formatBedAvailabilityData(bedAvailabilityData);

       res.status(200).json(formattedData);
       logger.info('Retrieved bed availability data successfully');
   } catch (error) {
       next(error);
   }
};

function formatBedAvailabilityData(bedAvailabilityData) {
   const formattedData = {
       bedAvailability: [],
   };

   bedAvailabilityData.forEach((ward) => {
       ward.wards.forEach((timeSlot) => {
           const entry = {
               ward: timeSlot.wardName,
               time: getRandomTime(),
               availableBeds: 0,
           };

           timeSlot.beds.forEach((bed) => {
               if (bed.status === 'available') {
                   entry.availableBeds += 1;
               }
           });

           if (entry.availableBeds > 0) {
               entry.time = adjustAdmissionTime(entry.time);
           }

           formattedData.bedAvailability.push(entry);
       });
   });

   return formattedData;
}

function getRandomTime() {
   const randomHour = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
   const randomMinute = Math.floor(Math.random() * 60);
   return moment().hour(randomHour).minute(randomMinute).format('HH:mm A');
}

function adjustAdmissionTime(currentTime) {
   const randomMinutes = Math.floor(Math.random() * 60);
   const adjustedTime = moment(currentTime, 'HH:mm A').subtract(randomMinutes, 'minutes');

   if (adjustedTime.isBefore(moment('08:00 AM', 'hh:mm A'))) {
       return moment('08:00 AM', 'hh:mm A').format('HH:mm A');
   } else if (adjustedTime.isAfter(moment('11:00 PM', 'hh:mm A'))) {
       return moment('11:00 PM', 'hh:mm A').format('HH:mm A');
   }

   return adjustedTime.format('HH:mm A');
}


//dashboard 2


const wardOccup = async (req, res, next) => {
   const occupiedWards = await Bed.find({ 'wards.beds.status': 'occupied' });

   if (!occupiedWards || occupiedWards.length === 0) {
       const errorMessage = 'No occupied beds found.';
       logger.error(errorMessage);
       return res.status(404).json({ message: errorMessage });
   }

   const wardOccupancy = [];

   for (const wardDocument of occupiedWards) {
       for (const ward of wardDocument.wards) {
           const wardName = ward.wardName;
           const occupiedCount = ward.beds.filter((bed) => bed.status === 'occupied').length;

           wardOccupancy.push({ ward: wardName, occupancy: occupiedCount });
       }
   }

   logger.info('Ward occupancy is displayed');
   res.json({ wardOccupancy });
};

//dashboard 3:
const availablebed = async (req, res, next) => {
    
       const availableWards = await Bed.find({ 'wards.beds.status': 'available' });

       if (!availableWards || availableWards.length === 0) {
           return res.status(404).json({ message: 'No occupied beds found.' });
       }

       const realtimeavailbility = [];

       for (const wardDocument of availableWards) {
           for (const ward of wardDocument.wards) {
               const wardName = ward.wardName;
               const availableCount = ward.beds.filter((bed) => bed.status === 'available').length;

               realtimeavailbility.push({ ward: wardName, realtimebeds: availableCount });
           }
       }
logger.info ("ward availability is displayed");
       res.json({ realtimeavailbility });
   
};
//dashboard 4:


const paagHandler = asyncHandler(async (req, res) => {
   try {
       const uniqueCombinationsWithCount = await Patient.aggregate([
           {
               $group: {
                   _id: { wardName: '$wardName', medicalAcuity: '$medicalAcuity' },
                   count: { $sum: 1 },
               },
           },
       ]);

       const result = {};

       uniqueCombinationsWithCount.forEach((entry) => {
           const wardName = entry._id.wardName;
           const medicalAcuity = entry._id.medicalAcuity;
           const count = entry.count;

           // Check if wardName exists in result, if not, initialize it
           if (!result[wardName]) {
               result[wardName] = {};
           }

           // Store count for each medicalAcuity under the specific ward
           result[wardName][medicalAcuity] = count;
       });

       // Log info
       logger.info('Successful retrieval of patient acuity breakdown');

       // Send the result as JSON response
       res.json({ patientAcuityBreakdown: result });
   } catch (error) {
       logger.error('Internal server error:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

//dashboard 5:
const getAdmissionDischarge = async (req, res) => {
   // Define the formatDate function within the scope of getAdmissionDischarge
   function formatDate(dateString) {
     const parts = dateString.split('-');
     if (parts.length === 3) {
       return `${parts[2]}-${parts[1]}-${parts[0]}`;
     }
     return dateString; // Return unchanged if not in the expected format
   }
 
   try {
     const admissions = await Patient.find({}, 'admissionDate');
     const discharges = await Discharged.find({}, 'dischargeDate');
 
     const allEvents = [...admissions, ...discharges];
 
     const trendData = {};
 
     allEvents.forEach((event) => {
       if (event.admissionDate || event.dischargeDate) {
         const formattedDate = formatDate(event.admissionDate || event.dischargeDate);
 
         if (!trendData[formattedDate]) {
           trendData[formattedDate] = { admissions: 0, discharges: 0 };
         }
 
         if (event.admissionDate) {
           trendData[formattedDate].admissions += 1;
         } else if (event.dischargeDate) {
           trendData[formattedDate].discharges += 1;
         }
       }
     });
 
     const admissionsDischargesTrend = Object.entries(trendData).map(([date, data]) => ({
       date,
       admissions: data.admissions,
       discharges: data.discharges,
     }));
 
     res.json({ admissionsDischargesTrend });
   } catch (error) {
     console.error('Error fetching admissions and discharges trend data:', error);
     res.status(500).json({ error: 'Error fetching admissions and discharges trend data.' });
   }
 };
//dashboard 6:



const patientCare = asyncHandler(async (req, res, next) => {
   const patientsData = await Patient.find();
   if (patientsData.length > 0) {
       const formattedData = patientsData.map(patient => ({
           name: patient.patientName,
           medicalAcuity: patient.medicalAcuity,
           assignedNurse: patient.assignedNurse,
           tasks: patient.tasks,
       }));
       res.status(200).json({ patients: formattedData });
       logger.info('Retrieved patient care dashboard data successfully');
   } else {
       const error = new Error('No patients found');
       error.statusCode = 404;
       throw error;
   }
});

//

const patientCarealert = asyncHandler(async (req, res, next) => {
    const patientsData = await Patient.find();
    if (patientsData.length > 0) {
        const formattedData = patientsData.map(patient => ({
            name: patient.patientName,
            medicalAcuity: patient.medicalAcuity,
            assignedNurse: patient.assignedNurse,
            tasks: patient.tasks,
        }));
 
        // Check for critical and moderate medical acuity
        const criticalPatients = formattedData.filter(patient => patient.medicalAcuity === 'Critical');
        const moderatePatients = formattedData.filter(patient => patient.medicalAcuity === 'Moderate');
 
        // Trigger alerts for critical patients
        if (criticalPatients.length > 0) {
            criticalPatients.forEach(patient => {
                console.log(`ALERT: Critical medical acuity detected for patient ${patient.name}`);
                // You can trigger an alert mechanism here, such as sending an email or notification
            });
        }
 
        // Trigger alerts for moderate patients
        if (moderatePatients.length > 0) {
            moderatePatients.forEach(patient => {
                console.log(`ALERT: Moderate medical acuity detected for patient ${patient.name}`);
                // You can trigger an alert mechanism here, such as sending an email or notification
            });
        }
 
        // Return the formatted patient data
        res.status(200).json({ patients: formattedData });
        logger.info('Retrieved patient care dashboard data successfully');
    } else {
        const error = new Error('No patients found');
        error.statusCode = 404;
        throw error;
    }
 });
 
 
module.exports = { paagHandler, patientCare, wardOccup,availablebed,bedAvailabilityBoard,getAdmissionDischarge,patientCarealert};
