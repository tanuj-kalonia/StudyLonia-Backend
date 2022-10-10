import mongoose, { Schema } from "mongoose";
// import validator from "validator";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import crypto from "crypto";

const paymentSchema = new mongoose.Schema({
    razorpay_signature: {
        type: String,
        require: true
    },
    razorpay_payment_id: {
        type: String,
        require: true
    },
    razorpay_subscription_id: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

const Payment = new mongoose.model("Payment", paymentSchema);
export default Payment;