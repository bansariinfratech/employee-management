import { profileSchema } from "../validator/profile.js"
import RegisterModel from "../model/register.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const updateProfile = async(req,res,next) =>{
    try{
        const {error} = profileSchema.validate(req.body,{
            abortEarly:false
        });

        if(error){
            return res.status(400).json({
                status:400,
                message:"Validation failed",
                errors:error.details.map(err => err.message.toString())
            });
        }

        const {id, dob, location, gender, role, profilePic, email, password} = req.body;

     
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:"Invalid user ID format"
            });
        }

        const user = await RegisterModel.findById(id);
        
        if(!user){
            return res.status(404).json({
                status:404,
                message:"User not found",
            });
        }

        const userId = user._id;

        const updateProfileData = {};
        if(dob) updateProfileData.dob = dob;
        if(location) updateProfileData.location = location;
        if(gender) updateProfileData.gender = gender;
        if(role) updateProfileData.role = role;
        if(profilePic) updateProfileData.profilePic = profilePic;
        if(email && email !== user.email) {
         
            const emailExists = await RegisterModel.findOne({ email: email });
            if(emailExists) {
                return res.status(400).json({
                    status: 400,
                    message: "Email already exists"
                });
            }
            updateProfileData.email = email;
        }
        if(password) {
            updateProfileData.password = await bcrypt.hash(password, 10);
        }

     
        const updatedProfile = await RegisterModel.findByIdAndUpdate(
            userId,
            {$set: updateProfileData},
            {new: true, runValidators: true}
        );

        return res.json({
            status:200,
            message:"Profile updated successfully",
            data:{
                id: updatedProfile._id,
                email: updatedProfile.email,
                dob: updatedProfile.dob,
                location: updatedProfile.location,
                gender: updatedProfile.gender,
                role: updatedProfile.role,
                profilePic: updatedProfile.profilePic
            }
        });

    }catch(error){
        console.error('Error in updateProfile:', error);
        return res.status(500).json({
            status:500,
            message:"Internal server error",
            errors:error.message || "An unexpected error occurred"
        });
    }
}

export const getProfile = async(req,res,next) =>{
    try{
        
        const userIdOrEmail = req.user.id || req.user.email;
        
        if(!userIdOrEmail){
            return res.status(401).json({
                status:401,
                message:"Unauthorized:User not found"
            });
        }

      const user = await RegisterModel.findById(userIdOrEmail);
        
        if(!user){
            return res.status(404).json({
                status:404,
                message:"User not found",
            });
        }

        return res.json({
            status:200,
            message:"Profile retrieved successfully",
            data:{
                id: user._id,
                email: user.email,
                dob: user.dob,
                location: user.location,
                gender: user.gender,
                role: user.role,
                profilePic: user.profilePic,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    }catch(error){
        console.error('Error in getProfile:', error);
        return res.status(500).json({
            status:500,
            message:"Internal server error",
            errors:error.message || "An unexpected error occurred"
        });
    }
}


