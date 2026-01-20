// import Joi from "joi";

// export const registerSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
//   otp: Joi.string().default(null),
//   otpExpiry: Joi.date().default(null),
//   isVerified: Joi.boolean().default(false),
//   createdAt: Joi.date().default(Date.now),
//   lastmodifiedDate: Joi.date().default(Date.now),
//   otpsendDate: Joi.date().default(null),
//   dob: Joi.date().required(),
//   gender: Joi.string().valid("Male", "Female").required(),
//   role: Joi.string().valid("Admin", "Employee", "Supervisor", "Manager").default("Admin").required(),
//   location: Joi.string().trim().optional(),
//   profilePic: Joi.string().default("").optional()
// });

// export const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
// });
