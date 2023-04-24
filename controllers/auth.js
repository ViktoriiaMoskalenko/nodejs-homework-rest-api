const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const { User } = require("../models/users");

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
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

    const { name, email, password, subscription } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hash });

    return res.status(201).json({
      message: "User registered successfully",
      user: { email },
    });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.token = token;
    await user.save();

    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (err) {
    return next(err);
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

    return res.status(204);
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

module.exports = { register, login, logout, current, subscription };
