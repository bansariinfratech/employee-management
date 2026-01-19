
import { sendOtpEmail } from "../config/email.js";
import { generateOtp } from "../helper/otp.js";
import RegisterModel from "../model/register.model.js";
import { registerSchema ,loginSchema} from "../validator/authValidator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser  = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                status: 400,
                message: 'Validation failed',
                errors: error.details.map(err => err.message.toString())
            });
        }

        const { email, password, dob, gender, role, location, profilePic } = req.body;

        const existingUser = await RegisterModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: 'User already exists with this email'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const otp = generateOtp();
        const otpsendDate = new Date();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

        
        if (!otp) {
            return res.status(500).json({
                status: 500,
                message: 'Failed to generate OTP'
            });
        }

        const newUser = new RegisterModel({
            email: email,
            password: hashPassword,
            dob,
            location,
            gender,
            profilePic,
            role: role || "user",
            otp: otp,
            otpExpiry: otpExpiry,
            otpsendDate: otpsendDate,
            isVerified: false,
        });

        const savedUser = await newUser.save();
        
       
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
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
         
        });

    } catch (error) {

        console.error('Error in Signup:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            errors: error.message
        });
    }
}

export const loginUser = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                status: 400,
                message: 'Request body is required',
                errors: 'Please provide email and password in the request body'
            });
        }

        const { error } = loginSchema.validate(req.body, 
        {
            abortEarly: false
        }); 
        if (error) {
            return res.status(400).json({
                status: 400,
                message: 'Validation failed',
                errors: error.details.map(err => err.message.toString())
            });
        }
        const { email, password } = req.body;

        const user = await RegisterModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({   
                status: 400,
                message: 'Invalid email or password'
            });
        }

        if (!user.isVerified) {
         return res.status(403).json({
        status: 403,
        message: "OTP not verified. Please verify your account.",
          });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid email or password'
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
            message: 'Login successful',
            data: { 
                id: user._id,
                email: user.email,
                token: token
            }
        });
    } catch (error) {
        console.error('Error in Login', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            errors: error.message
        });
    }
}

export const verifyOtp = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                status: 400,
                message: 'Request body is required',
                errors: 'Please provide email and otp'
            });
        }

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 400,
                message: 'Validation failed',
                errors: 'Email and OTP are required'
            });
        }

        const user = await RegisterModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                status: 400,
                message: 'User already verified'
            });
        }

       
        if (user.otp !== otp) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid OTP'
            });
        }

       
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return res.status(400).json({
                status: 400,
                message: 'OTP has expired. Please request a new OTP.'
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
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'OTP verified successfully',
            data: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified,
                token: token
            }
        });

    } catch (error) {
        console.error('Error in OTP Verification:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            errors: error.message
        });
    }
}