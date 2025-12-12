import jwt from "jsonwebtoken";

const userAuth = async(req , res , next)=>{

    const {token}= req.cookies;

    if(!token){
        return res.json({succcess:false , message: "Not Authorized. login again."})
    }

    try{
        req.body = req.body || {};

        const decodedToken= jwt.verify(token, process.env.JWT_SECRET);

        if(decodedToken.id){
            req.body.userId = decodedToken.id;
        }else{
            return res.json({success:false , message: "Not Authorized. login again."})
        }

        next();

    }catch(error){
         return res.json({succcess:false , message: error.message})
    };
}

export default userAuth;