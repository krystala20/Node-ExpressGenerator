const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate() ));

//whenever using sessions w/ Passport- need to serialize and de-serialize

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
