const accountModel = require("../models/account.model")




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


module.exports = { createAccount }