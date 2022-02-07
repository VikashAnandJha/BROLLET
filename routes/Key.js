const express= require('express')
const router = express.Router();
const web3 = require('@solana/web3.js');
const {Keypair,PublicKey} = require("@solana/web3.js")
const { AccountLayout, u64,Token,TOKEN_PROGRAM_ID,splToken } = require("@solana/spl-token");
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')
const bip39 = require("bip39")
const bip44 = require("bip44")
var cors = require('cors')


async function generateAccount(mnemonic) {
    const seed = await bip44.mnemonicToSeed(mnemonic);
    const keyPair = Keypair.fromSeed(seed.slice(0, 32));
    console.log(keyPair.publicKey.toBase58())
    return new web3.Account(keyPair.secretKey)
  
   
 }



 router.get('/create',(req, res) => {

    //res.send("Creating SOLANA Key")
    const mnemonic = bip39.generateMnemonic();
    let seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    let keypair = Keypair.fromSeed(seed.slice(0, 32));
     

    let publicKey=keypair.publicKey.toBase58();
    let secretKey=keypair.secretKey;


      seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
      let path;
for (let i = 0; i < 10; i++) {
    path = `m/44'/501'/${i}'/0'`;
    keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);

  if(i==0)
  {
    publicKey=keypair.publicKey.toBase58();
    secretKey="["+keypair.secretKey+"]";
  }

}
 
res.json({"sucess":true,"publicKey":publicKey,"secretKey":secretKey,"mnemonic":mnemonic});

})


router.post('/restore',(req, res)=>{
  console.log("mnemonics recvd:",req.body.mnemonic)
  var mnemonic=req.body.mnemonic;
  if(mnemonic!=undefined){
     let seed ; let keypair;let publicKey;let secretKey;


      seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
      let path;
for (let i = 0; i < 10; i++) {
    path = `m/44'/501'/${i}'/0'`;
    keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);

  if(i==0)
  {
    publicKey=keypair.publicKey.toBase58();
    secretKey="["+keypair.secretKey+"]";
  }

}
 
res.json({"sucess":true,"publicKey":publicKey,"secretKey":secretKey,"mnemonic":mnemonic});

  }else
  res.json({"sucess":false})
  
})

module.exports = router;