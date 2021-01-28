'use strict'
const
    mysql = require('mysql'),
    config = require('../../config'),
    db = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        charset : 'utf8mb4',
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

    static query(sql,res){
        console.log("=========================================================================================================");
        console.log(sql);
        return new Promise((resolve,reject)=>{ 
            db.query(sql, function (err, result) {
                if (err) {    
                    res.status(500).send({error_message:"Something went wrong"});
                    reject({});
                }
                const _res = JSON.parse(JSON.stringify(result)); 
                resolve(_res);
            });
        })
    }
}
