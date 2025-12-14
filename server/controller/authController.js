import bcrypt from "bcryptjs"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export const register = async( req , res)=>{
    const { name, email, password} = req.body;
    if(!name || !email || !password){
        return res.json({success: false , message : " missing details"})
    }
    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success: false ,  message : "user already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user =  new userModel({ name , email , password: hashedPassword});

        await user.save();

        const token =  jwt.sign({id: user._id}, process.env.JWT_SECRET , {expiresIn: '7d'});

        res.cookie('token', token , {
            httpOnly: true,
            secure: process.env.NODE_ENV=== 'production',
            sameSite : process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        });

        // sending email to user
        const mailOption={
            from : process.env.SENDER_EMAIL,
            to : email,
            subject : 'Welcome to MERN_AUTH website',
            text: `Welcome to Rajdeep's website . you login with email id : ${email} `
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true});

    }catch(error){
        res.json({success:false , message : error.message});
    }
}

export const login = async (req , res )=>{
    const {email , password } = req.body;

    if(!email || !password ){
        return res.json ({success : false , message : "email and password are required"});
    }

    try{

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({sucess: false , message: " invalid email"});
        }

        const isMatch = await bcrypt.compare(password , user.password);

        if(!isMatch){
            return res.json({sucess: false , message : "inavlid password"});
        }

        const token =  jwt.sign({id: user._id}, process.env.JWT_SECRET , {expiresIn: '7d'});

        res.cookie('token', token , {
            httpOnly: true,
            secure: process.env.NODE_ENV=== 'production',
            sameSite : process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })

        return res.json({success: true});


    }catch(error){
        return res.json({sucess: false , message: error.message });
    }
}

export const logout = async (req , res)=>{
    try{

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV=== 'production',
            sameSite : process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
        })

        return res.json({sucess: true , message: "logout sucessfull"})

    }catch(error){
         return res.json({sucess: false , message: error.message });
    }
}

export const sendVerifyOpt= async(req , res)=>{
    try{

        const {userId}= req.body;

        const user = await userModel.findById(userId);

        if(user.isVerified){
            return res.json({success:false  , message: "Account already verified"});
        }
        const otp = Math.floor(100000+ Math.random()*900000);
        user.verifyOtp = otp;
        user.verifyOtpExpireAt= Date.now()+24*60*60*1000;

        await user.save();

        const mailOption={
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : 'Account verification OTP',
            text: `Your OTP is ${otp}. verify account with this OTP. `
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true , message:"verification OTP send on email."});


    }catch(error){
        return res.send({success : false , message : error.message})
    }
}

export const verifyEmail = async(req , res)=>{
    const {userId, otp}= req.body;

    if(!userId || !otp ){
        res.json({success: false , message : "missing details"});
    }
    try {

        const user= await userModel.findById(userId);

        if(!user){
            res.json({success: false , message : "user not found"});
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp ){
            res.json({success: false , message : "Invalid Otp"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            res.json({success: false , message : "OTP expired"});
        }

        user.isVerified= true;
        user.verifyOtp='';
        user.verifyOtpExpireAt=0;

        await user.save();

        return res.json({success: true , message:"verification Sucessfull"})


    }catch(error){
        if (res.headersSent) {
        console.error("Error after headers sent:", error);
        return;
    }
        res.json({success: false , message : error.message});
    }
}

export const isAuthenticated = async (req , res)=>{
    try{

        return res.json({success: true});

    }catch(error){
        return res.send({success : false , message : error.message})
    }
}

export const sendResetOtp = async (req , res)=>{
    const {email} = req.body;
    if(!email){
        return res.json({success : false , message : "email is required"});
    }
    try{

       const user = await userModel.findOne({email});
       if(!user){
         return res.json({success : false , message : "user not found"});
       } 

        const otp = Math.floor(100000+ Math.random()*900000);
        user.resetOtp = otp;
        user.resetOtpExpiredAt= Date.now()+15*60*1000;

        await user.save();

        const mailOption={
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : 'Password reset OTP',
            text: `your passward reset opt : ${otp} . please verify using this otp . `
        }
        await transporter.sendMail(mailOption);
        return res.json({success :  true , message : "password reset OTP send "})

    }catch(error){
        return res.send({success : false , message : error.message})
    }
}

export const resetPassword = async (req , res)=>{
    const {email , otp , newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.json({success : false , message : "Email , otp or New password required "})
    }
    try{

        const user = await userModel.findOne({email});

        if(!user){
             return res.json({success : false , message : "user not found "})
        }

        if(user.resetOtp== "" || user.resetOtp !== otp){
             return res.json({success : false , message : "Inavlid Otp"});
        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({success : false , message : "Expired Otp"})
        }

        const hashedPassword = await bcrypt.hash(newPassword , 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiredAt= 0;

        await user.save();

        return res.json({success :  true , message : "password reset successfully "});

    }catch(error){
        return res.send({success : false , message : error.message})
    }
}