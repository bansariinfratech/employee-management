// import Joi from "joi";

// export const profileSchema = Joi.object({
//     id: Joi.string().required().messages({
//         'string.empty': 'ID is required',
//         'any.required': 'ID is required'
//     }),
//     email: Joi.string().email().optional(),
//     password: Joi.string().min(6).optional(),
//     gender: Joi.string().valid("male","female").optional(),
//     role: Joi.string().valid("Admin","Employee","Supervisor","Manager").optional(),
//     dob: Joi.date().optional(),
//     location: Joi.string().trim().optional(),
//    // profilePic: Joi.string().optional(),
// }).messages({
//     'object.min': 'ID and at least one field must be provided for update'
// }) 