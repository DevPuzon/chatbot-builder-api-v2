'use strict'
require("dotenv").config();

module.exports = {
    port:process.env.PORT,
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    cryptojs_key: process.env.CRYPTOJS_KEY,
    app_key:process.env.APP_KEY,
    jwt_key:process.env.JWT_KEY,
};