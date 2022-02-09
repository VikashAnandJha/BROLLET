const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const userSchema =new Schema({
    name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    mobile:{
        type: String,
        required:false
    },
    publicKey:{
        type: String,
        required: true
    },
    fcm_id:{
        type: String,
        required: false
    }
},{timestamps:true})

const User=mongoose.model('User',userSchema);

module.exports = User;





