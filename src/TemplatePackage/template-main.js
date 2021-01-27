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
router.post('/',middlewareMain.onCheckProject,async (req,res)=>{
    try{ 
        const b =req.body;
        Object.assign(b,{
            template_id:uuidv4()
        })
        var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.Template set ?`,[b]);
        await DBMain.query(sql,res);

        var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
        project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
        fbpage.fb_page_id left join Template as template on template.project_id = project.project_id 
        where project.project_id = ? ;`,[req.projectData.project_id]);
        var _res = await DBMain.query(sql,res);  
        res.send(_res[0]);

    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})

router.put('/',middlewareMain.onCheckProject,async (req,res)=>{
    try{ 
        const b =req.body;
        const q =req.query;
        var sql = SqlString.format(`Update chatbot_builder_v2.Template set ? where template_id = ? and  project_id = ?`,[b,q.template_id,q.project_id]);
        await DBMain.query(sql,res);
        
        var sql = SqlString.format(`SELECT template.template_id, project.project_id,project.user_id,project.name,project.fb_page_id,project.proj_img,
        project.updated_at,fbpage.name as fbpage_name,fbpage.fb_page_id as fbpage_id,fbpage.page_img as fbpage_img FROM Project as project left join FB_Page as fbpage on project.fb_page_id =
        fbpage.fb_page_id left join Template as template on template.project_id = project.project_id 
        where project.project_id = ? ;`,[req.projectData.project_id]);
        var _res = await DBMain.query(sql,res); 

        res.send(_res[0]);
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})
        
router.get('/',middlewareMain.onCheckProject,async (req,res)=>{
    try{  
        const q =req.query;
        var sql = SqlString.format(`select * from Template where template_id = ? ;`,[q.template_id]);
        var _res = await DBMain.query(sql,res);
        res.send(_res[0]);
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})
   
// router.get('/list-all',async (req,res)=>{
//     try{  
//         const limit = 50;
//         const q =req.query;
//         var data ;
//         if(!q.page){ 
//             var sql = SqlString.format(`select * from Template where is_public = 1 order by updated_at desc limit ${limit} ;` );
//             var _res = await DBMain.query(sql,res);
//             console.log(_res);
//             data ={
//                 data :_res, 
//                 nextPage:"template/list-all?page=1"
//             }
//         }else{
//             var sql = SqlString.format(`select * from Template where is_public = 1  order by updated_at desc limit ${limit} offset ${q.page*limit} ;`);
//             var _res = await DBMain.query(sql,res);
//             console.log(parseInt(q.page)-1  == -1? 0: parseInt(q.page)-1); 
//             data ={
//                 data :_res,
//                 prevPage:"template/list-all?page="+(parseInt(q.page)-1  == -1? 0: parseInt(q.page)-1),
//                 nextPage:(limit == _res.length ? "template/list-all?page="+(parseInt(q.page)+1):'') 
//             }
//         }
//         res.send(data); 
//     }catch(err){
//         console.log(err)
//         res.status(500).send({error_message:"Something went wrong"});
//     }
// })
 

router.get('/list',async (req,res)=>{
    try{  
        const limit = 50;
        const q = req.query;
        var data ;
        if(q.sort_type == 'all'){
            if(!q.page){ 
                var sql = SqlString.format(`select template.created_by, template.template_id,template.name,template.project_id,template.is_public,template.type,
                template.temp_img,template.description,fbpage.fb_page_id from Template as template
                left join Project as project on project.project_id = template.project_id 
                 left join FB_Page as fbpage on fbpage.fb_page_id = project.fb_page_id
                  where template.is_public = 1 order by template.updated_at desc limit ${limit} ;` );
                var _res = await DBMain.query(sql,res);
                console.log(_res);
                data ={
                    data :_res, 
                    nextPage:`template/list?page=1&sort_type=${q.sort_type}`
                }
            }else{
                var sql = SqlString.format(`select template.created_by, template.template_id,template.name,template.project_id,template.is_public,template.type,
                template.temp_img,template.description,fbpage.fb_page_id from Template as template
                left join Project as project on project.project_id = template.project_id 
                 left join FB_Page as fbpage on fbpage.fb_page_id = project.fb_page_id
                  where template.is_public = 1  order by template.updated_at desc limit ${limit} offset ${q.page*limit} ;`);
                var _res = await DBMain.query(sql,res); 
                data ={
                    data :_res,
                    prevPage:`template/list?page=${(parseInt(q.page)-1  == -1? 0: parseInt(q.page)-1)}&sort_type=${q.sort_type}`,
                    nextPage:(limit == _res.length ? `template/list?page=${(parseInt(q.page)+1)}&sort_type=${q.sort_type}`:'') 
                }
            }
        res.send(data); 
        }else{
            if(!q.page){ 
                var sql = SqlString.format(`select template.created_by, template.template_id,template.name,template.project_id,template.is_public,template.type,
                template.temp_img,template.description,fbpage.fb_page_id from Template as template
                left join Project as project on project.project_id = template.project_id 
                 left join FB_Page as fbpage on fbpage.fb_page_id = project.fb_page_id
                  where template.is_public = 1 and template.type  = ? order by template.updated_at desc limit ${limit} ;`,[q.sort_type] );
                var _res = await DBMain.query(sql,res);
                console.log(_res);
                data ={
                    data :_res, 
                    nextPage:`template/list?page=1&sort_type=${q.sort_type}`
                }
            }else{
                var sql = SqlString.format(`select  template.created_by, template.template_id,template.name,template.project_id,template.is_public,template.type,
                template.temp_img,template.description,fbpage.fb_page_id from Template as template
                left join Project as project on project.project_id = template.project_id 
                 left join FB_Page as fbpage on fbpage.fb_page_id = project.fb_page_id
                  where template.is_public = 1  and template.type  = ? order by template.updated_at desc limit ${limit} offset ${q.page*limit} ;`,[q.sort_type] );
                var _res = await DBMain.query(sql,res); 
                data ={
                    data :_res,
                    prevPage:`template/list?page=${(parseInt(q.page)-1  == -1? 0: parseInt(q.page)-1)}&sort_type=${q.sort_type}`,
                    nextPage:(limit == _res.length ? `template/list?page=${(parseInt(q.page)+1)}&sort_type=${q.sort_type}`:'') 
                }
            }
            res.send(data); 
        }
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
})
 

router.post('/use',async (req,res)=>{
    try{
        const q = req.query;  
        let  b ={ 
            project_id:uuidv4(),
            version_id:uuidv4(),
            version_id_dep:uuidv4(),
            user_id:req.userData.user_id,
            name: q.template_name
        }
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
        
        sql =  sql+ SqlString.format(` 
        INSERT INTO chatbot_res (chatbot_res_id, block_index,block_name,mini_block_index,mini_block_type,mini_block_message,project_id)
        SELECT UUID(),block_index,block_name,mini_block_index,mini_block_type,mini_block_message,concat(?)
        FROM chatbot_res WHERE project_id =?;`,[b.project_id,q.project_id] ); 
        sql =  sql+ SqlString.format(` 
        INSERT INTO word_matching (wmID,wm_index,user_possible_words,command_index,command_type,text_message,block_property_index,block_property_element,project_id)
        SELECT UUID(),wm_index,user_possible_words,command_index,command_type,text_message,block_property_index,block_property_element,concat(?)
        FROM word_matching WHERE project_id =?;`,[b.project_id,q.project_id] ); 
        await DBMain.query(sql,res);
        res.send(b);
    }catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }
});
module.exports = router;