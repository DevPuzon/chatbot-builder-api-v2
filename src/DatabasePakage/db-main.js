'use strict'
const
    mysql = require('mysql'),
    config = require('../../config'),
    db = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        multipleStatements: true
    })
    
db.connect(function (err) {
    if (err) {
        console.log(err.message);
    }else{
        console.log("DATABASE CONNECTED!");
    }
});
module.exports = class DBMain{
    constructor(){

    }

    static query(sql){
        console.log(sql);
        return new Promise((resolve,reject)=>{ 
            db.query(sql, function (err, result) {
                if (err) {  
                    setTimeout(() => {
                      process.exit(0)
                    }, 1000).unref()  
                    throw new Error(err);
                }
                const _res = JSON.parse(JSON.stringify(result)); 
                resolve(_res);
            });
        })
    }
}
