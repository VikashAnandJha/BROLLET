const express= require('express')
const router = express.Router();
const web3 = require('@solana/web3.js');
const {PublicKey} = require("@solana/web3.js")
const {
    Connection,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction
  } = require("@solana/web3.js");
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID,splToken } = require("@solana/spl-token");
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')
const bip39 = require("bip39")
const bip44 = require("bip44")
var cors = require('cors')


router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests

let connection,bal,tokens,endpoint="devnet",fromWallet,toWallet;

//endpoint="mainnet-beta";

connection = new web3.Connection(web3.clusterApiUrl(endpoint), 'confirmed');
 


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
//var acckey=account.pubkey.toString();
   //console.log(account.account.data["parsed"]["info"]["mint"]);
   console.log(
     `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    
   );
   console.log(`Mint: ${account.account.data["parsed"]["info"]["mint"]}`);
   console.log(
     `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
     
     
   );
var mint=account.account.data["parsed"]["info"]["mint"];
var amount=account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
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

 
    async function sendSOL(fromAddress,toAddress,amount,key){
        let hash;
        var mnemonic=key;
        let seed ; let keypair;let publicKey;let secretKey;
      
        if(mnemonic!=undefined){
           
      
            seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
            let path;
      for (let i = 0; i < 1; i++) {
          path = `m/44'/501'/${i}'/0'`;
          keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
        console.log(`${path} => ${keypair.publicKey.toBase58()}`);
      
        if(i==0)
        {
          publicKey=keypair.publicKey.toBase58();
          secretKey="["+keypair.secretKey+"]";
        }
      
      }
    }
    fromWallet = Keypair.fromSecretKey(keypair.secretKey);
        
      toWallet = new web3.PublicKey(toAddress); //HOLDER OF ATLAS

  console.log(fromWallet.publicKey)
  var balance=await connection.getBalance(fromWallet.publicKey) / web3.LAMPORTS_PER_SOL;
          console.log(balance)
        var tamount=amount;
        console.log("Sendable amount: "+tamount)
         if(balance>=0){
             console.log("Transfering SOL: "+tamount)
         const lamportsToSend = LAMPORTS_PER_SOL*tamount;
         //000200000
        
         const transferTransaction = new web3.Transaction()
           .add(web3.SystemProgram.transfer({
             fromPubkey: fromWallet.publicKey,
             toPubkey: toWallet,
             lamports: lamportsToSend
           }))

           console.log( transferTransaction)
        
         var txnhash=await sendAndConfirmTransaction(connection, transferTransaction, [fromWallet]);
         if(txnhash)
         {
             console.log("<<<<<<<<<<<<< SOL TRasfer SUCCESS >>>>>>>>>>>>>>>")
             console.log(txnhash);
             var balance=await connection.getBalance(fromWallet.publicKey) / LAMPORTS_PER_SOL;
             console.log("Remaining Balance:"+balance)
            
         
         }
        
         }
         hash=txnhash;

         return hash;
         
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

  router.post('/transfer',(req, res)=>{
    var fromAddress=  req.body.fromAddress;
    var toAddress=  req.body.toAddress;
    var key=  req.body.key;
    var amount=  req.body.amount;
    
    console.log(key)
    sendSOL(fromAddress,toAddress,amount,key).then((hash)=>{

        console.log("hash:"+hash)
        res.json({"status": "success","hash":hash})
  

    }).catch((hash)=>{
        console.log(hash)
       res.json({"status": "error","hash":hash})
    })

     

  })

  module.exports = router;