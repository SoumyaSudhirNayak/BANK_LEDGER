const express = require('express')
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json())
app.use(cookieParser())

/* ROUTES */
const authRoutes = require("./routes/auth.routes")
const accountRoutes = require("./routes/account.routes")

/* USE-ROUTES */
app.use("/api/auth", authRoutes)
app.use("/api/account", accountRoutes)
module.exports = app;
