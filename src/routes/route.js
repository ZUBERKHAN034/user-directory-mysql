const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getUserByToken, getUsersByFilter } = require('../controllers/userController');
const { authentication } = require('../middlewares/auth');

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/user", authentication, getUserByToken);

router.get("/users", getUsersByFilter);

// if api is invalid OR wrong URL
router.all("/*", function (req, res) {
    res.status(404).send({ status: false, msg: "The api you requested is not available" })
});

module.exports = router;