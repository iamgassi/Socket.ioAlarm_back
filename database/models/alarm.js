const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
 createdBy:{
   type:String,
 },
 alarmId:{type:String},
 alarmTime:{type:String,unique:true},
 created_at:
{ 
    type: Date,
    default: Date.now
 },
},
 )

 const alarmModel = mongoose.model('Alarm', alarmSchema);

 module.exports=alarmModel