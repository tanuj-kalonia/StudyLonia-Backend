import mongoose from "mongoose";

const DB = process.env.MONGO_URI;
// const email = process.env.GMAIL_USER
export const connectDB = async () => {
    const { connection } = await mongoose.connect(DB);
    console.log(`MongoDB connected with  ${connection.host}`);
};

