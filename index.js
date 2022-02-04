const express= require('express')
const app = express()
const web3 = require('@solana/web3.js');
const {Keypair,PublicKey} = require("@solana/web3.js")
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID,splToken } = require("@solana/spl-token");

const bip39 = require("bip39")
var cors = require('cors')


app.use(cors())
  

let connection,bal,tokens;

app.get('/',(req, res) => {

    res.send("Hellow BROLLET!")
    console.log(solanaWeb3);
}) 



async function generateAccount(mnemonic) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const keyPair = Keypair.fromSeed(seed.slice(0, 32));
    console.log(keyPair.publicKey.toBase58())
    return new web3.Account(keyPair.secretKey)
  
   
 }
 async function getBalance(address) {
    let key = new web3.PublicKey(address);

    connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
      bal = await connection.getBalance(key);
      bal=bal/web3.LAMPORTS_PER_SOL;
    console.log(bal)
  //return bal;
  //res.send("Balance of this solana account:"+req.params.id+" is "+bal+"\nFilter by:"+req.query.showIn);
  //res.send("Balance of this solana account:"+bal);
    
   
 }
 async function getAssocBalance(address,mint) {
  connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');

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
var amount=account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];


item = {}
        item ["mint"] = mint;
        item ["amount"] = amount;

        arr.push(item);
   });

   console.log(arr)

tokens=arr;
   return arr;
   

}


app.get('/api/create',(req, res) => {

    //res.send("Creating SOLANA Key")

    let account = Keypair.generate();

console.log(account.publicKey.toBase58());
console.log(account.secretKey);
let key="["+account.secretKey+"]";


// const mnemonic = bip39.generateMnemonic();
// console.log("Your password:", mnemonic);

// const id = generateAccount(mnemonic)


res.json({"sucess":true,"key":key});

})
app.get('/api/balance/:id',(req, res) => {



  console.log("type:"+req.query.type+" mint="+req.query.type)

  if(req.query.type=="assoc"){
   
    getAssocBalance(req.params.id,req.query.type).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success","tokens": tokens})

    }).catch((err)=>{
       res.json({"status": "error"})
    })

  }else{
    getBalance(req.params.id).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success","balance": bal})

    }).catch((err)=>{
       res.json({"status": "error"})
    })
  }
   
   

    
   
})

// PORT 
const PORT= process.env.PORT || 5000
app.listen(PORT,() => console.log("Listening "+PORT))



 