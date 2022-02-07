const express= require('express')
const app = express()

var cors = require('cors')





app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json()) //For JSON requests
app.use(express.static(__dirname+'/public'));


  


const keyRoute=require('./routes/Key');
const balanceRoute=require('./routes/Balance');


// PORT 
const PORT= process.env.PORT || 5000
app.listen(PORT,() => console.log("Listening "+PORT))

app.use("/api/",keyRoute)
app.use("/api/",balanceRoute)

app.get('/',(req, res) => {

  res.sendFile('index.html', { root: __dirname });


 // console.log(solanaWeb3);
}) 