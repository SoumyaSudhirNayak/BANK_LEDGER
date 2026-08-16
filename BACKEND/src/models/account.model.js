const mongoose = require("mongoose");
const { ledgerModel } = require("./ledger.model");


const accountSchema = new mongoose.Schema(
    {

        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Please provide userId"],
            index: true //to handle many users in parallel (Scalability), search is fast
        },
        status: {
            type: String,
            enum: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status is either ACTIVE, FROZEN or CLOSED",
            default: "ACTIVE"
        },
        currency: {
            type: String,
            required: [true, "Please provide currency"],
            default: "INR"
        },
    },
    {
        timestamps: true
    }

);



accountSchema.index({ userId: 1, status: 1 }) //composite index



accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        {
            // Explicitly cast the instance ID to a strict MongoDB ObjectId
            $match: { account: new mongoose.Types.ObjectId(this._id) }
        },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ]);

    // If no ledger entries exist yet for this account, balance is 0
    if (balanceData.length === 0) {
        return 0;
    }

    // Access the calculation from the first array item
    return balanceData[0].balance;
};


const accountModel = mongoose.model("Account", accountSchema);

module.exports = { accountModel};