const bcrypt = require('bcrypt')


function isValidUrl(url){
    try{
        new URL(url)
        return true
    }
    catch{
        return false
    }
}

function validateUser(data) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return {
      success: false,
      message: "All fields are required",
    };
  }

  if (name.length < 3) {
    return {
      success: false,
      message: "Name must be at least 3 characters",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Invalid email",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters",
    };
  }

  return {
    success: true,
    message: "Validation successful",
  };
}


const bycriptedPass = async (password) => {
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;

    }catch(e){
        return e
    }
};


const comparePass = async(password,passwordDb)=>{
    try{
        const matchedpass = await bcrypt.compare(password,passwordDb)
        return matchedpass
    }
    catch(e){
  
        return e
    }
}


module.exports= {isValidUrl,validateUser,bycriptedPass,comparePass}