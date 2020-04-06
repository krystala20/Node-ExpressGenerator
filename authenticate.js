const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
//use this to create sign and verify tokens
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');


const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate() ));

//whenever using sessions w/ Passport- need to serialize and de-serialize

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
}

const opts = {};
//option specifies how JSON web token will be extracted. Send JWT in auth header as bearer token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//supply JWT strategy w/ key for signing token
opts.secretOrKey = config.secretKey;

//Export Jwt Strategy
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        //verify callback fcn
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            //Find user with same id as what is in token
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();    
    } else {
        res.statusCode = 403;
        err = new Error("You are not authorized to perform this operation!");
        return next(err);
    }
}

//exporting function that checks if user is an admin
exports.verifyAdmin = verifyAdmin;

//use this to verify that request is from an authenticated user
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            //check if we already have a user account in Mongo DB.
            //Do any users have facebookId = profile.id
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                //if there is no error but user already exists in DB
                if (!err && user) {
                    return done(null, user);
                //no error and no user. Create a new user document from FB profile info
                } else {
                    user = new User ( {username: profile.displayName } );
                    user.facebookId= profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    })
                }
            })
        }
    )
)