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
const { TokenListProvider, TokenInfo } = require('@solana/spl-token-registry');
const {   programs } = require('@metaplex/js'); 
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');
const {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} = require("@nfteyez/sol-rayz");
const axios = require('axios');





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
    console.log(bal)
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
  //  console.log(
  //    `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    
  //  );
    console.log(account.account.data["parsed"]["info"]);
  //  console.log(
  //    `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
     
     
  //  );
var mint=account.account.data["parsed"]["info"]["mint"];
var amount=account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
console.log(amount)

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

   

  router.post('/transfer',(req, res)=>{
       
   createConnection(req.query.endpoint)

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





  module.exports = router;