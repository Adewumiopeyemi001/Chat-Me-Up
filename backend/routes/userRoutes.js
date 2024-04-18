const express = require("express");
const { signUp, authUser, allUser } = require("../Controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post('/', signUp);
router.post("/login", authUser);
router.get('/', protect,  allUser);


module.exports = router;