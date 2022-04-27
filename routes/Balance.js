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
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const splToken = require('@solana/spl-token');
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')
const bip39 = require("bip39")
const bip44 = require("bip44")
var cors = require('cors')
const { TokenListProvider, TokenInfo } = require('@solana/spl-token-registry');
const {   programs } = require('@metaplex/js'); 
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');
const {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} = require("@nfteyez/sol-rayz");
const axios = require('axios');

const TransactionModel = require('../models/Transactions')
const Users = require('../models/Users')

var FCM = require('fcm-node');




router.use(cors())
router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests

let connection,bal,tokens,endpoint="devnet",fromWallet,toWallet,tokenList,nftdata;

//endpoint="mainnet-beta";

connection = new web3.Connection(web3.clusterApiUrl(endpoint), 'confirmed');
 


function createConnection(endpoint)

{
    if(endpoint!=undefined){
        console.log("Connecting server: ",endpoint)
        connection = new web3.Connection(web3.clusterApiUrl(endpoint), 'confirmed');
    }else{
      connection = new web3.Connection(web3.clusterApiUrl("devnet"), 'confirmed');
        console.log("Endpoint not given. Connected to devnet")
    }
   
 
}

 async function getBalance(address) {
    let key = new web3.PublicKey(address);

   // connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
      bal = await connection.getBalance(key);
      bal=bal/web3.LAMPORTS_PER_SOL;
    //console.log(bal)
  //return bal;
  //res.send("Balance of this solana account:"+req.params.id+" is "+bal+"\nFilter by:"+req.query.showIn);
  //res.send("Balance of this solana account:"+bal);
    
   
 }


 async function getTokenList()
 {
  new TokenListProvider().resolve().then(tokens => {
      tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
    

})


 }

 async function getAssocBalance(address,mint) {
  var tokenList = [];
  new TokenListProvider().resolve().then(tokens => {
    tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
  

})
    //console.log("fetching balance for: "+address)
  let key = new web3.PublicKey(address);

  // connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
     bal = await connection.getBalance(key);
     bal=bal/web3.LAMPORTS_PER_SOL;
  // console.log(bal)


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
  //  console.log(
  //    `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    
  //  );
   // console.log(account.account.data["parsed"]["info"]);
  //  console.log(
  //    `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
     
     
  //  );
var mint=account.account.data["parsed"]["info"]["mint"];
var amount=account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
//console.log(amount)

var token_data;
token_data=tokenList.find( record => record.address === mint)


 

//console.log(token_data)

// getNftList(mint).then(()=>{
//   token_data=nftdata;
// });


item = {}
        item ["mint"] = mint;
        item ["amount"] = amount;
       item ["token_data"] = token_data;


    //    if(token_data==undefined){
    //     getNftList(mint).then(()=>{
    //      token_data=nftdata.name;
         
    //  console.log("recvd")
    //  console.log(token_data)
    
    //    });
    // }

    if(token_data!=undefined)
    arr.push(item);
        
   });

   //console.log(arr)

