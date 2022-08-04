const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateCode, isValid, isValidEmail, isValidPhone, isValidPassword, isValidName } = require('../utils/utils');

//------------------------------------------------------------------------------------------------------------------------------------------------------

const registerUser = async (req, res) => {
    try {
        // data sent through request body
        const body = req.body;

        let { first_name, last_name, email, mobile, password, role, status } = body;

        if (!isValid(first_name) || !isValidName(first_name)) {
            return res.status(400).send({ status: false, message: "first_name is required and it should contain only alphabets" })
        }

        if (!isValid(last_name) || !isValidName(last_name)) {
            return res.status(400).send({ status: false, message: "last_name is required and it should contain only alphabets" })
        }

        if (!isValid(email) || !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "email is required and it should be a valid email" });
        }

        // Checking E-mail for Uniqueness
        const checkEmailQuery = "SELECT * FROM users WHERE email = ?";

        const isEmailAlreadyPresent = await userModel.findOne(checkEmailQuery, email);
        if (isEmailAlreadyPresent.length > 0) {
            return res.status(400).send({ status: false, message: "email already present!" });
        }

        if (!isValid(mobile) || !isValidPhone(mobile)) {
            return res.status(400).send({ status: false, message: "mobile is required and it should be a valid indian phone number" });
        }

        // Checking phone number for uniqueness
        const checkMobileQuery = "SELECT * FROM users WHERE mobile = ?";

        const isMobileAlreadyPresent = await userModel.findOne(checkMobileQuery, mobile);
        if (isMobileAlreadyPresent.length > 0) {
            return res.status(400).send({ status: false, message: "Phone number already present!" });
        }

        // Checking the length of password
        if (!isValid(password) || !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "password is required and it should be Valid min 8 and max 15" });
        }

        //Encrypting Password by Bcrypt
        password = await bcrypt.hash(password, 10);

        if (!isValid(role) || !isValidName(role)) {
            return res.status(400).send({ status: false, message: "role is required and it should contain only alphabets" });
        }

        if (!((role === "admin") || (role === "member") || (role === "trainer"))) {
            return res.status(400).send({ status: false, message: `role should be only [ admin or member or trainer ]` });
        }

        if (!((status === true) || (status === false))) {
            return res.status(400).send({ status: false, message: "status should have only true/false in it" });
        }

        const uid = generateCode(13);

        const sql = 'INSERT INTO users(uid,first_name, last_name, email, mobile ,password, role, status) VALUES ?'
        const values = [[uid, first_name, last_name, email, mobile, password, role, status]];

        const result = await userModel.create(sql, values);
        res.status(200).send({ status: true, message: "Account successfully created", data: result });


    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const loginUser = async (req, res) => {
    try {
        // login credentials sent through request body
        const email = req.body.email;
        const password = req.body.password;

        // if email is empty
        if (!isValid(email) || !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter valid email!" });
        }

        // if password is empty
        if (!isValid(password) || !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Please enter valid [ min 8 and max 15 ] password!" });
        }

        // Find user details from DB
        const findEmailQuery = "SELECT * FROM users WHERE email = ?";

        const user = await userModel.findOne(findEmailQuery, email);

        // Checking User exists or not
        if (user.length === 0) {
            return res.status(401).send({ status: false, message: "The email address you entered isn't connected to an account. Register a new user first." });
        }

        const userData = JSON.parse(JSON.stringify(user));

        //Decrypt password by Bcrypt and Compare the password with password from request body
        const decrypPassword = userData[0].password;
        const pass = await bcrypt.compare(password, decrypPassword)
        if (!pass) {
            return res.status(400).send({ status: false, message: "Password Incorrect" })
        }

        // JWT generation using sign function
        const token = jwt.sign(
            { email: userData[0].email, uid: userData[0].uid }, "SQL_WITH_NODEJS", { expiresIn: "30d" }
        );

        // Sending token in response header
        res.setHeader('Authorization', 'Bearer ' + token);
        res.status(200).send({ status: true, message: "Logged in successfully", data: userData, token: token });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getUserByToken = async (req, res) => {
    try {

        // uid from DecodedToken
        const uid = req.uid;

        // Find user details from DB
        const findUserIdQueruy = "SELECT * FROM users WHERE uid = ?";

        const user = await userModel.findOne(findUserIdQueruy, uid);

        // Checking User exists or not
        if (user.length === 0) {
            return res.status(404).send({ status: false, message: "user not found!" });
        }

        const userData = JSON.parse(JSON.stringify(user));

        res.status(200).send({ status: true, message: "User founded successfully", data: userData });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getUsersByFilter = async (req, res) => {
    try {

        const query = req.query;

        if (!Object.keys(query).length) {
            return res.status(400).send({ status: false, message: "please enter atleast one filter in query!" });
        }

        const { name, email, mobile, status, role } = query;

        // Find user details from DB
        const findUsersFilterQueruy = "SELECT * FROM users WHERE first_name = ? OR email = ? OR mobile = ? OR status = ? OR role = ?;"

        const filter = [name, email, mobile, status, role];

        const user = await userModel.find(findUsersFilterQueruy, filter);

        // Checking User exists or not
        if (user.length === 0) {
            return res.status(404).send({ status: false, message: "user not found!" });
        }

        const userData = JSON.parse(JSON.stringify(user));

        res.status(200).send({ status: true, message: "Users founded successfully", data: userData });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports = { registerUser, loginUser, getUserByToken, getUsersByFilter };