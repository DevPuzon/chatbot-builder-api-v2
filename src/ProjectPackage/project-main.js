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
    const limit = 50;
    var data ;
    if(!req.query.page){ 
        var sql = SqlString.format(`SELECT project.project_id,project.user_id,project.name,project.fb_page_id,project.template_id,project.proj_img,
        project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.project_id =
        fbpage.fb_page_id where project.user_id =?  order by updated_at asc limit ${limit} ;`,[req.userData.user_id]);
        var _res = await DBMain.query(sql);
        console.log(_res);
        data ={
            data :_res, 
            nextPage:"project/list?page=1"
        }
    }else{
        var sql = SqlString.format(`SELECT project.project_id,project.user_id,project.name,project.fb_page_id,project.template_id,project.proj_img,
        project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.project_id =
        fbpage.fb_page_id where project.user_id =? order by updated_at asc limit ${limit} offset ${req.query.page*limit} ;`,[req.userData.user_id]);
        var _res = await DBMain.query(sql);
        console.log(parseInt(req.query.page)-1  == -1? 0: parseInt(req.query.page)-1); 
        data ={
            data :_res,
            prevPage:"project/list?page="+(parseInt(req.query.page)-1  == -1? 0: parseInt(req.query.page)-1),
            nextPage:(limit == _res.length ? "project/list?page="+(parseInt(req.query.page)+1):'') 
        }
    }
    res.send(data); 
});


router.post('/create',middlewareMain.isUserValid, async (req,res)=>{
    try{ 
        //create new project
        const b = req.body;
        var sql = SqlString.format(`SELECT * FROM chatbot_builder_v2.Project where user_id = ?`,[req.userData.user_id]);
        var _res = await DBMain.query(sql);
        console.log(_res.length);
        Object.assign(b,{
            project_id:uuidv4(),
            version_id:uuidv4(),
            version_id_dep:uuidv4(),
            user_id:req.userData.user_id,
            name: 'Project #'+(_res.length + 1)
        })
        const ver_data ={
            version_id:b.version_id,
            current_version:0
        }
        const ver_data_dep ={
            version_id_dep:b.version_id_dep,
            current_version:0
        } 
        var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.Project_version SET ? ; `,[ver_data])  
        sql =  sql+SqlString.format(`INSERT INTO chatbot_builder_v2.Project_version_dep SET ? ; `,[ver_data_dep]) 
        sql =  sql+ SqlString.format(`INSERT INTO chatbot_builder_v2.Project SET ? ; `,[b])
        await DBMain.query(sql);

        //success
        res.send(b);
    }catch(err){
      console.log(err)
      res.status(500).send({error_message:"Something went wrong"});
    }
});

module.exports = router;