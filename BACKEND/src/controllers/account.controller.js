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


async function getAccountBalance(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        userId: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}


module.exports = { createAccount, getAccounts, getAccountBalance}