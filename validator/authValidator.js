import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  createdAt: Joi.date().default(Date.now),
  lastmodifiedDate: Joi.date().default(Date.now),
  otpsendDate: Joi.date().default(null),
  dob: Joi.date().required(),
  gender: Joi.string().valid("male", "female").required(),
  role: Joi.string().valid("admin", "employee", "supervisor", "manager").required(),
  location: Joi.string().trim().optional(),
  profilePic: Joi.string().default("").optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