tokens=arr;
 
   return arr;
   

}

 
    async function sendSOL(fromAddress,toAddress,amount,key,token_name,mint,decimal){
        let hash,transferTransaction;
        var mnemonic=key;
        let seed ; let keypair;let publicKey;let secretKey;
      
        if(mnemonic!=undefined){
           
      
            seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
            let path;
      for (let i = 0; i < 1; i++) {
          path = `m/44'/501'/${i}'/0'`;
          keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
       // console.log(`${path} => ${keypair.publicKey.toBase58()}`);
      
        if(i==0)
        {
          publicKey=keypair.publicKey.toBase58();
          secretKey="["+keypair.secretKey+"]";
        }
      
      }
    }
    fromWallet = Keypair.fromSecretKey(keypair.secretKey);
        
      toWallet = new web3.PublicKey(toAddress); //HOLDER OF ATLAS

 
         //000200000
        

         if(token_name=="sol")
         {
            //console.log(fromWallet.publicKey)
  var balance=await connection.getBalance(fromWallet.publicKey) / web3.LAMPORTS_PER_SOL;
  console.log(balance)
var tamount=amount;
console.log("Sendable amount: "+tamount)
 if(balance>=0){
     console.log("Transfering SOL: "+tamount)
 const lamportsToSend = LAMPORTS_PER_SOL*tamount; 
           transferTransaction = new web3.Transaction()
           .add(web3.SystemProgram.transfer({
             fromPubkey: fromWallet.publicKey,
             toPubkey: toWallet,
             lamports: lamportsToSend
           }))
          }
           console.log( transferTransaction)

        }

           if(token_name!="sol")
           {
            var myMint = new web3.PublicKey(mint);
            var myToken = new splToken.Token(
              connection,
              myMint,
              splToken.TOKEN_PROGRAM_ID,
              fromWallet
            );
            // Create associated token accounts for my token if they don't exist yet
            var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
              fromWallet.publicKey
            )
            var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
              toWallet
            )
            let lamportsInToken=Math.pow(10, decimal);
            console.log("decimal:"+decimal+" lamports:"+lamportsInToken)
           // Add token transfer instructions to transaction
              transferTransaction = new web3.Transaction()
              .add(
                splToken.Token.createTransferInstruction(
                  splToken.TOKEN_PROGRAM_ID,
                  fromTokenAccount.address,
                  toTokenAccount.address,
                  fromWallet.publicKey,
                  [],
                  amount*lamportsInToken
                )
              );
           }

          


        
         var txnhash=await sendAndConfirmTransaction(connection, transferTransaction, [fromWallet]);

         if(txnhash && token_name=="sol")
         {
             console.log("<<<<<<<<<<<<< SOL TRasfer SUCCESS >>>>>>>>>>>>>>>")
             console.log(txnhash);
             var balance=await connection.getBalance(fromWallet.publicKey) / LAMPORTS_PER_SOL;
             console.log("Remaining Balance:"+balance)
            
         
         }
         if(txnhash && token_name!="sol")
         {
             console.log("<<<<<<<<<<<<< TOKEN TRasfer SUCCESS >>>>>>>>>>>>>>>")
             console.log(txnhash);
              
            
         
         }
        
         
         hash=txnhash;

         return hash;
         
        } 

 router.get('/balance/:id',(req, res) => {
 
          createConnection(req.query.endpoint)
       
           getAssocBalance(req.params.id,req.query.type).then(()=>{
             //  res.send("Balance is:"+bal+"SOL")
               res.json({"status": "success","balance":bal,"tokens": tokens})
         
           }).catch((err)=>{
             console.log(err)
              res.json({"status": "error","msg":err.message})
           })
         
           console.log("type:"+req.query.type+" mint="+req.query.type)
          
            
            
         
             
            
         })

  async function checkMainBalance(address)
  {
    
    let key = new web3.PublicKey(address);

    // connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
       bal = await connection.getBalance(key);

       return bal;

  }

