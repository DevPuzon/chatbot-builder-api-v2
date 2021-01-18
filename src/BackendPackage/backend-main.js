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

async function insertHistory(sender_pid, fb_page_id, api_call, parameters, type) {
  var date = new Date();
  var hr;
  var min;
  var sec;
  date.setHours(date.getHours() ); //+ 8);
  if (date.getHours() < 10)
    hr = "0" + date.getHours();
  else
    hr = date.getHours();

  if (date.getMinutes() < 10)
    min = "0" + date.getMinutes();
  else
    min = date.getMinutes();

  if (date.getSeconds() < 10)
    sec = "0" + date.getSeconds();
  else
    sec = date.getSeconds();
  var regTime = date.toISOString().slice(0, 11).replace('T', ' ') + hr + ":" + min + ":" + sec;
  console.log(regTime)

  var sqlHis = "INSERT INTO History(sender_pid, fb_page_id, api_call, parameters, type, datetime) VALUES('" + sender_pid + "','" + fb_page_id + "','" + api_call + "','" + parameters + "','" + type + "','" + regTime + "')"
  var sqlHisQuery = await DBMain.query(sqlHis);//db.query(sqlHis, (err, results) => {
  //if(err){
  //  console.log(err);
      //res.status(400).send({"error_message": err});
  //}
    //res.send({"success": true});
  return null;
  //})
};

router.get('/getblock/:fb_page_id/:sender_pid', async (req, res) => {
  try{

    var sql = SqlString.format(`SELECT project_id FROM Project WHERE fb_page_id = ?`, [req.params.fb_page_id]);
    var result = await DBMain.query(sql);

    var sqlBlocks = SqlString.format(`SELECT * FROM chatbot_res WHERE project_id = ? AND block_name = ? ORDER BY mini_block_index ASC`, [result[0].project_id, req.body.block_name]);
    var resultBlocks = await DBMain.query(sqlBlocks);

    var message;

    if(resultBlocks.length){
      var mini_blocks = [];
      for(let mini_block_index in result){
        message = resultBlocks[mini_block_index].mini_block_message;
        message = message.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        mini_blocks.push({"type": result[mini_block_index].mini_block_type, "message":JSON.parse(message)});
      }
      //Save record to history
      var type = "default"
      var parameter = JSON.stringify({"block": mini_blocks});
      insertHistory(req.params.sender_pid, req.params.fb_page_id, "getblock", parameter, type).then((value) => {
        res.send({"response": mini_blocks})
      });

      //res.send({"response": mini_blocks});
    } else{
      res.send({"response": null});
    }
  } catch(err){
      console.log(err);
      res.status(500).send({"error_message":err});
  }

});

module.exports = router;