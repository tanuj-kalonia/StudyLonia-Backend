import express from "express";
import {
    register,
    login,
    logout,
    getMyProfile,
    changePassword,
    updateProfile,
    updateProfilePicture,
    forgetPassword,
    resetPassword,
    addToPlaylist,
    removeFromPlaylist,
    getAllUsers,
    updateUserRole,
    deleteUser,
    deleteMyProfile
} from "../controllers/userController.js";
import singleUpload from "../middlewares/multer.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// To register a user 
router.route("/register").post(singleUpload, register);

// Login
router.route("/login").post(login);

// Logout
router.route("/logout").get(logout);

// Get my Profile
// This route will be accessed by only that user, which is authenticated
router.route("/me")
    .get(isAuthenticated, getMyProfile)
    .delete(isAuthenticated, deleteMyProfile);

// Change my password, put request as we are updating the password 
router.route("/changepassword").put(isAuthenticated, changePassword);

// Update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

// Update profile picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateProfilePicture);

// forget password
router.route("/forgetpassword").post(forgetPassword);

// reset pasword
router.route("/resetpassword/:token").put(resetPassword);

// Add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

// remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);


// Admin Controllers

// Gets all the user
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);

// Updates the user role
router.route("/admin/user/:id")
    .put(isAuthenticated, authorizeAdmin, updateUserRole)
    .delete(isAuthenticated, authorizeAdmin, deleteUser);



export default router;