import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middlewares/Error.js"
import cors from "cors";

config({ path: "./config/config.env" })
const app = express();

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// using middlewares
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// for accessing cokkies

// importing and using routes
import course from "./routes/CourseRoutes.js"
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js"
import other from "./routes/otherRoutes.js"

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;

// using error middlewares
// if no middlewares that are used above are not able to 
// solve the error, then errorMiddleware will be used.
// This will be called if there is any error in the this file.
app.use(ErrorMiddleware);

