const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ mesage: "Token not found" });
  }
  const token = authHeader.split(" ")[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ mesage: "Invalid token" });
  }
};

module.exports = auth;
