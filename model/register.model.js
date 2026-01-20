import mongoose from 'mongoose';
import Joi from 'joi';

const registerSchema =new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
     otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
    },

    location: {
      type: String,
      trim: true,
    },

    profilePic: {
      // type:String,
      // default: "",
      data: Buffer,
      contentType: String,
    },

    role: {
      type: String,
      enum: ["Admin","Employee","Supervisor","Manager"],
   
    },

    otpsendDate:{
        type: Date,
        default: null,
},
},

  {
    timestamps: {
      currentTime: () => {
        const now = new Date();
        const offset = 330;
        return new Date(now.getTime() + offset * 60000);
      }
    }
  }
);

export const Register = mongoose.model('Register',registerSchema);
export default Register;


export const RegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  otp: Joi.string().default(null),
  otpExpiry: Joi.date().default(null),
  isVerified: Joi.boolean().default(false),
  createdAt: Joi.date().default(Date.now),
  lastmodifiedDate: Joi.date().default(Date.now),
  otpsendDate: Joi.date().default(null),
  dob: Joi.date().required(),
  gender: Joi.string().valid("Male", "Female").required(),
  role: Joi.string().valid("Admin", "Employee", "Supervisor", "Manager").default("Admin").required(),
  location: Joi.string().trim().optional(),
  profilePic: Joi.string().default("").optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
