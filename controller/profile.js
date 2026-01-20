//import { profileSchema } from "../validator/profile.js"
import RegisterModel from "../model/register.model.js";

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { ProfileSchema } from "../model/profile.model.js";

export const updateProfile = async(req,res,next) =>{
    try{
        const {error} = ProfileSchema.validate(req.body,{
            abortEarly:false
        });

        if(error){
            return res.status(400).json({
                status:400,
                message:message.validation,
                errors:error.details.map(err => err.message.toString())
            });
        }

        const {id, dob, location, gender, role, email, password} = req.body;

     
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                status:400,
                message:message.invaliduserid
            });
        }

        const user = await RegisterModel.findById(id);
        
        if(!user){
            return res.status(404).json({
                status:404,
                message:message.usernotfound,
            });
        }

        const userId = user._id;

        const updateProfileData = {};
        if(dob) updateProfileData.dob = dob;
        if(location) updateProfileData.location = location;
        if(gender) updateProfileData.gender = gender;
        if(role) updateProfileData.role = role;
        
        if(req.file){
             user.profilePic = {
             data: req.file.buffer,
             contentType: req.file.mimetype
    };
        }

        if(email && email !== user.email) {
         
            const emailExists = await RegisterModel.findOne({ email: email });
            if(emailExists) {
                return res.status(400).json({
                    status: 400,
                    message:message.emailalreadyexists,
                });
            }
            updateProfileData.email = email;
        }
        if(password) {
            updateProfileData.password = await bcrypt.hash(password, 10);
        }

         await user.save();
     
        const updatedProfile = await RegisterModel.findByIdAndUpdate(
            userId,
            {$set: updateProfileData},
            {new: true, runValidators: true}
        );

        return res.json({
            status:200,
            message:message.profileupdate,
            data:{
                id: updatedProfile._id,
                email: updatedProfile.email,
                dob: updatedProfile.dob,
                location: updatedProfile.location,
                gender: updatedProfile.gender,
                role: updatedProfile.role,
                profilePic: `${req.protocol}://${req.get("host")}/auth/profilepic`,
            }
        });

    }catch(error){
        return res.status(500).json({
            status:500,
            message:message.servererror,
            errors:error.message
        });
    }
}

export const getProfile = async(req,res,next) =>{
    try{       
        const userIdOrEmail = req.user.id || req.user.email;
        
        if(!userIdOrEmail){
            return res.status(401).json({
                status:401,
                message:message.usernotfound,
            });
        }

      const user = await RegisterModel.findById(userIdOrEmail);
        
        if(!user){
            return res.status(404).json({
                status:404,
                message:message.usernotfound,
            });
        }

        return res.json({
            status:200,
            message:message.profileretrieved,
            data:{
                id: user._id,
                email: user.email,
                dob: user.dob,
                location: user.location,
                gender: user.gender,
                role: user.role,
               profilePic: `${req.protocol}://${req.get("host")}/auth/profilepic`,
                isVerified: user.isVerified,
                createdAt: getIsoString(user.createdAt),
                updatedAt: getIsoString(user.updatedAt),
            }
        });

    }catch(error){
        return res.status(500).json({
            status:500,
            message:message.servererror,
            errors:error.message 
        });
    }
}
export const uploadProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; 

    if (!userId) {
      return res.status(401).json({
        status: 401,
        message:message.usernotfound,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: message.filenotuploaded,
      });
    }

    const user = await RegisterModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: message.usernotfound,
      });
    }

   
    user.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await user.save();

    return res.status(200).json({
      status: 200,
      message:message.imageuploaded,
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message:message.servererror,
      errors: error.message
    });
  }
};


