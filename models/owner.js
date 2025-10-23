const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate=require("mongoose-findorcreate")


const OwnerSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Owner'
    }
});
OwnerSchema.plugin(findOrCreate);
OwnerSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Owner',OwnerSchema);
