const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);
let connection;
function connect() {
  if (!connection) connection = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 }).catch(error => { connection = null; throw error; });
  return connection;
}
if (process.env.MONGO_URI) connect().catch(error => console.error("Database connection failed:", error.message));
module.exports = connect;
