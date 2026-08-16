const {userModel} = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")


/* 
* -User Controller Register
* - post request to api/auth/register
* - request body should contain email,password & name
*/
async function registerUser(req, res) {
    const { email, password, name } = req.body;
    const ifUserExist = await userModel.findOne({ email })

    if (ifUserExist) {
        return res.status(422).json({
            success: false,
            message: "User already exists"
        })
    }

    const User = await userModel.create({
        email,
        password,
        name
    })

    const token = jwt.sign({ userId: User._id }, process.env.JWT_SECRET, {
        expiresIn: "3d"
    })
    res.cookie("token", token)
    res.status(201).json({ message: "User registerd successfully", user_details: { email: User.email, name: User.name }, token })

    // send the welcome email
    await emailService.sendRegistrationEmail(User.email, User.name);
}

/* 
*-User Controller Login
*- Post Request to api/auth/login
*- Login is done using email and password
*/

async function loginUser(req,res){
    const {email, password}= req.body;
    const User= await userModel.findOne({email}).select("+password");

    if(!User){
        return res.status(401).json({
            success: false,
            message: "User does not exist",
            
        })
    }
    const isPasswordValid =await User.comparePassword(password);
    if(!isPasswordValid){
        return res.status(401).json({
            success: false,
            message: "Invalid password",
        })
    }

    const token = jwt.sign({ userId: User._id }, process.env.JWT_SECRET, {
        expiresIn: "3d"
    })

    res.cookie("token", token)
    res.status(200).json({
        success:true,
        message:"User logged in successfully",
        user_details:{
            email:User.email,
            name:User.name
        },
        token
    })
}



module.exports = { registerUser, loginUser }