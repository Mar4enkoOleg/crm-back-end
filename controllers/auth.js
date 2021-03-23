const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async (req, res) => {
  const candidate = await User.findOne({ email: req.body.email });
  if (candidate) {
    const passwordResult = bcrypt.compareSync(
      req.body.password,
      candidate.password
    );
    if (passwordResult) {
      // token generation, passes equals
      const token = jwt.sign(
        {
          email: candidate.email,
          userId: candidate._id,
        },
        keys.jwt,
        { expiresIn: 60 * 60 }
      );
      res.status(200).json({ token: `Bearer ${token}` });
    } else {
      res.status(401).json({ message: 'Password not equals ' });
    }
  } else {
    //error
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports.register = async (req, res) => {
  const candidate = await User.findOne({ email: req.body.email });
  if (candidate) {
    //user true, error
    res.status(409).json({
      message: 'Email taken',
    });
  } else {
    //create user
    const salt = bcrypt.genSaltSync(10);
    const password = req.body.password;
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt),
    });

    try {
      await user.save();
      res.status(201).json(user);
    } catch (e) {
      //error
      errorHandler(res, e);
    }
  }
};
