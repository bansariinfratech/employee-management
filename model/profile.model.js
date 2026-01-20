import mongoose from "mongoose";
import Joi from "joi";

const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true 
    }, 
    dob:{
        type: Date,
    },
    location:{
        type: String,
        trim: true,
    },
    profilePic:{
        type: String,
        default: "",    
    },
    gender:{
        type: String,
        enum: ["Male","Female"],
    },
    role:{
        type: String,
        enum: ["Admin","Employee","Supervisor","Manager"],
    },
},
    {timestamps: true},
);

export const profile = mongoose.model("profile", profileSchema);
export default profile;

export const ProfileSchema = Joi.object({
    id: Joi.string().required().messages({
        'string.empty': 'ID is required',
        'any.required': 'ID is required'
    }),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    gender: Joi.string().valid("male","female").optional(),
    role: Joi.string().valid("Admin","Employee","Supervisor","Manager").optional(),
    dob: Joi.date().optional(),
    location: Joi.string().trim().optional(),
   // profilePic: Joi.string().optional(),
}).messages({
    'object.min': 'ID and at least one field must be provided for update'
}) 