import mongoose from "mongoose";

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
        enum: ["male","female"],
    },
    role:{
        type: String,
        enum: ["admin","employee","supervisor","manager"],
    },
},
    {timestamps: true},
);

export const profile = mongoose.model("profile", profileSchema);
export default profile;
