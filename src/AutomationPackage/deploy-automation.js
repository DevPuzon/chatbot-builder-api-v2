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

// Deploy
router.post('/deploy', async (req, res) => { 
    try{ 
        var block_name;
        var type;
        var message; 

        if(req.body.blocks.length){  
            var sql  = `DELETE FROM chatbot_res_dep WHERE project_id = '${req.projectData.project_id}';` ; 
            sql = sql+ "INSERT INTO chatbot_res_dep(chatbot_res_id, project_id, block_index, block_name, mini_block_index, mini_block_type, mini_block_message) VALUES";
            for(let block_index in req.body.blocks){
                block_name = req.body.blocks[block_index].block_name;
                for(let miniblock_index in req.body.blocks[block_index].mini_blocks){
                    type = req.body.blocks[block_index].mini_blocks[miniblock_index].type;
                    message = JSON.stringify(req.body.blocks[block_index].mini_blocks[miniblock_index].message); 
                    sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + block_index + "," + SqlString.escape(block_name) + "," + miniblock_index + ",'" + type + "'," + SqlString.escape(message) + "),";
                }
            }
            sql = sql.slice(0, sql.length - 1);
            await DBMain.query(sql,res);  
        if(req.body.word_matches.length){
            var sql = `DELETE FROM word_matching_dep WHERE project_id = '${req.projectData.project_id }';`; 
            sql = sql + "INSERT INTO word_matching_dep(wmID, project_id, wm_index, user_possible_words, command_index, command_type, text_message, block_property_index, block_property_element) VALUES";
            var upw;
            var type2;
            var text_message;
            var block_property_element;
            for(let wm_index in req.body.word_matches){  
                upw = JSON.stringify({"upw_array": req.body.word_matches[wm_index].user_possible_words}); 
                if(req.body.word_matches[wm_index].commands.length > 0){
                    for(let command_index in req.body.word_matches[wm_index].commands){
                        if(req.body.word_matches[wm_index].commands[command_index].command_type){
                            type2 = req.body.word_matches[wm_index].commands[command_index].command_type;
                            if(type2 === "text_message"){
                                text_message = req.body.word_matches[wm_index].commands[command_index].text_message;
                                sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + "," + SqlString.escape(upw) + "," + command_index + ",'" + type2 + "','" + text_message + "', null, null),"
                            }

                            for(let block_property_index in req.body.word_matches[wm_index].commands[command_index].block_properties){
                                block_property_element = JSON.stringify(req.body.word_matches[wm_index].commands[command_index].block_properties[block_property_index]);
                                sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + "," + SqlString.escape(upw) + "," + command_index + ",'" + type2 + "', null," + block_property_index + "," + SqlString.escape(block_property_element) + "),";
                            }
                        }else{  
                            sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + "," + SqlString.escape(upw) + "," + command_index + ", null, null, null, null),";
                        }
                    }
                }else{
                    sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + "," + SqlString.escape(upw) + ", 0, null, null, null, null),"
                }
            } 
            sql = sql.slice(0, sql.length - 1); 
            await DBMain.query(sql,res);
                
            var sqlSel = "SELECT * FROM Project_version_dep WHERE version_id_dep = '" + req.projectData.version_id + "'"; 
            var results = await DBMain.query(sqlSel,res); 
            var sqlPutVer;
            var queryPutVer;
            if(results.length){
                var new_ver = parseInt(results[0].current_version) + 1;
                sqlPutVer = "UPDATE Project_version_dep SET current_version = '" + new_ver + "' WHERE version_id_dep = '" + req.projectData.version_id + "'"; 
                res.status(200).send({"success": true, "current_version": "" + new_ver});
            } else{
                sqlPutVer = "INSERT INTO Project_version_dep(version_id_dep, current_version) VALUES('" + req.projectData.version_id + "','0')";
                res.status(200).send({"success": true, "current_version": "0"});
            } 
            await DBMain.query(sqlPutVer,res); 
        } else{ 
            var sqlSel = "SELECT * FROM Project_version_dep WHERE version_id_dep = '" + req.projectData.version_id + "'"; 
            var results = await DBMain.query(sqlSel,res);
            
            var sqlPutVer;
            var queryPutVer;
            if(results.length){
                var new_ver = parseInt(results[0].current_version) + 1;
                sqlPutVer = "UPDATE Project_version_dep SET current_version = '" + new_ver + "' WHERE version_id_dep = '" + req.projectData.version_id + "'"; 
                res.status(200).send({"success": true, "current_version": "" + new_ver});
            } else{
                sqlPutVer = "INSERT INTO Project_version_dep(version_id_dep, current_version) VALUES('" + req.projectData.version_id + "','0')";
                res.status(200).send({"success": true, "current_version": "0"});
            }
            await DBMain.query(sqlPutVer,res);
        } 
        } else{
        res.status(200).send({"success": true});
        }
    } catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }  
});

module.exports = router;