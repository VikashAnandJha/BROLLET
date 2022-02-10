const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const txnSchema =new Schema({
    hash: {
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required:true
    },
    from_publicKey:{
        type: String,
        required: true
    },
    to_publicKey:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: false
    },
    token_name:{
        type: String,
        required: true
    }
},{timestamps:true})

const Transaction=mongoose.model('Transaction',txnSchema);

module.exports = Transaction;





