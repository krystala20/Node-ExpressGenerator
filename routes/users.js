const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
//router.get : the GET method of users endpoint: verify the user , verify user is admin
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  //find and return all users in DB
  User.find()
  .then(users => {
    res.statusCode =200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  })
  .catch(err => next(err));
});

//endpoint allows new user to register on website
router.post('/signup', cors.corsWithOptions, (req, res) => {
    User.register(
      new User({username: req.body.username}),
      req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
        } else {
          if (req.body.firstname){
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname){
            user.lastname = req.body.lastname;
          }
          user.save(err => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return;
            }

            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
             res.setHeader('Content-Type', 'application/json');
             res.json({success: true, status: 'Registration Sucessful!'});
             });
          });
      }
    }); 
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token, status: 'You are sucessfully logged in!'})
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
      const err  = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  //ensure there is a valid user. If FB token strategy worked, passport should have added user property to request object
  if (req.user) {
  //create JSON Web token
      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;
