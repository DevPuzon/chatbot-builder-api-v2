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
                const token = jwt.sign(data, config.jwt_key, { expiresIn: '15d'});  
                resolve(token);
            }catch(err){ 
                throw new Error(err);
            }   
        });
    }, 
    onCheckProject:async (req,res,next)=>{
        try{  
            const q = req.query; 
            var sql = SqlString.format(`select * from Project where project_id = ?`,[q.project_id])
            var _res = await DBMain.query(sql);
            if(_res.length == 0){
                return res.status(401).send({error_message:"Unauthorized"});
            }
            req.projectData = _res[0];
            next();
        } catch (err) {  
            return res.status(401).send({error_message:"Unauthorized"});
        }
    },
    onLogout:(token)=>{
        jwtr.destroy(token);
    }, 
    isUserValid: async(req, res, next) => {
        try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
            token,
            config.jwt_key
        ); 
        var sql = SqlString.format(`select * from User_Tbl where user_id = ? and role = ?`,[decoded.user_id,decoded.role])
        var _res = await DBMain.query(sql); 
        if(_res.length ==0){
            return res.status(401).send({error_message:"Unauthorized"});
        } 
        req.userData = _res[0];
        next();
        } catch (err) {  
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
        req.adminData = decoded;
        next();
        } catch (err) {  
            return res.status(401).send({error_message:"Unauthorized"});
        }
    } 
};
