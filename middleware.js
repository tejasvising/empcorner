const Employee = require('./models/employee');
const {employeeSchema}=require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/employees');
    }
    next();
}

module.exports.validateEmployee=async(req,res,next)=>{ 
    const employee = await Employee.findById(req.params.id)
    const {error}=employeeSchema.validate(req.body)
    
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        req.flash('error', 'invalid input')
        //return res.redirect(`/employees/${employee._id}/edit`)
    }
    else{
        next();
    }
    }