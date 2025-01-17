const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const gravatar = require("gravatar");
const jimp = require("jimp");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { User } = require("../models/users");
const { transporter } = require("../helpers/sendEmail");

const { promisify } = require("util");
const moveFile = promisify(require("fs").rename);

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  avatarURL: Joi.string(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

async function register(req, res, next) {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const avatar = gravatar.url(email, { s: "250", r: "pg", d: "mp" });
    const verificationToken = uuidv4();

    await User.create({
      name,
      email,
      password: hash,
      avatarURL: avatar,
      verificationToken,
    });

    transporter(name, req.headers.host, verificationToken);

    return res.status(201).json({
      message: "User registered successfully",
      user: { email, avatar },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function verify(req, res, next) {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function resendVerificationEmail(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const { verificationToken } = user;

    await User.findByIdAndUpdate(user._id, { verificationToken });

    transporter(user.name, req.headers.host, verificationToken);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    if (!user.verify) {
      return res.status(401).json({ message: "User is not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await User.findByIdAndUpdate(user._id, {
      token,
    });

    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function current(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { email, subscription } = user;
    res.status(200).json({
      email,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function subscription(req, res, next) {
  const { subscription } = req.body;

  if (!["starter", "pro", "business"].includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { subscription },
    { new: true }
  );

  res.json(user);
}

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, "public", "avatars"),
  filename: (req, file, cb) => {
    const ext = path.parse(file.originalname).ext;
    cb(null, `${req.user.id}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("image")) {
      cb(null, true);
      return;
    }
    cb(null, false);
  },
}).single("avatar");

async function avatar(req, res, next) {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const image = await jimp.read(req.file.path);
    await image.resize(250, 250);
    const avatarName = `${req.user.id}.jpg`;
    const avatarPath = `public/avatars/${avatarName}`;

    if (!fs.existsSync("public/avatars")) {
      fs.mkdirSync("public/avatars");
    }

    await image.writeAsync(avatarPath);

    const avatarURL = `/avatars/${avatarName}`;
    await User.findByIdAndUpdate(req.user.id, { avatarURL });

    await moveFile(req.file.path, `public/avatars/${avatarName}`);

    res.json({ avatarURL });
  } catch (error) {
    console.error(error);

    if (req.file) {
      await fs.promises.unlink(req.file.path);
    }

    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  register,
  login,
  logout,
  current,
  subscription,
  avatar,
  avatarUpload,
  avatarStorage,
  verify,
  resendVerificationEmail,
};
