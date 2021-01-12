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
 
 
router.get('/list',async (req,res)=>{
    try{ 
        const limit = 50;
        var data ;
        if(!req.query.page){ 
            var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
            project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
            fbpage.fb_page_id left join Template as template on template.project_id = project.project_id  where project.user_id =?  order by updated_at desc limit ${limit} ;`,[req.userData.user_id]);
            var _res = await DBMain.query(sql);
            console.log(_res);
            data ={
                data :_res, 
                nextPage:"project/list?page=1"
            }
        }else{
            var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
            project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
            fbpage.fb_page_id left join Template as template on template.project_id = project.project_id  where project.user_id =? order by updated_at desc limit ${limit} offset ${req.query.page*limit} ;`,[req.userData.user_id]);
            var _res = await DBMain.query(sql);
            console.log(parseInt(req.query.page)-1  == -1? 0: parseInt(req.query.page)-1); 
            data ={
                data :_res,
                prevPage:"project/list?page="+(parseInt(req.query.page)-1  == -1? 0: parseInt(req.query.page)-1),
                nextPage:(limit == _res.length ? "project/list?page="+(parseInt(req.query.page)+1):'') 
            }
        }
        res.send(data); 
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
});


router.get('/item-list',middlewareMain.onCheckProject,async (req,res)=>{ 
    try{  
        var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
        project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
        fbpage.fb_page_id left join Template as template on template.project_id = project.project_id 
        where project.project_id = ? ;`,[req.projectData.project_id]);
        var _res = await DBMain.query(sql); 
        res.send(_res[0]); 
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    } 
});

router.post('/create', async (req,res)=>{
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

router.put('/connect-fbpage',middlewareMain.onCheckProject,async (req,res)=>{
    try{
        const b = req.body;
        var sql = SqlString.format(`UPDATE chatbot_builder_v2.Project SET fb_page_id = ? WHERE project_id = ? and user_id = ?;`,[b.fb_page_id,req.projectData.project_id,req.userData.user_id])
        await DBMain.query(sql);
        
        var sql =SqlString.format(`SELECT fbpage.fb_page_id,fbpage.name,fbpage.page_img,fbpage.user_id,fbpage.is_problem_connection, fbpage.updated_at,project.project_id,project.name as project_name FROM chatbot_builder_v2.FB_Page as fbpage left join Project as project on project.fb_page_id = fbpage.fb_page_id where fbpage.user_id = ? order by fbpage.updated_at desc;`,[req.userData.user_id]);
        var fbpages = await DBMain.query(sql);
        var sql =SqlString.format(`SELECT project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
            project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
            fbpage.fb_page_id where  project.project_id = ? and project.user_id = ?;`,[req.projectData.project_id,req.userData.user_id])
        var fbpage_updated = await DBMain.query(sql);
        console.log(fbpage_updated);
        res.send({
            fbpages:fbpages,
            fbpage_updated:fbpage_updated[0]
        });  
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
});

module.exports = router;