router.get('/verify/:id',(req, res) => {
 
          createConnection(req.query.endpoint)

          checkMainBalance(req.params.id).then((bal)=>{
            res.json({status:"success","msg":bal})
          }).catch((err)=>{
            console.log(err)
            res.json({status:"error","msg":err.message})
          })

            
        
         })

   
         async function  sendToken(fromAddress,toAddress,amount,key,token_name){
          const DEMO_WALLET_SECRET_KEY = new Uint8Array([18,39,55,167,130,245,139,239,216,72,17,127,7,59,72,45,90,247,33,85,231,5,24,154,210,92,167,171,174,113,254,108,7,246,163,81,166,166,12,183,69,80,204,246,45,149,211,133,213,218,200,236,8,136,164,210,233,62,233,58,139,58,59,48]);

          console.log("sendin token to "+toAddress)
          // Connect to cluster
          var connection = new web3.Connection(web3.clusterApiUrl("devnet"));
          // Construct wallet keypairs
          var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
          var toWallet = web3.Keypair.generate();
          // Construct my token class
          var myMint = new web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
          var myToken = new splToken.Token(
            connection,
            myMint,
            splToken.TOKEN_PROGRAM_ID,
            fromWallet
          );
          // Create associated token accounts for my token if they don't exist yet
          var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
            fromWallet.publicKey
          )
          var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
            toWallet.publicKey
          )
         // Add token transfer instructions to transaction
          var transaction = new web3.Transaction()
            .add(
              splToken.Token.createTransferInstruction(
                splToken.TOKEN_PROGRAM_ID,
                fromTokenAccount.address,
                toTokenAccount.address,
                fromWallet.publicKey,
                [],
                0.01*1000000
              )
            );
            
          var signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [fromWallet]
          );
          console.log("SIGNATURE", signature);
        
          console.log("SUCCESS"); 
        
         return signature;
        
          // let txid = await connection.confirmTransaction("4PiHmzAw2NrHuaCTJhAFzmFKtg4SPTu5Cxbd8FP2fm58Ws4x4q5htzZSuDUjcLWm9shjErQJNrJqtiHyKLAunXmx");
          //console.log(txid);
        }



  router.post('/transfer',(req, res)=>{
       
   createConnection(req.query.endpoint)

    var fromAddress=  req.body.fromAddress;
    var toAddress=  req.body.toAddress;
    var key=  req.body.key;
    var amount=  req.body.amount;
    var token_name=  req.body.token_name;
    var mint=  req.body.mint;
    var decimal=  req.body.decimal;
    
    console.log(key)

    if("sol"=="sol"){
      sendSOL(fromAddress,toAddress,amount,key,token_name,mint,decimal).then((hash)=>{

        console.log("hash:"+hash)

        const txn=new TransactionModel({
          "hash":hash,"amount":amount,"from_publicKey":fromAddress,"to_publicKey":toAddress,"status":"success","type":"sent",
          "token_name":token_name
        })
        txn.save().then((result)=>{
          console.log(result)
        }).catch((err)=>{
          console.log(err)
        })

        sendPush(fromAddress,toAddress,amount,token_name)

       res.json({"status": "success","hash":hash})
  

    }).catch((hash)=>{
        console.log(hash)
        const txn=new TransactionModel({
          "hash":hash,"amount":amount,"from_publicKey":fromAddress,"to_publicKey":toAddress,"status":"error","type":"sent",
          "token_name":token_name
        })
        txn.save().then((result)=>{
          console.log(result)
        }).catch((err)=>{
          console.log(err)
        })
       res.json({"status": "error","hash":hash})
    })
    }
     




     

  })


  async function  sendPush(fromAddress,toAddress,amount,token_name)
  {

    

   

   await Users.find().or([{ publicKey: toAddress }]).limit(1).then((result)=>{
     
      var recectoken=result[0].fcm_id;
      console.log(recectoken)
      var fcm = new FCM("AAAAg3DpV0g:APA91bHxj7G2eAe5ypp3ApLOcuIQs-9k_yUrxrcCHrvKncY2YoDvhjdDaGGeu83T4tS5xqGnVtljWSZRJgCArl5_8aphPUGQsrgKBmNk4-wlUvBZJnY3peBhjfHkJ0v3P7xnuogIKCs4");

      var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: recectoken, 
           notification: {
              title: amount+' '+token_name+' deposit received', 
              body:  'from:'+fromAddress 
          } 
      };
      
       fcm.send(message, function(err, response){
          if (err) {
              console.log("Something has gone wrong!"+err);
          } else {
              console.log("Successfully sent with response: ", response);
          }
      });



    }).catch((err)=>{
     console.log(err);
    })


  }


  async function getNftList(id){
    
    //const tokenPublicKey = '26n5r44sjT76JAizmomXanyoaZqgrnyZtkVeS9KjDVDN';
    // try {
    //   const ownedMetadata = await Metadata.load(connection, tokenPublicKey);
    //   console.log(ownedMetadata);
    // } catch {
    //   console.log('Failed to fetch metadata');
    // }
    const tokenPublicKey = id;
    console.log("fetching data for:",id)

 
    const tokenMint = id;
    const metadataPDA = await Metadata.getPDA(new PublicKey(tokenMint));
    const tokenMetadata = await Metadata.load(connection, metadataPDA);
     
var data=tokenMetadata.data;
//console.log("data"+data.data)
//console.log("data.data.data"+data.data.name)
  nftdata=data.data;
 
var arr = [];
      item = {}
         item ["name"] = nftdata.name;
          item ["symbol"] = nftdata.symbol;
        item ["uri"] = nftdata.uri;

        if(toke)
          arr.push(item);

          console.log("Nft data:"+nftdata)

          return arr;


 
    



  }

  router.get('/nft/:id',(req, res)=>{
    
   createConnection(req.query.endpoint)
    console.log(req.params.id+" geting nft")
    getNftList(req.params.id).then(()=>{
      res.json(nftdata)
    });

})

async function getData(mint)
{
  const tokenMint = mint;
const metadataPDA = await Metadata.getPDA(new PublicKey(tokenMint));
const tokenMetadata = await Metadata.load(connection, metadataPDA);
console.log(tokenMetadata.data.data);
return tokenMetadata.data.data;
}


async function list(address,res){


  let key = new web3.PublicKey(address);
 
  console.log("finding nft list: "+address)
    

  const publicAddress = await resolveToWalletAddress({
    text: address
  });
  
  const nftArray = await getParsedNftAccountsByOwner({
    publicAddress,
  });


var data=nftArray;
  let arr = [];
    let n = data.length;
    for (let i = 0; i < n; i++) {
      console.log(data[i].data.uri);
      let val = await axios.get(data[i].data.uri);

      console.log(val.data)
      arr.push(val.data);
    }



  //console.log(arr)

  res.send(arr)

 


}

 
router.get('/nftlist/:id',(req, res)=>{
    
  createConnection(req.query.endpoint)
  list(req.params.id,res)
 
     

})

async function getBalance(address)
{
  let key = new web3.PublicKey(address);
  bal = await connection.getBalance(key);
  bal=bal/web3.LAMPORTS_PER_SOL;

  return bal;
}

router.get('/sol_balance/:id',(req, res) => {
 
  createConnection(req.query.endpoint)

    getBalance(req.params.id).then((bal)=>{
       res.json({"status": "success","balance":bal,"tokens": tokens})
 
   }).catch((err)=>{
     console.log(err)
      res.json({"status": "error","msg":err.message})
   })
 
     
    
 })





  module.exports = router;