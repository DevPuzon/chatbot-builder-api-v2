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
        var sqlDel  = `DELETE FROM chatbot_res WHERE project_id = '${req.projectData.project_id}';` ;
    //   var queryDel = db.query(sqlDel, (errDel, resultsDel) => {
    //   }); //end of queryDel 
        await DBMain.query(sqlDel);
        var sql = "INSERT INTO chatbot_res(chatbot_res_id, project_id, block_index, block_name, mini_block_index, mini_block_type, mini_block_message) VALUES";
        for(let block_index in req.body.blocks){
            block_name = req.body.blocks[block_index].block_name;
            for(let miniblock_index in req.body.blocks[block_index].mini_blocks){
                type = req.body.blocks[block_index].mini_blocks[miniblock_index].type;
                message = JSON.stringify(req.body.blocks[block_index].mini_blocks[miniblock_index].message); 
                sql += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + block_index + ",'" + block_name + "'," + miniblock_index + ",'" + type + "','" + message + "'),";
            }
        }
        sql = sql.slice(0, sql.length - 1);
        await DBMain.query(sql);
        // var query = db.query(sql, (err, results) => {
        // }); // end of sql
        
        if(req.body.word_matches.length){
            var sqlDel2 = `DELETE FROM word_matching WHERE project_id = '${req.projectData.project_id }';`;
            // var queryDel2 = db.query(sqlDel2, (errDel2, resultsDel2) => {
            // }); //end of queryDel2
            await DBMain.query(sqlDel2); 
            var sql2 = "INSERT INTO word_matching(wmID, project_id, wm_index, user_possible_words, command_index, command_type, text_message, block_property_index, block_property_element) VALUES";
            var upw;
            var type2;
            var text_message;
            var block_property_element;
            for(let wm_index in req.body.word_matches){
                console.log('for(let wm_index in req.body.word_matches){');
                //if(req.body.word_matches[wm_index].commands.length > 0){
                upw = JSON.stringify({"upw_array": req.body.word_matches[wm_index].user_possible_words});
                console.log(upw);
                if(req.body.word_matches[wm_index].commands.length > 0){
                    for(let command_index in req.body.word_matches[wm_index].commands){
                        if(req.body.word_matches[wm_index].commands[command_index].command_type){
                            type2 = req.body.word_matches[wm_index].commands[command_index].command_type;
                            if(type2 === "text_message"){
                                text_message = req.body.word_matches[wm_index].commands[command_index].text_message;
                                sql2 += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + ",'" + upw + "'," + command_index + ",'" + type2 + "','" + text_message + "', null, null),"
                            }

                            for(let block_property_index in req.body.word_matches[wm_index].commands[command_index].block_properties){
                                block_property_element = JSON.stringify(req.body.word_matches[wm_index].commands[command_index].block_properties[block_property_index]);
                                sql2 += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + ",'" + upw + "'," + command_index + ",'" + type2 + "', null," + block_property_index + ",'" + block_property_element + "'),";
                            }
                        }else{ //empty command
                            sql2 += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + ",'" + upw + "'," + command_index + ", null, null, null, null),";
                        }
                    }
                }else{
                    sql2 += "('" + uuidv4() + "','" + req.projectData.project_id + "'," + wm_index + ",'" + upw + "', 0, null, null, null, null),"
                }
            }
            console.log(sql2);
            sql2 = sql2.slice(0, sql2.length - 1);
            //console.log(sql2);
            // var query2 = db.query(sql2, (err2, results2) => {
            // }); //end of query2
            await DBMain.query(sql2);
                
            var sqlSel = "SELECT * FROM Project_version WHERE version_id = '" + req.projectData.version_id + "'";
            // var querySel = db.query(sqlSel, (err, results) => {
            // }); 
            var results = await DBMain.query(sqlSel); 
            var sqlPutVer;
            var queryPutVer;
            if(results.length){
                var new_ver = parseInt(results[0].current_version) + 1;
                sqlPutVer = "UPDATE Project_version SET current_version = '" + new_ver + "' WHERE version_id = '" + req.projectData.version_id + "'";
                // queryPutVer = db.query(sqlPutVer, (errPutVer, resultsPutVer) => {
                //     if(errPutVer) throw errPutVer;
                // });
                res.status(200).send({"success": true, "current_version": "" + new_ver});
            } else{
                sqlPutVer = "INSERT INTO Project_version(version_id, current_version) VALUES('" + req.projectData.version_id + "','0')"
                // queryPutVer = db.query(sqlPutVer, (errPutVer, resultsPutVer) => {
                //     if(errPutVer) throw errPutVer;
                //     res.status(200).send({"success": true, "current_version": "0"});
                // }); 
                res.status(200).send({"success": true, "current_version": "0"});
            } 
            await DBMain.query(sqlPutVer); 
        } else{ 
            var sqlSel = "SELECT * FROM Project_version WHERE version_id = '" + req.projectData.version_id + "'";
            // var querySel = db.query(sqlSel, (err, results) => {
            // }); 
            var results = await DBMain.query(sqlSel);
            
            var sqlPutVer;
            var queryPutVer;
            if(results.length){
                var new_ver = parseInt(results[0].current_version) + 1;
                sqlPutVer = "UPDATE Project_version SET current_version = '" + new_ver + "' WHERE version_id = '" + req.projectData.version_id + "'";
                // queryPutVer = db.query(sqlPutVer, (errPutVer, resultsPutVer) => {
                // if(errPutVer) throw errPutVer;
                // }); 
                res.status(200).send({"success": true, "current_version": "" + new_ver});
            } else{
                sqlPutVer = "INSERT INTO Project_version(version_id, current_version) VALUES('" + req.projectData.version_id + "','0')"
                // queryPutVer = db.query(sqlPutVer, (errPutVer, resultsPutVer) => {
                // if(errPutVer) throw errPutVer;
                // res.status(200).send({"success": true, "current_version": "0"});
                // });
                res.status(200).send({"success": true, "current_version": "0"});
            }
            await DBMain.query(sqlPutVer);
        } 
        } else{
        res.status(200).send({"success": true});
        }
    } catch(err){
        console.log(err)
        res.status(500).send({error_message:"Something went wrong"});
    }  
});
router.get('/getallblocks',async (req,res)=>{ 
    try{
        var blocks = [];
        var wordmatches = [];
        var sql = "SELECT * FROM chatbot_res WHERE project_id = '" + req.projectData.project_id + "' ORDER BY block_index, mini_block_index ASC"; 
        var results = await DBMain.query(sql); 
        var message;
        if(results.length){ 
            for(let row in results){
                if(results[row].block_index in blocks){ 
                    message = results[row].mini_block_message;
                    message = message.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); 
                    blocks[results[row].block_index].mini_blocks.push({"type": results[row].mini_block_type, "message": JSON.parse(message)}); 
                }
                else{ 
                    message = results[row].mini_block_message;
                    message = message.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); 
                    blocks.push({"block_name": results[row].block_name, "mini_blocks": [{"type": results[row].mini_block_type, "message": JSON.parse(message)}]}); 
                }
            } 
        } 
        
        var sql = "SELECT * FROM word_matching WHERE project_id = '" + req.projectData.project_id + "' ORDER BY wm_index, command_index, block_property_index"
        var user_possible_words; 
        var commands = [];
        var block_properties = [];
        var results = await DBMain.query(sql);
         
        if(results.length){ 
            for(let count in results){ 
                if(results[count].wm_index in wordmatches){ 
                    if(results[count].command_type == null){  
                        // wordmatches[results[count].wm_index].commands.push({});
                    }
                    else{
                        if(results[count].command_type === "block"){
                            if(results[count].command_index in wordmatches[results[count].wm_index].commands){
                                wordmatches[results[count].wm_index].commands[results[count].command_index].block_properties.push(JSON.parse(results[count].block_property_element));
                            }
                            else{
                                block_properties.push(JSON.parse(results[count].block_property_element));
                                wordmatches[results[count].wm_index].commands.push({"block_properties": block_properties, "command_type": "block"});
                            }
                        }
                        else if(results[count].command_type === "text_message"){
                           wordmatches[results[count].wm_index].commands.push({"command_type": "text_message", "text_message": results[count].text_message});
                        }
                    }
                } else{
                    user_possible_words = JSON.parse(results[count].user_possible_words).upw_array;
                    if(results[count].command_type != null){
                        if(results[count].command_type === "block"){
                        block_properties.push(JSON.parse(results[count].block_property_element));
                        commands.push({"block_properties": block_properties, "command_type": "block"});
                        }
                        else if(results[count].command_type === "text_message"){
                        commands.push({"command_type": "text_message", "text_message": results[count].text_message})
                        }
                        wordmatches.push({"user_possible_words":user_possible_words, "commands":commands});
                    }else{
                        // commands.push({});
                        wordmatches.push({"user_possible_words":user_possible_words, "commands":commands});
                    }
                }

                block_properties = []
                commands = []
            }
        }
        
        res.status(200).send({"wordmatches": wordmatches,"blocks":blocks});
    } catch(err){
        console.log(err);
        res.status(500).send({error_message:"Something went wrong"});
    }
})
module.exports = router;