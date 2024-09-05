const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!verifyToken) {
      return res.status(401).send("Token error");
    }
    req.user = verifyToken; // Store the entire token data in req.user
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send("Authentication error");
  }
};

module.exports = auth;
