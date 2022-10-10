import app from "./app.js";
import "./config/database.js";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Stats from "./models/Stats.js";
import cloudinary from "cloudinary";
import RazorPay from "razorpay"
import nodeCron from "node-cron";


const PORT = process.env.PORT;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET
})

// RazorPay instance
export const instance = new RazorPay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// creating a schedule for monthlu schedule
// sec min hour day month year
// this will called on 1 of every month
nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
})

app.listen(PORT || 3333, () => {
  console.log(`server is up at port ${PORT}`);
})
