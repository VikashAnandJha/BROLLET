const express= require('express')
const app = express()
const web3 = require('@solana/web3.js');
const {Keypair} = require("@solana/web3.js")
var cors = require('cors')


app.use(cors())
  

let connection,bal;

app.get('/',(req, res) => {

    res.send("Hellow BROLLET!")
    console.log(solanaWeb3);
}) 



async function createAddress() {
    
    
   
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


app.get('/api/create',(req, res) => {

    res.send("Creating SOLANA Key")

    let account = Keypair.generate();

console.log(account.publicKey.toBase58());
console.log(account.secretKey);

})
app.get('/api/balance/:id',(req, res) => {

   
    getBalance(req.params.id).then(()=>{
      //  res.send("Balance is:"+bal+"SOL")
        res.json({"status": "success",balance: bal})

    }).catch((err)=>{
       res.json({"status": "error"})
    })

    
   
})

// PORT 
const PORT= process.env.PORT || 5000
app.listen(PORT,() => console.log("Listening "+PORT))



 