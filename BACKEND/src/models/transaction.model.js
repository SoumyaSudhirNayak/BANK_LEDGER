const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Please provide fromAccount"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Please provide toAccount"],
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Please provide amount"],
        min:[0,"Please provide positive amount"]
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status is either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },
    idempotencyKey: {
        type: String,
        required: [true, "IdempotencyKey is required for a transaction"],
        unique:true,
        index:true
    }
},
    {
        timestamps:true
    }
)


const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = { transactionModel };