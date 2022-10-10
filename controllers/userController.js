import crypto from "crypto"
import cloudinary from "cloudinary";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/erorrHandler.js";
import User from "../models/User.js"
import Course from "../models/Course.js"
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import getDataUri from "../utils/datauri.js"
import Stats from "../models/Stats.js"

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = cloudinary.v2.uploader.upload(fileUri.content);

    if (!name || !email || !password || !file) {
        return next(new ErrorHandler("Please fill all the fields", 400))
    }

    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User already exists", 509));

    // upload file on cloudinary
    user = await User.create({
        name, email, password,
        avatar: {
            public_id: (await mycloud).public_id,
            url: (await mycloud).secure_url
        }
    })
    sendToken(res, user, "Registered successfully", 201);

})


export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    // const file = req.file;

    if (!email || !password) {
        return next(new ErrorHandler("Please fill all the fields", 400))
    }

    // This will retrieve the user along with email and password
    let user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Incorrect Email or Password", 509));

    // sending the password recieved to compare function
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Incorrect Email or Password", 401));

    sendToken(res, user, `Welcome back ${user.name}`, 201);

})

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(201).cookie("token", null, {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "Logged Out successfully"
    })
})

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(201).json({
        success: true,
        user,
    })
})

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    // cancel subscriptio

    res.status(201).cookie("token", null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "User deleted"
    })
})


export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password  ");

    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please fill all the fields", 400))
    }

    const isMatch = await user.comparePassword(oldPassword); if (!isMatch) return next(new ErrorHandler("Incorrect old password"));

    user.password = newPassword;
    await user.save();

    res.status(201).json({
        success: true,
        message: "password changed successfully",
    })

})
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(201).json({
        success: true,
        message: "profile updated successfully",
    })

})

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = cloudinary.v2.uploader.upload(fileUri.content);

    // deleting old profile picture
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // setting new profile picture
    user.avatar = {
        public_id: (await mycloud).public_id,
        url: (await mycloud).secure_url
    }
    user.save();
    res.status(201).json({
        success: true,
        message: "Profile Picture updated successfully"
    })
})

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User not found", 400));

    // This will generate a reset token for the user
    const resetToken = await user.getResetToken();
    await user.save();
    // send this token via email to the user
    const url = `${process.env.FRONT_END_URL}/resetpassword/${resetToken}`

    const message = `Click on the below link to reset your password -> ${url}. If this was not you, then you may ignore this message. Thankyou-team : studylonia`
    // send this message to the user
    sendEmail(user.email, "StudyLonia Reset Password", message);


    res.status(201).json({
        success: true,
        message: `Reset toke has been sent to ${user.email}`,
    })
})
export const resetPassword = catchAsyncError(async (req, res, next) => {
    // it will pick the token from the url
    const { token } = req.params;

    // we need to compare the token recieved via url to the token saved in db after hashing
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    // now find this hashed token in the database along with expire date
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            // gt refers to greator operator
            $gt: Date.now()
        }
    })
    if (!user) return next(new ErrorHandler("Invalid or Expired Token"), 401);

    // if we found the user, then update the password and set the expire and token field to undefined
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();
    res.status(201).json({
        success: true,
        message: "Password changed successfully",
    })
})

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);

    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    const itemExist = user.playlist.find(item => {
        return item.course.toString() === course._id.toString() ? true : false;
    })
    if (itemExist) return next(new ErrorHandler("Item already exists", 409));

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    })
    await user.save();

    res.status(201).json({
        success: true,
        message: "Added to playlist",
    })
})

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);

    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    // filtering out all the playlist item whose id doesnot match the id
    const newPlaylist = user.playlist.filter(item => {
        if (item.course.toString() !== course._id.toString()) return item;
    })
    user.playlist = newPlaylist;
    await user.save();

    res.status(201).json({
        success: true,
        message: "Removed from playlist",
    })
})

// Admin Controllers

// Gets all the user 
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({});
    res.status(201).json({
        success: true,
        users
    })
})

// Updates the user role
export const updateUserRole = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found"), 404);

    if (user.role === "admin") user.role = "user";
    else user.role = "admin"

    await user.save();

    res.status(201).json({
        success: true,
        message: "Role Updated"
    })
})
// Delete a user
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found"), 404);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await user.remove();

    res.status(201).json({
        success: true,
        message: "User deleted"
    })
})

User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

    const subscription = await User.find({ "subscription.status": "active" });
    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
});