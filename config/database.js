import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" })
const DB = process.env.MONGO_URI;

mongoose.connect(DB)
    .then(res => console.log("Connection successful"))
    .catch(err => console.log(`Connection failed ${err}`))



