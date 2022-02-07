const express= require('express')
const app = express()
const web3 = require('@solana/web3.js');
const {Keypair,PublicKey} = require("@solana/web3.js")
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID,splToken } = require("@solana/spl-token");
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')



const bip39 = require("bip39")
const bip44 = require("bip44")
var cors = require('cors')





app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json()) //For JSON requests


  

let connection,bal,tokens,enpoint="devnet";

const keyRoute=require('./routes/Key');
const balanceRoute=require('./routes/Balance');

connection = new web3.Connection(web3.clusterApiUrl(enpoint), 'confirmed');
 
// PORT 
const PORT= process.env.PORT || 5000
app.listen(PORT,() => console.log("Listening "+PORT))

app.use("/api/",keyRoute)
app.use("/api/",balanceRoute)

app.get('/',(req, res) => {

  res.send("Hellow BROLLET!")
 // console.log(solanaWeb3);
}) 