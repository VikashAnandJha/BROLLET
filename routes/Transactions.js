const express= require('express')

const Transaction = require('../models/Transactions')
const router = express.Router();

var cors = require('cors')

router.use(cors())
router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests


router.post('/txn/add',(req,res)=>{

    let hash= req.body.hash;
    let amount= req.body.amount;
    let from_publicKey= req.body.from_publicKey;
    let to_publicKey=req.body.to_publicKey;
    let status=req.body.status;
    let type=req.body.type;
    

    const txn=new Transaction({
      "hash":hash,"amount":amount,"from_publicKey":from_publicKey,"to_publicKey":to_publicKey,"status":status,"type":type
    })
    txn.save().then((result)=>{
      res.json(result)
    }).catch((err)=>{
      res.json(err)
    })
  })
  router.get('/txn/list/:id',(req,res)=>{
   
    let id=req.params.id;
    Transaction.find().or([{ from_publicKey: id }, { to_publicKey: id }]).limit(100).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      res.json(err)
    })
  })

  router.get('/txn/details/:id',(req,res)=>{
   
    let id=req.params.id;
    Transaction.findById(id).then((result)=>{
      res.json(result)
    }).catch((err)=>{
      res.json(err)
    })
  })

  
  module.exports = router;