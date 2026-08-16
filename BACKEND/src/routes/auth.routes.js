const express = require("express");
const { registerUser, loginUser, userLogout } = require("../controllers/auth.controller");


const router = express.Router();
/* /POST /api/auth/register */
router.post("/register", registerUser);

/* /POST /api/auth/login */
router.post("/login", loginUser);

/**
 * - POST /api/auth/logout
 */
router.post("/logout", userLogout)




module.exports = router;
