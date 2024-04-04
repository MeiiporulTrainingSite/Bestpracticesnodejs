const mongoose = require('mongoose');
const transfersSchema = new mongoose.Schema({
  patientName: String,
  age: String,
  gender: String,
  patientId: String,
  transferId:String,
  currentWardId: String,
  currentBedNumber: String,
  transferWardId: String,
  transferBedNumber: String,
  
  medicalAcuity: [
    {type:String}
  ],
  transferReasons:
  [
    {type:String}
  ],
});
const Transfers = mongoose.model('Transfer', transfersSchema);
module.exports = Transfers;