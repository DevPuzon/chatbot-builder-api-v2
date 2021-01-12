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

router.get('/list',middlewareMain.isUserValid,async (req,res)=>{  
    try{ 
        var sql =SqlString.format(`SELECT fbpage.fb_page_id,fbpage.name,fbpage.page_img,fbpage.user_id,fbpage.is_problem_connection, fbpage.updated_at,project.project_id,project.name as project_name FROM chatbot_builder_v2.FB_Page as fbpage left join Project as project on project.fb_page_id = fbpage.fb_page_id where fbpage.user_id = ? order by fbpage.updated_at desc;`,[req.userData.user_id]);
        var _res = await DBMain.query(sql);
        res.send(_res); 
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
}); 

router.post('/set-fb-token',middlewareMain.isUserValid,async (req,res)=>{
    try{
        const b = req.body;
        console.log(b);
        
        var sql = SqlString.format(`delete  from chatbot_builder_v2.FB_Page where user_id = ?;`, [req.userData.user_id ]);
        for(let i = 0 ; i < b.length ;i ++){
        let d = b[i];
        Object.assign(d,{
            user_id:req.userData.user_id
        })
        sql = sql + SqlString.format(`INSERT INTO chatbot_builder_v2.FB_Page SET ?;`, [d]); 
        }
        await DBMain.query(sql);

        res.send({success:true});
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
});
module.exports = router;