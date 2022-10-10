import mongoose, { Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        require: [true, "please enter your email"],
        unique: true,
        validator: validator.isEmail,
    },
    password: {
        type: String,
        require: [true, "please enter your password"],
        minLength: [6, "Password must be atleaet 6 chars"],
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    subscription: {
        id: String,
        status: String
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },

    // using refrence of course modes
    playlist: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId, // this will return the id that references course
                ref: "Course"
                // this will referece to the course model
            },
            poster: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
});
// This will hash the password before saving into the database
// prefunction will called before savign the data into the databse
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // hash function will hash the password upto 10 rounds of salt
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// This function generates token for the user
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    })
}

// This will compare the user's password with password stored in database
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

// This function will generate the reset token for the user
userSchema.methods.getResetToken = async function () {
    // This method will generate a 20 char long hexadecima code or token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // we need to hash this token as it will be stores in db
    // sha256 is alogorith which will hash the resetToken
    // digest is same as toString
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");


    // set the expire time for the token (after 15 mins)
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}
const User = new mongoose.model("User", userSchema);
export default User;