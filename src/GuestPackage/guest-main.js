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
 
 
router.post('/create-user',async(req,res)=>{
    console.log('create user ');
    try{  
        const dta_user = {
            user_id:uuidv4(),
            email:uuidv4().substring(0,12)+"@x.com",
            password:"no-password==="+uuidv4(),
            user_img:'https://img.icons8.com/ios/50/000000/user-male-circle.png',
            provider:'guest',
            role:'user',
        }
        var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.User_Tbl SET ?; `,[dta_user]);
        
        const  dta_project ={ 
            project_id:uuidv4(),
            version_id:uuidv4(),
            version_id_dep:uuidv4(),
            user_id:dta_user.user_id,
            name: 'Project #1' 
        }

        const ver_data ={
            version_id:dta_project.version_id,
            current_version:0
        }

        const ver_data_dep ={
            version_id_dep:dta_project.version_id_dep,
            current_version:0
        } 

        sql =  sql + SqlString.format(`INSERT INTO chatbot_builder_v2.Project_version SET ? ; `,[ver_data]);
        sql =  sql + SqlString.format(`INSERT INTO chatbot_builder_v2.Project_version_dep SET ? ; `,[ver_data_dep]);
        sql =  sql + SqlString.format(`INSERT INTO chatbot_builder_v2.Project SET ? ; `,[dta_project]);
        await DBMain.query(sql,res);
        const token = await middlewareMain.onLogin(dta_user.user_id,res);

        var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
        fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,
        user.user_img,
        group_concat(CONCAT(UCASE(LEFT(user.first_name, 1)), 
        LCASE(SUBSTRING(user.first_name, 2)))," ",CONCAT(UCASE(LEFT(user.last_name, 1)), 
        LCASE(SUBSTRING(user.last_name, 2)))) as user_fullname FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
        fbpage.fb_page_id left join Template as template on template.project_id = project.project_id 
        left join User_Tbl as user on user.user_id = project.user_id 
        where project.project_id = ?;`,[dta_project.project_id]);
        var _res = await DBMain.query(sql,res); 
        const projectdata = _res[0];
        res.send({projectdata:projectdata,token:token});
    }catch(err){
      console.log(err)
      res.status(500).send({error_message:"Something went wrong"});
    }
});

router.post("/use-template",middlewareMain.onCheckProject,async (req,res)=>{
    try{
        const q = req.query;
        var sql = SqlString.format(` 
        INSERT INTO chatbot_res (chatbot_res_id, block_index,block_name,mini_block_index,mini_block_type,mini_block_message,project_id)
        SELECT UUID(),block_index,block_name,mini_block_index,mini_block_type,mini_block_message,concat(?)
        FROM chatbot_res WHERE project_id =?;`,[q.project_id,q.from_project_id] ); 
        sql =  sql+ SqlString.format(` 
        INSERT INTO word_matching (wmID,wm_index,user_possible_words,command_index,command_type,text_message,block_property_index,block_property_element,project_id)
        SELECT UUID(),wm_index,user_possible_words,command_index,command_type,text_message,block_property_index,block_property_element,concat(?)
        FROM word_matching WHERE project_id =?;`,[q.project_id,q.from_project_id] ); 
        await DBMain.query(sql,res);
        res.send({success:true});
    }catch(ex){
        res.status(500).send({error_message:"Something went wrong"});
    }
});

module.exports = router;