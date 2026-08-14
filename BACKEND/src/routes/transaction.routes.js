const express = require("express");
const {createTransaction, createInitialFundsTransaction}=require("../controllers/transaction.controller")
const {authMiddleware, authSystemUserMiddleware}=require("../middleware/auth.middleware")


const router= express.Router();

/*
* - POST /api/transactions
* - Create new Transaction
*/ 

router.post("/",authMiddleware,createTransaction) 


router.post("/system/intial-funds",authSystemUserMiddleware,createInitialFundsTransaction)




module.exports=router;