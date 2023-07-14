import jwt from "jsonwebtoken"
import ErrorHandler from "../utils/erorrHandler.js";
import { catchAsyncError } from "./catchAsyncError.js"
import User from "../models/User.js";


export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    console.log("auth token cokkie", req.cookies);
    if (!token) return next(new ErrorHandler("Not Logged In", 401));
    const foundData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(foundData._id);
    next();
})

export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`), 403)
    }
    next();
}
export const authSubscriber = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
        return next(new ErrorHandler(`only subscribers are allowed to access lectures`), 403)
    }
    next();
}
