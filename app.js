const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDatabse = require('./config/db');
const router = require('./routes/urlRoutes');

const morgan = require("morgan");

dotenv.config()
connectDatabse().catch((e) =>
  console.log("unable to connect to mongo db server ", e),
);
const app = express()

app.use(morgan("dev"));

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(
  cors({
    url: "http://localhost:5173/",
  }),
);

app.use('/api/urlShot',router)


app.listen(process.env.PORT_DEV,(e)=>{
    if(e){
        console.log('Opps got into error',e)
    }
    else{

        console.log("SERVER IS RUNNING SUCCESFULLY 🚀🚀");
    }
})