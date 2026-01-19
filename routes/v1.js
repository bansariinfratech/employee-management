import express, { Router } from 'express';
import { registerUser, loginUser, verifyOtp } from '../controller/register.js';
import { updateProfile, getProfile } from '../controller/profile.js';
import { veriftToken } from '../middlewear/auth.js';

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

routerv1.put('/auth/updateProfile', veriftToken, updateProfile);
routerv1.get('/auth/profile', veriftToken, getProfile);
export default routerv1;
