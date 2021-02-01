'use strict' 

const 
    express = require('express') ,
    router = express.Router() , 
    DBMain = require('../DatabasePakage/db-main'), 
    SqlString = require('sqlstring'),
    nodemailer = require('nodemailer'),
    phone = require('phone');

var reserves_restaurant = new Array();
var reserves_pro_ser = new Array();

// class RestaurantModel{
//     datetime;
//     contactnumber;
//     numberguest;
//     sender_pid;
//     constructor(){ 
//         this.datetime;
//         this.contactnumber;
//         this.numberguest;
//         this.sender_pid;
//     }
// }    
    //RESTAURANT TEMPLATE=====================================================================
     
router.post('/restaurant/contact-number',async (req,res)=>{
    try{ 
        const b = req.body;
        const phs  =phone(b.user_input, '');
        if(phs.length){
            const find_user = reserves_restaurant.findIndex(x => x.sender_pid === b.sender_pid);
            if(find_user >= 0){
                //HAS sender_pid
                // reserves_restaurant[find_user].contactnumber = b.sender_pid;
                Object.assign(reserves_restaurant[find_user],{
                    contactnumber:phs[0] +" "+ phs[1]
                })
            }else{
                //NO sender_pid
                reserves_restaurant.push({contactnumber :phs[0] +" "+ phs[1],sender_pid:b.sender_pid});
            }
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.resolve_blocks,"extra_message":`Thank you for providing your contact number : ${phs[0] +" "+ phs[1]}`});
        }else{
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.reject_blocks,"extra_message":"Please enter a correct phone number"});
        }
    }catch(err){
        res.status(500).send({error_message:"Something went wrong."})
    }
})

router.post('/restaurant/number-of-guest',async (req,res)=>{
    try{
        const b = req.body; 
        const numb = parseInt(b.user_input);
        if(numb){
            const find_user = reserves_restaurant.findIndex(x => x.sender_pid === b.sender_pid);
            if(find_user >= 0){
                //HAS sender_pid 
                Object.assign(reserves_restaurant[find_user],{
                    numberguest:numb
                })
            }else{
                //NO sender_pid
                reserves_restaurant.push({numberguest :numb,sender_pid:b.sender_pid});
            }
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.resolve_blocks,"extra_message":''});
        }else{
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.reject_blocks,"extra_message":"please enter only digits"});
        }
    }catch(err){
        res.status(500).send({error_message:"Something went wrong."})
    }
}) 

router.post('/restaurant/date-and-time',async (req,res)=>{
    try{
        const b = req.body; 

        const find_user = reserves_restaurant.findIndex(x => x.sender_pid === b.sender_pid);
        if(find_user >= 0){
            //HAS sender_pid 
            Object.assign(reserves_restaurant[find_user],{
                datetime:b.user_input
            })
        }else{
            //NO sender_pid
            reserves_restaurant.push({datetime :b.user_input,sender_pid:b.sender_pid});
        } 
        res.send({"sender_pid": b.sender_pid,"response_blocks":b.resolve_blocks,"extra_message":`Great! Please confirm your booking:
        Reservation for {firstname}.
        Phone number : ${reserves_restaurant[find_user].contactnumber}.
        Date and arrival time : ${reserves_restaurant[find_user].datetime} .
        Number of guests : ${reserves_restaurant[find_user].numberguest}. 
        
        Is this information correct?`});
    }catch(err){
        res.status(500).send({error_message:"Something went wrong."})
    }
})


//PROFESSIONAL SERVICES TEMPLATE

router.post('/proservices/contact-number',async (req,res)=>{
    try{ 
        const b = req.body;
        const phs  =phone(b.user_input, '');
        if(phs.length){
            const find_user = reserves_pro_ser.findIndex(x => x.sender_pid === b.sender_pid);
            if(find_user >= 0){
                //HAS sender_pid 
                Object.assign(reserves_pro_ser[find_user],{
                    contactnumber:phs[0] +" "+ phs[1]
                })
            }else{
                //NO sender_pid
                reserves_pro_ser.push({contactnumber :phs[0] +" "+ phs[1],sender_pid:b.sender_pid});
            }
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.resolve_blocks,"extra_message":`Thank you for providing your contact number : ${phs[0] +" "+ phs[1]}`});
        }else{
            res.send({"sender_pid": b.sender_pid,"response_blocks":b.reject_blocks,"extra_message":"Please enter a correct phone number"});
        }
    }catch(err){
        res.status(500).send({error_message:"Something went wrong."})
    }
})

router.post('/proservices/date-and-time',async (req,res)=>{
    try{
        const b = req.body; 

        const find_user = reserves_pro_ser.findIndex(x => x.sender_pid === b.sender_pid);
        if(find_user >= 0){
            //HAS sender_pid 
            Object.assign(reserves_pro_ser[find_user],{
                datetime:b.user_input
            })
        }else{
            //NO sender_pid
            reserves_pro_ser.push({datetime :b.user_input,sender_pid:b.sender_pid});
        } 
        res.send({"sender_pid": b.sender_pid,"response_blocks":b.resolve_blocks,"extra_message":`Great! Please confirm the details:
        Reservation for {firstname}.
        Phone number : ${reserves_pro_ser[find_user].contactnumber}.
        Date and arrival time : ${reserves_pro_ser[find_user].datetime} . 
        
        Is this information correct?`});
    }catch(err){
        res.status(500).send({error_message:"Something went wrong."})
    }
})

module.exports = router;