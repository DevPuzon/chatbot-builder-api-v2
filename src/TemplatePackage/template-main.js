'use strict'

const middlewareMain = require('../MiddlewarePackage/middleware-main');

const 
    express = require('express') ,
    router = express.Router() ,
    DBMain = require('../DatabasePakage/db-main'),
    { Validator } = require('node-input-validator'), 
    config = require('../../config'),
    { v4: uuidv4 } = require('uuid'), 
    CryptoUtil = require('../UtilsPackage/crypt.util'),
    HttpUtil = require('../UtilsPackage/http-util'),
    SqlString = require('sqlstring');

//ALL HAST TOKEN================================================
router.post('/export',middlewareMain.onCheckProject,async (req,res)=>{
    try{ 
        const b =req.body;
        Object.assign(b,{
            template_id:uuidv4()
        })
        var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.Template set ?`,[b]);
        await DBMain.query(sql);
        res.send({success:true});
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})

router.put('/export',middlewareMain.onCheckProject,async (req,res)=>{
    try{ 
        const b =req.body;
        const q =req.query;
        var sql = SqlString.format(`Update chatbot_builder_v2.Template set ? where template_id = ?`,[b,q.template_id]);
        await DBMain.query(sql);
        res.send({success:true});
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})
module.exports = router;