'use strict'
const
    mysql = require('mysql'),
    config = require('../../config'),
    db = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    })

db.connect(function (err) {
    if (err) {
        console.log(err.message);
    }
    console.log("DATABASE CONNECTED!");
});
module.exports = class DBMain{
    constructor(){

    }

    static query(sql){
        console.log(sql);
        return new Promise((resolve,reject)=>{ 
            db.query(sql, function (err, result) {
                if (err) { 
                    console.log(err);
                    reject(err);
                }
                resolve(result);
            });
        })
    }
}