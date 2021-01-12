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
  SqlString = require('sqlstring'),
  middlewareMain = require('../MiddlewarePackage/middleware-main')

 
router.post('/register', async (req, res)=>{ 
  try{
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
      social_user_id: 'integer',
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
     
    var sql = SqlString.format(`SELECT user_id FROM chatbot_builder_v2.User_Tbl where provider =? and email =?`, [b.provider,b.email]);  
    var _res = await DBMain.query(sql) 
    if(_res.length > 0){ 
      res.status(400).send({error_message:"This account or email is already in used."});
      return;
    } 
    var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.User_Tbl SET ?`, [b]); 
    await DBMain.query(sql);
  
    var sql = SqlString.format(`select * from chatbot_builder_v2.User_Tbl where user_id = ?`, [b.user_id]);  
    var _res = await DBMain.query(sql) ;
  
    //success
    res.send({success:true});
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
});
 
router.get('/account',async(req,res)=>{
  try{
    const b = req.body;
    var sql =  SqlString.format(`select user_id from chatbot_builder_v2.User_Tbl where user_id = ?`, [b.user_id]);  
    const _res = await DBMain.query(sql);
    
    //success
    res.send(_res[0]);
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
});

router.post('/email-login',async(req,res)=>{
  try{
    const b = req.body;
    console.log(b);
    b.password = CryptoUtil.decryptData(b.password);
    console.log(b.password);
    var sql = SqlString.format(`select password from chatbot_builder_v2.User_Tbl where email = ? and provider = 'email'`, [b.email]);
    const _res_count_acc = await DBMain.query(sql);
    
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
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
}); 

router.post('/fb-login',async(req,res)=>{
  try{
    const b = req.body; 
    b.password =  "no-password==="+uuidv4();
    Object.assign(b,{
      user_id:uuidv4()
    })
    let user_id = b.user_id;
    console.log(b);
    var sql = SqlString.format(`select user_id from chatbot_builder_v2.User_Tbl where email = ? and social_user_id =  ?`, [b.email,b.social_user_id]);
    var _res = await DBMain.query(sql);
    if(_res.length <= 0){
      //Create new account
      var sql = SqlString.format(`INSERT INTO chatbot_builder_v2.User_Tbl SET ?`, [b]);  
      await DBMain.query(sql);
    } else{
      user_id =_res[0].user_id;
    }
    const token = await middlewareMain.onLogin(user_id);
    console.log(token);
    //On Fb Login 
    var sql = SqlString.format(`SELECT * FROM chatbot_builder_v2.User_Tbl where user_id = ? and profession is null`, [user_id]);
    var _res = await DBMain.query(sql);
    if(_res.length > 0){
      //success
      res.send({success:true,is_not_complete:true,user_id,token:token});
    }else{ 
      //success not enough informations
      res.send({success:true,is_not_complete:false,user_id,token:token});
    }
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
});

//HAS TOKEN =====================
router.put('/fb-complete-register',middlewareMain.isUserValid,async(req,res)=>{
  try{ 
    const b = req.body; 
    var sql = SqlString.format(`select user_id from chatbot_builder_v2.User_Tbl where user_id = ?`, [req.userData.user_id ]);
    var _res = await DBMain.query(sql);
    if(_res.length <= 0){ 
      res.status(401).send({error_message:"No user found"});
      return;
    } 
  
    var sql = SqlString.format(`UPDATE chatbot_builder_v2.User_Tbl SET ? WHERE user_id = ?`, [b,req.userData.user_id ]);
    var _res = await DBMain.query(sql);
  
    //success
    res.send({success:true});
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
});

router.post('/check-next-proceed',middlewareMain.isUserValid,async (req,res)=>{
  try{  
    var sql = SqlString.format(`SELECT * FROM chatbot_builder_v2.User_Tbl where user_id = ? and profession is null`, [req.userData.user_id]);
    var _res = await DBMain.query(sql);
    if(_res.length > 0){
      //success
      res.send({success:true,is_not_complete:true});
    }else{ 
      //success not enough informations
      res.send({success:true,is_not_complete:false});
    }
    
  }catch(err){
    console.log(err)
    res.status(500).send({error_message:"Something went wrong"});
  }
});


module.exports = router;