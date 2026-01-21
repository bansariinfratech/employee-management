import express, { Router } from 'express';
import { registerUser, loginUser, verifyOtp } from '../controller/register.js';
import { updateProfile, getProfile, uploadProfile, address } from '../controller/profile.js';
import { verifyToken } from '../middlewear/auth.js';
import { upload } from '../middlewear/upload.js';


const routerv1 = express.Router();

//routerv1.get('/auth/verifyToken', (req, res) => {
 //   res.json({
//        status: 200,
//        message: "Token is valid"
//    });
//});

routerv1.post('/auth/register', registerUser);
routerv1.post('/auth/login', loginUser);
routerv1.post('/auth/verify-otp', verifyOtp);

routerv1.put('/auth/updateProfile', verifyToken,upload.single("profilepic"), updateProfile);
routerv1.get('/auth/profile', verifyToken, getProfile);
routerv1.post('/auth/address', address);


routerv1.post('/auth/upload', verifyToken,upload.single("profilepic"),uploadProfile);


export default routerv1;
