const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../Models/userModel");
const { generateToken } = require("../Config/generateToken");

exports.signUp = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    const userExists = await User.findOne({ email })
    
    if (userExists){
        res.status(400);
        throw new Error("User Already Exist");
    };
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);


    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(500);
        throw new Error("Failed to Create User");
    }
});

exports.authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    if (user) {
        res.status(200).json({message: "Login Successfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

exports.allUser = asyncHandler(async(req, res) => {
    const keyword = req.query.search
        ? { 
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                {email : { $regex: req.query.search, $options: "i" }}
            ],

        }
        : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users)
});