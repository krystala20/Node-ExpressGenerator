
const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());


//Route 1
favoriteRouter.route('/')

.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

//**When user does GET operation on /favorites, retireve the list of faves for the user , 
//** then populate the user and campsites refs before returning the faves//
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    //find user that corresponds to the req.user._id
    Favorite.find({ user: req.user._id })
    //when favorite docs are retrieved, populate user and campsites fields of favorite document
    //by finding user doc and campsite doc that matches object ID stored there
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //will send JSON data to the client in response stream and auto-close response stream after 
        res.json(favorite);
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //Query DB, look for favorite object with user in the request
    Favorite.findOne({ user: req.user})
    .then(favorite=> {
        if (favorite) {
            //check if the campsite ids in the req body are in the campsites array of the favorite object. If not, then add the ids in the req body into the cmapsites array
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id)){
                    favorite.campsites.push(fav._id);
                }
            });
            //save the ids of the campsites into the DB
    favorite.save()
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', '/application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
    //if there is no favorite document, create one. Assign the user id in req body to user and ids in the req body to the campsites array
} else {
    Favorite.create({
        user: req.user._id,
        campsites: req.body
    })
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', '/application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
}
}) .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode= 403;
    res.end('PUT operation not supported on /favorites')
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany({user: req.user})
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

//Route 2
favoriteRouter.route('/:campsiteId')

.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //Query DB, look for favorite object with user in the request
    Favorite.findOne({ user: req.user})
    .then(favorite=> {
        if (favorite) {
            //if the campsites array in favorites object does not include the campsite id, push the campsite id into the array
                if(!favorite.campsites.includes(req.params.campsiteId)){
                    favorite.campsites.push(req.params.campsiteId);
            //save the id of the campsites into the DB
    favorite.save()
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', '/application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
   
    //if the campsites array in favorites object includes the campsite id, then say the campsite is already a favorite.
    }   else {
        res.statusCode = 200;
        res.end(`That campsite with id: ${req.params.campsiteId} is already a favorite!`)
        }

    //if there is no favorite object for the user, create one with user id and campsite id
    } else {
        Favorite.create({
            user: req.user._id, campsites: [req.params.campsiteId] })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', '/application/json');
                res.json(favorite);
    })
    .catch(err => next(err));
    }
})
.catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}`);
})

//Edit this

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next ) => {
//Find a favorite document for the user id in req object
   Favorite.findOne({ user: req.user._id })
   .then(favorite => {
    if (favorite) {
        //find the index of the campsite matching the _id of req.params.campsiteId
        const index = favorite.campsites.findIndex (x => x._id == req.params.campsiteId);
        console.log(index)
        if (index >= 0) {
            favorite.campsites.splice(index,1);
        }
        //save the updated favorite object
        favorite.save()
        .then(favorite => {
            console.log('Favorite Campsite Deleted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
            res.end(`The campsite with id ${req.params.campsiteId} is deleted`)
        })
        .catch(err => next(err));
} else {
    res.statusCode = 200;
    res.setHeader('Content-Type', '/application/json');
    res.json(favorite);
}
}).catch(err => next(err));
});

module.exports = favoriteRouter;
