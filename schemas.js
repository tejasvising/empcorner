const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.employeeSchema = Joi.object({
    employee: Joi.object({
        year: Joi.number().required().min(0),
        month: Joi.number().required().min(0),
        name:Joi.string().required().escapeHTML(),
        empcode: Joi.string().required().escapeHTML(),
        present: Joi.number().required().min(0),
        absent: Joi.number().required().min(0),
        sdm: Joi.number().required().min(0),
        salary: Joi.number().required().min(0),
        actual_salary: Joi.number().required().min(0),

    }).required(),
   
});


