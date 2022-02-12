const express= require('express')
const router = express.Router();
var FCM = require('fcm-node');


const Users = require('../models/Users')

var cors = require('cors')

router.use(cors())
router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests


async function updateToken(id,token)
{

    console.log("trying to update: "+id+" with token:"+token)

    const filter = { publicKey: id };
    const update = { fcm_id: token };
    
    // `doc` is the document _before_ `update` was applied
   // let doc =   Users.findOneAndUpdate(filter, update);

   let query = { /* query */ }; 
   let options = {upsert: true, new: true, setDefaultsOnInsert: true};
   let model = await Users.findOneAndUpdate(filter, update, options);

   


}

router.post('/push/updateToken',(req,res)=>{

   var publicKey= req.body.public_key;
   var token=req.body.fcm_token;

   console.log(publicKey+"---"+token)

   
  
   updateToken(publicKey,token).then((result)=>{
       res.json({"success":true})
   }).catch((err)=>{
    res.json({"success":false})
   });

    //console.log(req.body.public_key);
    
  })

  router.post('/push/send',(req,res)=>{


     //console.log(req.body.public_key);
     
   })
   

  
  module.exports = router;