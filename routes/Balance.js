const express= require('express')
const router = express.Router();
const web3 = require('@solana/web3.js');
const {Keypair,PublicKey} = require("@solana/web3.js")
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID,splToken } = require("@solana/spl-token");
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')
const bip39 = require("bip39")
const bip44 = require("bip44")
var cors = require('cors')


let connection,bal,tokens,enpoint="devnet";

connection = new web3.Connection(web3.clusterApiUrl(enpoint), 'confirmed');
 


 async function getBalance(address) {
    let key = new web3.PublicKey(address);

   // connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
      bal = await connection.getBalance(key);
      bal=bal/web3.LAMPORTS_PER_SOL;
    console.log(bal)
  //return bal;
  //res.send("Balance of this solana account:"+req.params.id+" is "+bal+"\nFilter by:"+req.query.showIn);
  //res.send("Balance of this solana account:"+bal);
    
   
 }
 async function getAssocBalance(address,mint) {
    console.log("fetching balance for: "+address)
  let key = new web3.PublicKey(address);

  // connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
     bal = await connection.getBalance(key);
     bal=bal/web3.LAMPORTS_PER_SOL;
   console.log(bal)


  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 32, // number of bytes
            bytes: address, // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(
    `Found ${accounts.length} token account(s) for wallet : `
  ); 

  var arr = [];

  if(accounts.length>0)
 accounts.forEach((account, i) => {
var acckey=account.pubkey.toString();
   //console.log(account.account.data["parsed"]["info"]["mint"]);
   console.log(
     `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    
   );
   console.log(`Mint: ${account.account.data["parsed"]["info"]["mint"]}`);
   console.log(
     `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
     
     
   );
var mint=account.account.data["parsed"]["info"]["mint"];
var amount=account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]*web3.LAMPORTS_PER_SOL;
console.log(amount)

item = {}
        item ["mint"] = mint;
        item ["amount"] = amount;

        arr.push(item);
   });

   console.log(arr)

tokens=arr;
 
   return arr;
   

}
router.get('/balance/:id',(req, res) => {
 
   

    getAssocBalance(req.params.id,req.query.type).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success","balance":bal,"tokens": tokens})
  
    }).catch((err)=>{
      console.log(err)
       res.json({"status": "error","msg":err.message})
    })
  
    console.log("type:"+req.query.type+" mint="+req.query.type)
   
     
     
  
      
     
  })

  router.get('/sol_balance/:id',(req, res) => {


  
    getBalance(req.params.id).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success","balance": bal})
  
    }).catch((err)=>{
       res.json({"status": "error"})
    })
  
   
   
  
    
   
  })
  router.get('/token_balance/:id',(req, res) => {
  
    getAssocBalance(req.params.id,req.query.type).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success","tokens": tokens})
  
    }).catch((err)=>{
      console.log(err)
       res.json({"status": "error","msg":err.message})
    })
   
  })

  module.exports = router;