
import { sendOtpEmail } from "../config/email.js";
import { message } from "../helper/messagehelper.js";
import { generateOtp ,getNowISO} from "../helper/methods.js";
import RegisterModel, { loginSchema, RegisterSchema } from "../model/register.model.js";
//import { registerSchema ,loginSchema} from "../validator/authValidator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail,saveUser } from "../helper/register.js";



export const registerUser  = async (req, res, next) => {
    try {
        const { error } = RegisterSchema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                status: 400,
                message:message.validation,
                errors: error.details.map(err => err.message.toString())
            });
        }

        const { email, password, dob, gender, role, location, profilePic } = req.body;

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: message.alreadyExists
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const otp = generateOtp();
        const otpsendDate = new Date(getNowISO());
        const otpExpiry = new Date(
          new Date(getNowISO()).getTime() + 2 * 60 * 1000
        );
  
        if (!otp) {
            return res.status(500).json({
                status: 500,
                message: message.otpfailed
            });
        }

        const newUser = new RegisterModel({
            email: email,
            password: hashPassword,
            dob,
            location,
            gender,
            profilePic,
            role: role || "Admin",
            otp: otp,
            otpExpiry: otpExpiry,
            otpsendDate: otpsendDate,
            isVerified: false,
          
        });

        const savedUser = await createUser(newUser);
       
        if (!savedUser.otp || !savedUser.otpsendDate) {
            console.error('OTP not save', {
                otp: savedUser.otp,
                otpsendDate: savedUser.otpsendDate,
                otpExpiry: savedUser.otpExpiry
            });
        }

        await sendOtpEmail(email, otp);

        return res.status(201).json({
            status: 201,
            message:message.register,
            data: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
         
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: message.servererror,
            errors: error.message
        });
    }
}

export const loginUser = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                status: 400,
                message: message.requestbody,
                errors: message.emailrequired
            });
        }

        const { error } = loginSchema.validate(req.body, 
        {
            abortEarly: false
        }); 
        if (error) {
            return res.status(400).json({
                status: 400,
                message: message.validation,
                errors: error.details.map(err => err.message.toString())
            });
        }
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({   
                status: 400,
                message: message.invalidfield
            });
        }

        if (!user.isVerified) {
         return res.status(403).json({
        status: 403,
        message: message.otpnotverify,
          });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: 400,
                message: message.invalidfield
            });
        }

        const token = jwt.sign({
            id:user.email,
            email:user.email,
        },process.env.JWT_SECRET,
        {expiresIn:"1h"} 
        );

        return res.json({
            status: 200,
            message: message.loginsucess,
            data: { 
                id: user._id,
                email: user.email,
                token: token
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: message.servererror,
            errors: error.message
        });
    }
}

export const verifyOtp = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                status: 400,
                message:message.requestbody,
                errors: message.otprequired,
            });
        }

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 400,
                message:message.validation,
                errors: message.otprequired,
            });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message:message.usernotfound,
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                status: 400,
                message:message.useralreadyverify,
            });
        }

       
        if (user.otp !== otp) {
            return res.status(400).json({
                status: 400,
                message: message.invalidotp
            });
        }

       
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return res.status(400).json({
                status: 400,
                message: message.otpexpired,
            });
        }

        
        const token = jwt.sign({
            id:user._id.toString(),
            email:user.email,
        },process.env.JWT_SECRET,
        {expiresIn:"1h"} 
        );

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await saveUser(user);

        return res.status(200).json({
            status: 200,
            message: message.otpverify,
            data: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified,
                token: token
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: message.servererror,
            errors: error.message
        });
    }
}