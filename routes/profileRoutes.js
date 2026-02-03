const express = require("express");
const router = express.Router();
const { getSingleUser, getAllUsers } = require("../controllers/profileController");

// GET ALL USERS
router.get("/users", getAllUsers);

// GET SINGLE USER BY ID
router.get("/users/:id", getSingleUser);

module.exports = router;
