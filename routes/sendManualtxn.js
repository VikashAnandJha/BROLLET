const express= require('express')
const router = express.Router();
const web3 = require('@solana/web3.js');
const {Token,transfer, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const splToken = require('@solana/spl-token');
const bs58 = require('bs58');
const nacl = require('tweetnacl');

var cors = require('cors')

const {PublicKey,Keypair, LAMPORTS_PER_SOL,Transaction,
  TransactionInstruction} = require("@solana/web3.js");

  
router.use(cors())
router.use(express.urlencoded({extended: true}));
router.use(express.json()) //For JSON requests


// Address: 9vpsmXhZYMpvhCKiVoX5U8b1iKpfwJaFpPEEXF7hRm9N
const DEMO_WALLET_SECRET_KEY = new Uint8Array([18,39,55,167,130,245,139,239,216,72,17,127,7,59,72,45,90,247,33,85,231,5,24,154,210,92,167,171,174,113,254,108,7,246,163,81,166,166,12,183,69,80,204,246,45,149,211,133,213,218,200,236,8,136,164,210,233,62,233,58,139,58,59,48]);
async function  sendPayment(toAddress){
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
   // console.log(transaction);

    // await transaction.add(
    //   new TransactionInstruction({
    //     keys: [{ pubkey: fromWallet.publicKey, isSigner: true, isWritable: true }],
    //     data: Buffer.from('Sent Via Furr1', 'utf-8'),
    //     programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    //   })
    //   )
  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet]
  );
  console.log("SIGNATURE", signature);

  console.log("SUCCESS");
// Alternatively, manually construct the transaction
// let recentBlockhash = await connection.getRecentBlockhash();
// let manualTransaction = new web3.Transaction({
//     recentBlockhash: recentBlockhash.blockhash,
//     feePayer: fromWallet.publicKey
// });
// manualTransaction.add(web3.SystemProgram.transfer({
//     fromPubkey: fromWallet.publicKey,
//     toPubkey: toWallet.publicKey,
//     lamports: 100000000*0.01,
// }));

// manualTransaction.add(transaction); 

// let transactionBuffer = manualTransaction.serializeMessage();
// let signature = nacl.sign.detached(transactionBuffer, fromWallet.secretKey);

// console.log(bs58.encode(signature)+" signarure")

// manualTransaction.addSignature(fromWallet.publicKey, signature);

// let isVerifiedSignature = await manualTransaction.verifySignatures();

// console.log(`The signatures were verifed: ${isVerifiedSignature} ${signature} `)

// // The signatures were verified: true

// let rawTransaction = manualTransaction.serialize();

// console.log(rawTransaction)

// let txnid=await web3.sendAndConfirmRawTransaction(connection, rawTransaction);
//  console.log("raw: "+txnid);

 return '{success:"true",txnid:"'+signature+'"}';

  // let txid = await connection.confirmTransaction("4PiHmzAw2NrHuaCTJhAFzmFKtg4SPTu5Cxbd8FP2fm58Ws4x4q5htzZSuDUjcLWm9shjErQJNrJqtiHyKLAunXmx");
  //console.log(txid);
}


router.get('/sendToken/:address',(req, res) => {
 
  
  sendPayment(req.params.address).then((response) => {

    console.log(response)
    res.send(response)
  }).catch((err)=>{
    console.log(err)
    res.send("error: "+err)
  })
     
    
 })



module.exports = router;