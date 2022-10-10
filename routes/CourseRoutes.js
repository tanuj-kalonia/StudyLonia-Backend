import express from "express";
import {
    addLecture,
    createCourse,
    deleteCourse,
    deleteLecture,
    getAllCourses,
    getCourseLectures
} from "../controllers/courseController.js";

import { authorizeAdmin, authSubscriber, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

// get all the courses without lectures array
router.route("/course").get(getAllCourses);

// create new course  - only admin
router.route("/createcourse").post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

// add, delete, get course
router.route("/course/:id")
    .get(isAuthenticated, authSubscriber, getCourseLectures)
    .post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
    .delete(isAuthenticated, authorizeAdmin, deleteCourse)


// delete lecture
router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);
export default router;