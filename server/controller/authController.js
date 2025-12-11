import bcrypt from "bcryptjs"
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
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
        })
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