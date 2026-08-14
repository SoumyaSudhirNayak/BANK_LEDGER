const {accountModel} = require("../models/account.model")




async function createAccount(req, res) {
    const User = req.user

    const account = await accountModel.create({
        userId: User._id
    }

    )
    res.status(201).json({
        message: "Account Created Successfully",
        account
    })

}


async function getAccounts(req, res){
    const User = req.user
    const accounts = await accountModel.find({
        userId: User._id
    })

    if(!accounts){
        return res.status(404).json({
            message: "No accounts found"
        })
    }
    res.status(200).json({
        message: "Accounts fetched successfully",
        accounts
    })
    
}



module.exports = { createAccount, getAccounts}