const express= require('express')
const app = express()
const mongoose = require("mongoose")
var cors = require('cors') 


const dbURI="mongodb+srv://vikashjha:jhajha22@brollet.168kf.mongodb.net/brollet";
mongoose.connect(dbURI,{useNewUrlParser:true,useUnifiedTopology:true}).then((msg)=>{
console.log("db connected succesfully")
 
}).catch((err)=>{
  console.log(err)
})



app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json()) //For JSON requests
app.use(express.static(__dirname+'/public'));


  


const keyRoute=require('./routes/Key');
const balanceRoute=require('./routes/Balance');
const usersRoute=require('./routes/Users');
const txnRoute=require('./routes/Transactions');
const pushRoute=require('./routes/Push');


// PORT 
const PORT= process.env.PORT || 5000
app.listen(PORT,() => console.log("Listening "+PORT))

app.use("/api/",keyRoute)
app.use("/api/",balanceRoute)
app.use("/api/",usersRoute)
app.use("/api/",txnRoute)
app.use("/api/",pushRoute)

app.get('/',(req, res) => {

  res.sendFile('index.html', { root: __dirname });


 // console.log(solanaWeb3);
}) 
app.get('/privacy',(req, res) => {

  res.sendFile('privacy.html', { root: __dirname });


 // console.log(solanaWeb3);
}) 


