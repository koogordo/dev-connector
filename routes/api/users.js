const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load validation scripts
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//@route  POST api/users/register
//@desc   register a new user
//@access Public
router.post('/register', (req, res) => {
  let { errors, isValid } = validateRegisterInput(req.body);
  //initial validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  //second level validation make sure an email doesn't already exist
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      //if(user) = true it mean an email exists and we return and error
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      //set avatar using word press gravater
      let avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm' //default - this is what it will go to when the user doesnt have a gravater email
      });

      let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              res.json(user);
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route  POST api/users/login
//@desc   user login, start session, generate cookies and tokens
//@access Public
router.post('/login', (req, res) => {
  let { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let email = req.body.email;
  let password = req.body.password;
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'User not found';
      return res.status(404).json(errors);
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        let payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(400).json(errors);
      }
    });
  });
});

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
