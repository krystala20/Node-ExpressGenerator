//File contains code for handling REST API endpoints for campsites and campsites/campsiteId

const express = require('express');
const bodyParser = require('body-parser');

const campsiteRouter = express.Router();

campsiteRouter.use(bodyParser.json());

//We are routing starting from ('/')
campsiteRouter.route('/')

//Single statement (chained) handles all endpoints for routing to campsites.
//Do this for all endpoints. Default
.all((req, res, next) => {
    res.status = 200;
    res.setHeader('Content-Type', 'text/plain');
    //next() passes control of app routing to next relevant routing method after this one. otherwise it would stop here and not go further
    //applies to middleware. Certain middleware has to call next().
    next();
})

//GET = READ
.get((req, res) => {
    res.end('Will send all the campsites to you')
})

//POST (CREATE) 
.post( (req, res) => {
    res.end(`Will add the campsite: ${req.body.name} with description ${req.body.description}`)
})

//PUT (UPDATE) operation is not supported because you won't update all campsites at same time
.put((req, res) => {
    res.statusCode= 403;
    res.end('PUT operation not supported on /campsites')
})

//DELETE 
.delete((req, res) => {
    res.end('Deleting all campsites');
});

// Wk1 Task 1 assignment //
campsiteRouter.route('/:campsiteId')

.all((req, res, next) => {
    res.status = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})

.get((req, res) => {
    res.end(`Will send campsite ${req.params.campsiteId} to you`)
})

//POST= creating new campsite is not allowed
.post( (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})

//PUT operation is supported
.put( (req, res) => {
    res.write(`Updating the campsite: ${req.params.campsiteId}\n`)
    res.end(`Will update the campsite: ${req.body.name}
           with description: ${req.body.description}`)
})

.delete( (req, res) => {
    res.end(`Deleting the campsite ${req.params. campsiteId}`)
})


module.exports = campsiteRouter;