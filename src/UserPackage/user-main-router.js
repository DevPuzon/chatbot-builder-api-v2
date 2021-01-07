'use strict'  
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

 
router.post('/register', async (req, res)=>{ 
  const b = req.body;
  Object.assign(b,{
    user_id:uuidv4()
  });
  if(b.provider == 'facebook'){
    b.password =  "no-password==="+uuidv4();
  }
  const v = new Validator(req.body, {
    email: 'required|email',
    first_name: 'required',
    last_name: 'required', 
    msgr_id: 'integer',
    provider: 'required',
    mobile_number: 'required',
    profession: 'required', 
    user_img: 'required', 
  });
  
  const matched = await v.check(); 
  if (!matched) {
    const err_msg = HttpUtil.errorFirst(v.errors);
    res.status(400).send({error_message:err_msg});
    return;
  }
  console.log(b);
   
  var sql = SqlString.format(`SELECT * FROM chatbot_builder_v2.User_Tbl where provider =? and email =?`, [b.provider,b.email]);  
  var _res = await DBMain.query(sql).catch((_err)=>{  
    res.status(500).send({error_message:"Something went wrong"});
    return;
  });
  if(_res.length > 0){ 
    res.status(400).send({error_message:"This account or email is already in used."});
    return;
  }
  console.log(_res.length);
    
  
  var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.User_Tbl SET ?`, [b]); 
  await DBMain.query(sql).catch((_err)=>{  
    res.status(500).send({error_message:"Something went wrong"});
    return;
  });

  var sql = SqlString.format(`select * from chatbot_builder_v2.User_Tbl where user_id = ?`, [b.user_id]);  
  var _res = await DBMain.query(sql).catch((_err)=>{ 
    res.status(500).send({error_message:"Something went wrong"});
    return;
  });

  //success
  res.send(_res[0]);
});
 
router.get('/account',async(req,res)=>{
  const b = req.body;
  var sql =  SqlString.format(`select * from chatbot_builder_v2.User_Tbl where user_id = ?`, [b.user_id]);  
  const _res = await DBMain.query(sql).catch((_err)=>{ 
    res.status(500).send({error_message:"Something went wrong"});
    return;
  });
  
  //success
  res.send(_res[0]);
});

router.post('/email-login',async(req,res)=>{
  const b = req.body;
  console.log(b);
  b.password = CryptoUtil.decryptData(b.password);
  console.log(b.password);
  var sql = SqlString.format(`select * from chatbot_builder_v2.User_Tbl where email = ? and provider = 'email'`, [b.email]);
  const _res_count_acc = await DBMain.query(sql).catch((_err)=>{ 
    res.status(500).send({error_message:"Something went wrong"});
    return;
  });
  
  if(_res_count_acc.length <= 0){ 
    res.status(401).send({error_message:"Email and password doesn't match."});
    return;
  }
  console.log(_res_count_acc[0]);
  if(CryptoUtil.decryptData(_res_count_acc[0].password) == b.password){
    //success
    res.send({success:true});
  }else{ 
    res.status(401).send({error_message:"Email and password doesn't match."});
  }
});

module.exports = router;