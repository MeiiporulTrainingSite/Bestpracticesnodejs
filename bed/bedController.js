const asyncHandler = require('express-async-handler');
const Bed = require('../bed/bedModel');
const  moment=require('moment')
const logger = require('../utils/logger');

const addBeds = asyncHandler(async (req, res, next) => {
    const { wardName, wardId, wardType, bedNumber } = req.body;

    // Find the existing ward by its wardId and wardType
    let existingWard = await Bed.findOne({
        'wards.wardName': wardName,
        'wards.wardId': wardId,
        'wards.wardType': wardType,
    });

    // If the ward doesn't exist, create a new one
    if (!existingWard) {
        existingWard = new Bed({
            wards: [
                {
                    wardName,
                    wardId,
                    wardType,
                    beds: [],
                },
            ],
        });
    }

    // Get the current bed count in the ward
    const currentBeds = existingWard.wards[0].beds || [];

    if (bedNumber >= 0) {
        // Get the starting bed number
        const startingBedNumber =
            currentBeds.length > 0
                ? parseInt(currentBeds[currentBeds.length - 1].bedNumber.split('_')[1]) + 1
                : 1;

        // Add the specified number of beds to the existing or new ward
        for (let i = 1; i <= bedNumber; i++) {
            const newBedNumber = startingBedNumber + i - 1;
            const newBed = {
                bedNumber: `bed_${newBedNumber}`,
                status: 'available',
            };
            currentBeds.push(newBed);
        }

        // Update the beds array in the existing or newly created ward
        existingWard.wards[0].beds = currentBeds;

        // Save the updated or newly created ward
        await existingWard.save();
        logger.info('Added beds successfully'); // Log successful addition of beds

        res.status(200).json({ message: `Added ${bedNumber} beds to the specified ward successfully` });
    } else {
        const errorMessage = 'Invalid bed count found';
        logger.error(errorMessage); // Log the error
        next({ statusCode: 400, message: errorMessage }); // Pass error to error handler middleware
    }
});

const bedGet = asyncHandler(async (req, res, next) => {
    const bedss = await Bed.find();
    if (bedss.length > 0) {
        res.json(bedss);
    } else {
        const errorMessage = 'Invalid Patient Not Found';
        logger.error(errorMessage); // Log the error
        next({ statusCode: 404, message: errorMessage }); // Pass error to error handler middleware
    }
});
const getBedStatusPerWard = asyncHandler(async (req, res) => {
    try {
        const allBedsData = await Bed.find(); // Fetch all documents

        if (!allBedsData || allBedsData.length === 0) {
            return res.status(404).json({ message: 'No bed data found.' });
        }

        const today = moment();
        const thisWeekStart = moment().startOf('isoWeek');
        const thisMonthStart = moment().startOf('month');

        const bedStatusPerWard = {};

        allBedsData.forEach((bedData) => { // Iterate through all documents
            bedData.wards.forEach((ward) => {
                const wardName = ward.wardName;
                let occupiedBedsToday = 0;
                let occupiedBedsThisWeek = 0;
                let occupiedBedsThisMonth = 0;

                ward.beds.forEach((bed) => {
                    if (bed.status === 'occupied') {
                        const occupiedDate = moment(bed.admissionDate);
                        if (occupiedDate.isSame(today, 'day')) {
                            occupiedBedsToday++;
                        }
                        if (occupiedDate.isSameOrAfter(thisWeekStart, 'day')) {
                            occupiedBedsThisWeek++;
                        }
                        if (occupiedDate.isSameOrAfter(thisMonthStart, 'day')) {
                            occupiedBedsThisMonth++;
                        }
                    }
                });

                const availableBeds = ward.beds.filter((bed) => bed.status === 'available').length;

                bedStatusPerWard[wardName] = {
                    occupiedTodayBeds: occupiedBedsToday,
                    occupiedThisWeekBeds: occupiedBedsThisWeek,
                    occupiedThisMonthBeds: occupiedBedsThisMonth,
                    availableBeds: availableBeds,
                };
            });
        });

        res.json({
            bedStatusPerWard,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const getOccupancyTrends = asyncHandler(async (req, res) => {

try {
    // Find all beds with occupied status
    const occupiedBeds = await Bed.find({ 'wards.beds.status': 'occupied' });

    if (!occupiedBeds || occupiedBeds.length === 0) {
      return res.status(404).json({ message: 'No occupied beds found.' });
    }

    const admissionData = [];

    occupiedBeds.forEach((bed) => {
      bed.wards.forEach((ward) => {
        ward.beds.forEach((bed) => {
          if (bed.status === 'occupied') {
            const admissionDate = bed.admissionDate;
            const bedNumber = bed.bedNumber; // Assuming bedNumber is the field for bed number
            const patientName = bed.patientName;

            admissionData.push({
              admissionDate,
              bedNumber,
              patientName,
            });
          }
        });
      });
    });

    res.json(admissionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = { addBeds, bedGet,getBedStatusPerWard,getOccupancyTrends };

