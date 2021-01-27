'use strict' 

const 
    express = require('express') ,
    router = express.Router() ,
    middlewareMain = require('../MiddlewarePackage/middleware-main'),
    DBMain = require('../DatabasePakage/db-main'),
    { Validator } = require('node-input-validator'), 
    config = require('../../config'),
    { v4: uuidv4 } = require('uuid'), 
    CryptoUtil = require('../UtilsPackage/crypt.util'),
    HttpUtil = require('../UtilsPackage/http-util'),
    SqlString = require('sqlstring');

//ALL HAST TOKEN================================================ 

router.get('/get-project-version',async (req,res)=>{  
    try{    
        var sql = SqlString.format(`select project.project_id , project_version.current_version as current_version from Project as project left join Project_version as project_version on project_version.version_id = project.version_id where project.project_id = ?;`,[req.projectData.project_id]);
        var _res = await DBMain.query(sql,res);
        res.send(_res[0]); 
    }catch(err){ 
        res.status(500).send({error_message:"Something went wrong"});
    }
});  

 
module.exports = router;