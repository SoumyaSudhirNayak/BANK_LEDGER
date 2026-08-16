const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware")
const {createAccount, getAccounts, getAccountBalance}=require("../controllers/account.controller")




/* 
*- POST request to api/account
*- CREATE A NEW ACCOUNT
*- PROTECTED ROUTE 
*/
router.post("/createAccount",authMiddleware,createAccount)


/* 
*- GET request to api/account
*- GET ALL ACCOUNTS
*- PROTECTED ROUTE 
*/
router.get("/getAccounts",authMiddleware,getAccounts)


/* Get Account Balance*/

router.get("/getAccountBalance/:accountId",authMiddleware,getAccountBalance)



module.exports = router;