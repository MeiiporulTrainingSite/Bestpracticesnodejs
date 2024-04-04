const mongoose = require('mongoose');

const NurseSchema = new mongoose.Schema({
    nurseName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Nurse = mongoose.model('Nurse', NurseSchema);

module.exports = Nurse;
