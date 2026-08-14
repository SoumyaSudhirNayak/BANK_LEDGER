const mongoose = require("mongoose");


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


const accountModel = mongoose.model("Account", accountSchema);

module.exports = {accountModel};