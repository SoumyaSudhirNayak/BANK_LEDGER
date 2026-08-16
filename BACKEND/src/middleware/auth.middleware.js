const { userModel } = require("../models/user.model")
const jwt = require("jsonwebtoken")
const { tokenBlackListModel } = require("../models/blacklist.model")




async function authMiddleware(req, res, next) {
    let token = req.cookies?.token;

    // If token isn't in cookies, check the Authorization header safely
    if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "");
        }
    }

    

    // If still no token found in either place
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }
}


async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }
    const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemuser")


        if (user.systemuser) {
            req.user = user
            next()
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        })
    }
}



module.exports = { authMiddleware, authSystemUserMiddleware }