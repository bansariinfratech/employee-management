import mongoose from 'mongoose';

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
      enum: ["male", "female"],
    },

    location: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin","employee","supervisor","manager"],
      default: "user",
    },

    otpsendDate:{
        type: Date,
        default: null,
},
},

  { timestamps: true }
);

export const Register = mongoose.model('Register',registerSchema);
export default Register;

