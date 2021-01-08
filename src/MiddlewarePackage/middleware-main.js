'use strict'
const 
    jwt = require('jsonwebtoken'),
    config = require('../../config'),
    SqlString = require('sqlstring'),
    DBMain = require('../DatabasePakage/db-main') 

module.exports = {
//   isLoggedIn: (req, res, next) => {
//     try{
//       //console.log(req.headers);
//       const token = req.headers.authorization.split(' ')[1];
//       //console.log("token: " + token);
//       const decoded = jwt.verify(
//         token,
//         'retailgate'
//       );
//       //console.log("decoded:" + decoded);
//       req.userData = decoded; 
//       next();
//     } catch (err) {
//       //console.log(err)
//       return res.status(401).send({"token": null});
//     }
//   },
  
    onLogin:(user_id)=>{
        return new Promise(async (resolve)=>{
            try{ 
                var sql = SqlString.format(`select user_id,role from chatbot_builder_v2.User_Tbl where user_id = ?  `,[user_id])
                var _res = await DBMain.query(sql);
                const data = _res[0];
                console.log();
                console.log( config.jwt_key);
                const token = jwt.sign(data, config.jwt_key, { expiresIn: '24h'}); 
                console.log(token);
                resolve(token);
            }catch(err){
                console.log(err);
                throw new Error(err);
            }
        });
    }, 
    onLogout:(token)=>{
        jwtr.destroy(token);
    }, 
    isUserValid: (req, res, next) => {
        try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
            token,
            config.jwt_key
        );
        console.log(decoded);
        req.userData = decoded;
        next();
        } catch (err) { 
            console.log(err);
            return res.status(401).send({error_message:"Unauthorized"});
        }
    } ,
    isAdminValid: (req, res, next) => {
        try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
            token,
            config.jwt_key
        );
        console.log(decoded);
        req.adminData = decoded;
        next();
        } catch (err) { 
            console.log(err);
            return res.status(401).send({error_message:"Unauthorized"});
        }
    } 
};
