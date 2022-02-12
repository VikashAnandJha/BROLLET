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
    let doc = await Users.findOneAndUpdate(filter, update);


}

router.post('/push/updateToken',(req,res)=>{

   var publicKey= req.body.public_key;
   var token=req.body.fcm_token;

   
  
   updateToken(publicKey,token).then((result)=>{
       res.json(result)
   }).catch((err)=>{
    res.json(err)
   });

    //console.log(req.body.public_key);
    
  })

  router.post('/push/send',(req,res)=>{

    var fcm = new FCM("AAAAg3DpV0g:APA91bHxj7G2eAe5ypp3ApLOcuIQs-9k_yUrxrcCHrvKncY2YoDvhjdDaGGeu83T4tS5xqGnVtljWSZRJgCArl5_8aphPUGQsrgKBmNk4-wlUvBZJnY3peBhjfHkJ0v3P7xnuogIKCs4");

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: 'f9kvor6eTti6r3NSEsB7Xz:APA91bGkeBtc7obw3gUPiNQsd6P3OVCColH3fACHze3f4cfqVzK4xjHRUdjrAnTOCXyYDgHAff9PH0-os3YQAxboUnR9a8iIhEgJLmoNlm7rT3-6-8CAYfdODYa_UwvI0v4lMlwW4wNe', 
         notification: {
            title: 'Title of your push notification', 
            body: 'Body of your push notification' 
        },
        
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
     //console.log(req.body.public_key);
     
   })
   

  
  module.exports = router;