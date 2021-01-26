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





// Send notification to admins

async function notifAdmin(pageID, mail_body, model){

  //console.log(model);
  var sqlMod = ""
  if(model != null){

  console.log(model.toUpperCase().replace(/ /g, ''));
  sqlMod = "SELECT adminID FROM models WHERE model_name = '" + model.toUpperCase().replace(/ /g, '') + "'";

  } else{

  sqlMod = "SELECT adminID FROM models WHERE model_name = '" + model + "'"

  }
  //var queryMod = db.query(sqlMod, (errMod, resultsMod) => {
  var resultsMod = DBMain.query(sqlMod);
  //console.log(resultsMod);
  var sql = ""
  if(resultsMod.length){
    sql = "SELECT email FROM admins WHERE pageID = '" + pageID + "' AND adminID = " + resultsMod[0].adminID;
  } else{
    sql = "SELECT email FROM admins WHERE authority = 'superior'";
  }

  //var query = db.query(sql, (err, results) => {
  var results = DBMain.query(sql);
    if(results.length){
      var emails = "";
      for(let index in results){
        emails += results[index].email + ",";
      }
      emails = emails.substring(0, emails.length - 1);
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'retailgate.chatmaster@gmail.com',
          pass: 'RTLchatmaster@2020'
        }
      });

      var mailOptions = {
        from: 'retailgate.chatmaster@gmail.com',
        to: emails, //'rienaldnesthy96@gmail.com',
        subject: 'Kawasaki Chatbot Inquiry',
        html: mail_body
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log('Recipients: ' + emails);
        }
      });
    } else{
      console.log("No admin found..");
    }
    return null;
  //}); //end of query


  //}); //end of queryMod
}





async function insertHistory(sender_pid, fb_page_id, api_call, parameters, type) {
  var date = new Date();
  var hr;
  var min;
  var sec;
  date.setHours(date.getHours() + 8);
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

        mini_blocks.push({"type": resultBlocks[mini_block_index].mini_block_type, "message":JSON.parse(message)});
      }
      //Save record to history
      var type = "default"
      var parameter = JSON.stringify({"block": mini_blocks});
      insertHistory(req.params.sender_pid, req.params.fb_page_id, "getblock", parameter, type).then((value) => {
        res.status(200).send({"response": mini_blocks})
      });

      //res.send({"response": mini_blocks});
    } else{
      res.status(200).send({"response": null});
    }
  } catch(err){
      console.log(err);
      res.status(500).send({"error_message":err});
  }

});

// Get Token by page ID
router.get('/get_token/:pageID', async (req, res) => {
  try{
    var sql = "SELECT fb_page_access_token FROM FB_Page WHERE fb_page_id = '" + req.params.pageID + "'";
    var results = await DBMain.query(sql);
    //var query = db.query(sql, (err, results) => {
      if(results.length){
        res.status(200).send({"page_access_token": results[0].fb_page_access_token});
      } else{
        res.status(400).send({"page_access_token": null});
      }
    //}); 
  } catch(err) {
    console.log(err);
    res.status(500).send({"error_message": err});
  }
});















