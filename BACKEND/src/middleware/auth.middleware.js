const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")



async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ","")

    if(!token){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }

    try {
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)

        if(!user){
            return res.status(401).json({
                success:false,
                message:"User Not Found"
            })
        }
        req.user=user;
        next()
        
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"Invalid Token"
        })
        
    }

}


module.exports={authMiddleware}