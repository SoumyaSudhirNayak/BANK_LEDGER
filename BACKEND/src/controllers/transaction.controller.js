const mongoose = require("mongoose")
const { userModel } = require("../models/user.model")
const { accountModel } = require("../models/account.model");
const { ledgerModel } = require("../models/ledger.model")
const { transactionModel } = require("../models/transaction.model")
const { sendTransactionEmail, sendTransactionFailureEmail } = require("../services/email.service")


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */


async function createTransaction(req, res) {


    /* * 1. Validate request */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        userId: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        userId: toAccount
    })


    if (fromAccount !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You can only transfer from your own account"
        });
    }


    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /* ** 2. Validate idempotency key
     * Checks whether this transaction was already processed.
     */
    const ifTransactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (ifTransactionExists) {
        if (ifTransactionExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction already failed",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "PENDING") {
            return res.status(504).json({
                message: "Transaction already pending",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "REVERSED") {
            return res.status(400).json({
                message: "Transaction already reversed",
                transaction: ifTransactionExists
            })

        }
    }
    /* ** 3. Check account status
     * 
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }
    /* 4. Derive sender balance from ledger */
    const fromBalance = await fromUserAccount.getBalance()

    if (fromBalance < amount) {
        return res.status(400).json({
            message: `Insufficient balance, Current Balance \`${fromBalance}\`, Transaction Failed`
        })
    }

    /* ** 5. Create transaction (PENDING) */

    const session = await mongoose.startSession()
    session.startTransaction()
    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount: amount,
        idempotencyKey: idempotencyKey,
        status: "PENDING"
    })

    /* ** 6. Create DEBIT ledger entry */
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session })

    /* ** 7. Create CREDIT ledger entry */
    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session })

    /* ** 8. Mark transaction COMPLETED */
    transaction.status = "COMPLETED"
    await transaction.save({ session })

    /* ** 9. Commit MongoDB session */
    await session.commitTransaction()
    session.endSession()

    /* ** 10. Send email notification */
    const toUser = await userModel.findById(toAccount);


    await sendTransactionEmail(req.user.email, req.user.name, amount, toUser ? toUser.name : toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })


}


async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        userId: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = new mongoose.Types.ObjectId(req.user._id) /* I'm using older versions of Mongoose & calling standard document manipulation tools later, checking req.user._id can sometimes fail or return undefined if the internal document state is polluted or if req.user isn't fully casting down to its plain object identifier.To prevent typecasting bugs across your entire request lifecycle, wrap queries in explicit Mongoose ObjectId type definitions.*/

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const ifTransactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (ifTransactionExists) {
        if (ifTransactionExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction already failed",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "PENDING") {
            return res.status(504).json({
                message: "Transaction already pending",
                transaction: ifTransactionExists
            })
        }
        if (ifTransactionExists.status === "REVERSED") {
            return res.status(400).json({
                message: "Transaction already reversed",
                transaction: ifTransactionExists
            })

        }
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}



module.exports = { createTransaction, createInitialFundsTransaction }