// Get word matching (backend)
router.get('/getwordmatch/:fb_page_id/:sender_pid/:message', async (req, res) => {
  try{
  var rbBrands = ['ROUSER', 'DOMINAR', 'CT', 'BARAKO', 'FURY'];
  var rbModels = ['ROUSER200NSFI', 'ROUSERNS200FI', 'ROUSERNS160', 'ROUSERRS200ABS', 'DOMINAR400', 'CT100', 'CT125', 'CT150', 'BARAKO175', 'FURY125'] //['ROUSERNS125FI', 'ROUSERNS160', 'ROUSERNS200FI', 'ROUSERRS200ABS', 'DOMINAR400', 'CT100', 'CT125', 'CT150', 'BARAKOII', 'FURY125', 'ROUSERNS125', 'ROUSERRS200', 'DOMINAR', 'BARAKO175'];
  var lbBrands = [];
  var lbModels = ['NINJAZX-10RR'];
  var type;
  var modword = req.params.message.replace(/ /g, '')
  modword = modword.toUpperCase();
  //console.log(modword);
  if(rbModels.indexOf(modword) > -1){
    type = "model";
  } else if(lbModels.indexOf(modword) > -1){
    type = "model";
  } else if(rbBrands.indexOf(modword) > -1){
    type = "brand";
  } else if(lbBrands.indexOf(modword) > -1){
    type = "brand";
  } else{
    type = "default";
  }
  //console.log(type);
  var hisRet = await insertHistory(req.params.sender_pid, req.params.fb_page_id, "getwordmatch", JSON.stringify({"word": req.params.message}), type); //.then((value) => {


  var sqlProj = SqlString.format(`SELECT project_id FROM Project WHERE fb_page_id = ?`, [req.params.fb_page_id]);
  var resultProj = await DBMain.query(sqlProj);
  if(resultProj.length){
  var sql = "SELECT * FROM word_matching WHERE project_id = '" + resultProj[0].project_id + "' ORDER BY wm_index, command_index, block_property_index"
  //var result = await DBMain.query(sql);
  //var sql = "SELECT * FROM word_matching WHERE clientID = " + req.params.pageID + " ORDER BY wm_index, command_index, block_property_index"
  var user_possible_words;
  var wm_array = [];
  var commands = [];
  var block_properties = [];
  //var query = db.query(sql, (err, results) => {
  var results = await DBMain.query(sql);
    if(results.length){
      for(let count in results){
        if(results[count].wm_index in wm_array){
          if(results[count].command_type == null){

            wm_array[results[count].wm_index].commands.push({});
          }
          else{
            if(results[count].command_type === "block"){
              if(results[count].command_index in wm_array[results[count].wm_index].commands){
                wm_array[results[count].wm_index].commands[results[count].command_index].block_properties.push(JSON.parse(results[count].block_property_element));
              }
              else{
                block_properties.push(JSON.parse(results[count].block_property_element));
                wm_array[results[count].wm_index].commands.push({"block_properties": block_properties, "command_type": "block"});
              }
            }
            else if(results[count].command_type === "text_message"){
              wm_array[results[count].wm_index].commands.push({"command_type": "text_message", "text_message": results[count].text_message});
            }
          }
        }

        else{ // Word match index not in array yet
          user_possible_words = JSON.parse(results[count].user_possible_words).upw_array;
          if(results[count].command_type != null){
            if(results[count].command_type === "block"){
              block_properties.push(JSON.parse(results[count].block_property_element));
              commands.push({"block_properties": block_properties, "command_type": "block"});
            }
            else if(results[count].command_type === "text_message"){
              commands.push({"command_type": "text_message", "text_message": results[count].text_message})
            }
            wm_array.push({"user_possible_words":user_possible_words, "commands":commands});
          }
          else{
           commands.push({});
           wm_array.push({"user_possible_words":user_possible_words, "commands":commands});
          }
        }
        block_properties = []
        commands = []
      }
      //res.status(200).send({"response": wm_array});
      //console.log("Hey " + wm_array)
      var flag = false;
      var ctype = "";
      var theblock;
      var thetext;
      var arr = [];
      var block_obj = {};
      var text_obj = {};
      for (var i = 0; i < wm_array.length; i++) {
        //console.log("This: " + wm_array);
        if (req.params.message.match(new RegExp("\\b(" + wm_array[i].user_possible_words.join("|") + ")\\b", "gi"))) {
          var response = [];
          //console.log("test")
          for (var j = 0; j < wm_array[i].commands.length; j++) {
            //console.log(wm_array[i].commands[j].command_type);
            if (wm_array[i].commands[j].command_type === undefined) {
              console.log("empty");
            } else if (wm_array[i].commands[j].command_type === "block") {
              for (var k = 0; k < wm_array[i].commands[j].block_properties.length; k++) {
                if (wm_array[i].commands[j].block_properties[k].ischecked) {
                  //console.log(wm_array[i].commands[j].block_properties[k].block_name);
                  ////res.status(200).send({"command_type": "block", "response": wm_array[i].commands[j].block_properties[k].block_name});
                  //theblock = wm_array[i].commands[j].block_properties[k].block_name; 
                  //ctype = "block";
                  block_obj['command_type'] = "block";
                  if("block_names" in block_obj){
                    block_obj['block_names'].push(wm_array[i].commands[j].block_properties[k].block_name);
                  } else{
                    block_obj['block_names'] = [wm_array[i].commands[j].block_properties[k].block_name];
                  }
                  //arr.push(block_obj);
                }
                //arr.push(block_obj);
              }
              arr.push(block_obj);
              flag = true;
            } else if (wm_array[i].commands[j].command_type === "text_message") {
              ////res.status(200).send({"command_type": "text_message", "response": wm_array[i].commands[j].text_message});
              //thetext = wm_array[i].commands[j].text_message; 
              //ctype = "text_message";
              text_obj['command_type'] = "text_message";
              text_obj['text_message'] = wm_array[i].commands[j].text_message;
              arr.push(text_obj);
              flag = true;
            }
          }
          //flag = true
          break;
        }
      }
      if(!flag){
        res.status(400).send(null);
      } else{
        res.status(200).send(arr);
      }  
    }
    else{
      res.status(400).send(null);
    }
  //});
  } else{ // end of if(resultProj.length)
    res.status(400).send(null);
  }
  //}); // end of insertHistory
  } catch(err){
    console.log(err);
    res.status(500).send({"error_message":err});
  }
});






// Get user firstname and lastname
router.get('/username', async (req, res) => {
  var sql = "SELECT lname, name FROM User_Info WHERE sender_pid = '" + req.body.sender_pid + "' AND fb_page_id = '" + req.body.pageID + "'";
  //var query = db.query(sql, (err, results) => {
  var results = await DBMain.query(sql);
    if(results.length){
      res.status(200).send({"lastname": results[0].lname, "firstname": results[0].name});
    } else{
      res.status(200).send({"lastname": null, "firstname": null});
    }
  //})

});







// Live chat notif to admin
router.get('/livechatnotif/:pageID/:sender_pid', (req, res) => {
  var sql = "SELECT name, lname FROM User_Info WHERE sender_pid = '" + req.params.sender_pid + "'";
  var query = db.query(sql, (err, results) => {
    if(err) throw err;
    var body = results[0].name + " " + results[0].lname + " wants to talk live. Please check the page messenger.";
    notifAdmin(req.params.pageID, body, null);
    res.status(200).send({"success": true});
  });
});










module.exports = router;