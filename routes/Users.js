const express= require('express')
const router = express.Router();

var cors = require('cors')

router.use(cors())
router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests


router.post('users/add',(req,res)=>{
    // const user=new User({
    //   name:"test",mobile:"123456789",publicKey:"ggggggg",fcm_id:""
    // })
    // user.save().then((result)=>{
    //   res.json(result)
    // }).catch((err)=>{
    //   res.json(err)
    // })
  })
  router.get('users/:id',(req,res)=>{
   
    let id=req.params.id;
    User.find().or([{ name: id }, { mobile: id }]).limit(1).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      res.json(err)
    })
  })

  
  module.exports = router;