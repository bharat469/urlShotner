const { validateUser, bycriptedPass, comparePass } = require("../helper");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const signInUserData = async (req, res) => {
  let valid = validateUser(req.body);

  if (!valid.success) {
    return res.status(401).json(valid);
  } else {
    try {
      let duplicate = await User.findOne({ email: req.body.email });
      if (duplicate) {
        return res.status(400).json({ message: "Already registered" });
      } else {
        const hashedPassword = await bycriptedPass(req.body.password);

        let userCreated = await User.create({
          name: req.body.name,
          email: req.body.email,
          Password: hashedPassword,
        });

      
        res.status(201).json({ message: "New entry has been created" });
      }
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Internal Server Error !!!", value: e });
    }
  }
};

const loginUser = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).json({ message: "Details are missing" });
  } else {
    try {
      let foundUser = await User.findOne({ email: req.body.email });
      if (foundUser) {
        let matchPassword = await comparePass(
          req.body.password,
          foundUser.Password,
        );

        if (matchPassword) {
          const token = jwt.sign(
            {
              id: foundUser._id,
              email: foundUser.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
          );

          const refreshToken = jwt.sign(
            {
              id: foundUser._id,
              email: foundUser.email,
            },
            process.env.REFRESH_TOEKN_SECRET,
            { expiresIn: "7d" },
          );

          foundUser.refreshToken = refreshToken;
          await foundUser.save();

          res.status(200).json({
            message: "Congrats you are logged in",
            token: token,
            refreshToken: refreshToken,
            user: {
              _id: foundUser._id,
              name: foundUser.name,
              email: foundUser.email,
            },
          });
        } else {
          return res.status(401).json({ message: "email password mismatched" });
        }
      } else {
        return res.status(400).json({ message: "user not found" });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal Server Error !!!" });
    }
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.body.Refreshtoken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token is missing" });
  }

  try {
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      return res
        .status(401)
        .json({ message: "Refresh Token is wrong please check" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOEKN_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const token = jwt.sign(
      {
        id: foundUser._id,
        email: foundUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res
      .status(200)
      .json({ message: "Successfully made token!!!", token });
  } catch (e) {
    return res.status(401).json({ message: "Unable to generate token" });
  }
};

const getProfileData = async (req, res) => {
  const userId = req.params.id || req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Details are missing" });
  }

  try {
    const user = await User.findById(userId).select("-Password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "user found", data: user });
  } catch (e) {
    return res.status(401).json({ message: "Unable to get Detail of user" });
  }
};

module.exports = { signInUserData, loginUser, refreshToken, getProfileData };
