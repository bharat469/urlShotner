const mongoose = require('mongoose')

async function connectDatabase(){
    try{
        await mongoose.connect(process.env.MONGO_DB_URL);
          console.log("DATABASE CONNECTED READY TO ROLE ✨✨✨ ");
    }
    catch(e){
           console.log("OOPS ERROR !!!", e);
    }
}

module.exports= connectDatabase