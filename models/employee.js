
const mongoose=require('mongoose')
const Schema = mongoose.Schema;
n=new Date();
const employeeSchema=new Schema({
    year:{
        type:Number,
        required: true,
        max:n.getFullYear()
    },
    month:{
        type:Number,
        required: true,
        max:12
    },
    name:{
        type:String,
        required: true
        
    },
    empcode:{
        type:String,
        required: true
    },
    present:{
        type:Number,
        required: true,
        max:31
     //  validate: {
         //    validator: function(v) {
           //    if(year%4==0 && month==2 && present>29){
          ///         throw new Error('Need to get a Turbo Man for Christmas');

        //        }
       //      },
     //       message: props => `${props.value} is not a valid phone number!`
    //       },
        
    },
    absent:{
        type:Number,
        required: true,
        max:31
    },
    sdm:{                                                  //salary deduction multiplier
        type:Number,
        required: true
    },
    salary:{
        type:Number,
        required: true
    },
    actual_salary:{
        type:Number,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Owner'
    }


})
employeeSchema.path('present').validate(function(month,year,present) {
    if(employeeSchema.path('year')%4==0 && employeeSchema.path('month')==2 && present>29){
        throw new Error('No. of days present cannot be more than number of days in a month');

    }
    if((month==4 || month==6 || month==9 || month==11) && present>30){
        throw new Error('No. of days present cannot be more than number of days in a month');

    }
    return true;
  }, 'No. of days present `{VALUE}` is not valid');
// employeeSchema.statics.findAndValidate=async function(username,password){
//     const foundUser=await this.findOne({username});
    
//    const isValid= await bcrypt.compare(password,foundUser.password)
//     return isValid? foundUser:false;
// }
// employeeSchema.pre('save',async function(next){
//    if(!this.isModified('password')) return next();
//     this.password=await bcrypt.hash(this.password,12);
//     next();
// })
module.exports=mongoose.model('Employee',employeeSchema);