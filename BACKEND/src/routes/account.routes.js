const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware")
const {createAccount, getAccounts}=require("../controllers/account.controller")




/* 
*- POST request to api/account
*- CREATE A NEW ACCOUNT
*- PROTECTED ROUTE 
*/
router.post("/createAccount",authMiddleware,createAccount)
router.post("/getAccounts",authMiddleware,getAccounts)


module.exports = router;